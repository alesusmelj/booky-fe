import { mockUser, mockApiResponse } from '../testUtils';

describe('testUtils', () => {
  describe('mockUser', () => {
    it('should have required user properties', () => {
      expect(mockUser).toHaveProperty('id');
      expect(mockUser).toHaveProperty('name');
      expect(mockUser).toHaveProperty('email');
    });

    it('should have valid data types', () => {
      expect(typeof mockUser.id).toBe('string');
      expect(typeof mockUser.name).toBe('string');
      expect(typeof mockUser.email).toBe('string');
    });
  });

  describe('mockApiResponse', () => {
    it('should wrap data with success response', () => {
      const testData = { test: 'value' };
      const response = mockApiResponse(testData);

      expect(response.data).toEqual(testData);
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success');
    });
  });
});
