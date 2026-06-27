# tracker/serializers.py
"""
DRF Serializers for Life OS Tracker — Performance, Wealth, Tech.

Each serializer includes:
  - Human-readable display fields for all choice/enum fields
  - Field-level and object-level validation
  - read_only_fields for auto-managed fields (streaks, timestamps)
  - Nested summary serializers for list views (lightweight)
"""

from datetime import date
from rest_framework import serializers
from .models import PerformanceLog, StudyDocument, RevisionCard, StudyLog, TechLog


# ══════════════════════════════════════════════════════════════
# PILLAR 1: PERFORMANCE
# ══════════════════════════════════════════════════════════════

class PerformanceLogSerializer(serializers.ModelSerializer):
    """Full serializer — used for Create, Retrieve, Update, Delete."""

    # Human-readable choice label (read-only)
    activity_type_display = serializers.CharField(
        source='get_activity_type_display',
        read_only=True
    )

    class Meta:
        model  = PerformanceLog
        fields = [
            'id',
            'date_logged',
            'activity_type',
            'activity_type_display',
            'duration_mins',
            'calories_burned',
            'is_rest_day',
            'current_streak',
            'longest_streak',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['current_streak', 'longest_streak', 'created_at', 'updated_at']

    # ── Field-level validation ──────────────────────────────
    def validate_date_logged(self, value):
        """Prevent logging future dates."""
        if value > date.today():
            raise serializers.ValidationError("Cannot log an entry for a future date.")
        return value

    def validate_duration_mins(self, value):
        """Duration must be a positive non-zero number."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Duration must be greater than 0 minutes.")
        return value

    def validate_calories_burned(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Calories burned must be a positive number.")
        return value

    # ── Object-level validation ─────────────────────────────
    def validate(self, attrs):
        """
        If is_rest_day is True, duration_mins is not required.
        If is_rest_day is False, activity_type must not be REST.
        """
        is_rest = attrs.get('is_rest_day', False)
        activity = attrs.get('activity_type', PerformanceLog.ActivityType.GYM)

        if not is_rest and activity == PerformanceLog.ActivityType.REST:
            raise serializers.ValidationError({
                'activity_type': "Set 'is_rest_day=true' if marking this as a rest day."
            })
        return attrs


class PerformanceLogSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints — fewer fields."""
    activity_type_display = serializers.CharField(
        source='get_activity_type_display', read_only=True
    )

    class Meta:
        model  = PerformanceLog
        fields = [
            'id', 'date_logged', 'activity_type', 'activity_type_display',
            'duration_mins', 'calories_burned', 'notes', 'current_streak', 'is_rest_day',
        ]


# ══════════════════════════════════════════════════════════════
# PILLAR 2: STUDY & READING
# ══════════════════════════════════════════════════════════════

class StudyDocumentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pdf_file_url = serializers.SerializerMethodField()

    class Meta:
        model = StudyDocument
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_pdf_file_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None

    def validate_total_pages(self, value):
        if value < 0:
            raise serializers.ValidationError("Total pages must be 0 or positive.")
        return value

    def validate_current_page(self, value):
        if value < 0:
            raise serializers.ValidationError("Current page must be 0 or positive.")
        return value

    def validate(self, attrs):
        current = attrs.get('current_page')
        total = attrs.get('total_pages')
        
        if self.instance:
            if current is None:
                current = self.instance.current_page
            if total is None:
                total = self.instance.total_pages
        else:
            current = current or 0
            total = total or 0

        if total > 0 and current > total:
            raise serializers.ValidationError({
                'current_page': "Current page cannot exceed total pages."
            })
        return attrs


class RevisionCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevisionCard
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'review_count', 'last_reviewed']


class StudyLogSerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)

    class Meta:
        model = StudyLog
        fields = '__all__'
        read_only_fields = ['current_streak', 'longest_streak', 'created_at', 'updated_at']

    def validate_date_logged(self, value):
        if value > date.today():
            raise serializers.ValidationError("Cannot log an entry for a future date.")
        return value

    def validate_duration_mins(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Duration must be greater than 0 minutes.")
        return value

    def validate_pages_read(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Pages read must be positive.")
        return value

    def validate_topic(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Topic must be at least 3 characters long.")
        return value.strip()


class StudyLogSummarySerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)

    class Meta:
        model = StudyLog
        fields = [
            'id', 'date_logged', 'activity_type', 'activity_type_display',
            'topic', 'duration_mins', 'pages_read', 'document', 'document_title', 'current_streak'
        ]


# ══════════════════════════════════════════════════════════════
# PILLAR 3: TECH
# ══════════════════════════════════════════════════════════════

class TechLogSerializer(serializers.ModelSerializer):
    """Full serializer — used for Create, Retrieve, Update, Delete."""

    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )

    class Meta:
        model  = TechLog
        fields = [
            'id',
            'date_logged',
            'category',
            'category_display',
            'topic',
            'duration_mins',
            'github_committed',
            'current_streak',
            'longest_streak',
            'notes',
            'resources_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['current_streak', 'longest_streak', 'created_at', 'updated_at']

    # ── Field-level validation ──────────────────────────────
    def validate_date_logged(self, value):
        if value > date.today():
            raise serializers.ValidationError("Cannot log an entry for a future date.")
        return value

    def validate_topic(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Topic must be at least 3 characters long.")
        return value.strip()

    def validate_duration_mins(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Duration must be greater than 0 minutes.")
        return value


class TechLogSummarySerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display', read_only=True
    )

    class Meta:
        model  = TechLog
        fields = [
            'id', 'date_logged', 'category', 'category_display',
            'topic', 'duration_mins', 'github_committed', 'current_streak',
        ]


# ══════════════════════════════════════════════════════════════
# DASHBOARD — Aggregate summary across all three pillars
# ══════════════════════════════════════════════════════════════

class DashboardSerializer(serializers.Serializer):
    """
    Read-only aggregate for the /api/dashboard/ endpoint.
    Returns today's snapshot across all three pillars.
    """
    date          = serializers.DateField()
    performance   = PerformanceLogSummarySerializer(many=True)
    study         = StudyLogSummarySerializer(many=True)
    tech          = TechLogSummarySerializer(many=True)
    streaks       = serializers.DictField()
