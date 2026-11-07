from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from bizbrain_api.database import DatabaseConfigurationError, dispose_engine
from bizbrain_api.routers import ai, businesses, health, orders


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    try:
        yield
    finally:
        dispose_engine()


app = FastAPI(title="BizBrain AI API", version="0.1.0", lifespan=lifespan)


@app.exception_handler(DatabaseConfigurationError)
@app.exception_handler(SQLAlchemyError)
async def database_unavailable(request: Request, exc: Exception) -> JSONResponse:
    # Driver exceptions may contain connection details. Never echo or log them here.
    return JSONResponse(status_code=503, content={"detail": "Database unavailable"})


app.include_router(health.router)
app.include_router(businesses.router)
app.include_router(orders.router)
app.include_router(ai.router)
