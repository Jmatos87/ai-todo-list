# Smart Todo App with MCP

A todo application where Claude can read/write tasks via MCP (Model Context Protocol), featuring natural language processing for task management.

## Features

- React frontend with dark theme
- MCP server integration for Claude to manage tasks
- Natural language task creation and updates
- Priority levels (low, medium, high)
- Tags and due dates
- Filter by status (all, active, completed)

## Project Structure

```
ai-todo-list/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # MCP server + API server
└── data/            # Shared JSON storage
```

## Setup

### Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### Run the app

Terminal 1 - API Server:
```bash
cd server && npm run dev
```

Terminal 2 - React Frontend:
```bash
cd client && npm run dev
```

## MCP Configuration

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "todo": {
      "command": "npx",
      "args": ["tsx", "C:/Users/josue/Desktop/ai-project/ai-todo-list/server/src/index.ts"]
    }
  }
}
```

### Available MCP Tools

- `list_todos` - List all todos with optional filters
- `add_todo` - Add a new todo item
- `update_todo` - Update an existing todo
- `delete_todo` - Delete a todo
- `complete_todo` - Mark a todo as completed
- `search_todos` - Search todos by text
