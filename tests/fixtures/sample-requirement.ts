import { defineRequirement } from '@chonky/runtime';

export const loginRequirement = defineRequirement({
  id: 'REQ-USER-LOGIN-01',
  name: 'User Login',
  description: 'Handle user authentication via username and password.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Button#login',
      event: 'click',
    },
  ],
  preconditions: [
    {
      expression: 'formData.username.length > 0',
      type: 'DATA_VALID',
    },
  ],
  sideEffects: [
    {
      type: 'API_CALL',
      target: '/api/auth/login',
      description: 'Send login credentials to server',
    },
  ],
});
