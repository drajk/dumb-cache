class DumbCache {
  constructor() {
    this._cache = Object.create(null);
  }

  /**
   * Returns all keys from in-memory
   * @returns {number}
   */
  get keys() {
    return Object.keys(this._cache);
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
    } else if (typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
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
   * Returns current value from in-memory cache and takes Rehydrate() as a argument which can run asynchronously when cache is expired.
   * @param {string} key
   * @param {function} rehydrate (optional)
   * @returns {object}
   */
  get(key, rehydrate) {
    // get data from cache or use null data
    let data = this._cache[key];

    // make sure 'rehydrate' is function, if its defined
    if (typeof rehydrate !== 'undefined' && typeof rehydrate !== 'function') {
      throw new Error('Rehydrate must be a function');
    }

    // rehydrate the cache
    if (typeof rehydrate === 'function' && this.shouldRehydrate(key)) {
      data = {
          ...data,
          value: data ? data.value : null,
          isRehydrating: true,
      };

      rehydrate();
    }

    return data ? data.value : null;
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
   * Returns whether a value from in-memory cache should be rehydrated
   * @param {string} key
   * @returns {boolean}
   */
  shouldRehydrate(key) {
    const data = this._cache[key];

    // when rehydrating
    if (data && data.isRehydrating) {
      return false;
    }

    // when not expired
    if (data && (isNaN(data.expire) || data.expire >= Date.now())) {
      return false;
    }

    return true;
  }
}

module.exports = new DumbCache();