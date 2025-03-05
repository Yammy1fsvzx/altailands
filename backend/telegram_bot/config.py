from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class BotConfig(BaseSettings):
    telegram_bot_token: str
    admin_chat_id: int = Field(alias="TELEGRAM_ADMIN_CHAT_ID")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

config = BotConfig() 