"""
WebSocket Consumers - Handle WebSocket connections and messages.
"""

import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from loguru import logger


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
        elif message_type == "mark_read":
            notification_id = data.get("notification_id")
            if notification_id:
                success = await self.mark_notification_read(notification_id)
                await self.send_json({
                    "type": "notification_marked_read",
                    "notification_id": notification_id,
                    "success": success,
                })
            else:
                await self.send_json({
                    "type": "error",
                    "message": "notification_id is required",
                })
        else:
            await self.send_json({
                "type": "error",
                "message": f"Unknown message type: {message_type}",
            })


    async def notification_message(self, event):
        """
        Handle notification messages sent to the group.
        
        Called when channel_layer.group_send() is used with type="notification_message"
        """
        await self.send_json({
            "type": "notification",
            "data": event["data"],
        })
        

    async def weekly_recommendation_notification(self, event):
        """Handle weekly recommendation notifications."""
        await self.send_json({
            "type": "weekly_recommendation",
            "data": event["data"],
        })

    async def food_analysis_complete(self, event):
        """Handle food analysis completion notifications."""
        await self.send_json({
            "type": "food_analysis_complete",
            "data": event["data"],
        })

    @database_sync_to_async
    def mark_notification_read(self, notification_id: int):
        """Mark a notification as read in the database."""
        # Implement based on your Notification model
        pass