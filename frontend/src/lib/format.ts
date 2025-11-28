export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

export function formatHumidity(humidity: number): string {
  return `${humidity.toFixed(0)}%`;
}

export function formatPrecipitation(precip: number): string {
  return `${precip.toFixed(1)} mm`;
}

export function formatWindSpeed(speed: number): string {
  return `${speed.toFixed(0)} km/h`;
}

export function formatWaterBalance(balance: number): string {
  const sign = balance >= 0 ? '+' : '';
  return `${sign}${balance.toFixed(1)} mm`;
}

export function displayOrDash<T>(value: T | null | undefined, formatter?: (v: T) => string): string {
  if (value === null || value === undefined) return '-';
  return formatter ? formatter(value as T) : String(value);
}

export function formatTime(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return timeString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getWaterBalanceStatus(balance: number): {
  text: string;
  color: string;
} {
  if (balance > 5) {
    return { text: 'Excesso hídrico', color: 'text-warning' };
  } else if (balance >= -2) {
    return { text: 'Balanço adequado', color: 'text-success' };
  } else if (balance >= -5) {
    return { text: 'Déficit leve', color: 'text-warning' };
  } else {
    return { text: 'Déficit severo', color: 'text-danger' };
  }
}
