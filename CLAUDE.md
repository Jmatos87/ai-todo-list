# Claude Code Context

## Project Overview
Smart Todo App with MCP integration. Claude can manage todos via MCP tools while users interact through a React frontend.

## Tech Stack
- **Frontend**: React + TypeScript + Vite (port 5173)
- **API Server**: Express + TypeScript (port 3001)
- **MCP Server**: @modelcontextprotocol/sdk
- **Database**: Supabase (Postgres)
- **Deployment**: Vercel (frontend) + Render (backend)

## Project Structure
```
client/          # React frontend
server/src/
  ├── api.ts     # REST API for React frontend
  ├── db.ts      # Shared Supabase CRUD module
  └── index.ts   # MCP server for Claude
```

## Environment Variables

### Server (`server/.env`)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon/public key
- `PORT` - API server port (default 3001)
- `CORS_ORIGIN` - Allowed CORS origin (default `*`)

### Client (`client/.env`)
- `VITE_API_URL` - API base URL (default `http://localhost:3001/api`)

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

## Scripts (`server/package.json`)
- `npm start` - Run API server (production, for Render)
- `npm run start:mcp` - Run MCP server
- `npm run dev` - Run API server (dev, with tsx)
- `npm run dev:mcp` - Run MCP server (dev)
- `npm run build` - Compile TypeScript

## Database
- Supabase Postgres with RLS enabled
- Table: `todos` (snake_case columns mapped to camelCase in `db.ts`)
- Both `api.ts` and `index.ts` import CRUD from `db.ts` — never access Supabase directly

## Code Conventions
- Use TypeScript strict mode
- React components in `client/src/components/`
- CSS files colocated with components
- Catppuccin Mocha color palette for UI
