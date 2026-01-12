import React from 'react'
import { render, screen } from '@testing-library/react'
import WeatherDashboard from './WeatherDashboard'

describe('WeatherDashboard', () => {
  // Mock data to simulate API response
  const mockWeatherData = {
    current: {
      temperature_2m: 25,
      relative_humidity_2m: 60,
      precipitation: 0,
      wind_speed_10m: 10,
      wind_gusts_10m: 15,
      wind_direction_10m: 180,
      cloud_cover: 20,
      pressure_msl: 1013,
      apparent_temperature: 26,
      vapour_pressure_deficit: 1.5,
    },
    today: {
      temperature_2m_max: 30,
      temperature_2m_min: 20,
      precipitation_sum: 5,
      et0_fao_evapotranspiration: 4,
      precipitation_probability_max: 40,
      wind_speed_10m_max: 20,
      wind_gusts_10m_max: 30,
    },
    next_hours: [
      {
        time: "2025-11-28T12:00",
        precipitation_probability: 0,
        precipitation: 0,
        wind_speed_10m: 10,
      }
    ],
    derived: {
      water_balance_today_mm: 1,
      water_balance_class: 'Neutro',
      operation_window_ok: true,
      temp_ok_22_30: true,
    },
    units: {
      temperature_2m: '°C',
      precipitation: 'mm',
      wind_speed_10m: 'km/h',
    },
    meta: {
      timezone: 'America/Sao_Paulo'
    }
  }

  // Mock global fetch
  global.fetch = jest.fn()

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
  })

  it('renders loading state initially', () => {
    // When no city is selected
    render(<WeatherDashboard city={null} />)
    expect(screen.getByText(/selecione uma cidade/i)).toBeInTheDocument()
  })

  it('renders loading skeleton when city is selected but data is fetching', async () => {
    // Mock a pending promise to simulate loading
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))
    
    render(<WeatherDashboard city={{ 
      name: 'Test City', 
      latitude: 0, 
      longitude: 0, 
      country: 'BR', 
      admin1: 'SP', 
      label: 'Test' 
    }} />)
    
    // Check for skeleton elements (by class name usually, but here we can check if "Selecione" is gone)
    expect(screen.queryByText(/selecione uma cidade/i)).not.toBeInTheDocument()
  })
})
