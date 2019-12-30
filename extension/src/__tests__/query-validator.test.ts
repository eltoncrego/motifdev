import validateQuery from '../main/app/js/ext/query-validator';

test('test', () => {
    expect(validateQuery(["hello", "there"])).toBe(false);
})