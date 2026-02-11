import { useState } from "react";
import { type Todo } from "../types/todo";
import "./AddTodo.css";

interface AddTodoProps {
  onAdd: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      dueDate: dueDate || undefined,
      tags,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setTags([]);
    setIsExpanded(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <div className="add-todo-main">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="add-todo-input"
        />
        <button type="submit" className="add-todo-button">
          Add
        </button>
      </div>

      {isExpanded && (
        <div className="add-todo-details">
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="add-todo-description"
          />

          <div className="add-todo-row">
            <div className="add-todo-field">
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Todo["priority"])}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="add-todo-field">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="add-todo-tags">
            <div className="add-todo-tag-input">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" onClick={handleAddTag}>
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="add-todo-tag-list">
                {tags.map((tag) => (
                  <span key={tag} className="add-todo-tag">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
