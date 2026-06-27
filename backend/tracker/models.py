# tracker/models.py

from django.db import models
from django.utils import timezone


# ══════════════════════════════════════════════════════════════
# PILLAR 1: PERFORMANCE  (Fitness / Gym)
# ══════════════════════════════════════════════════════════════

class PerformanceLog(models.Model):
    """
    Tracks daily fitness & gym activities.
    Supports streak tracking and freeform notes.
    """

    class ActivityType(models.TextChoices):
        GYM    = 'GYM',    'Gym / Weight Training'
        CARDIO = 'CARDIO', 'Cardio / Running'
        YOGA   = 'YOGA',   'Yoga / Flexibility'
        SPORTS = 'SPORTS', 'Sports / Recreation'
        REST   = 'REST',   'Active Rest / Recovery'

    # Core fields
    date_logged     = models.DateField(default=timezone.now, db_index=True)
    activity_type   = models.CharField(
        max_length=20,
        choices=ActivityType.choices,
        default=ActivityType.GYM
    )
    duration_mins   = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Workout duration in minutes'
    )
    calories_burned = models.PositiveIntegerField(null=True, blank=True)

    # Streak tracking
    current_streak = models.PositiveIntegerField(
        default=0, help_text='Consecutive active days'
    )
    longest_streak = models.PositiveIntegerField(default=0)
    is_rest_day    = models.BooleanField(
        default=False,
        help_text='Intentional rest — does not break streak'
    )

    # Notes
    notes = models.TextField(blank=True, help_text='How did it feel? PRs hit?')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-date_logged']
        verbose_name        = 'Performance Log'
        verbose_name_plural = 'Performance Logs'

    def __str__(self):
        return (
            f"[Performance] {self.date_logged} | "
            f"{self.get_activity_type_display()} | "
            f"Streak: {self.current_streak}🔥"
        )


# ══════════════════════════════════════════════════════════════
# PILLAR 2: STUDY & READING (Books / Online Courses / Revision)
# ══════════════════════════════════════════════════════════════

class StudyDocument(models.Model):
    """
    Document Library: Stores PDFs or reading resources.
    Tracks user's progress through each book or paper.
    """
    class DocumentStatus(models.TextChoices):
        READING   = 'READING', 'Currently Reading'
        COMPLETED = 'COMPLETED', 'Completed'
        PLAN      = 'PLAN', 'Plan to Read'

    title        = models.CharField(max_length=255)
    category     = models.CharField(max_length=100, default='General')
    pdf_file     = models.FileField(
        upload_to='study_pdfs/',
        blank=True, null=True,
        help_text='Upload the PDF file to read in-app'
    )
    current_page = models.PositiveIntegerField(default=0)
    total_pages  = models.PositiveIntegerField(default=0)
    status       = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices,
        default=DocumentStatus.PLAN
    )
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-updated_at']
        verbose_name        = 'Study Document'
        verbose_name_plural = 'Study Documents'

    def __str__(self):
        progress = f" ({self.current_page}/{self.total_pages} pgs)" if self.total_pages else ""
        return f"{self.title}{progress}"


class RevisionCard(models.Model):
    """
    Daily Revision Vault: Notes or key concepts saved to review daily
    to build a 60-day revision habit.
    """
    title        = models.CharField(max_length=255)
    content      = models.TextField(help_text='Detailed content or answer')
    review_count = models.PositiveIntegerField(default=0, help_text='Total times reviewed')
    last_reviewed = models.DateField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-created_at']
        verbose_name        = 'Revision Card'
        verbose_name_plural = 'Revision Cards'

    def __str__(self):
        return f"[Card] {self.title}"


