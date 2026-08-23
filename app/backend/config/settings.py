"""
Compatibility entry point.

New code should select:
    config.settings.development
or:
    config.settings.production
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

from config.settings.development import *  # noqa: E402,F403,F401
