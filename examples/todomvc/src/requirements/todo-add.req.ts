import { defineRequirement } from '@chonky/runtime';

export const addTodoRequirement = defineRequirement({
  id: 'REQ-TODO-ADD-01',
  name: 'Add Todo Item',
  description: 'User can add a new todo item by typing in the input field and pressing Enter.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Input#new-todo',
      event: 'keydown:Enter',
    },
  ],
  preconditions: [
    {
      expression: 'inputValue.trim().length > 0',
      type: 'DATA_VALID',
    },
  ],
  sideEffects: [
    {
      type: 'STATE_MUTATION',
      target: 'todos',
      description: 'Append new todo to the list',
    },
  ],
});
