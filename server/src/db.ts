import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Todo {
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

interface TodoRow {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed,
    priority: row.priority as Todo["priority"],
    dueDate: row.due_date ?? undefined,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars");
    }
    _client = createClient(url, key);
  }
  return _client;
}

export async function getAllTodos(): Promise<Todo[]> {
  const { data, error } = await getClient()
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TodoRow[]).map(rowToTodo);
}

export async function getTodoById(id: string): Promise<Todo | null> {
  const { data, error } = await getClient()
    .from("todos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return rowToTodo(data as TodoRow);
}

export async function createTodo(input: {
  title: string;
  description?: string;
  priority?: Todo["priority"];
  dueDate?: string;
  tags?: string[];
}): Promise<Todo> {
  const { data, error } = await getClient()
    .from("todos")
    .insert({
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? "medium",
      due_date: input.dueDate ?? null,
      tags: input.tags ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTodo(data as TodoRow);
}

export async function updateTodo(
  id: string,
  fields: Partial<{
    title: string;
    description: string;
    completed: boolean;
    priority: Todo["priority"];
    dueDate: string;
    tags: string[];
  }>
): Promise<Todo | null> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.title !== undefined) update.title = fields.title;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.completed !== undefined) update.completed = fields.completed;
  if (fields.priority !== undefined) update.priority = fields.priority;
  if (fields.dueDate !== undefined) update.due_date = fields.dueDate;
  if (fields.tags !== undefined) update.tags = fields.tags;

  const { data, error } = await getClient()
    .from("todos")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return rowToTodo(data as TodoRow);
}

export async function deleteTodo(id: string): Promise<boolean> {
  const { error, count } = await getClient()
    .from("todos")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function completeTodo(id: string): Promise<Todo | null> {
  return updateTodo(id, { completed: true });
}

export async function listTodos(filters?: {
  completed?: boolean;
  priority?: Todo["priority"];
  tag?: string;
}): Promise<Todo[]> {
  let query = getClient()
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.completed !== undefined) {
    query = query.eq("completed", filters.completed);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.tag) {
    query = query.contains("tags", [filters.tag]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as TodoRow[]).map(rowToTodo);
}

export async function searchTodos(searchQuery: string): Promise<Todo[]> {
  const pattern = `%${searchQuery}%`;
  const { data, error } = await getClient()
    .from("todos")
    .select("*")
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TodoRow[]).map(rowToTodo);
}
