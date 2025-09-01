/**
 * Basic setup test to validate test configuration
 */

describe('Test Setup Validation', () => {
  it('should have working test environment', () => {
    expect(true).toBe(true);
  });

  it('should have mocked performance API', () => {
    expect(global.performance).toBeDefined();
    expect(global.performance.now).toBeDefined();
    expect(typeof global.performance.now()).toBe('number');
  });

  it('should have jest setup working', () => {
    expect(jest).toBeDefined();
    expect(jest.fn).toBeDefined();
  });
});