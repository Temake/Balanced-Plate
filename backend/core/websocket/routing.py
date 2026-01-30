"""
WebSocket URL routing configuration.
"""

from django.urls import re_path

from core.websocket.consumers import (
    NotificationConsumer,
)


websocket_urlpatterns = [
    # Connect: ws://localhost:8000/ws/notifications/?token=<JWT>
    re_path(
        r"^ws/notifications/$",
        NotificationConsumer.as_asgi(),
    )
]