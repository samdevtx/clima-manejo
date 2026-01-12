import pytest
import respx
from httpx import Response
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_search_cities_integration():
    # Mock Open-Meteo Geocoding API response
    mock_data = {
        "results": [
            {
                "id": 3448439,
                "name": "São Paulo",
                "latitude": -23.5475,
                "longitude": -46.63611,
                "country_code": "BR",
                "admin1": "São Paulo",
                "timezone": "America/Sao_Paulo"
            },
            {
                "id": 123456,
                "name": "São Paulo Not BR",
                "latitude": 10.0,
                "longitude": 10.0,
                "country_code": "US", # Should be filtered out
                "admin1": "California",
                "timezone": "America/Los_Angeles"
            }
        ]
    }

    # Mock the external API call
    with respx.mock(base_url="https://geocoding-api.open-meteo.com", assert_all_called=False) as respx_mock:
        respx_mock.get("/v1/search").mock(return_value=Response(200, json=mock_data))

        response = client.get("/cities/?q=Sao Paulo")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify filtering logic (only BR cities)
        assert len(data) == 1
        city = data[0]
        assert city["name"] == "São Paulo"
        assert city["country"] == "Brasil"
        assert city["admin1"] == "São Paulo"
        
        # Verify label formatting
        assert city["label"] == "São Paulo - São Paulo - Brasil"
