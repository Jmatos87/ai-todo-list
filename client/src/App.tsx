import { useState, useEffect } from "react";
import { type Todo } from "./types/todo";
import { TodoItem } from "./components/TodoItem";
import { AddTodo } from "./components/AddTodo";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="app">
      <header className="header">
        <h1>Todo List</h1>
      </header>

      <main className="main">
        <AddTodo onAdd={addTodo} />

        <div className="filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({todos.length})
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active ({activeCount})
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed ({todos.length - activeCount})
          </button>
        </div>

        <div className="todo-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty">
              {filter === "all"
                ? "No todos yet. Add one above!"
                : `No ${filter} todos.`}
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
