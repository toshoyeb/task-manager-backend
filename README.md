# Task Manager Backend

A RESTful API backend for a task management application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **User Authentication**: Secure signup and login with JWT
- **Task Management**: Create, read, update, and delete tasks
- **Task Organization**: Categorize tasks and add tags
- **Task Status**: Mark tasks as pending or completed
- **Search & Filter**: Search tasks by title, filter by category or status
- **Task Stats**: Get statistics about task completion and distribution

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd task-manager-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://toshoyeb:ZIqCf5YEixRHK00B@cluster0.02rpw0y.mongodb.net/
   JWT_SECRET=1234567890
   NODE_ENV=development
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- **Register User**: `POST /api/auth/register`
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Login**: `POST /api/auth/login`
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **Get User Profile**: `GET /api/auth/profile`
  - Requires authentication token in the header:
    ```
    Authorization: Bearer <your_token>
    ```

### Tasks

All task endpoints require authentication.

- **Create Task**: `POST /api/tasks`
  ```json
  {
    "title": "Task Title",
    "description": "Task description",
    "category": "work",
    "tags": ["coding", "project"],
    "priority": "high",
    "dueDate": "2023-05-31T23:59:59.999Z"
  }
  ```

- **Get All Tasks**: `GET /api/tasks`
  - Optional query parameters:
    - `status`: Filter by status (pending, completed)
    - `category`: Filter by category
    - `search`: Search in title

- **Get Task by ID**: `GET /api/tasks/:id`

- **Update Task**: `PUT /api/tasks/:id`
  ```json
  {
    "title": "Updated Title",
    "status": "completed"
  }
  ```

- **Delete Task**: `DELETE /api/tasks/:id`

- **Get Task Statistics**: `GET /api/tasks/stats`

## Project Structure

```
task-manager-backend/
├── src/
│   ├── config/
│   │   └── db.ts              # Database connection configuration
│   ├── controllers/
│   │   ├── authController.ts  # Authentication controllers
│   │   └── taskController.ts  # Task CRUD controllers
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── models/
│   │   ├── User.ts            # User model schema
│   │   └── Task.ts            # Task model schema
│   ├── routes/
│   │   ├── authRoutes.ts      # Authentication routes
│   │   └── taskRoutes.ts      # Task routes
│   ├── services/
│   │   ├── taskService.ts     # Task business logic
│   │   └── userService.ts     # User business logic
│   └── server.ts              # Express server setup
├── .env                       # Environment variables
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies
```

## Development

- Build the project: `npm run build`
- Start production server: `npm start`
- Start development server with hot reload: `npm run watch`

## Testing API Endpoints

You can test the API using tools like Postman or curl commands. Here's an example with curl:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login to get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create a task (replace TOKEN with your actual token)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the task manager application",
    "category": "work",
    "tags": ["coding", "typescript"],
    "priority": "high",
    "dueDate": "2023-05-31T23:59:59.999Z"
  }'
```

## License

ISC

## Author

Shoyeb Akhtar
