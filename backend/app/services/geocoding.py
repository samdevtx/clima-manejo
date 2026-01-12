import httpx
import unicodedata
import os
from typing import List, Optional
from ..schemas import City
from ..cache import get_geocoding_cache, set_geocoding_cache
from ..logger import logger

async def search_cities(query: str) -> List[City]:
    """Search cities using Open-Meteo Geocoding API"""
    
    # Normalize and cache key
    normalized_query = normalize_city_name(query)
    cache_key = normalized_query.lower()
    
    # Check cache first
    cached_result = get_geocoding_cache(cache_key)
    if cached_result:
        return cached_result
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            api_url = os.getenv("OPEN_METEO_GEOCODING_API_URL", "https://geocoding-api.open-meteo.com/v1/search")
            response = await client.get(
                api_url,
                params={
                    "name": normalized_query,
                    "count": 10,
                    "language": "pt",
                    "format": "json"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            cities = []
            if "results" in data:
                for result in data["results"]:
                    # Filter for Brazilian cities
                    if result.get("country_code") == "BR":
                        city = City(
                            name=result["name"],
                            admin1=result.get("admin1", ""),
                            country="Brasil",
                            latitude=result["latitude"],
                            longitude=result["longitude"],
                            timezone=result.get("timezone", "America/Sao_Paulo"),
                            label=f"{result['name']} - {result.get('admin1', '')} - Brasil"
                        )
                        cities.append(city)
            
            # Cache the result
            set_geocoding_cache(cache_key, cities)
            return cities
            
    except httpx.RequestError as e:
        logger.error(f"Error searching cities: {e}", exc_info=True)
        return []
    except Exception as e:
        logger.error(f"Unexpected error searching cities: {e}", exc_info=True)
        return []

def normalize_city_name(city_name: str) -> str:
    """Normalize city name for better search results"""
    # Remove accents and convert to lowercase
    normalized = unicodedata.normalize('NFD', city_name)
    normalized = ''.join(char for char in normalized if unicodedata.category(char) != 'Mn')
    return normalized.strip()