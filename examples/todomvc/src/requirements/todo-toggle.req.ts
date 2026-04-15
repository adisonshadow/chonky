import { defineRequirement } from '@chonkylang/runtime';

export const toggleTodoRequirement = defineRequirement({
  id: 'REQ-TODO-TOGGLE-01',
  name: 'Toggle Todo Completion',
  description: 'User can toggle a todo item between completed and active states.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Input.toggle',
      event: 'change',
    },
  ],
  sideEffects: [
    {
      type: 'STATE_MUTATION',
      target: 'todos',
      description: 'Toggle the completed flag of the todo',
    },
  ],
});
