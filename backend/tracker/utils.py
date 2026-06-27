# tracker/utils.py

from datetime import date, timedelta


def calculate_streak(model_class, today: date = None) -> int:
    """
    Calculates the current consecutive-day streak for a given pillar model.

    Walks backwards from today, checking if a log entry exists for each day.
    Stops as soon as a day is missing.

    Args:
        model_class: A Django model class with a `date_logged` DateField.
        today: The date to start from (defaults to today).

    Returns:
        int: Number of consecutive days with at least one log entry.

    Example:
        from tracker.models import TechLog
        from tracker.utils import calculate_streak

        streak = calculate_streak(TechLog)
        print(f"Current Tech streak: {streak} days")
    """
    today = today or date.today()
    streak = 0
    check_date = today

    while True:
        exists = model_class.objects.filter(date_logged=check_date).exists()
        if exists:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    return streak


def update_streak_on_save(instance, model_class) -> None:
    """
    Call this inside a post_save signal to auto-update streak fields.

    Args:
        instance: The saved model instance.
        model_class: The model class to query streak against.
    """
    current = calculate_streak(model_class)
    instance.current_streak = current
    instance.longest_streak = max(instance.longest_streak, current)
    # Use update() to avoid triggering post_save again
    model_class.objects.filter(pk=instance.pk).update(
        current_streak=instance.current_streak,
        longest_streak=instance.longest_streak,
    )
