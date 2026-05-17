import { apiRequest } from './http.service.js';

export const authApi = {
  login(payload) {
    return apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },

  register(payload) {
    return apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },
};
