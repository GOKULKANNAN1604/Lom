"""
WSGI config for life_os project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
application = get_wsgi_application()
