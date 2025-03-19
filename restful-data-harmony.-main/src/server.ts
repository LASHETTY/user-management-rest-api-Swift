
import http from 'http';
import { connect } from './db';
import { handleRequest } from './requestHandler';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connect().then(() => {
  // Create the server
  const server = http.createServer(handleRequest);

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});
