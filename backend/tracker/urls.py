# tracker/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PerformanceLogViewSet,
    StudyLogViewSet,
    StudyDocumentViewSet,
    RevisionCardViewSet,
    TechLogViewSet,
    DashboardView,
)
from .views_extra import (
    PersonalProfileView,
    DailyJournalViewSet,
    NoteViewSet,
    SalaryRecordViewSet,
    ExpenseViewSet,
)

router = DefaultRouter()
router.register(r'performance',     PerformanceLogViewSet, basename='performance')
router.register(r'study',           StudyLogViewSet,       basename='study')
router.register(r'study-documents', StudyDocumentViewSet,  basename='study-documents')
router.register(r'revision-cards',  RevisionCardViewSet,   basename='revision-cards')
router.register(r'tech',            TechLogViewSet,        basename='tech')
router.register(r'journal',         DailyJournalViewSet,   basename='journal')
router.register(r'notes',           NoteViewSet,           basename='notes')
router.register(r'salary',          SalaryRecordViewSet,   basename='salary')
router.register(r'expenses',        ExpenseViewSet,        basename='expenses')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('profile/',   PersonalProfileView.as_view(), name='profile'),
]


# ─────────────────────────────────────────────────────────────────────────────
# FULL ENDPOINT REFERENCE
# ─────────────────────────────────────────────────────────────────────────────
#
# AUTH (JWT)
#   POST   /api/auth/token/               → Obtain access + refresh tokens
#   POST   /api/auth/token/refresh/       → Refresh access token
#   POST   /api/auth/token/verify/        → Verify token validity
#
# PERFORMANCE
#   GET    /api/performance/              → List (summary)
#   POST   /api/performance/              → Create new log
#   GET    /api/performance/<id>/         → Retrieve full detail
#   PUT    /api/performance/<id>/         → Full update
#   PATCH  /api/performance/<id>/         → Partial update
#   DELETE /api/performance/<id>/         → Delete
#   GET    /api/performance/streak/       → Streak summary
#   GET    /api/performance/by-date/      → ?date=YYYY-MM-DD
#
# WEALTH
#   GET    /api/wealth/                   → List (summary)
#   POST   /api/wealth/                   → Create new log
#   GET    /api/wealth/<id>/              → Retrieve full detail
#   PUT    /api/wealth/<id>/              → Full update
#   PATCH  /api/wealth/<id>/              → Partial update
#   DELETE /api/wealth/<id>/              → Delete
#   GET    /api/wealth/streak/            → Streak summary
#   GET    /api/wealth/by-date/           → ?date=YYYY-MM-DD
#
# TECH
#   GET    /api/tech/                     → List (summary)
#   POST   /api/tech/                     → Create new log
#   GET    /api/tech/<id>/                → Retrieve full detail
#   PUT    /api/tech/<id>/                → Full update
#   PATCH  /api/tech/<id>/                → Partial update
#   DELETE /api/tech/<id>/                → Delete
#   GET    /api/tech/streak/              → Streak summary
#   GET    /api/tech/by-date/             → ?date=YYYY-MM-DD
#
# DASHBOARD
#   GET    /api/dashboard/                → Today's snapshot — all pillars + streaks
# ─────────────────────────────────────────────────────────────────────────────
