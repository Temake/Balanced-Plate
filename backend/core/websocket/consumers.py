"""
WebSocket Consumers - Handle WebSocket connections and messages.
"""

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from loguru import logger

from core.recommendations.models import WeeklyRecommendation


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications.
    
    Each user joins their own notification group: user_{user_id}_notifications
    Messages can be sent to users from anywhere in the application.
    """

    async def connect(self):
        user = self.scope.get("user")
        self.group_name = user.push_notification_channel_id
        
        if not user or not user.is_authenticated:
            logger.warning("Unauthenticated WebSocket connection rejected")
            await self.close(code=4001)
            return

        await self.accept()
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )  
        logger.info(f"WebSocket connected: user={user.id}, group={self.group_name}")
        await self.send_json({
            "type": "connection_established",
            "message": "Connected to notification service",
            "user_id": user.id,
        })


    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        """
        if self.group_name:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected: group={self.group_name}, code={close_code}")
        else:
            logger.info(f"WebSocket disconnected (no group): code={close_code}")


    async def receive_json(self, data, **kwargs):
        """
        Handle incoming messages from the client.
        """
        message_type = data.get("type")

        if message_type == "ping":
            await self.send_json({
                "type": "pong",
                "timestamp": data.get("timestamp"),
            })        
        elif message_type == "mark_notification_read":
            recommendation_id = data.get("recommendation_id")
            if recommendation_id:
                success = await self.mark_recommendation_read(recommendation_id)
                if not success:
                    await self.send_json({
                        "type": "error",
                        "message": f"Could not mark recommendation {recommendation_id} as read",
                    })
            else:
                await self.send_json({
                    "type": "error",
                    "message": "recommendation_id is required",
                })
        else:
            await self.send_json({
                "type": "error",
                "message": f"Unknown message type: {message_type}",
            })


    async def recommendation_ready(self, event):
        await self.send_json(event)
        logger.info(f"Sent recommendation_ready to user {self.user.id}")


    async def recommendation_read(self, event):
        await self.send_json(event)
        logger.info(f"Sent recommendation_read to user {self.user.id}")


    async def analysis_completed(self, event):
        await self.send_json(event)
        logger.info(f"Sent analysis_completed to user {self.user.id}")


    async def analysis_failed(self, event):
        await self.send_json(event)
        logger.info(f"Sent analysis_failed to user {self.user.id}")


    @database_sync_to_async
    def mark_recommendation_read(self, recommendation_id: int) -> bool:
        """
        Mark a weekly recommendation as read.
        """
        
        try:
            recommendation = WeeklyRecommendation.objects.get(
                id=recommendation_id,
                owner=self.user,
            )
            recommendation.mark_as_read()
            return True
        except WeeklyRecommendation.DoesNotExist:
            logger.warning(
                f"Recommendation {recommendation_id} not found for user {self.user.id}"
            )
            return False
        except Exception as e:
            logger.error(f"Error marking recommendation as read: {e}")
            return False