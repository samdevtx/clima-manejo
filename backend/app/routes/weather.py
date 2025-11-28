from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.open_meteo import get_weather_data
from ..services.geocoding import search_cities
from ..schemas import WeatherResponse, City

router = APIRouter()

@router.get("/", response_model=WeatherResponse)
async def get_weather(
    city: str = Query(..., description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    """Get weather data for a specific city"""
    
    # If lat/lon provided, use them directly
    if lat is not None and lon is not None:
        try:
            weather_data = await get_weather_data(lat, lon)
            
            # Create a city object for the response
            city_obj = City(
                name=city,
                admin1="",
                country="Brasil",
                latitude=lat,
                longitude=lon,
                timezone="America/Sao_Paulo",
                label=f"{city} - Brasil"
            )
            
            return WeatherResponse(
                status="ok",
                data={
                    "location": city_obj.model_dump(),
                    **weather_data
                }
            )
        except Exception as e:
            return WeatherResponse(
                status="not_found",
                message=f"Error fetching weather data: {str(e)}"
            )
    
    # Otherwise, search for the city
    cities = await search_cities(city)
    
    if not cities:
        return WeatherResponse(
            status="not_found",
            message="City not found"
        )
    
    if len(cities) > 1:
        return WeatherResponse(
            status="ambiguous",
            candidates=cities,
            message="Multiple cities found, please specify coordinates"
        )
    
    # Single city found, get weather data
    city_obj = cities[0]
    
    try:
        weather_data = await get_weather_data(city_obj.latitude, city_obj.longitude)
        
        return WeatherResponse(
            status="ok",
            data={
                "location": city_obj.model_dump(),
                **weather_data
            }
        )
    except Exception as e:
        return WeatherResponse(
            status="not_found",
            message=f"Error fetching weather data: {str(e)}"
        )