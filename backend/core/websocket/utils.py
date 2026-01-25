from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync   
from loguru import logger


def emit_websocket_event(instance,  event_type: str) -> bool:
    """
    Emit WebSocket event.
    """
    event_method = getattr(instance.EventData, f"on_{event_type}", None)
    if not event_method:
        logger.warning(f"Unknown recommendation event type: {event_type}")
        return False
    
    try:
        event_data = event_method(instance)
        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            instance.owner.push_notification_channel_id,
            event_data,
        )
        
        logger.info(
            f"event emitted: type={event_type}, "
            f"user={instance.owner.id}"
        )
        return True
        
    except Exception as e:
        logger.error(f"Failed to emit event: {e}")
        return False