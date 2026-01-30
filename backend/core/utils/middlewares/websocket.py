"""
JWT Authentication Middleware for WebSocket connections.

WebSockets don't support HTTP headers in the same way as REST APIs,
so we pass the JWT token as a query parameter: ws://host/ws/path/?token=<JWT>
"""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from loguru import logger

from core.account.models import Account


class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware that authenticates WebSocket connections using JWT tokens.
    
    Usage:
        Connect with: ws://localhost:8000/ws/notifications/?token=<access_token>
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        
        token = query_params.get("token", [None])[0]
        
        scope["user"] = await self.get_user_from_token(token)
        
        user = scope["user"]
        if user.is_authenticated:
            logger.info(f"WebSocket authenticated: user_id={user.id}")
        else:
            logger.warning("WebSocket connection with invalid/missing token")
        
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token: str=None):
        """
        Validate JWT token and return the associated user.
        """
        if not token:
            return AnonymousUser()

        try:
            access_token = AccessToken(token)
            user_id = access_token.get("user_id")
            
            user = Account.objects.get(id=user_id, is_active=True)
            return user
            
        except TokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            return AnonymousUser()
        except Account.DoesNotExist:
            logger.warning(f"User not found for token")
            return AnonymousUser()
        except Exception as e:
            logger.error(f"JWT authentication error: {e}")
            return AnonymousUser()