
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';
import { parseRequestBody } from './utils';
import { loadData } from './dataLoader';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  deleteAllUsers, 
  deleteUserById 
} from './userController';
import { ApiResponse } from './types';

// Send JSON response
function sendJsonResponse(res: ServerResponse, statusCode: number, data: ApiResponse): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const parsedUrl = url.parse(req.url || '', true);
    const pathName = parsedUrl.pathname || '';
    const method = req.method?.toUpperCase();

    console.log(`[SERVER] ${method} ${pathName}`);

    // Check if this is an API request
    if (pathName.startsWith('/api/')) {
      // Process API request
      handleApiRequest(req, res, pathName, method || '');
      return;
    }

    // For non-API routes, serve the frontend as a single-page application
    if (method === 'GET') {
      const publicFolderPath = path.resolve(__dirname, '../dist');
      let filePath = path.join(publicFolderPath, pathName === '/' ? 'index.html' : pathName);
      
      // Check if the path exists as a file
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        // Serve the file with the appropriate content type
        const contentType = getContentType(filePath);
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }
      
      // If file doesn't exist, serve index.html for client-side routing
      const indexPath = path.join(publicFolderPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
        return;
      }
    }

    // Handle other HTTP methods or not found resources
    sendJsonResponse(res, 404, { status: 404, error: 'Not found' });
  } catch (error) {
    console.error('[SERVER] Unhandled error:', error);
    sendJsonResponse(res, 500, { status: 500, error: 'Internal server error' });
  }
}

// Handle API requests separately
async function handleApiRequest(req: IncomingMessage, res: ServerResponse, pathName: string, method: string): Promise<void> {
  // Extract the API path without the /api prefix
  const apiPath = pathName.substring(5); // Remove '/api/' prefix
  console.log(`[SERVER] Processing API request: ${apiPath}`);
  
  // Route to appropriate API handler
  if (apiPath === 'load') {
    try {
      console.log('[SERVER] Processing load request');
      await loadData();
      sendJsonResponse(res, 200, { status: 200, data: { message: 'Data loaded successfully' } });
    } catch (error) {
      console.error('[SERVER] Error loading data:', error);
      sendJsonResponse(res, 500, { status: 500, error: 'Failed to load data' });
    }
    return;
  }
  
  // Handle users collection endpoints
  if (apiPath === 'users') {
    if (method === 'GET') {
      // Get all users
      try {
        console.log('[SERVER] Getting all users');
        const users = await getAllUsers();
        sendJsonResponse(res, 200, { status: 200, data: users });
      } catch (error) {
        console.error('[SERVER] Error getting users:', error);
        sendJsonResponse(res, 500, { status: 500, error: 'Failed to get users' });
      }
      return;
    } else if (method === 'PUT') {
      // Create new user
      try {
        const data = await parseRequestBody(req);
        const result = await createUser(data);
        
        if (result.exists) {
          sendJsonResponse(res, 409, { status: 409, error: 'User already exists' });
          return;
        }
        
        const locationHeader = `/api/users/${result.userId}`;
        res.setHeader('Location', locationHeader);
        
        sendJsonResponse(res, 201, { status: 201, data: { message: 'User created successfully', userId: result.userId } });
      } catch (error) {
        console.error('[SERVER] Error creating user:', error);
        sendJsonResponse(res, 500, { status: 500, error: 'Failed to create user' });
      }
      return;
    } else if (method === 'DELETE') {
      // Delete all users
      try {
        await deleteAllUsers();
        sendJsonResponse(res, 200, { status: 200, data: { message: 'All users deleted successfully' } });
      } catch (error) {
        console.error('[SERVER] Error deleting users:', error);
        sendJsonResponse(res, 500, { status: 500, error: 'Failed to delete users' });
      }
      return;
    }
  }
  
  // Handle user by ID endpoints
  const userIdMatch = apiPath.match(/^users\/(\d+)$/);
  if (userIdMatch) {
    const userId = parseInt(userIdMatch[1]);
    
    if (method === 'GET') {
      // Get user by ID
      try {
        const user = await getUserById(userId);
        if (!user) {
          sendJsonResponse(res, 404, { status: 404, error: 'User not found' });
          return;
        }
        sendJsonResponse(res, 200, { status: 200, data: user });
      } catch (error) {
        console.error('[SERVER] Error getting user:', error);
        sendJsonResponse(res, 500, { status: 500, error: 'Failed to get user' });
      }
      return;
    } else if (method === 'DELETE') {
      // Delete user by ID
      try {
        const result = await deleteUserById(userId);
        if (!result.success) {
          sendJsonResponse(res, 404, { status: 404, error: 'User not found' });
          return;
        }
        sendJsonResponse(res, 200, { status: 200, data: { message: 'User deleted successfully' } });
      } catch (error) {
        console.error('[SERVER] Error deleting user:', error);
        sendJsonResponse(res, 500, { status: 500, error: 'Failed to delete user' });
      }
      return;
    }
  }
  
  // Handle not found API requests
  console.log('[SERVER] API endpoint not found:', apiPath);
  sendJsonResponse(res, 404, { status: 404, error: 'API endpoint not found' });
}

// Helper function to determine content type based on file extension
function getContentType(filePath: string): string {
  const extname = path.extname(filePath).toLowerCase();
  const contentTypeMap: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  
  return contentTypeMap[extname] || 'text/plain';
}
