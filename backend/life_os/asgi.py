"""
ASGI config for life_os project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
application = get_asgi_application()
