import os
from pathlib import Path
import environ
import cloudinary

BASE_DIR = Path(__file__).resolve(strict=True).parent.parent
env = environ.Env()

# Fetching
env_dir = os.path.join(BASE_DIR, ".env")
if os.path.exists(env_dir):
    environ.Env.read_env(env_dir, overwrite=True)

cloudinary.config(
    cloud_name=env.str("CLOUDINARY_CLOUD_NAME"),
    api_key=env.str("CLOUDINARY_API_KEY"),
    api_secret=env.str("CLOUDINARY_API_SECRET")
)