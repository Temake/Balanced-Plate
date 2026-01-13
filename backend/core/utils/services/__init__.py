import json

from loguru import logger
from typing import Any


try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from django.conf import settings

class GeminiBaseService:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
        
        if GENAI_AVAILABLE and self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None

    def call_gemini(self, input: Any):
        response = self.model.generate_content(input)

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