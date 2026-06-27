"""
URL Configuration for Life OS Tracker
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── JWT Auth endpoints ────────────────────────────────────
    # POST /api/auth/token/         → obtain access + refresh
    # POST /api/auth/token/refresh/ → refresh access token
    # POST /api/auth/token/verify/  → verify token validity
    path('api/auth/token/',         TokenObtainPairView.as_view(),  name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(),     name='token_refresh'),
    path('api/auth/token/verify/',  TokenVerifyView.as_view(),      name='token_verify'),

    # ── Tracker API ───────────────────────────────────────────
    path('api/', include('tracker.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Admin site customisation
admin.site.site_header  = '🧠 Life OS Tracker'
admin.site.site_title   = 'Life OS Admin'
admin.site.index_title  = 'Dashboard — Manage Your Pillars'
