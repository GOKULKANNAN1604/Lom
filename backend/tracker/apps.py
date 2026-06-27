from django.apps import AppConfig


class TrackerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tracker'
    verbose_name = '🧠 Life OS Tracker'

    def ready(self):
        import tracker.signals  # noqa: F401 — connects signals on startup
