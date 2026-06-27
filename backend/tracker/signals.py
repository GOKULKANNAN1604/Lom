# tracker/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PerformanceLog, StudyLog, TechLog
from .utils import update_streak_on_save


@receiver(post_save, sender=PerformanceLog)
def update_performance_streak(sender, instance, created, **kwargs):
    """Auto-update streak when a PerformanceLog entry is saved."""
    if created:
        update_streak_on_save(instance, PerformanceLog)


@receiver(post_save, sender=StudyLog)
def update_study_streak(sender, instance, created, **kwargs):
    """Auto-update streak when a StudyLog entry is saved."""
    if created:
        update_streak_on_save(instance, StudyLog)


@receiver(post_save, sender=TechLog)
def update_tech_streak(sender, instance, created, **kwargs):
    """Auto-update streak when a TechLog entry is saved."""
    if created:
        update_streak_on_save(instance, TechLog)