class StudyLog(models.Model):
    """
    Tracks daily study sessions — book reading, course work, revision, etc.
    """

    class ActivityType(models.TextChoices):
        BOOK     = 'BOOK',     'Book Reading'
        COURSE   = 'COURSE',   'Online Course / Video'
        REVISION = 'REVISION', 'Revision / Reviewing Cards'
        PRACTICE = 'PRACTICE', 'Practice / Labs'

    # Core fields
    date_logged     = models.DateField(default=timezone.now, db_index=True)
    activity_type   = models.CharField(
        max_length=20,
        choices=ActivityType.choices,
        default=ActivityType.BOOK
    )
    topic           = models.CharField(
        max_length=255,
        help_text='What topic did you learn today?'
    )
    duration_mins   = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Study duration in minutes'
    )
    pages_read      = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Number of pages read (if reading a book)'
    )
    document        = models.ForeignKey(
        StudyDocument,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='study_logs',
        help_text='Linked PDF document (if applicable)'
    )

    # Streak tracking
    current_streak = models.PositiveIntegerField(
        default=0,
        help_text='Consecutive study days'
    )
    longest_streak = models.PositiveIntegerField(default=0)

    # Notes
    notes = models.TextField(
        blank=True,
        help_text='Key takeaways, notes, or solutions'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-date_logged']
        verbose_name        = 'Study Log'
        verbose_name_plural = 'Study Logs'

    def __str__(self):
        return (
            f"[Study] {self.date_logged} | "
            f"{self.topic} | "
            f"Streak: {self.current_streak}📚"
        )


# ══════════════════════════════════════════════════════════════
# PILLAR 3: TECH  (Coding / Learning)
# ══════════════════════════════════════════════════════════════

class TechLog(models.Model):
    """
    Tracks daily coding sessions, courses, project work,
    and technical skill-building.
    """

    class TechCategory(models.TextChoices):
        CODING      = 'CODE',    'Coding / Development'
        COURSE      = 'COURSE',  'Online Course / Tutorial'
        PROJECT     = 'PROJECT', 'Side Project Work'
        READING     = 'READ',    'Technical Reading / Docs'
        INTERVIEW   = 'DSA',     'DSA / Interview Prep'
        OPEN_SOURCE = 'OSS',     'Open Source Contribution'

    # Core fields
    date_logged   = models.DateField(default=timezone.now, db_index=True)
    category      = models.CharField(
        max_length=10,
        choices=TechCategory.choices,
        default=TechCategory.CODING
    )
    topic         = models.CharField(
        max_length=200,
        help_text='e.g., Django ORM, React Hooks, LeetCode #234'
    )
    duration_mins = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Time spent (in minutes)'
    )

    # Streak tracking
    current_streak   = models.PositiveIntegerField(
        default=0,
        help_text='LeetCode-style consecutive coding days'
    )
    longest_streak   = models.PositiveIntegerField(default=0)
    github_committed = models.BooleanField(
        default=False,
        help_text='Did you push at least one commit today?'
    )

    # Notes
    notes         = models.TextField(
        blank=True,
        help_text='Key takeaways, blockers, resources saved'
    )
    resources_url = models.URLField(
        blank=True,
        help_text='Link to course, article, or GitHub repo'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-date_logged']
        verbose_name        = 'Tech Log'
        verbose_name_plural = 'Tech Logs'

    def __str__(self):
        return (
            f"[Tech] {self.date_logged} | "
            f"{self.topic} | "
            f"Streak: {self.current_streak}💻"
        )


# ══════════════════════════════════════════════════════════════
# PERSONAL PROFILE
# ══════════════════════════════════════════════════════════════

class PersonalProfile(models.Model):
    """
    Personal Profile / Security Locker model.
    Stores personal identities, bank accounts, emergency info, and custom key-value details.
    """
    # Basic Info
    full_name      = models.CharField(max_length=150, blank=True)
    date_of_birth  = models.DateField(null=True, blank=True)
    phone          = models.CharField(max_length=20, blank=True)
    email          = models.EmailField(blank=True)
    blood_group    = models.CharField(max_length=10, blank=True)
    
    # Government IDs / Credentials (Locker)
    aadhaar_number = models.CharField(max_length=20, blank=True)
    pan_number     = models.CharField(max_length=20, blank=True)
    driving_license= models.CharField(max_length=50, blank=True)
    passport_no    = models.CharField(max_length=50, blank=True)

    # Financial / Bank Accounts
    bank_name      = models.CharField(max_length=100, blank=True)
    account_no     = models.CharField(max_length=50, blank=True)
    ifsc_code      = models.CharField(max_length=20, blank=True)
    upi_id         = models.CharField(max_length=100, blank=True)

    # Emergency Contact
    emergency_name  = models.CharField(max_length=150, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    medical_notes   = models.TextField(blank=True, help_text='Allergies, policy numbers, health info')

    # Professional & Social Links
    linkedin_url    = models.URLField(blank=True, max_length=500)
    github_url      = models.URLField(blank=True, max_length=500)
    portfolio_url   = models.URLField(blank=True, max_length=500)

    # Custom Key-Value Vault
    custom_vault    = models.JSONField(default=dict, blank=True, help_text='Custom key-value details')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Personal Profile'
        verbose_name_plural = 'Personal Profiles'

    def __str__(self):
        return f"Vault Locker: {self.full_name or 'unnamed'}"


# ══════════════════════════════════════════════════════════════
# DAILY JOURNAL
# ══════════════════════════════════════════════════════════════

class DailyJournal(models.Model):
    """
    Private daily diary — one entry per day.
    Tracks mood, energy, sleep, highlights and tomorrow's plan.
    """

    class Mood(models.TextChoices):
        GREAT    = 'GREAT',   '😄 Great'
        GOOD     = 'GOOD',    '🙂 Good'
        OKAY     = 'OKAY',    '😐 Okay'
        LOW      = 'LOW',     '😔 Low'
        STRESSED = 'STRESSED','😤 Stressed'

    # When
    date = models.DateField(unique=True, default=timezone.now, db_index=True)

    # How was the day?
    mood         = models.CharField(
        max_length=10, choices=Mood.choices, default=Mood.GOOD
    )
    energy_level = models.PositiveSmallIntegerField(
        default=5, help_text='Energy level 1 (exhausted) – 10 (amazing)'
    )
    sleep_hours  = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        help_text='Hours slept last night'
    )

    # Reflections
    highlights      = models.TextField(blank=True, help_text='What went well today?')
    learnings       = models.TextField(blank=True, help_text='What did I learn today?')
    challenges      = models.TextField(blank=True, help_text='What was hard today?')
    gratitude       = models.TextField(blank=True, help_text='3 things I am grateful for')
    tomorrow_goals  = models.TextField(blank=True, help_text='Top 3 things to do tomorrow')
    notes           = models.TextField(blank=True, help_text='Free-form thoughts, ideas, anything')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-date']
        verbose_name        = 'Daily Journal'
        verbose_name_plural = 'Daily Journal Entries'

    def __str__(self):
        return f"[Journal] {self.date} | {self.get_mood_display()}"


# ══════════════════════════════════════════════════════════════
# NOTES
# ══════════════════════════════════════════════════════════════

class Note(models.Model):
    """
    General-purpose personal notes — like Notion-lite.
    Supports categories, tags, pinning and archiving.
    """

    class Category(models.TextChoices):
        PERSONAL  = 'PERSONAL',  'Personal'
        WORK      = 'WORK',      'Work'
        IDEAS     = 'IDEAS',     'Ideas'
        LEARNING  = 'LEARNING',  'Learning'
        HEALTH    = 'HEALTH',    'Health'
        FINANCE   = 'FINANCE',   'Finance'
        OTHER     = 'OTHER',     'Other'

    title       = models.CharField(max_length=255)
    content     = models.TextField(blank=True)
    category    = models.CharField(
        max_length=15, choices=Category.choices, default=Category.PERSONAL
    )
    tags        = models.CharField(
        max_length=300, blank=True,
        help_text='Comma-separated tags, e.g. django,idea,project'
    )
    is_pinned   = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)

    # Timestamps
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-is_pinned', '-updated_at']
        verbose_name        = 'Note'
        verbose_name_plural = 'Notes'

    def __str__(self):
        pin = '📌 ' if self.is_pinned else ''
        return f"{pin}[Note] {self.title[:60]}"


