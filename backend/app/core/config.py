from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "BidRakshak"
    app_version: str = "0.1.0"
    database_url: str = "sqlite:///./bidrakshak.db"
    secret_key: str = "bidrakshak-development-secret"
    access_token_expire_minutes: int = 1440

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

settings = Settings()