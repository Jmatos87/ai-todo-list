import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "../../data/todos.json");

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

function loadTodos(): Todo[] {
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  const data = readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function saveTodos(todos: Todo[]): void {
  writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

const server = new Server(
  {
    name: "todo-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_todos",
      description: "List all todos, optionally filtered by status or priority",
      inputSchema: {
        type: "object",
        properties: {
          completed: {
            type: "boolean",
            description: "Filter by completion status",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Filter by priority level",
          },
          tag: {
            type: "string",
            description: "Filter by tag",
          },
        },
      },
    },
    {
      name: "add_todo",
      description: "Add a new todo item with natural language support",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The todo title/task description",
          },
          description: {
            type: "string",
            description: "Optional detailed description",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Priority level (defaults to medium)",
          },
          dueDate: {
            type: "string",
            description: "Due date in ISO format",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags for categorization",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "update_todo",
      description: "Update an existing todo item",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The todo ID to update",
          },
          title: {
            type: "string",
            description: "New title",
          },
          description: {
            type: "string",
            description: "New description",
          },
          completed: {
            type: "boolean",
            description: "Mark as completed or not",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "New priority level",
          },
          dueDate: {
            type: "string",
            description: "New due date",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "New tags",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "delete_todo",
      description: "Delete a todo item",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The todo ID to delete",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "complete_todo",
      description: "Mark a todo as completed",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The todo ID to complete",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "search_todos",
      description: "Search todos by text in title or description",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
        },
        required: ["query"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let todos = loadTodos();

  switch (name) {
    case "list_todos": {
      let filtered = todos;
      if (args?.completed !== undefined) {
        filtered = filtered.filter((t) => t.completed === args.completed);
      }
      if (args?.priority) {
        filtered = filtered.filter((t) => t.priority === args.priority);
      }
      if (args?.tag) {
        filtered = filtered.filter((t) => t.tags.includes(args.tag as string));
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(filtered, null, 2),
          },
        ],
      };
    }

    case "add_todo": {
      const now = new Date().toISOString();
      const newTodo: Todo = {
        id: uuidv4(),
        title: args?.title as string,
        description: args?.description as string | undefined,
        completed: false,
        priority: (args?.priority as Todo["priority"]) || "medium",
        dueDate: args?.dueDate as string | undefined,
        tags: (args?.tags as string[]) || [],
        createdAt: now,
        updatedAt: now,
      };
      todos.push(newTodo);
      saveTodos(todos);
      return {
        content: [
          {
            type: "text",
            text: `Created todo: ${JSON.stringify(newTodo, null, 2)}`,
          },
        ],
      };
    }

    case "update_todo": {
      const index = todos.findIndex((t) => t.id === args?.id);
      if (index === -1) {
        return {
          content: [{ type: "text", text: `Todo not found: ${args?.id}` }],
          isError: true,
        };
      }
      const todo = todos[index];
      const updated: Todo = {
        id: todo.id,
        title: (args?.title as string) ?? todo.title,
        description: args?.description !== undefined ? (args.description as string) : todo.description,
        completed: args?.completed !== undefined ? (args.completed as boolean) : todo.completed,
        priority: (args?.priority as Todo["priority"]) ?? todo.priority,
        dueDate: args?.dueDate !== undefined ? (args.dueDate as string) : todo.dueDate,
        tags: (args?.tags as string[]) ?? todo.tags,
        createdAt: todo.createdAt,
        updatedAt: new Date().toISOString(),
      };
      todos[index] = updated as Todo;
      saveTodos(todos);
      return {
        content: [
          {
            type: "text",
            text: `Updated todo: ${JSON.stringify(updated, null, 2)}`,
          },
        ],
      };
    }

    case "delete_todo": {
      const initialLength = todos.length;
      todos = todos.filter((t) => t.id !== args?.id);
      if (todos.length === initialLength) {
        return {
          content: [{ type: "text", text: `Todo not found: ${args?.id}` }],
          isError: true,
        };
      }
      saveTodos(todos);
      return {
        content: [{ type: "text", text: `Deleted todo: ${args?.id}` }],
      };
    }

    case "complete_todo": {
      const index = todos.findIndex((t) => t.id === args?.id);
      if (index === -1) {
        return {
          content: [{ type: "text", text: `Todo not found: ${args?.id}` }],
          isError: true,
        };
      }
      todos[index].completed = true;
      todos[index].updatedAt = new Date().toISOString();
      saveTodos(todos);
      return {
        content: [
          {
            type: "text",
            text: `Completed: ${todos[index].title}`,
          },
        ],
      };
    }

    case "search_todos": {
      const query = (args?.query as string).toLowerCase();
      const results = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Todo MCP server running...");
}

main().catch(console.error);
