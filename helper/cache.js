const NodeCache = require('node-cache');

class CacheHelper {
  constructor() {
    this.cache = new NodeCache();
  }

  set(key, value, ttlSeconds = 0) {
    // ttlSeconds é o tempo de vida do cache em segundos
    this.cache.set(key, value, ttlSeconds);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.del(key);
  }

  flushAll() {
    this.cache.flushAll();
  }
}

module.exports = new CacheHelper();
