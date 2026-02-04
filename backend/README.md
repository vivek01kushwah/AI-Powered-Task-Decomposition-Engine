# Task Decomposition API - Backend

Node.js/Express backend for the Task Decomposition API MERN stack application.

## Features

- RESTful API endpoints for task management
- Task decomposition engine with multiple strategies
- MongoDB integration with Mongoose
- Error handling middleware
- Logging utilities
- CORS enabled

## Project Structure

- `/models` - MongoDB schemas (Task, Decomposition)
- `/controllers` - Business logic for tasks and decompositions
- `/routes` - API endpoint definitions
- `/services` - Core decomposition logic
- `/utils` - Helper functions and logger
- `server.js` - Express application entry point

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Decompositions
- `POST /api/decompositions/decompose` - Create task decomposition
- `GET /api/decompositions/:id` - Get decomposition
- `GET /api/decompositions/task/:taskId` - List task decompositions
- `PUT /api/decompositions/:id` - Update decomposition
- `DELETE /api/decompositions/:id` - Delete decomposition

### Health Check
- `GET /api/health` - Server health status

## Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `body-parser` - JSON body parsing
- `dotenv` - Environment variables
- `nodemon` (dev) - Auto-restart on file changes
- `jest` (dev) - Testing framework

## Error Handling

All errors are handled by the centralized error middleware in `server.js`. Errors return:

```json
{
  "success": false,
  "message": "Error message",
  "error": {}
}
```

## Logging

Logger utility available at `/utils/logger.js` with methods:
- `logger.log(message)`
- `logger.error(message, error)`
- `logger.info(message)`
- `logger.warn(message)`
