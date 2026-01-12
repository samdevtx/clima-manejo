import { WeatherData } from '@/lib/types'

interface Props {
  weatherData: WeatherData
}

export default function AdvancedMetrics({ weatherData }: Props) {
  const { current, today } = weatherData
  const items = [
    { label: 'Pressão (MSL)', value: current?.pressure_msl, unit: 'hPa' },
    { label: 'VPD', value: current?.vapour_pressure_deficit, unit: 'kPa' },
    { label: 'Nebulosidade', value: current?.cloud_cover, unit: '%' },
    { label: 'Direção do vento', value: current?.wind_direction_10m, unit: '°' },
    { label: 'Sensação térmica', value: current?.apparent_temperature, unit: '°C' },
    { label: 'Radiação (SW)', value: today?.shortwave_radiation_sum, unit: 'MJ/m²' },
    { label: 'Duração de sol', value: today?.sunshine_duration, unit: 'min' },
    { label: 'UV máx', value: today?.uv_index_max, unit: 'index' },
  ]

  return (
    <div className="bg-card rounded-lg shadow-md p-4 border border-border">
      <details>
        <summary className="cursor-pointer text-card-foreground font-semibold">Avançado</summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{it.label}</span>
              <span title={it.value == null ? 'Indisponível para este modelo/local' : ''} className="text-card-foreground">
                {it.value == null ? '-' : it.value} {it.value == null ? '' : it.unit}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

