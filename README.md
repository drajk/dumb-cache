# Why dumb-cache?
`dumb-cache` is a light-weight in-memory cache with `zero` dependencies.
It only does one thing ie: caching and does it better.


## Installation

    npm install dumb-cache --save

## Usage

```javascript
const dumbCache = require('dumb-cache');
```

### Add to `cache` and rehydrate when data expires

```javascript
const UNIQUE_CACHE_KEY = '__unique_cache_key__';
const EXPIRE_AFTER = 60 * 1000; // milliseconds

dumbCache.get(UNIQUE_CACHE_KEY, async() => {
    // get data from an API or any other rehydration logic
    const data = {
        fancy: 'data'
    };

    // add to cache
    dumbCache.put(UNIQUE_CACHE_KEY, data, EXPIRE_AFTER);
})


// rinse & repeat for more items in cache 
dumbCache.get(`SOME_KEY`, async() => {
    // rehydrate
    dumbCache.put(`SOME_KEY`, someData, 30000);
})
```

### Delete from `cache`

```javascript
// delete with specific key
dumbCache.delete(`CACHE_KEY`);

// delete all
dumbCache.clear();
```


### Get all keys from `cache`

```javascript
dumbCache.keys();
```

### License: [GNU](https://www.gnu.org/licenses/gpl-3.0.en.html)