import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  searchTodos,
} from "./db.js";
import type { Todo } from "./db.js";

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

  try {
    switch (name) {
      case "list_todos": {
        const todos = await listTodos({
          completed: args?.completed as boolean | undefined,
          priority: args?.priority as Todo["priority"] | undefined,
          tag: args?.tag as string | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(todos, null, 2),
            },
          ],
        };
      }

      case "add_todo": {
        const newTodo = await createTodo({
          title: args?.title as string,
          description: args?.description as string | undefined,
          priority: args?.priority as Todo["priority"] | undefined,
          dueDate: args?.dueDate as string | undefined,
          tags: args?.tags as string[] | undefined,
        });
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
        const id = args?.id as string;
        const fields: Record<string, unknown> = {};
        if (args?.title !== undefined) fields.title = args.title;
        if (args?.description !== undefined) fields.description = args.description;
        if (args?.completed !== undefined) fields.completed = args.completed;
        if (args?.priority !== undefined) fields.priority = args.priority;
        if (args?.dueDate !== undefined) fields.dueDate = args.dueDate;
        if (args?.tags !== undefined) fields.tags = args.tags;

        const updated = await updateTodo(id, fields);
        if (!updated) {
          return {
            content: [{ type: "text", text: `Todo not found: ${id}` }],
            isError: true,
          };
        }
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
        const id = args?.id as string;
        const deleted = await deleteTodo(id);
        if (!deleted) {
          return {
            content: [{ type: "text", text: `Todo not found: ${id}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: `Deleted todo: ${id}` }],
        };
      }

      case "complete_todo": {
        const id = args?.id as string;
        const completed = await completeTodo(id);
        if (!completed) {
          return {
            content: [{ type: "text", text: `Todo not found: ${id}` }],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Completed: ${completed.title}`,
            },
          ],
        };
      }

      case "search_todos": {
        const results = await searchTodos(args?.query as string);
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
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Error in ${name}: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
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
