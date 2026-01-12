'use client';

import { useState, useEffect } from 'react';
import { City, WeatherData } from '@/lib/types';
import { formatWaterBalance, getWaterBalanceStatus, formatTime, displayOrDash } from '@/lib/format';
import { Droplets, AlertCircle, CheckCircle } from 'lucide-react';
import AdvancedMetrics from '@/components/AdvancedMetrics';

interface WeatherDashboardProps {
  city: City | null;
  onWeatherDataLoad?: (data: WeatherData) => void;
}

export default function WeatherDashboard({ city, onWeatherDataLoad }: WeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) {
      setWeatherData(null);
      setError(null);
      return;
    }

    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/weather/?city=${encodeURIComponent(city.name)}&lat=${city.latitude}&lon=${city.longitude}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        const status = data?.status;
        if (status === 'ok' && data?.data) {
          setWeatherData(data.data);
          onWeatherDataLoad?.(data.data);
        } else if (status === 'ambiguous') {
          throw new Error('Cidade ambígua');
        } else if (status === 'not_found') {
          throw new Error(data?.message || 'Cidade não encontrada');
        } else {
          throw new Error('Dados inesperados');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setWeatherData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [city, onWeatherDataLoad]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-card rounded-lg shadow-md p-6 mb-6">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-16 bg-muted rounded w-full mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive border border-border rounded-lg p-6 mb-6 text-destructive-foreground">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Erro ao carregar dados climáticos: {error}</span>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Selecione uma cidade para ver o balanço hídrico</p>
      </div>
    );
  }

  const { derived, current, location, today, next_hours } = weatherData;
  const waterBalanceStatus = getWaterBalanceStatus(derived.water_balance_today_mm ?? 0);
  const lastUpdate = formatTime(current.time);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">{location.name}</h2>
            <p className="text-muted-foreground">{location.label}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Atualizado às {lastUpdate}
          </div>
        </div>
      </div>

      {/* Water Balance Hero Card */}
      <div className="bg-card rounded-lg shadow-lg p-4 md:p-8 border border-border">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="w-12 h-12 text-success mr-3" />
            <h3 className="text-2xl font-semibold text-card-foreground">Balanço Hídrico 24h</h3>
          </div>
          
          <div className="text-5xl font-bold text-card-foreground mb-2 tabular-nums">
            {formatWaterBalance(derived.water_balance_today_mm ?? 0)}
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            {(derived.water_balance_today_mm ?? 0) >= -2 ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-warning" />
            )}
            <span className={`font-medium ${waterBalanceStatus.color}`}>
              {derived.water_balance_class ?? waterBalanceStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* Temperature Status Badge */}
      {derived.temp_ok_22_30 && (
        <div className="bg-success text-success-foreground rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              Temperatura ideal para manejo da cana (22-30°C)
            </span>
          </div>
        </div>
      )}

      {today && (
        <div className="bg-card rounded-lg shadow-md p-4 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Hoje (00:00–23:59)</div>
              <div className="mt-2 text-card-foreground">
                Máx {displayOrDash<number>(today.temperature_2m_max, (v) => `${v} °C`)} · Mín {displayOrDash<number>(today.temperature_2m_min, (v) => `${v} °C`)}
              </div>
              <div className="text-muted-foreground">Chuva {displayOrDash<number>(today.precipitation_sum, (v) => `${v} mm`)} · ET₀ {displayOrDash<number>(today.et0_fao_evapotranspiration, (v) => `${v} mm`)}</div>
            </div>
            <div>
              <div className="text-card-foreground">Vento máx {displayOrDash<number>(today.wind_speed_10m_max, (v) => `${v} km/h`)} · Raj {displayOrDash<number>(today.wind_gusts_10m_max, (v) => `${v} km/h`)}</div>
              <div className="text-muted-foreground">Prob. chuva máx {displayOrDash<number>(today.precipitation_probability_max, (v) => `${v}%`)}</div>
            </div>
          </div>
        </div>
      )}

      {Array.isArray(next_hours) && next_hours.length > 0 && (
        <div className="bg-card rounded-lg shadow-md p-4 border border-border">
          <div className="text-sm text-muted-foreground mb-2">Próximas 6h</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {next_hours.map((h, idx) => {
              const t = new Date(h.time)
              const hour = t.toLocaleTimeString('pt-BR', { hour: '2-digit' })
              const prob = h.precipitation_probability ?? null
              const cellTone = prob == null ? 'bg-muted' : (prob >= 60 ? 'bg-danger/15' : (prob >= 30 ? 'bg-warning/15' : 'bg-success/15'))
              const probTone = prob == null ? 'text-muted-foreground' : (prob >= 60 ? 'text-danger' : (prob >= 30 ? 'text-warning' : 'text-success'))
              return (
                <div key={idx} className={`${cellTone} rounded p-2`}>
                  <div className="text-xs text-muted-foreground">{hour}</div>
                  <div className={`text-sm tabular-nums ${probTone}`}>{h.precipitation_probability ?? '-'}%</div>
                  <div className="text-xs text-muted-foreground">{h.precipitation ?? '-'} mm</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <AdvancedMetrics weatherData={weatherData} />
    </div>
  );
}
