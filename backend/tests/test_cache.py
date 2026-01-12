import unittest
from unittest.mock import patch, MagicMock
from app.cache import get_weather_cache, set_weather_cache, WEATHER_CACHE_TTL

class TestCache(unittest.TestCase):
    def setUp(self):
        # Reset internal memory cache before each test
        from app.cache import _memory_cache
        _memory_cache.clear()

    @patch("app.cache.redis_client")
    def test_redis_set_get(self, mock_redis):
        # Setup mock
        mock_redis.get.return_value = '{"temp": 25}'
        
        # Test Set
        set_weather_cache("test-key", {"temp": 25})
        mock_redis.setex.assert_called_with("weather:test-key", WEATHER_CACHE_TTL, '{"temp": 25}')
        
        # Test Get
        result = get_weather_cache("test-key")
        self.assertEqual(result, {"temp": 25})
        mock_redis.get.assert_called_with("weather:test-key")

    def test_memory_fallback(self):
        # Force redis_client to None to simulate failure/missing redis
        with patch("app.cache.redis_client", None):
            set_weather_cache("mem-key", {"val": 1})
            result = get_weather_cache("mem-key")
            self.assertEqual(result, {"val": 1})

if __name__ == '__main__':
    unittest.main()
