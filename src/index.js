class DumbCache {
    constructor() {
        this._cache = Object.create(null);
    }

    /**
     * Adds a new entry to in-memory cache
     *
     * @param {string} key
     * @param {object} value
     * @param {number} time (milliseconds)
     * @param {function} timeoutCallback
     * @returns {object}
     */
    put(key, value, time, timeoutCallback) {
        if (Number(time) <= 0) {
            throw new Error('Cache timeout must be a positive number');
        } else if (
            typeof timeoutCallback !== 'undefined' &&
            typeof timeoutCallback !== 'function'
        ) {
            throw new Error('Cache timeout callback must be a function');
        }

        // if cache exists, clear the timeout
        const oldRecord = this._cache[key];
        if (oldRecord) {
            clearTimeout(oldRecord.timeout);
        }

        const record = {
            value,
            expire: time + Date.now(),
        };

        // set up callback
        if (!isNaN(record.expire)) {
            record.timeout = setTimeout(() => {
                if (timeoutCallback) {
                    timeoutCallback(key, value);
                }
            }, time);
        }

        this._cache[key] = record;

        return value;
    }

    /**
     * Deletes a entry from in-memory cache
     * @param {string} key
     * @returns {boolean}
     */
    delete(key) {
        const oldRecord = this._cache[key];
        if (oldRecord) {
            clearTimeout(oldRecord.timeout);
            if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
                return false;
            }
            delete this._cache[key];
            return true;
        }
        return false;
    }

    /**
     * Clears all entries from in-memory cache
     */
    clear() {
        Object.keys(this._cache).forEach((key) => {
            clearTimeout(this._cache[key].timeout);
        });
        this._cache = Object.create(null);
    }

    /**
     * Returns current value from in-memory cache and takes Rehydrate() as a argument which can run asynchronously when cache is expired.
     * @param {string} key
     * @param {function} rehydrate
     * @returns {object}
     */
    get(key, rehydrate) {
        const data = this._cache[key];

        if (!data || !data.value) {
            return null;
        }

        if (typeof rehydrate !== 'function') {
            throw new Error('Rehydrate must be a function');
        }

        // rehydrate the cache and return current value
        if (this.isExpired(key)) {
            data.isRehydrating = true;
            rehydrate();
        }

        return data.value;
    }

    /**
     * Returns whether a value from in-memory cache is expired
     * @param {string} key
     * @returns {boolean}
     */
    isExpired(key) {
        const data = this._cache[key];
        if (data) {
            if (data.isRehydrating || isNaN(data.expire) || data.expire >= Date.now()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns all keys from in-memory
     * @returns {number}
     */
    keys() {
        return Object.keys(this._cache);
    }
}

module.exports = new DumbCache();
