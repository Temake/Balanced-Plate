# Imported here so the Huey worker registers these tasks: it only autodiscovers
# each app's top-level `tasks` module, which for this app is this package.
from . import mail  # noqa: F401
