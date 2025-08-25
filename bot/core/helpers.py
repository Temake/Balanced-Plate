import cloudinary.uploader
import tempfile

async def upload_to_cloudinary(file, filename: str) -> str:
    """
    Download a Telegram file temporarily and upload to Cloudinary.
    Returns the Cloudinary URL.
    """

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        await file.download_to_drive(tmp.name)
        upload_result = cloudinary.uploader.upload(
            tmp.name, 
            public_id=filename, 
            resource_type="image", 
            folder="balanced_plate"
        )
        return upload_result["secure_url"]