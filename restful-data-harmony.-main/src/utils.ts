
import { IncomingMessage } from 'http';
import https from 'https';

export function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyParts: Buffer[] = [];
    
    req.on('data', (chunk) => {
      bodyParts.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const body = Buffer.concat(bodyParts).toString();
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

export function customFetch(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}
