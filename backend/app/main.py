import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

from app.api.router import router
from app.core import settings
from app.core.db import db_helper
from app.middleware.cors import setup_cors


@asynccontextmanager
async def lifespan(app: FastAPI):
    #startup
    yield
    #showdown
    await db_helper.dispose()

main_app = FastAPI(
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)


setup_cors(main_app)

main_app.include_router(
    router,
    tags=['auth']
)


if __name__ == "__main__":
    uvicorn.run(
        "main:main_app",
        host=settings.run.host,
        port=settings.run.port,
        reload=True
    )