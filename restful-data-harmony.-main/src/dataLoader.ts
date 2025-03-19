
import { customFetch } from './utils';
import { usersCollection, postsCollection, commentsCollection } from './db';
import { User, Post, Comment } from './types';

const PLACEHOLDER_API = 'https://jsonplaceholder.typicode.com';

export async function loadData(): Promise<void> {
  try {
    // Fetch users, posts, and comments from JSONPlaceholder
    const users: User[] = await customFetch(`${PLACEHOLDER_API}/users`);
    const posts: Post[] = await customFetch(`${PLACEHOLDER_API}/posts`);
    const comments: Comment[] = await customFetch(`${PLACEHOLDER_API}/comments`);

    // Group posts by userId
    const postsByUserId = posts.reduce<Record<number, Post[]>>((acc, post) => {
      const userId = post.userId || 0;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(post);
      return acc;
    }, {});

    // Group comments by postId
    const commentsByPostId = comments.reduce<Record<number, Comment[]>>((acc, comment) => {
      const postId = comment.postId || 0;
      if (!acc[postId]) {
        acc[postId] = [];
      }
      acc[postId].push(comment);
      return acc;
    }, {});

    // Enrich posts with comments
    const enrichedPosts = posts.map(post => ({
      ...post,
      comments: commentsByPostId[post.id] || []
    }));

    // Enrich users with posts (which include comments)
    const enrichedUsers = users.map(user => ({
      ...user,
      posts: postsByUserId[user.id]?.map(post => ({
        ...post,
        comments: commentsByPostId[post.id] || []
      })) || []
    }));

    // Clear existing collections
    await usersCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await commentsCollection.deleteMany({});

    // Insert enriched data into MongoDB
    if (enrichedUsers.length > 0) {
      await usersCollection.insertMany(enrichedUsers);
    }
    
    if (enrichedPosts.length > 0) {
      await postsCollection.insertMany(enrichedPosts);
    }
    
    if (comments.length > 0) {
      await commentsCollection.insertMany(comments);
    }

    console.log('Data loaded successfully');
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}
