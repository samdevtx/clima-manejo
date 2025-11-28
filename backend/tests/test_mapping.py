import unittest

from app.services.open_meteo import _first, _get

class TestMappingHelpers(unittest.TestCase):
    def test_first(self):
        self.assertEqual(_first([1,2,3]), 1)
        self.assertIsNone(_first([]))
        self.assertIsNone(_first(None))

    def test_get(self):
        arr = [10,20,30]
        self.assertEqual(_get(arr, 0), 10)
        self.assertEqual(_get(arr, 2), 30)
        self.assertIsNone(_get(arr, 5))
        self.assertIsNone(_get(None, 0))

if __name__ == '__main__':
    unittest.main()

