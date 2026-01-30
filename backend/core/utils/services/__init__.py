import json

from loguru import logger
from typing import Any


try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from django.conf import settings

class GeminiBaseService:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
        
        if GENAI_AVAILABLE and self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def call_gemini(self, input: Any):
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=input,
        )

        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]

        result = json.loads(response_text.strip())
        logger.info("Successfully prompted Gemini")
        return result, False