import { Todo } from "../types/todo";
import "./TodoItem.css";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const priorityColors = {
    low: "#4ade80",
    medium: "#fbbf24",
    high: "#f87171",
  };

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
      </div>
      <div className="todo-content">
        <div className="todo-header">
          <span className="todo-title">{todo.title}</span>
          <span
            className="todo-priority"
            style={{ backgroundColor: priorityColors[todo.priority] }}
          >
            {todo.priority}
          </span>
        </div>
        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}
        <div className="todo-meta">
          {todo.dueDate && (
            <span className="todo-due">
              Due: {new Date(todo.dueDate).toLocaleDateString()}
            </span>
          )}
          {todo.tags.length > 0 && (
            <div className="todo-tags">
              {todo.tags.map((tag) => (
                <span key={tag} className="todo-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button className="todo-delete" onClick={() => onDelete(todo.id)}>
        ×
      </button>
    </div>
  );
}
