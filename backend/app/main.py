from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .routes import cities, weather, health
from .logger import logger

# Rate Limiter Setup
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title="Clima para Manejo API",
    description="API para consulta de dados climáticos para manejo de cana-de-açúcar",
    version="0.1.0"
)

# Rate Limit Config
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

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

@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")

@app.get("/")
async def root():
    return {"message": "Clima para Manejo API - Manejo de Cana", "version": "0.1.0"}
