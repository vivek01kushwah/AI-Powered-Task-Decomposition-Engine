# Task Decomposition API - Frontend

React frontend application for the Task Decomposition API MERN stack.

## Features

- Task listing and management
- Task filtering by status and priority
- Create, edit, and delete tasks
- Task decomposition interface
- Responsive design with Tailwind CSS
- API integration with Axios

## Project Structure

- `/src/components` - React components (Header, TaskList, TaskDetail, DecompositionView)
- `/src/services` - API service layer using Axios
- `/src/utils` - Utility functions (helpers, formatting)
- `/public` - Static HTML and assets
- `/src/App.js` - Main application component
- `/src/index.js` - React entry point

## Installation

```bash
npm install
```

## Configuration

By default, the frontend connects to `http://localhost:5000`. To customize:

Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Development Server

```bash
npm start
```

Opens at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

Creates an optimized build in the `/build` directory.

## Running Tests

```bash
npm test
```

## Components

### Header
Navigation and branding component

### TaskList
Displays tasks with filtering capabilities
- Filter by status (pending, in-progress, completed)
- Filter by priority (low, medium, high)
- Quick view of task details

### TaskDetail
Detailed task view with editing
- View/edit task properties
- Initiate task decomposition
- Save changes

### DecompositionView
Display decomposed subtasks
- View decomposition method
- See subtask details
- View estimated hours and complexity

## Services

### apiService
Centralized API client using Axios
- Task CRUD operations
- Decomposition operations
- Base URL configuration

## Dependencies

- `react` - UI library
- `react-dom` - React DOM rendering
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `postcss` & `autoprefixer` - CSS processing
- `react-scripts` - Build scripts

## Styling

- **Tailwind CSS** for utility-first styling
- **PostCSS** for CSS processing
- Custom CSS in `src/App.css`
- Global styles in `src/index.css`

## Responsive Design

The application is fully responsive with breakpoints:
- Mobile (default)
- Tablet (`md:`)
- Desktop (`lg:`)

## API Integration

The frontend automatically proxies API calls through the backend server configured in `package.json`. Update the proxy value if your backend is on a different port:

```json
"proxy": "http://localhost:5000"
```

## Environment Variables

- `REACT_APP_API_URL` - Backend API base URL (optional, defaults to proxy)
- Any variable starting with `REACT_APP_` is available in the app
