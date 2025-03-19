
# REST API Server with MongoDB for User Management

## Project info

A Node.js REST API server with MongoDB for user management. This project provides endpoints for managing users, posts, and comments.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <https://github.com/LASHETTY/user-management-rest-api-Swift.git>

# Step 2: Navigate to the project directory.
cd <restful-data-harmony.-main>

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- MongoDB

## API Endpoints

- `GET /api/load` - Load sample data from JSONPlaceholder
- `GET /api/users` - Get all users 
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users` - Create a new user
- `DELETE /api/users` - Delete all users
- `DELETE /api/users/:userId` - Delete user by ID
