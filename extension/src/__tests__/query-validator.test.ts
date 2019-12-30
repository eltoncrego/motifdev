import QueryValidator from '../main/app/js/ext/query-validator';

test('Test simple valid query', () => {
    expect(new QueryValidator().validateQuery(["cool", "and", "quiet", "or", "sad"]).error).toBe(null);
    expect(new QueryValidator().validateQuery(["cool", "and", "quiet", "or", "sad"]).valid).toBe(true);
});

test('Test trailing operator', () => {
    expect(new QueryValidator().validateQuery(["cool", "and", "quiet", "or", "sad", "and"]).valid).toBe(false);
});

test('Test paren after token', () => {
    expect(new QueryValidator().validateQuery(["(", "cool", "and", "quiet", "(", "sad", "and", "happy", ")", ")"]).valid).toBe(false);
});

test('Test extra closing paren', () => {
    expect(new QueryValidator().validateQuery(["(", "(", "quiet", "or", "sad", ")", ")", ")"]).valid).toBe(false);
});

test('Test unclosed open paren', () => {
    expect(new QueryValidator().validateQuery(["(", "(", "quiet", "or", "sad", ")"]).valid).toBe(false);
});

test('Test nested parens', () => {
    expect(new QueryValidator().validateQuery(["(", "guitar", "and", "(", "happy", "or", "sad", ")" , ")"]).valid).toBe(true);
});

test('Test double ops', () => {
    expect(new QueryValidator().validateQuery(["(", "guitar", "and", "and", "(", "happy", "or", "sad", ")" , ")"]).valid).toBe(false);
});

test('Test double tags', () => {
    expect(new QueryValidator().validateQuery(["(", "guitar", "bopper", "and", "(", "happy", "or", "sad", ")" , ")"]).valid).toBe(false);
});

test('Test trailing opening paren', () => {
    expect(new QueryValidator().validateQuery(["(", "guitar", "bopper", "and", "(", "happy", "or", "sad", ")" , ")"]).valid).toBe(false);
});

test('Test early closing paren', () => {
    expect(new QueryValidator().validateQuery(["(", "guitar", ")", ")", "and", "(", "happy", "or", "sad"]).valid).toBe(false);
}); 
