export interface City {
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  label: string;
}

export interface WeatherCurrent {
  time: string;
  temperature_2m?: number | null;
  relative_humidity_2m?: number | null;
  apparent_temperature?: number | null;
  precipitation?: number | null;
  wind_speed_10m?: number | null;
  wind_gusts_10m?: number | null;
  wind_direction_10m?: number | null;
  cloud_cover?: number | null;
  pressure_msl?: number | null;
  vapour_pressure_deficit?: number | null;
}

export interface WeatherToday {
  date: string;
  temperature_2m_max?: number | null;
  temperature_2m_min?: number | null;
  precipitation_sum?: number | null;
  precipitation_hours?: number | null;
  precipitation_probability_max?: number | null;
  precipitation_probability_mean?: number | null;
  wind_speed_10m_max?: number | null;
  wind_gusts_10m_max?: number | null;
  wind_direction_10m_dominant?: number | null;
  shortwave_radiation_sum?: number | null;
  sunshine_duration?: number | null;
  uv_index_max?: number | null;
  et0_fao_evapotranspiration?: number | null;
}

export interface WeatherDerived {
  water_balance_today_mm?: number | null;
  water_balance_class?: string | null;
  operation_window_ok?: boolean | null;
  temp_ok_22_30?: boolean | null;
}

export interface WeatherUnits {
  temperature_2m: string;
  relative_humidity_2m: string;
  precipitation: string;
  wind_speed_10m: string;
  et0_fao_evapotranspiration: string;
}

export interface WeatherData {
  location: City;
  current: WeatherCurrent;
  today: WeatherToday | null;
  next_hours: Array<{
    time: string;
    precipitation_probability?: number | null;
    precipitation?: number | null;
    wind_speed_10m?: number | null;
    wind_gusts_10m?: number | null;
    cloud_cover?: number | null;
  }>;
  derived: WeatherDerived;
  units: WeatherUnits;
}

export interface WeatherResponse {
  status: 'ok' | 'ambiguous' | 'not_found';
  data?: WeatherData;
  candidates?: City[];
  message?: string;
}

export interface CitiesResponse {
  cities: City[];
}
