import React from 'react';
import type { FilterType } from '../types';

interface TodoFilterProps {
  filter: FilterType;
  onFilter: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

export function TodoFilter({
  filter,
  onFilter,
  activeCount,
  completedCount,
  onClearCompleted,
}: TodoFilterProps) {
  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount}</strong> {activeCount === 1 ? 'item' : 'items'} left
      </span>
      <ul className="filters">
        <li>
          <a
            className={filter === 'all' ? 'selected' : ''}
            href="#/"
            onClick={(e) => { e.preventDefault(); onFilter('all'); }}
          >
            All
          </a>
        </li>
        <li>
          <a
            className={filter === 'active' ? 'selected' : ''}
            href="#/active"
            onClick={(e) => { e.preventDefault(); onFilter('active'); }}
          >
            Active
          </a>
        </li>
        <li>
          <a
            className={filter === 'completed' ? 'selected' : ''}
            href="#/completed"
            onClick={(e) => { e.preventDefault(); onFilter('completed'); }}
          >
            Completed
          </a>
        </li>
      </ul>
      {completedCount > 0 && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
}
