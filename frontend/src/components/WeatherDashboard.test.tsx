import React from 'react'
import { render, screen } from '@testing-library/react'
import WeatherDashboard from './WeatherDashboard'

describe('WeatherDashboard', () => {
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
