
import { MongoClient, Collection, Db } from 'mongodb';

// MongoDB connection string - you would typically store this in an environment variable
const url = 'mongodb://localhost:27017';
const dbName = 'userDataDb';

let db: Db;
let client: MongoClient;

// Collections
export let usersCollection: Collection;
export let postsCollection: Collection;
export let commentsCollection: Collection;

// Dummy/mock data for local development when MongoDB is not available
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    address: {
      street: "123 Main St",
      suite: "Apt 456",
      city: "New York",
      zipcode: "10001",
      geo: { lat: "40.730610", lng: "-73.935242" }
    },
    phone: "123-456-7890",
    website: "johndoe.com",
    company: {
      name: "ABC Corp",
      catchPhrase: "Leading the way",
      bs: "innovative solutions"
    },
    posts: [
      {
        id: 1,
        userId: 1,
        title: "Sample Post",
        body: "This is a sample post body",
        comments: [
          {
            id: 1,
            postId: 1,
            name: "Jane Smith",
            email: "jane@example.com",
            body: "Great post!"
          }
        ]
      }
    ]
  }
];

export async function connect(): Promise<void> {
  try {
    console.log('Attempting to connect to MongoDB...');
    client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB');
    
    db = client.db(dbName);
    
    // Initialize collections
    usersCollection = db.collection('users');
    postsCollection = db.collection('posts');
    commentsCollection = db.collection('comments');
    
    // Check if users collection is empty and if so, add mock data for testing
    const userCount = await usersCollection.countDocuments();
    if (userCount === 0) {
      console.log('No users found, adding mock data');
      await usersCollection.insertMany(mockUsers);
    }
    
    console.log('Collections initialized with MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('Setting up in-memory mock collections instead');
    // Set up mock collections for development
    setupMockCollections();
  }
}

// Setup mock collections when MongoDB connection fails
function setupMockCollections() {
  console.log('Setting up mock collections with sample data');
  // Create mock collection interfaces
  const mockCollection = {
    find: () => ({
      toArray: async () => mockUsers,
      sort: () => ({
        limit: () => ({
          toArray: async () => mockUsers
        })
      })
    }),
    findOne: async (query: any) => {
      const userId = query.id;
      return mockUsers.find(user => user.id === userId) || null;
    },
    insertOne: async (doc: any) => {
      console.log('Mock insertOne:', doc);
      return { acknowledged: true };
    },
    insertMany: async (docs: any[]) => {
      console.log('Mock insertMany:', docs.length, 'documents');
      return { acknowledged: true };
    },
    deleteOne: async (query: any) => {
      console.log('Mock deleteOne:', query);
      return { deletedCount: 1 };
    },
    deleteMany: async () => {
      console.log('Mock deleteMany: all documents');
      return { deletedCount: mockUsers.length };
    },
    countDocuments: async () => {
      console.log('Mock countDocuments:', mockUsers.length);
      return mockUsers.length;
    }
  };

  // Assign mock collection to each collection variable
  usersCollection = mockCollection as unknown as Collection;
  postsCollection = mockCollection as unknown as Collection;
  commentsCollection = mockCollection as unknown as Collection;
  
  console.log('Mock collections setup complete with', mockUsers.length, 'users');
}

export async function disconnect(): Promise<void> {
  if (client) {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}
