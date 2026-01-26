import secrets
from django.db import models
from django.utils import timezone

class BaseModelMixin(models.Model):
    date_added = models.DateTimeField(auto_now_add=True)
    date_last_modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"< {type(self).__name__}({self.id}) >"
    
    def is_instance_exist(self):
        return self.__class__.objects.filter(id=self.id).exists()

    def get_identifier(self):
        return secrets.token_hex(5) + str(int(timezone.now().timestamp()))