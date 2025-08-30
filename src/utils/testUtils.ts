// Test utilities for the application
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.jpg',
};

export const mockApiResponse = <T>(data: T) => ({
  data,
  message: 'Success',
  success: true,
});
