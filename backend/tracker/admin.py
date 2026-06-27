# tracker/admin.py

from django.contrib import admin
from .models import PerformanceLog, StudyDocument, RevisionCard, StudyLog, TechLog


# ──────────────────────────────────────────
# Performance Admin
# ──────────────────────────────────────────
@admin.register(PerformanceLog)
class PerformanceAdmin(admin.ModelAdmin):
    list_display   = (
        'date_logged', 'activity_type', 'duration_mins',
        'calories_burned', 'current_streak', 'longest_streak', 'is_rest_day'
    )
    list_filter    = ('activity_type', 'is_rest_day')
    search_fields  = ('notes',)
    date_hierarchy = 'date_logged'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('📅 Entry Details', {
            'fields': ('date_logged', 'activity_type', 'duration_mins', 'calories_burned', 'is_rest_day')
        }),
        ('🔥 Streak Info', {
            'fields': ('current_streak', 'longest_streak')
        }),
        ('📝 Notes', {
            'fields': ('notes',)
        }),
        ('🕒 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ──────────────────────────────────────────
# Study Document Admin
# ──────────────────────────────────────────
@admin.register(StudyDocument)
class StudyDocumentAdmin(admin.ModelAdmin):
    list_display   = ('title', 'current_page', 'total_pages', 'status', 'updated_at')
    list_filter    = ('status',)
    search_fields  = ('title',)
    readonly_fields = ('created_at', 'updated_at')


# ──────────────────────────────────────────
# Revision Card Admin
# ──────────────────────────────────────────
@admin.register(RevisionCard)
class RevisionCardAdmin(admin.ModelAdmin):
    list_display   = ('title', 'review_count', 'last_reviewed', 'created_at')
    search_fields  = ('title', 'content')
    readonly_fields = ('created_at', 'updated_at')


# ──────────────────────────────────────────
# Study Log Admin
# ──────────────────────────────────────────
@admin.register(StudyLog)
class StudyLogAdmin(admin.ModelAdmin):
    list_display   = (
        'date_logged', 'activity_type', 'topic',
        'duration_mins', 'pages_read', 'current_streak', 'longest_streak'
    )
    list_filter    = ('activity_type',)
    search_fields  = ('topic', 'notes')
    date_hierarchy = 'date_logged'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('📅 Entry Details', {
            'fields': ('date_logged', 'activity_type', 'topic', 'duration_mins', 'pages_read', 'document')
        }),
        ('📚 Streak Info', {
            'fields': ('current_streak', 'longest_streak')
        }),
        ('📝 Notes', {
            'fields': ('notes',)
        }),
        ('🕒 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ──────────────────────────────────────────
# Tech Admin
# ──────────────────────────────────────────
@admin.register(TechLog)
class TechAdmin(admin.ModelAdmin):
    list_display   = (
        'date_logged', 'category', 'topic',
        'duration_mins', 'github_committed', 'current_streak', 'longest_streak'
    )
    list_filter    = ('category', 'github_committed')
    search_fields  = ('topic', 'notes')
    date_hierarchy = 'date_logged'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('📅 Entry Details', {
            'fields': ('date_logged', 'category', 'topic', 'duration_mins', 'github_committed', 'resources_url')
        }),
        ('💻 Streak Info', {
            'fields': ('current_streak', 'longest_streak')
        }),
        ('📝 Notes', {
            'fields': ('notes',)
        }),
        ('🕒 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ──────────────────────────────────────────
# PersonalProfile Admin
# ──────────────────────────────────────────
from .models import PersonalProfile, DailyJournal, Note, SalaryRecord, Expense

@admin.register(PersonalProfile)
class PersonalProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'email', 'updated_at')
    search_fields = ('full_name', 'email', 'phone')
    readonly_fields = ('created_at', 'updated_at')


# ──────────────────────────────────────────
# DailyJournal Admin
# ──────────────────────────────────────────
@admin.register(DailyJournal)
class DailyJournalAdmin(admin.ModelAdmin):
    list_display = ('date', 'mood', 'energy_level', 'sleep_hours')
    list_filter = ('mood',)
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')


# ──────────────────────────────────────────
# Note Admin
# ──────────────────────────────────────────
@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_pinned', 'is_archived', 'updated_at')
    list_filter = ('category', 'is_pinned', 'is_archived')
    search_fields = ('title', 'content')
    readonly_fields = ('created_at', 'updated_at')


# ──────────────────────────────────────────
# SalaryRecord Admin
# ──────────────────────────────────────────
@admin.register(SalaryRecord)
class SalaryRecordAdmin(admin.ModelAdmin):
    list_display = ('month', 'gross_salary', 'net_salary', 'bonus', 'other_income')
    date_hierarchy = 'month'
    readonly_fields = ('created_at', 'updated_at')


# ──────────────────────────────────────────
# Expense Admin
# ──────────────────────────────────────────
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('date', 'category', 'amount', 'is_recurring', 'salary_record')
    list_filter = ('category', 'is_recurring')
    search_fields = ('description',)
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')

