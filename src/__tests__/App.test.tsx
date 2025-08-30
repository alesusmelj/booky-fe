import App from '../App';

describe('App', () => {
  it('should be defined', () => {
    expect(App).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof App).toBe('function');
  });

  it('should have correct name', () => {
    expect(App.name).toBe('App');
  });
});
