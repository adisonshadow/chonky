import { defineRequirement } from '@chonkylang/runtime';

export const filterTodoRequirement = defineRequirement({
  id: 'REQ-TODO-FILTER-01',
  name: 'Filter Todos by Status',
  description: 'User can filter the displayed todos by All, Active, or Completed.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Link.filter',
      event: 'click',
    },
  ],
  sideEffects: [
    {
      type: 'STATE_MUTATION',
      target: 'filter',
      description: 'Update the active filter value',
    },
  ],
});