# ══════════════════════════════════════════════════════════════
# SALARY & FINANCE TRACKER
# ══════════════════════════════════════════════════════════════

class SalaryRecord(models.Model):
    """
    Monthly salary and income record.
    One record per month — the parent for that month's expenses.
    """
    # Which month (always store as the 1st of the month)
    month          = models.DateField(unique=True, help_text='e.g. 2026-06-01 for June 2026')

    # Income breakdown
    gross_salary   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary     = models.DecimalField(max_digits=12, decimal_places=2, default=0,
                        help_text='Take-home / in-hand salary')
    pf_deduction   = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                        help_text='PF / ESI deducted')
    tax_deducted   = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                        help_text='TDS / income tax deducted')
    bonus          = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_income   = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                        help_text='Freelance, dividends, rent, etc.')
    notes          = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-month']
        verbose_name        = 'Salary Record'
        verbose_name_plural = 'Salary Records'

    def __str__(self):
        return f"[Salary] {self.month.strftime('%B %Y')} | ₹{self.net_salary:,.0f} net"


class Expense(models.Model):
    """
    Individual expense entry — linked to a SalaryRecord (month).
    """

    class Category(models.TextChoices):
        RENT          = 'RENT',          'Rent / Housing'
        FOOD          = 'FOOD',          'Food & Groceries'
        TRANSPORT     = 'TRANSPORT',     'Transport'
        ENTERTAINMENT = 'ENTERTAINMENT', 'Entertainment'
        SHOPPING      = 'SHOPPING',      'Shopping'
        HEALTH        = 'HEALTH',        'Health & Medical'
        INVESTMENT    = 'INVESTMENT',    'Investment / SIP'
        EMI           = 'EMI',           'EMI / Loan'
        UTILITIES     = 'UTILITIES',     'Utilities & Bills'
        EDUCATION     = 'EDUCATION',     'Education'
        OTHER         = 'OTHER',         'Other'

    salary_record = models.ForeignKey(
        SalaryRecord, on_delete=models.CASCADE, related_name='expenses'
    )
    date          = models.DateField(default=timezone.now, db_index=True)
    category      = models.CharField(
        max_length=15, choices=Category.choices, default=Category.OTHER
    )
    amount        = models.DecimalField(max_digits=10, decimal_places=2)
    description   = models.CharField(max_length=255, blank=True)
    is_recurring  = models.BooleanField(
        default=False, help_text='Monthly fixed expense (rent, EMI…)'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['-date']
        verbose_name        = 'Expense'
        verbose_name_plural = 'Expenses'

    def __str__(self):
        return f"[Expense] {self.date} | {self.get_category_display()} | ₹{self.amount:,.0f}"

