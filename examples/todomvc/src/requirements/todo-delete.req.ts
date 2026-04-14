import { defineRequirement } from '@chonky/runtime';

export const deleteTodoRequirement = defineRequirement({
  id: 'REQ-TODO-DELETE-01',
  name: 'Delete Todo Item',
  description: 'User can delete a todo item by clicking the destroy button.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Button.destroy',
      event: 'click',
    },
  ],
  preconditions: [
    {
      expression: 'todo.id !== undefined',
      type: 'DATA_VALID',
    },
  ],
  sideEffects: [
    {
      type: 'STATE_MUTATION',
      target: 'todos',
      description: 'Remove the todo from the list',
    },
  ],
});
