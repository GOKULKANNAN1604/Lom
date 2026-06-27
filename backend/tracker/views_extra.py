# tracker/views_extra.py
# Views for: PersonalProfile, DailyJournal, Note, SalaryRecord, Expense

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import PersonalProfile, DailyJournal, Note, SalaryRecord, Expense
from .serializers_extra import (
    PersonalProfileSerializer,
    DailyJournalSerializer,
    NoteSerializer, NoteListSerializer,
    SalaryRecordSerializer, SalaryRecordListSerializer,
    ExpenseSerializer,
)


# ── Personal Profile ──────────────────────────────────────────
class PersonalProfileView(APIView):
    """
    GET  /api/profile/  → Get the single profile (creates empty one if none)
    PUT  /api/profile/  → Full update
    PATCH /api/profile/ → Partial update
    """
    permission_classes = [IsAuthenticated]

    def _get_or_create(self):
        obj, _ = PersonalProfile.objects.get_or_create(pk=1)
        return obj

    def get(self, request):
        serializer = PersonalProfileSerializer(self._get_or_create())
        return Response(serializer.data)

    def put(self, request):
        serializer = PersonalProfileSerializer(
            self._get_or_create(), data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        serializer = PersonalProfileSerializer(
            self._get_or_create(), data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ── Daily Journal ─────────────────────────────────────────────
class DailyJournalViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for daily journal entries.
    GET /api/journal/?date=YYYY-MM-DD  → filter by specific date
    """
    queryset           = DailyJournal.objects.all()
    serializer_class   = DailyJournalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = {'date': ['exact', 'gte', 'lte', 'year', 'month']}
    ordering_fields    = ['date']
    ordering           = ['-date']

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        """GET /api/journal/today/ → Return or 404 for today's entry."""
        from django.utils import timezone
        today = timezone.localdate()
        try:
            entry = DailyJournal.objects.get(date=today)
            return Response(DailyJournalSerializer(entry).data)
        except DailyJournal.DoesNotExist:
            return Response(
                {'detail': 'No journal entry for today yet.'},
                status=status.HTTP_404_NOT_FOUND
            )


# ── Notes ─────────────────────────────────────────────────────
class NoteViewSet(viewsets.ModelViewSet):
    """
    Full CRUD + pin/archive/search for notes.
    GET /api/notes/?search=django          → full-text search
    GET /api/notes/?category=WORK          → filter by category
    GET /api/notes/?is_pinned=true         → pinned notes only
    GET /api/notes/?is_archived=false      → active notes (default)
    PATCH /api/notes/<id>/toggle_pin/      → toggle pin status
    PATCH /api/notes/<id>/toggle_archive/  → toggle archive status
    """
    queryset           = Note.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = {
        'category':    ['exact'],
        'is_pinned':   ['exact'],
        'is_archived': ['exact'],
    }
    search_fields  = ['title', 'content', 'tags']
    ordering_fields= ['updated_at', 'created_at', 'title', 'is_pinned']
    ordering       = ['-is_pinned', '-updated_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return NoteListSerializer
        return NoteSerializer

    @action(detail=True, methods=['patch'], url_path='toggle-pin')
    def toggle_pin(self, request, pk=None):
        note = self.get_object()
        note.is_pinned = not note.is_pinned
        note.save(update_fields=['is_pinned'])
        return Response({'id': note.id, 'is_pinned': note.is_pinned})

    @action(detail=True, methods=['patch'], url_path='toggle-archive')
    def toggle_archive(self, request, pk=None):
        note = self.get_object()
        note.is_archived = not note.is_archived
        note.save(update_fields=['is_archived'])
        return Response({'id': note.id, 'is_archived': note.is_archived})


# ── Finance ───────────────────────────────────────────────────
class SalaryRecordViewSet(viewsets.ModelViewSet):
    """
    Monthly salary records with nested expenses.
    GET /api/salary/           → list (summary)
    GET /api/salary/<id>/      → detail with all expenses + computed savings
    GET /api/salary/summary/   → last 6 months trend for charts
    """
    queryset           = SalaryRecord.objects.prefetch_related('expenses').all()
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = {'month': ['exact', 'gte', 'lte', 'year']}
    ordering           = ['-month']

    def get_serializer_class(self):
        if self.action == 'list':
            return SalaryRecordListSerializer
        return SalaryRecordSerializer

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Returns last 6 months for trend charts."""
        records = SalaryRecord.objects.prefetch_related('expenses').order_by('-month')[:6]
        data = []
        for r in reversed(records):
            total_exp = float(sum(e.amount for e in r.expenses.all()))
            data.append({
                'month':          r.month.strftime('%b %Y'),
                'gross_salary':   float(r.gross_salary),
                'net_salary':     float(r.net_salary),
                'total_expenses': total_exp,
                'savings':        float(r.net_salary + r.bonus + r.other_income) - total_exp,
            })
        return Response(data)


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    Expense CRUD — filter by salary_record or date range.
    GET /api/expenses/?salary_record=<id>
    GET /api/expenses/?category=FOOD
    """
    queryset           = Expense.objects.all()
    serializer_class   = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = {
        'salary_record': ['exact'],
        'category':      ['exact', 'in'],
        'date':          ['exact', 'gte', 'lte'],
        'is_recurring':  ['exact'],
    }
    ordering_fields = ['date', 'amount']
    ordering        = ['-date']
