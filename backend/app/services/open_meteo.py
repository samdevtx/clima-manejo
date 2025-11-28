import httpx
from typing import Dict, Any
from datetime import datetime, timedelta
from ..schemas import WeatherCurrent, WeatherToday, WeatherDerived, NextHour
from ..cache import get_weather_cache, set_weather_cache
from typing import List

async def get_weather_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """Get weather data from Open-Meteo API"""
    
    # Cache key
    cache_key = f"{latitude},{longitude}"
    
    # Check cache first
    cached_result = get_weather_cache(cache_key)
    if cached_result:
        return cached_result
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get current weather and daily forecast
            response = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "current": ",".join([
                        "temperature_2m",
                        "relative_humidity_2m",
                        "apparent_temperature",
                        "precipitation",
                        "wind_speed_10m",
                        "wind_gusts_10m",
                        "wind_direction_10m",
                        "cloud_cover",
                        "pressure_msl",
                        "vapour_pressure_deficit",
                    ]),
                    "daily": ",".join([
                        "temperature_2m_max",
                        "temperature_2m_min",
                        "precipitation_sum",
                        "precipitation_hours",
                        "precipitation_probability_max",
                        "precipitation_probability_mean",
                        "wind_speed_10m_max",
                        "wind_gusts_10m_max",
                        "wind_direction_10m_dominant",
                        "shortwave_radiation_sum",
                        "sunshine_duration",
                        "uv_index_max",
                        "et0_fao_evapotranspiration",
                    ]),
                    "hourly": ",".join([
                        "precipitation_probability",
                        "precipitation",
                        "wind_speed_10m",
                        "wind_gusts_10m",
                        "cloud_cover",
                    ]),
                    "timezone": "auto",
                    "forecast_days": 1,
                    "wind_speed_unit": "kmh",
                    "temperature_unit": "celsius",
                    "precipitation_unit": "mm",
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Process current weather
            current_data = data.get("current", {})
            current = WeatherCurrent(
                time=current_data.get("time", datetime.now().isoformat()),
                temperature_2m=current_data.get("temperature_2m"),
                relative_humidity_2m=current_data.get("relative_humidity_2m"),
                apparent_temperature=current_data.get("apparent_temperature"),
                precipitation=current_data.get("precipitation"),
                wind_speed_10m=current_data.get("wind_speed_10m"),
                wind_gusts_10m=current_data.get("wind_gusts_10m"),
                wind_direction_10m=current_data.get("wind_direction_10m"),
                cloud_cover=current_data.get("cloud_cover"),
                pressure_msl=current_data.get("pressure_msl"),
                vapour_pressure_deficit=current_data.get("vapour_pressure_deficit"),
            )
            
            # Process daily data
            daily_data = data.get("daily", {})
            daily_list = daily_data.get("time", [])
            today = None
            if daily_list:
                idx = 0
                today = WeatherToday(
                    date=daily_list[idx],
                    temperature_2m_max=_first(daily_data.get("temperature_2m_max")),
                    temperature_2m_min=_first(daily_data.get("temperature_2m_min")),
                    precipitation_sum=_first(daily_data.get("precipitation_sum")),
                    precipitation_hours=_first(daily_data.get("precipitation_hours")),
                    precipitation_probability_max=_first(daily_data.get("precipitation_probability_max")),
                    precipitation_probability_mean=_first(daily_data.get("precipitation_probability_mean")),
                    wind_speed_10m_max=_first(daily_data.get("wind_speed_10m_max")),
                    wind_gusts_10m_max=_first(daily_data.get("wind_gusts_10m_max")),
                    wind_direction_10m_dominant=_first(daily_data.get("wind_direction_10m_dominant")),
                    shortwave_radiation_sum=_first(daily_data.get("shortwave_radiation_sum")),
                    sunshine_duration=_first(daily_data.get("sunshine_duration")),
                    uv_index_max=_first(daily_data.get("uv_index_max")),
                    et0_fao_evapotranspiration=_first(daily_data.get("et0_fao_evapotranspiration")),
                )
            
            # Calculate derived metrics
            wb = None
            wb_class = None
            if today and today.precipitation_sum is not None and today.et0_fao_evapotranspiration is not None:
                wb = today.precipitation_sum - today.et0_fao_evapotranspiration
                wb_class = _classify_water_balance(wb)

            temp_ok = (current.temperature_2m is not None) and (22 <= current.temperature_2m <= 30)

            derived = WeatherDerived(
                water_balance_today_mm=wb,
                water_balance_class=wb_class,
                temp_ok_22_30=temp_ok,
            )

            # Next 6 hours
            hourly = data.get("hourly", {})
            times: List[str] = hourly.get("time", [])
            next_hours: List[NextHour] = []
            start_idx = 0
            current_time_str = current_data.get("time")
            if current_time_str and isinstance(times, list):
                try:
                    if current_time_str in times:
                        start_idx = times.index(current_time_str)
                    else:
                        now_dt = datetime.fromisoformat(current_time_str.replace("Z", "+00:00"))
                        for i, ts in enumerate(times):
                            try:
                                t = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                                if t >= now_dt:
                                    start_idx = i
                                    break
                            except Exception:
                                continue
                except Exception:
                    start_idx = 0

            for i in range(start_idx, min(start_idx + 6, len(times))):
                next_hours.append(NextHour(
                    time=times[i],
                    precipitation_probability=_get(hourly.get("precipitation_probability"), i),
                    precipitation=_get(hourly.get("precipitation"), i),
                    wind_speed_10m=_get(hourly.get("wind_speed_10m"), i),
                    wind_gusts_10m=_get(hourly.get("wind_gusts_10m"), i),
                    cloud_cover=_get(hourly.get("cloud_cover"), i),
                ))

            # Operation window next 2-3 hours
            op_ok = None
            if next_hours:
                check_range = next_hours[:3]
                op_ok = all(
                    (
                        (h.precipitation_probability or 0) <= 20 and
                        (h.wind_speed_10m or 0) <= 12
                    ) for h in check_range
                )
                derived.operation_window_ok = op_ok
            
            units = {
                "temperature_2m": "°C",
                "relative_humidity_2m": "%",
                "apparent_temperature": "°C",
                "precipitation": "mm",
                "wind_speed_10m": "km/h",
                "wind_gusts_10m": "km/h",
                "cloud_cover": "%",
                "pressure_msl": "hPa",
                "vapour_pressure_deficit": "kPa",
                "et0_fao_evapotranspiration": "mm",
                "shortwave_radiation_sum": "MJ/m²",
                "sunshine_duration": "min",
            }

            result = {
                "current": current.model_dump(),
                "today": today.model_dump() if today else None,
                "next_hours": [h.model_dump() for h in next_hours],
                "derived": derived.model_dump(),
                "units": units,
                "meta": {
                    "timezone": data.get("timezone"),
                    "units": units,
                },
            }
            
            # Cache the result
            set_weather_cache(cache_key, result)
            return result
            
    except httpx.RequestError as e:
        print(f"Error fetching weather data: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error fetching weather data: {e}")
        raise

def _first(arr):
    if isinstance(arr, list) and arr:
        return arr[0]
    return None

def _get(arr, idx):
    if isinstance(arr, list) and len(arr) > idx:
        return arr[idx]
    return None

def _classify_water_balance(value: float) -> str:
    if value <= -6.0:
        return "Déficit severo"
    if -6.0 < value <= -3.0:
        return "Déficit moderado"
    if -3.0 < value <= -1.0:
        return "Déficit leve"
    if -1.0 <= value <= 1.0:
        return "Neutro"
    return "Excedente"
