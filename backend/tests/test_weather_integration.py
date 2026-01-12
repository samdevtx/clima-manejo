import pytest
import respx
from httpx import Response
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_get_weather_integration():
    # Mock Open-Meteo API response
    mock_data = {
        "latitude": -27.6,
        "longitude": -48.6,
        "timezone": "America/Sao_Paulo",
        "current": {
            "time": "2025-11-28T12:00",
            "temperature_2m": 25.0,
            "relative_humidity_2m": 60,
            "apparent_temperature": 26.0,
            "precipitation": 0.0,
            "wind_speed_10m": 10.0,
            "wind_gusts_10m": 15.0,
            "wind_direction_10m": 180,
            "cloud_cover": 20,
            "pressure_msl": 1013.0,
            "vapour_pressure_deficit": 1.5
        },
        "daily": {
            "time": ["2025-11-28"],
            "temperature_2m_max": [30.0],
            "temperature_2m_min": [20.0],
            "precipitation_sum": [5.0],
            "precipitation_hours": [2.0],
            "precipitation_probability_max": [40],
            "precipitation_probability_mean": [20],
            "wind_speed_10m_max": [20.0],
            "wind_gusts_10m_max": [30.0],
            "wind_direction_10m_dominant": [180],
            "shortwave_radiation_sum": [20.0],
            "sunshine_duration": [600.0],
            "uv_index_max": [8.0],
            "et0_fao_evapotranspiration": [4.0]
        },
        "hourly": {
            "time": ["2025-11-28T12:00", "2025-11-28T13:00"],
            "precipitation_probability": [0, 0],
            "precipitation": [0.0, 0.0],
            "wind_speed_10m": [10.0, 10.0],
            "wind_gusts_10m": [15.0, 15.0],
            "cloud_cover": [20, 20]
        }
    }

    # Mock the external API call
    with respx.mock(base_url="https://api.open-meteo.com", assert_all_called=False) as respx_mock:
        respx_mock.get("/v1/forecast").mock(return_value=Response(200, json=mock_data))

        # Pass city param as it is required by the endpoint signature
        response = client.get("/weather/?city=Test City&lat=-27.6&lon=-48.6")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        weather = data["data"]
        
        # Verify derived calculations
        # Water Balance = Precip (5.0) - ET0 (4.0) = 1.0 (Neutro)
        assert weather["derived"]["water_balance_today_mm"] == 1.0
        assert weather["derived"]["water_balance_class"] == "Neutro"
        assert weather["derived"]["temp_ok_22_30"] is True  # 25.0 is between 22 and 30
