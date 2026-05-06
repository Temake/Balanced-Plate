from django.conf import settings
from django.core.cache import cache


class RedisTools:
    _cache_key: str
    _timeout: int = settings.CACHE_TTL
    _cached_value = None

    def __init__(self, cache_key: str, ttl: int = None):
        self._cache_key = cache_key
        if ttl:
            self._timeout = ttl


    def redis_get(self, default: object = None) -> object:
        return cache.get(self._cache_key, default=default)

    def redis_set(self, value):
        if not value:
            cache.delete(self._cache_key)
        cache.set(self._cache_key, value, timeout=self._timeout)

    def get_ttl(self):
        ttl = cache.ttl(self._cache_key)
        return ttl if ttl and ttl > 0 else None

    @property
    def cache_value(self):
        if self._cached_value:
            return self._cached_value
        value = cache.get(self._cache_key)
        self._cached_value = value
        return value

    @cache_value.setter
    def cache_value(self, value):
        if not value:
            cache.delete(self._cache_key)
        cache.set(self._cache_key, value, timeout=self._timeout)
        self._cached_value = value
    
    def redis_delete(self):
        cache.delete(self._cache_key)