import React, { useState, useCallback, useMemo } from 'react';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import type { Todo, FilterType } from './types';

let nextId = 1;
function generateId(): string {
  return `todo-${nextId++}`;
}

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const addTodo = useCallback((text: string) => {
    setTodos((prev) => [...prev, { id: generateId(), text, completed: false }]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t)),
    );
  }, []);

  const toggleAll = useCallback(() => {
    setTodos((prev) => {
      const allCompleted = prev.every((t) => t.completed);
      return prev.map((t) => ({ ...t, completed: !allCompleted }));
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed);
      case 'completed':
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;
  const allCompleted = todos.length > 0 && todos.every((t) => t.completed);

  return (
    <section className="todoapp">
      <TodoInput onAdd={addTodo} />
      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
        onToggleAll={toggleAll}
        allCompleted={allCompleted}
      />
      {todos.length > 0 && (
        <TodoFilter
          filter={filter}
          onFilter={setFilter}
          activeCount={activeCount}
          completedCount={completedCount}
          onClearCompleted={clearCompleted}
        />
      )}
    </section>
  );
}
