# tracker/serializers_extra.py
# Serializers for: PersonalProfile, DailyJournal, Note, SalaryRecord, Expense

from decimal import Decimal
from rest_framework import serializers
from .models import PersonalProfile, DailyJournal, Note, SalaryRecord, Expense


# ── Profile ──────────────────────────────────────────────────
class PersonalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PersonalProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


# ── Daily Journal ─────────────────────────────────────────────
class DailyJournalSerializer(serializers.ModelSerializer):
    mood_display = serializers.CharField(source='get_mood_display', read_only=True)

    class Meta:
        model  = DailyJournal
        fields = [
            'id', 'date', 'mood', 'mood_display', 'energy_level', 'sleep_hours',
            'highlights', 'learnings', 'challenges', 'gratitude',
            'tomorrow_goals', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_energy_level(self, value):
        if not (1 <= value <= 10):
            raise serializers.ValidationError("Energy level must be between 1 and 10.")
        return value

    def validate_sleep_hours(self, value):
        if value is not None and not (0 <= value <= 24):
            raise serializers.ValidationError("Sleep hours must be between 0 and 24.")
        return value


# ── Notes ────────────────────────────────────────────────────
class NoteSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model  = Note
        fields = [
            'id', 'title', 'content', 'category', 'category_display',
            'tags', 'tags_list', 'is_pinned', 'is_archived',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_tags_list(self, obj):
        """Return tags as a Python list for convenience on the frontend."""
        if not obj.tags:
            return []
        return [t.strip() for t in obj.tags.split(',') if t.strip()]


class NoteListSerializer(serializers.ModelSerializer):
    """Lightweight summary for the notes grid."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model  = Note
        fields = [
            'id', 'title', 'content', 'category', 'category_display',
            'tags', 'is_pinned', 'is_archived', 'updated_at',
        ]


# ── Finance ───────────────────────────────────────────────────
class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model  = Expense
        fields = [
            'id', 'salary_record', 'date', 'category', 'category_display',
            'amount', 'description', 'is_recurring', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        return value


class SalaryRecordSerializer(serializers.ModelSerializer):
    expenses        = ExpenseSerializer(many=True, read_only=True)
    total_expenses  = serializers.SerializerMethodField()
    total_income    = serializers.SerializerMethodField()
    savings         = serializers.SerializerMethodField()
    savings_rate    = serializers.SerializerMethodField()
    expense_by_category = serializers.SerializerMethodField()
    month_display   = serializers.SerializerMethodField()

    class Meta:
        model  = SalaryRecord
        fields = [
            'id', 'month', 'month_display',
            'gross_salary', 'net_salary', 'pf_deduction', 'tax_deducted',
            'bonus', 'other_income', 'notes',
            'expenses', 'total_expenses', 'total_income',
            'savings', 'savings_rate', 'expense_by_category',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')

    def get_total_expenses(self, obj):
        return float(sum(e.amount for e in obj.expenses.all()))

    def get_total_income(self, obj):
        return float(obj.net_salary + obj.bonus + obj.other_income)

    def get_savings(self, obj):
        total_exp = sum(e.amount for e in obj.expenses.all())
        total_inc = obj.net_salary + obj.bonus + obj.other_income
        return float(total_inc - total_exp)

    def get_savings_rate(self, obj):
        if not obj.gross_salary:
            return 0.0
        total_exp = sum(e.amount for e in obj.expenses.all())
        total_inc = obj.net_salary + obj.bonus + obj.other_income
        savings   = total_inc - total_exp
        return round(float(savings / obj.gross_salary * 100), 1)

    def get_expense_by_category(self, obj):
        """Returns { category_label: total_amount } for chart.js doughnut."""
        from collections import defaultdict
        totals = defaultdict(float)
        for e in obj.expenses.all():
            totals[e.get_category_display()] += float(e.amount)
        return dict(totals)


class SalaryRecordListSerializer(serializers.ModelSerializer):
    """Summary for list view — no nested expenses."""
    month_display  = serializers.SerializerMethodField()
    total_expenses = serializers.SerializerMethodField()
    savings        = serializers.SerializerMethodField()

    class Meta:
        model  = SalaryRecord
        fields = [
            'id', 'month', 'month_display', 'gross_salary', 'net_salary',
            'total_expenses', 'savings',
        ]

    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')

    def get_total_expenses(self, obj):
        return float(sum(e.amount for e in obj.expenses.all()))

    def get_savings(self, obj):
        total_exp = sum(e.amount for e in obj.expenses.all())
        return float(obj.net_salary + obj.bonus + obj.other_income - total_exp)
