from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import cities, weather, health

app = FastAPI(
    title="Canac Clima API",
    description="API para consulta de dados climáticos para manejo de cana-de-açúcar",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(cities.router, prefix="/cities", tags=["cities"])
app.include_router(weather.router, prefix="/weather", tags=["weather"])
app.include_router(health.router, prefix="/health", tags=["health"])

@app.get("/")
async def root():
    return {"message": "Canac Clima API - Manejo de Cana", "version": "0.1.0"}