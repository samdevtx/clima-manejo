VARIABLE_MAP = {
    # current
    "temperature_2m": {"label": "Temperatura", "unit": "°C", "source": "current", "path": ["current", "temperature_2m"]},
    "relative_humidity_2m": {"label": "Umidade relativa", "unit": "%", "source": "current", "path": ["current", "relative_humidity_2m"]},
    "apparent_temperature": {"label": "Sensação térmica", "unit": "°C", "source": "current", "path": ["current", "apparent_temperature"]},
    "precipitation": {"label": "Precipitação", "unit": "mm", "source": "current", "path": ["current", "precipitation"]},
    "wind_speed_10m": {"label": "Vento", "unit": "km/h", "source": "current", "path": ["current", "wind_speed_10m"]},
    "wind_gusts_10m": {"label": "Rajadas", "unit": "km/h", "source": "current", "path": ["current", "wind_gusts_10m"]},
    "wind_direction_10m": {"label": "Direção do vento", "unit": "°", "source": "current", "path": ["current", "wind_direction_10m"]},
    "cloud_cover": {"label": "Nebulosidade", "unit": "%", "source": "current", "path": ["current", "cloud_cover"]},
    "pressure_msl": {"label": "Pressão", "unit": "hPa", "source": "current", "path": ["current", "pressure_msl"]},
    "vapour_pressure_deficit": {"label": "VPD", "unit": "kPa", "source": "current", "path": ["current", "vapour_pressure_deficit"]},

    # today
    "temperature_2m_max": {"label": "Temp. Máx", "unit": "°C", "source": "daily", "path": ["daily", "temperature_2m_max", 0]},
    "temperature_2m_min": {"label": "Temp. Mín", "unit": "°C", "source": "daily", "path": ["daily", "temperature_2m_min", 0]},
    "precipitation_sum": {"label": "Chuva (dia)", "unit": "mm", "source": "daily", "path": ["daily", "precipitation_sum", 0]},
    "precipitation_hours": {"label": "Horas com chuva", "unit": "h", "source": "daily", "path": ["daily", "precipitation_hours", 0]},
    "precipitation_probability_max": {"label": "% chuva (máx)", "unit": "%", "source": "daily", "path": ["daily", "precipitation_probability_max", 0]},
    "precipitation_probability_mean": {"label": "% chuva (média)", "unit": "%", "source": "daily", "path": ["daily", "precipitation_probability_mean", 0]},
    "wind_speed_10m_max": {"label": "Vento máx", "unit": "km/h", "source": "daily", "path": ["daily", "wind_speed_10m_max", 0]},
    "wind_gusts_10m_max": {"label": "Rajadas máx", "unit": "km/h", "source": "daily", "path": ["daily", "wind_gusts_10m_max", 0]},
    "wind_direction_10m_dominant": {"label": "Direção dominante", "unit": "°", "source": "daily", "path": ["daily", "wind_direction_10m_dominant", 0]},
    "shortwave_radiation_sum": {"label": "Radiação", "unit": "MJ/m²", "source": "daily", "path": ["daily", "shortwave_radiation_sum", 0]},
    "sunshine_duration": {"label": "Sol", "unit": "min", "source": "daily", "path": ["daily", "sunshine_duration", 0]},
    "uv_index_max": {"label": "UV máx", "unit": "index", "source": "daily", "path": ["daily", "uv_index_max", 0]},
    "et0_fao_evapotranspiration": {"label": "ET₀", "unit": "mm", "source": "daily", "path": ["daily", "et0_fao_evapotranspiration", 0]},

    # hourly next hours
    "hourly_precipitation_probability": {"label": "% chuva", "unit": "%", "source": "hourly", "path": ["hourly", "precipitation_probability"]},
    "hourly_precipitation": {"label": "Precipitação", "unit": "mm", "source": "hourly", "path": ["hourly", "precipitation"]},
    "hourly_wind_speed_10m": {"label": "Vento", "unit": "km/h", "source": "hourly", "path": ["hourly", "wind_speed_10m"]},
    "hourly_wind_gusts_10m": {"label": "Rajadas", "unit": "km/h", "source": "hourly", "path": ["hourly", "wind_gusts_10m"]},
}

