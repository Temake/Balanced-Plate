from .account import *


class IsObjectOwner(BasePermission):
    """
    Allows access only to the owner of the object
    """

    message: str

    def has_object_permission(self, request, view, obj):
        self.message = "Permission denied!"
        return request.user == obj.owner
    