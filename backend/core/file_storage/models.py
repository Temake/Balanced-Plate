import mimetypes
import os
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.utils.mixins import BaseModelMixin
from core.utils.enums import FilePurposeType
 


def upload_format_file(instance, filename):
    owner_email = instance.owner.email.lower()
    file_name = instance.id
    if not instance.original_name:
        instance.original_name = filename

    if filename:
        splitted_filename = filename.split(".")
        if len(splitted_filename) > 1:
            extension = "." + splitted_filename[-1]
        else:
            extension = ""
    else:
        extension = ""
    mime_type, *_ = mimetypes.guess_type(filename)
    if mime_type and len(mime_type.split("/")) > 1:
        file_type = mime_type.split("/")[0]
    else:
        file_type = "unknown"
    return os.path.join(
        owner_email, instance.purpose.lower(), file_type, f"{file_name}{extension}"
    )
   


class FileModel(BaseModelMixin):
    id = models.CharField(primary_key=True, null=False, blank=True, max_length=100)
    owner = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        null=False,
        related_name="files",
        verbose_name=_("Uploaded By"),
    )

    file = models.FileField(
        _("Content"),
        upload_to=upload_format_file,
        null=False,
        blank=False,
        max_length=1000,
    )
    purpose = models.CharField(
        _("Purpose of Uploading"),
        null=False,
        blank=False,
        choices=FilePurposeType.choices(),
        max_length=100,
    )
    mime_type = models.CharField(
        _("File MIME Type"),
        null=True,
        blank=True,
        max_length=100,
    )
    upload_session_id = models.CharField(
        _("File Upload Session ID"),
        null=False,
        editable=False,
        default=uuid.uuid4,
        max_length=64,
    )
    currently_under_processing = models.BooleanField(
        _("Is this file currently under processing"),
        null=False,
        blank=True,
        default=False,
    )
    original_name = models.CharField(
        _("Original File Name"),
        null=True,
        blank=True,
        max_length=500,
        editable=False,
    )
  

    @property
    def file_type(self):
        mime_type = self.mime_type
        return mime_type and mime_type.split("/")[0]

    @property
    def file_src(self):
        return (
            self.file.url
            if settings.USING_MANAGED_STORAGE
            else os.path.join(settings.BASE_DIR, self.file.path)
        )
      
    

    class Meta:
        verbose_name = _("File")
        verbose_name_plural = _("Files")

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.get_identifier()
        super().save(*args, **kwargs)

    def __str__(self):
        return str(self.id)
