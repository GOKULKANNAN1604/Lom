"""
Django Settings for Life OS Tracker
"""

import os
from pathlib import Path
from decouple import config

# ──────────────────────────────────────────
# Base Directory
# ──────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent


# ──────────────────────────────────────────
# Security
# ──────────────────────────────────────────
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost').split(',')


# ──────────────────────────────────────────
# Installed Applications
# ──────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',

    # Local apps
    'tracker',
]


# ──────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'life_os.urls'


# ──────────────────────────────────────────
# Templates
# ──────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'life_os.wsgi.application'


# ──────────────────────────────────────────
# PostgreSQL Database
# ──────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     config('DB_NAME'),
        'USER':     config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST':     config('DB_HOST', default='localhost'),
        'PORT':     config('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': config('DB_SSLMODE', default='prefer'),
        }
    }
}


# ──────────────────────────────────────────
# Password Validation
# ──────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ──────────────────────────────────────────
# Internationalisation
# ──────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True


# ──────────────────────────────────────────
# Static & Media Files
# ──────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ──────────────────────────────────────────
# Django REST Framework
# ──────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DATE_FORMAT':     '%Y-%m-%d',
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S',
}


# ──────────────────────────────────────────
# JWT Configuration (SimpleJWT)
# ──────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    # Access token valid for 15 minutes — short-lived for security
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=15),
    # Refresh token valid for 7 days — kept in httpOnly cookie on frontend
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    'ROTATE_REFRESH_TOKENS':  True,   # Issue a new refresh token on each refresh
    'BLACKLIST_AFTER_ROTATION': True, # Invalidate old refresh token after rotation
    'UPDATE_LAST_LOGIN':      True,   # Update user.last_login on token obtain

    'ALGORITHM':              'HS256',
    'SIGNING_KEY':            config('SECRET_KEY'),

    'AUTH_HEADER_TYPES':      ('Bearer',),
    'AUTH_HEADER_NAME':       'HTTP_AUTHORIZATION',
    'USER_ID_FIELD':          'id',
    'USER_ID_CLAIM':          'user_id',

    'TOKEN_OBTAIN_SERIALIZER':  'rest_framework_simplejwt.serializers.TokenObtainPairSerializer',
    'TOKEN_REFRESH_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenRefreshSerializer',
    'TOKEN_VERIFY_SERIALIZER':  'rest_framework_simplejwt.serializers.TokenVerifySerializer',
}


# ──────────────────────────────────────────
# CORS — React Vite Frontend
# ──────────────────────────────────────────

# In development: allow ALL origins so any Vite port (5173, 5174 …) works
# In production: set DEBUG=False and list your real frontend domain below
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True          # ← allows localhost:5173, 5174, etc.
else:
    CORS_ALLOWED_ORIGINS = [
        'https://your-production-domain.com',
    ]

# Allow the browser to send Authorization header + cookies
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',        # JWT Bearer token
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
