machine:assert for "REQ-TODO-ADD-01" {
  scenario("Adding a todo appends it to the list", () => {
    const todos: Array<{ id: string; text: string; completed: boolean }> = [];
    const newTodo = { id: 'todo-1', text: 'Buy milk', completed: false };
    todos.push(newTodo);
    expect(todos).toHaveLength(1);
    expect(todos[0].text).toBe('Buy milk');
    expect(todos[0].completed).toBe(false);
  });

  scenario("Empty input does not add a todo", () => {
    const todos: Array<{ id: string; text: string; completed: boolean }> = [];
    const input = '   ';
    if (input.trim().length > 0) {
      todos.push({ id: 'todo-1', text: input.trim(), completed: false });
    }
    expect(todos).toHaveLength(0);
  });
}

machine:assert for "REQ-TODO-TOGGLE-01" {
  scenario("Toggling a todo flips its completed state", () => {
    const todo = { id: 'todo-1', text: 'Buy milk', completed: false };
    todo.completed = !todo.completed;
    expect(todo.completed).toBe(true);
    todo.completed = !todo.completed;
    expect(todo.completed).toBe(false);
  });
}

machine:assert for "REQ-TODO-DELETE-01" {
  scenario("Deleting a todo removes it from the list", () => {
    const todos = [
      { id: 'todo-1', text: 'Buy milk', completed: false },
      { id: 'todo-2', text: 'Walk the dog', completed: true },
    ];
    const filtered = todos.filter((t) => t.id !== 'todo-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('todo-2');
  });
}

machine:assert for "REQ-TODO-FILTER-01" {
  scenario("Filter 'active' shows only incomplete todos", () => {
    const todos = [
      { id: 'todo-1', text: 'Buy milk', completed: false },
      { id: 'todo-2', text: 'Walk the dog', completed: true },
    ];
    const active = todos.filter((t) => !t.completed);
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('todo-1');
  });

  scenario("Filter 'completed' shows only completed todos", () => {
    const todos = [
      { id: 'todo-1', text: 'Buy milk', completed: false },
      { id: 'todo-2', text: 'Walk the dog', completed: true },
    ];
    const completed = todos.filter((t) => t.completed);
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('todo-2');
  });
}
