### This is a dev runner, not meant for production
import uvicorn
from app.config import get_settings

if __name__ == "__main__":
    print(" This is a dev runner, not meant for production")
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=False,
        reload_dirs=["app"],
        log_level="debug" if settings.DEBUG else "info",
        
    )