# Claude Code Context

## Project Overview
Smart Todo App with MCP integration. Claude can manage todos via MCP tools while users interact through a React frontend.

## Tech Stack
- **Frontend**: React + TypeScript + Vite (port 5173)
- **API Server**: Express + TypeScript (port 3001)
- **MCP Server**: @modelcontextprotocol/sdk
- **Storage**: JSON file (`data/todos.json`)

## Project Structure
```
client/          # React frontend
server/src/
  ├── api.ts     # REST API for React frontend
  └── index.ts   # MCP server for Claude
data/            # Shared JSON storage
```

## Running the App
```bash
# API server
cd server && npm run dev

# React frontend
cd client && npm run dev
```

## MCP Tools
- `list_todos` - List/filter todos
- `add_todo` - Create todo with title, description, priority, dueDate, tags
- `update_todo` - Update any todo field by ID
- `delete_todo` - Remove todo by ID
- `complete_todo` - Mark todo as completed
- `search_todos` - Search by text in title/description

## Todo Schema
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Code Conventions
- Use TypeScript strict mode
- React components in `client/src/components/`
- CSS files colocated with components
- Catppuccin Mocha color palette for UI
