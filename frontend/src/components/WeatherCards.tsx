'use client';

import { WeatherData } from '@/lib/types';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain,
  Sun,
  Eye
} from 'lucide-react';
import { 
  formatTemperature, 
  formatHumidity, 
  formatPrecipitation, 
  formatWindSpeed,
  displayOrDash,
} from '@/lib/format';

interface WeatherCardsProps {
  weatherData: WeatherData | null;
  isLoading?: boolean;
}

export default function WeatherCards({ weatherData, isLoading }: WeatherCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card rounded-lg shadow-md p-6">
              <div className="h-8 w-8 bg-muted rounded mb-4"></div>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const { current, today } = weatherData as any;

  const tempOk = current.temperature_2m != null && current.temperature_2m >= 22 && current.temperature_2m <= 30;
  const cards = [
    {
      icon: Thermometer,
      title: 'Temperatura',
      value: current.temperature_2m != null ? formatTemperature(current.temperature_2m) : '-',
      subtitle: 'Atual',
      color: 'text-warning',
      bgColor: 'bg-warning/15',
      chip: tempOk ? 'OK 22–30°C' : undefined,
      chipColor: tempOk ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
    },
    {
      icon: Droplets,
      title: 'Umidade',
      value: current.relative_humidity_2m != null ? formatHumidity(current.relative_humidity_2m) : '-',
      subtitle: 'Relativa',
      color: 'text-primary',
      bgColor: 'bg-primary/15'
    },
    {
      icon: current.precipitation > 0 ? CloudRain : Sun,
      title: 'Precipitação',
      value: current.precipitation != null ? formatPrecipitation(current.precipitation) : '-',
      subtitle: `Última hora · prob. ${displayOrDash<number>(today?.precipitation_probability_max, (v) => `${v}%`)}`,
      color: current.precipitation > 0 ? 'text-primary' : 'text-warning',
      bgColor: current.precipitation > 0 ? 'bg-primary/15' : 'bg-warning/15'
    },
    {
      icon: Wind,
      title: 'Vento',
      value: current.wind_speed_10m != null ? formatWindSpeed(current.wind_speed_10m) : '-',
      subtitle: `Velocidade · raj. ${displayOrDash<number>(current.wind_gusts_10m, (v) => `${v} km/h`)}`,
      color: 'text-success',
      bgColor: 'bg-success/15'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-card rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${card.bgColor} ${card.color} mb-4`}>
              <Icon className="w-7 h-7 md:w-6 md:h-6" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">{card.title}</h3>
            <div className="text-2xl font-bold text-card-foreground mb-1 tabular-nums">{card.value}</div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              {card.chip && (
                <span className={`text-xs rounded px-2 py-0.5 ${card.chipColor}`}>{card.chip}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
