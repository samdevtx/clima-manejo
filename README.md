# CANAC Clima - Manejo de Cana (Next.js + FastAPI)

Aplicação web para produtores de cana-de-açúcar consultarem clima “agro-operacional”, com foco em decisão rápida: saldo hídrico (chuva − ET₀), condições atuais e janela operacional para pulverização/colheita.

---

## 1) Descrição
- Para quem: produtores, técnicos e agrônomos.
- O que resolve: mostra clima atual e indicadores essenciais (água, operação, estresse), com UI simples e estados assíncronos corretos.

## 2) Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + lucide-react
- Backend: FastAPI (Python) + httpx AsyncClient + cache TTL em memória
- Infra: Docker + Docker Compose (plugin v2)
- APIs: Open‑Meteo (Geocoding + Forecast)

## 3) Como rodar
### Pré‑requisitos
- Docker Engine + Docker Compose (plugin v2)

### Comandos
```
git clone https://github.com/seu-usuario/canac-clima.git
cd canac-clima
docker compose up --build
```

### Acessos
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (Swagger/OpenAPI em `/docs`)

### Como parar
- Ctrl+C no terminal ou `docker compose down`

### Troubleshooting
- Portas ocupadas (3000/8000): pare processos locais ou mude portas no `docker-compose.yml`.
- Rebuild forçado: `docker compose up --build --force-recreate`
- Cache de build quebrado: apague `.next/` no frontend e suba novamente.
- Proxy/BFF falhando: verifique `BACKEND_URL` no serviço `frontend` do compose.

## 4) Arquitetura (visão geral)
```
Browser (Next.js SPA)
        |
        v
Next Route Handlers (/api/cities, /api/weather)  <-- BFF/proxy same-origin
        |
        v
FastAPI Backend (wrapper HTTPS Open-Meteo)
        |
        v
Open‑Meteo (Geocoding / Forecast)
```

### Separação
- Backend como wrapper único (HTTPS), normaliza payloads e calcula derivados.
- Next como BFF/proxy para evitar CORS e simplificar segurança (same‑origin).

### Estrutura de pastas (alto nível)
- `backend/app/` (routes, services, cache, schemas)
- `frontend/app/` (App Router) + `frontend/components/` + `frontend/lib/`

## 5) Decisões técnicas
- `/cities` para sugestões: reduz ambiguidade e melhora UX; usuário escolhe a cidade correta.
- Clima por lat/lon após seleção: evita erros por texto; usa coordenadas precisas.
- Manter `/weather?city=`: aderência ao enunciado e compatibilidade - backend prioriza lat/lon se vierem.
- Estado assíncrono no frontend: state machine + reducer, `AbortController`, `requestId` para ignorar respostas fora de ordem.
- Cache TTL (10 min) no backend: melhor latência e menos chamadas repetidas.
- Formatação/normalização: unidades padronizadas, pt‑BR, diferenciar `0` real de ausência (`-`).

## 6) Design / UX
- Hierarquia glanceable:
  - Hero: saldo hídrico (chuva − ET₀)
  - Agora: Temperatura / Chuva / Umidade / Vento (raj.)
  - Hoje / Próximas 6h (mini‑lista por hora)
- Acessibilidade: contraste (tokens OKLCH), foco visível, touch targets confortáveis.
- Design system: tokens light/dark e semântica de status (OK / Atenção / Déficit / Excedente).

## 7) Endpoints e contratos (resumo)
### Rotas (como o frontend consome)
- GET `/api/cities?q=...`
- GET `/api/weather?...`

### Rotas (backend)
### GET `/cities?q=...`
Retorna lista de candidatos (normalizado):
```
[
  {
    "name": "Palhoça",
    "admin1": "Santa Catarina",
    "country": "Brasil",
    "latitude": -27.645,
    "longitude": -48.668,
    "timezone": "America/Sao_Paulo",
    "label": "Palhoça - SC - Brasil"
  }
]
```

### GET `/weather?city=...`
### GET `/weather?city=...&lat=...&lon=...`
- Ambíguo:
```
{
  "status": "ambiguous",
  "candidates": [ { ... }, { ... } ]
}
```
- Não encontrado:
```
{
  "status": "not_found",
  "message": "City not found"
}
```
- OK (resumo):
```
{
  "status": "ok",
  "data": {
    "location": { ... },
    "current": {
      "temperature_2m": 27.7,
      "relative_humidity_2m": 36,
      "precipitation": 0.0,
      "wind_speed_10m": 11,
      "wind_gusts_10m": 22,
      "wind_direction_10m": 140,
      "cloud_cover": 20,
      "pressure_msl": 1015,
      "apparent_temperature": 28.3,
      "vapour_pressure_deficit": 1.6
    },
    "today": {
      "temperature_2m_max": 30.1,
      "temperature_2m_min": 19.3,
      "precipitation_sum": 0.0,
      "et0_fao_evapotranspiration": 6.6,
      "precipitation_probability_max": 20,
      "wind_speed_10m_max": 18,
      "wind_gusts_10m_max": 31
    },
    "next_hours": [ { "time": "2025-11-28T17:00Z", "precipitation_probability": 20, "precipitation": 0.0 }, ... ],
    "derived": {
      "water_balance_today_mm": -6.6,
      "water_balance_class": "Déficit severo",
      "operation_window_ok": true,
      "temp_ok_22_30": true
    },
    "units": { "temperature_2m": "°C", "precipitation": "mm", ... },
    "meta": { "timezone": "America/Sao_Paulo" }
  }
}
```

Observação de erros: upstream Open‑Meteo indisponível → HTTP 502.

## 8) Limitações e notas
- ET₀ é referência FAO‑56; não representa saldo real do solo (não inclui armazenamento, infiltração, drenagem etc.).
- “Hoje” (daily) é janela do dia corrente (00:00–23:59), não “rolling 24h”.
- Dados dependem de modelo/local/cobertura; variáveis podem vir nulas (UI exibe `-`).

## 9) Melhorias futuras
- Persistir últimas localidades (localStorage)
- Rolling 24h real via hourly
- Cache Redis e rate limiting no backend
- Testes E2E (Playwright) e CI (GitHub Actions)
- Alertas configuráveis (limiares por fase da cultura)
- Integração com talhões (multi‑local)
- Observabilidade (logs estruturados)

---

## 10) Execução via Docker Compose
### Um comando
```
docker compose up --build
```
### Parar e limpar
```
docker compose down
```

---
