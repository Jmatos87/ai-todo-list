import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");
const DATA_FILE = join(DATA_DIR, "todos.json");

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

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, "[]");
  }
}

function loadTodos(): Todo[] {
  ensureDataDir();
  const data = readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function saveTodos(todos: Todo[]): void {
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

// Get all todos
app.get("/api/todos", (req, res) => {
  const todos = loadTodos();
  res.json(todos);
});

// Get single todo
app.get("/api/todos/:id", (req, res) => {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
});

// Create todo
app.post("/api/todos", (req, res) => {
  const todos = loadTodos();
  const now = new Date().toISOString();
  const newTodo: Todo = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    completed: false,
    priority: req.body.priority || "medium",
    dueDate: req.body.dueDate,
    tags: req.body.tags || [],
    createdAt: now,
    updatedAt: now,
  };
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// Update todo
app.patch("/api/todos/:id", (req, res) => {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }
  const updated = {
    ...todos[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  todos[index] = updated;
  saveTodos(todos);
  res.json(updated);
});

// Delete todo
app.delete("/api/todos/:id", (req, res) => {
  let todos = loadTodos();
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== req.params.id);
  if (todos.length === initialLength) {
    return res.status(404).json({ error: "Todo not found" });
  }
  saveTodos(todos);
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
