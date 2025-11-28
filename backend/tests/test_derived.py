import unittest
from app.services.open_meteo import _classify_water_balance

class TestDerived(unittest.TestCase):
    def test_classify(self):
        self.assertEqual(_classify_water_balance(-7.0), "Déficit severo")
        self.assertEqual(_classify_water_balance(-4.0), "Déficit moderado")
        self.assertEqual(_classify_water_balance(-2.0), "Déficit leve")
        self.assertEqual(_classify_water_balance(0.0), "Neutro")
        self.assertEqual(_classify_water_balance(2.0), "Excedente")

if __name__ == '__main__':
    unittest.main()

