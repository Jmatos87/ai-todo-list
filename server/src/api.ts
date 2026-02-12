import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./db.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json());

// Get all todos
app.get("/api/todos", async (_req, res) => {
  try {
    const todos = await getAllTodos();
    res.json(todos);
  } catch (err) {
    console.error("GET /api/todos error:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Get single todo
app.get("/api/todos/:id", async (req, res) => {
  try {
    const todo = await getTodoById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    console.error("GET /api/todos/:id error:", err);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Create todo
app.post("/api/todos", async (req, res) => {
  try {
    const todo = await createTodo({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      tags: req.body.tags,
    });
    res.status(201).json(todo);
  } catch (err) {
    console.error("POST /api/todos error:", err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update todo
app.patch("/api/todos/:id", async (req, res) => {
  try {
    const updated = await updateTodo(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/todos/:id error:", err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const deleted = await deleteTodo(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/todos/:id error:", err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
