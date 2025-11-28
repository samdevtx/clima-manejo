'use client';

import { WeatherData } from '@/lib/types';
import { formatPrecipitation, formatDate, displayOrDash } from '@/lib/format';
import { Calendar, Droplets, Thermometer } from 'lucide-react';

interface WeatherDetails24hProps {
  weatherData: WeatherData | null;
  isLoading?: boolean;
}

export default function WeatherDetails24h({ weatherData, isLoading }: WeatherDetails24hProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-card rounded-lg shadow-md p-6">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.today) {
    return null;
  }

  const { today } = weatherData as any;
  const date = formatDate(today.date);

  return (
    <div className="bg-card rounded-lg shadow-md p-4 md:p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-card-foreground">Hoje (00:00–23:59) - {date}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precipitation */}
        <div className="bg-primary/15 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Droplets className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-card-foreground">Precipitação Acumulada</h4>
          </div>
          <div className="text-2xl font-bold text-primary mb-1 tabular-nums">
            {displayOrDash<number>(today.precipitation_sum, (v) => formatPrecipitation(v))}
          </div>
          <p className="text-sm text-muted-foreground">Últimas 24 horas</p>
        </div>

        {/* Evapotranspiration */}
        <div className="bg-warning/15 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Thermometer className="w-5 h-5 text-warning" />
            <h4 className="font-medium text-card-foreground">Evapotranspiração (ET₀)</h4>
          </div>
          <div className="text-2xl font-bold text-warning mb-1 tabular-nums">
            {displayOrDash<number>(today.et0_fao_evapotranspiration, (v) => formatPrecipitation(v))}
          </div>
          <p className="text-sm text-muted-foreground">Referência FAO</p>
        </div>
      </div>

      {/* Water Balance Calculation */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium text-card-foreground mb-2">Cálculo do Balanço Hídrico</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Precipitação:</span>
            <span className="font-medium">{displayOrDash<number>(today.precipitation_sum, (v) => formatPrecipitation(v))}</span>
          </div>
          <div className="flex justify-between">
            <span>ET₀:</span>
            <span className="font-medium">- {displayOrDash<number>(today.et0_fao_evapotranspiration, (v) => formatPrecipitation(v))}</span>
          </div>
          <div className="border-t border-border pt-1 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Balanço:</span>
              <span className={`${(today.precipitation_sum != null && today.et0_fao_evapotranspiration != null && (today.precipitation_sum - today.et0_fao_evapotranspiration) >= -2) ? 'text-success' : 'text-danger'} tabular-nums`}>
                {today.precipitation_sum != null && today.et0_fao_evapotranspiration != null ? formatPrecipitation(today.precipitation_sum - today.et0_fao_evapotranspiration) : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
