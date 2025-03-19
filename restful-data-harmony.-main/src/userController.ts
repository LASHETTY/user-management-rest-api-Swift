
import { ObjectId } from 'mongodb';
import { usersCollection } from './db';
import { User } from './types';

// Get all users from the database
export async function getAllUsers(): Promise<User[]> {
  // Convert MongoDB documents to User type with type assertion
  return (await usersCollection.find({}).toArray()).map(doc => doc as unknown as User);
}

// Get a specific user by ID including their posts and comments
export async function getUserById(userId: number): Promise<User | null> {
  const user = await usersCollection.findOne({ id: userId });
  // Return null if user not found, otherwise convert to User type
  return user ? (user as unknown as User) : null;
}

// Create a new user in the database
export async function createUser(userData: User): Promise<{ exists: boolean; userId?: number }> {
  // Check if user already exists
  const existingUser = await usersCollection.findOne({ id: userData.id });
  
  if (existingUser) {
    return { exists: true };
  }
  
  // If no ID is provided, generate one
  if (!userData.id) {
    const highestUser = await usersCollection.find().sort({ id: -1 }).limit(1).toArray();
    userData.id = highestUser.length > 0 ? ((highestUser[0] as unknown as User).id || 0) + 1 : 1;
  }
  
  // Initialize empty posts array if none provided
  if (!userData.posts) {
    userData.posts = [];
  }
  
  // Insert the new user
  await usersCollection.insertOne(userData);
  return { exists: false, userId: userData.id };
}

// Delete all users from the database
export async function deleteAllUsers(): Promise<void> {
  await usersCollection.deleteMany({});
}

// Delete a specific user by ID
export async function deleteUserById(userId: number): Promise<{ success: boolean }> {
  const result = await usersCollection.deleteOne({ id: userId });
  return { success: result.deletedCount > 0 };
}
