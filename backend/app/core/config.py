import os
from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic import PostgresDsn
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)

load_dotenv()


class RunConfig(BaseModel):
    host: str
    port: int


class DataBaseConfig(BaseModel):
    url: PostgresDsn
    echo: bool
    echo_pool: bool
    pool_size: int
    max_overflow: int


class JWTConfig(BaseModel):
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",

        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="BACK_CONFIG__"
    )

    run: RunConfig
    db: DataBaseConfig
    jwt: JWTConfig


settings = Settings()