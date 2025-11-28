'use client';

import { useState } from 'react';
import CitySearchBox from '@/components/CitySearchBox';
import WeatherDashboard from '@/components/WeatherDashboard';
import WeatherCards from '@/components/WeatherCards';
import WeatherDetails24h from '@/components/WeatherDetails24h';
import { City, WeatherData } from '@/lib/types';
import { Leaf } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
  };

  const handleWeatherDataLoad = (data: WeatherData) => {
    setWeatherData(data);
  };

  const handleClear = () => {
    setSelectedCity(null);
    setWeatherData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>
        {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-primary mr-3" />
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Clima para Manejo</h1>
            </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consulte condições climáticas essenciais para o manejo da cana-de-açúcar
          </p>
        </div>

        {/* Search Section */}
        <div className="flex justify-center mb-8">
          <CitySearchBox
            onCitySelect={handleCitySelect}
            selectedCity={selectedCity}
            onClear={handleClear}
          />
        </div>

        {/* Weather Dashboard */}
        <div className="mb-8">
          <WeatherDashboard 
            city={selectedCity} 
            onWeatherDataLoad={handleWeatherDataLoad}
          />
        </div>

        {/* Weather Cards */}
        <div className="mb-8">
          <WeatherCards weatherData={weatherData} />
        </div>

        {/* 24h Details */}
        <div className="mb-8">
          <WeatherDetails24h weatherData={weatherData} />
        </div>
      </div>
    </div>
  );
}
