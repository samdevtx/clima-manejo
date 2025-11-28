from typing import List, Optional, Literal
from pydantic import BaseModel

class City(BaseModel):
    name: str
    admin1: str
    country: str
    latitude: float
    longitude: float
    timezone: str
    label: str

class WeatherCurrent(BaseModel):
    time: str
    temperature_2m: Optional[float] = None
    relative_humidity_2m: Optional[float] = None
    apparent_temperature: Optional[float] = None
    precipitation: Optional[float] = None
    wind_speed_10m: Optional[float] = None
    wind_gusts_10m: Optional[float] = None
    wind_direction_10m: Optional[float] = None
    cloud_cover: Optional[float] = None
    pressure_msl: Optional[float] = None
    vapour_pressure_deficit: Optional[float] = None

class WeatherToday(BaseModel):
    date: str
    temperature_2m_max: Optional[float] = None
    temperature_2m_min: Optional[float] = None
    precipitation_sum: Optional[float] = None
    precipitation_hours: Optional[float] = None
    precipitation_probability_max: Optional[float] = None
    precipitation_probability_mean: Optional[float] = None
    wind_speed_10m_max: Optional[float] = None
    wind_gusts_10m_max: Optional[float] = None
    wind_direction_10m_dominant: Optional[float] = None
    shortwave_radiation_sum: Optional[float] = None
    sunshine_duration: Optional[float] = None
    uv_index_max: Optional[float] = None
    et0_fao_evapotranspiration: Optional[float] = None

class NextHour(BaseModel):
    time: str
    precipitation_probability: Optional[float] = None
    precipitation: Optional[float] = None
    wind_speed_10m: Optional[float] = None
    wind_gusts_10m: Optional[float] = None
    cloud_cover: Optional[float] = None

class WeatherDerived(BaseModel):
    water_balance_today_mm: Optional[float] = None
    water_balance_class: Optional[str] = None
    operation_window_ok: Optional[bool] = None
    temp_ok_22_30: Optional[bool] = None

class Meta(BaseModel):
    timezone: Optional[str] = None
    units: Optional[dict] = None

class WeatherResponse(BaseModel):
    status: Literal["ok", "ambiguous", "not_found"]
    data: Optional[dict] = None
    candidates: Optional[List[City]] = None
    message: Optional[str] = None
