/**
 * Example test file
 * Remove this file and add real tests as development progresses
 */

describe('bondova-MOR Project Setup', () => {
  test('project should be initialized', () => {
    expect(true).toBe(true);
  });

  test('environment should load dotenv', () => {
    // Tests that .env configuration is loaded
    expect(process.env).toBeDefined();
  });
});
