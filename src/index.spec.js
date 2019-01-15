const dumbCache = require('.');

describe('DumbCache', () => {
    describe('put()', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        it('should allow new item to the cache', () => {
            expect(() => dumbCache.put('key', 'value', 'time')).not.toThrowError();
        });

        it('should allow new item to the cache with a timeout', () => {
            expect(() => dumbCache.put('key', 'value', 100)).not.toThrowError();
        });

        it('should throw an error for a negative timeout', () => {
            expect(() => dumbCache.put('key', 'value', -100)).toThrowError();
        });

        it('should throw an error for a non-function timeout callback', () => {
            expect(() => dumbCache.put('key', 'value', 100, 'foo')).toThrowError();
        });

        it('should call timeout callback once when the cache item expires', () => {
            // arrange
            const callback = jest.fn();
            dumbCache.put('key', 'value', 1000, callback);

            // act and assert
            jest.advanceTimersByTime(999);
            expect(callback).not.toBeCalled();
            jest.advanceTimersByTime(1);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('key', 'value');
        });

        it('should override the timeout callback on a new put() with a different timeout callback', () => {
            // arrange
            const oldCallback = jest.fn();
            const newCallback = jest.fn();

            // act and assert
            dumbCache.put('key', 'value', 1000, oldCallback);
            jest.advanceTimersByTime(999);

            dumbCache.put('key', 'value', 1000, newCallback);
            jest.advanceTimersByTime(1001);
            expect(oldCallback).not.toHaveBeenCalled();
            expect(newCallback).toHaveBeenCalledTimes(1);
            expect(newCallback).toHaveBeenCalledWith('key', 'value');
        });
    });

    describe('delete()', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        it('should return false given a key for an empty cache', () => {
            expect(dumbCache.delete('miss')).toBeFalsy();
        });

        it('should return true given a key in the cache', () => {
            dumbCache.put('key', 'value');
            expect(dumbCache.delete('key')).toBeTruthy();
        });
    });

    describe('get()', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        it('should work without rehydate()', () => {
            expect(dumbCache.get('miss')).toBeNull();
        });

        it('should return null given a key for an empty cache', () => {
            expect(dumbCache.get('miss', () => {})).toBeNull();
        });

        it('should return the corresponding value of a key in the cache', () => {
            dumbCache.put('key', 'value');
            expect(dumbCache.get('key', () => {})).toEqual('value');
        });

        it('should return value when key is expired', () => {
            dumbCache.put('key', 'value', 1000);
            jest.advanceTimersByTime(1000);
            expect(dumbCache.get('key', () => {})).toBe('value');
        });
    });
});
