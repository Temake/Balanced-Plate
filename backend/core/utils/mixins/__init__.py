from loguru import logger

from rest_framework.settings import api_settings
from rest_framework import status

from .base import *


class PaginationMixin:
    """A mixin that adds pagination to a view."""

    pagination_class = api_settings.DEFAULT_PAGINATION_CLASS

    def paginate_queryset(self, queryset):
        self.paginator = self.pagination_class()
        if not self.paginator:
            return None
        
        return self.paginator.paginate_queryset(queryset, self.request, view=self)


    def get_paginated_response(self, data):
        assert hasattr(self, "paginator"), (
            "you must call 'paginate_queryset()' before get_paginated_response"
        )
        return self.paginator.get_paginated_response(data)