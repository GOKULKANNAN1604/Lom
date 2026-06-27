/**
 * src/hooks/usePillarData.js
 *
 * React Query hooks for all three pillars (Performance, Study, Tech).
 * Provides CRUD queries and mutations, and custom actions (streaks, heatmap, documents, revision cards).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subDays, format, eachDayOfInterval } from '../utils/dateHelpers';
import {
  getPerformanceLogs, createPerformanceLog, updatePerformanceLog,
  deletePerformanceLog, getPerformanceStreak,
} from '../api/performance';
import {
  getStudyLogs, createStudyLog, updateStudyLog,
  deleteStudyLog, getStudyStreak,
  getStudyDocuments, createStudyDocument, updateStudyDocument, deleteStudyDocument,
  getRevisionCards, createRevisionCard, deleteRevisionCard, reviewRevisionCard
} from '../api/study';
import {
  getTechLogs, createTechLog, updateTechLog,
  deleteTechLog, getTechStreak,
} from '../api/tech';
import api from '../api/axios';


// ─────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => api.get('/dashboard/').then((r) => r.data),
    staleTime: 1000 * 60 * 2,   // 2 min
  });


// ─────────────────────────────────────────────────────────────────
// STREAKS
// ─────────────────────────────────────────────────────────────────

export const useStreaks = () =>
  useQuery({
    queryKey: ['streaks'],
    queryFn: async () => {
      const [perf, study, tech] = await Promise.all([
        getPerformanceStreak().then((r) => r.data),
        getStudyStreak().then((r) => r.data),
        getTechStreak().then((r) => r.data),
      ]);
      return { performance: perf, study, tech };
    },
    staleTime: 1000 * 60 * 5,
  });


// ─────────────────────────────────────────────────────────────────
// HEATMAP  (last 365 days, all pillars combined)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch up to 365 logs for a pillar within a date range.
 */
const fetchPillarRange = (endpoint, from, to) =>
  api
    .get(endpoint, {
      params: {
        date_logged__gte: from,
        date_logged__lte: to,
        page_size: 365,
        ordering: 'date_logged',
      },
    })
    .then((r) => r.data?.results ?? r.data ?? []);

export const useHeatmapData = (pillar = 'all') => {
  const today = new Date();
  const from  = format(subDays(today, 364));
  const to    = format(today);

  return useQuery({
    queryKey: ['heatmap', pillar, from, to],
    queryFn: async () => {
      const endpoints =
        pillar === 'all'
          ? { performance: '/performance/', study: '/study/', tech: '/tech/' }
          : pillar === 'performance' ? { performance: '/performance/' }
          : pillar === 'study'       ? { study: '/study/' }
          :                           { tech: '/tech/' };

      const results = await Promise.all(
        Object.entries(endpoints).map(([key, ep]) =>
          fetchPillarRange(ep, from, to).then((rows) => ({ key, rows }))
        )
      );

      // Build a map: { '2026-06-23': { performance: 1, study: 0, tech: 2, total: 3 } }
      const days = eachDayOfInterval(subDays(today, 364), today);
      const map  = {};
      for (const d of days) {
        map[format(d)] = { performance: 0, study: 0, tech: 0, total: 0 };
      }
      for (const { key, rows } of results) {
        for (const row of rows) {
          const d = row.date_logged;
          if (map[d]) {
            map[d][key]  += 1;
            map[d].total += 1;
          }
        }
      }

      return { map, from, to };
    },
    staleTime: 1000 * 60 * 10,
  });
};


// ─────────────────────────────────────────────────────────────────
// PERFORMANCE CRUD
// ─────────────────────────────────────────────────────────────────

export const usePerformanceLogs = (params = {}) =>
  useQuery({
    queryKey: ['performance', params],
    queryFn:  () => getPerformanceLogs(params).then((r) => r.data),
  });

export const useCreatePerformanceLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPerformanceLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['heatmap'] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
};

export const useUpdatePerformanceLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updatePerformanceLog(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performance'] }),
  });
};

export const useDeletePerformanceLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePerformanceLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance'] });
      qc.invalidateQueries({ queryKey: ['heatmap'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
};


// ─────────────────────────────────────────────────────────────────
// STUDY CRUD
// ─────────────────────────────────────────────────────────────────

export const useStudyLogs = (params = {}) =>
  useQuery({
    queryKey: ['study', params],
    queryFn:  () => getStudyLogs(params).then((r) => r.data),
  });

export const useCreateStudyLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudyLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['heatmap'] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
      qc.invalidateQueries({ queryKey: ['study-documents'] });
    },
  });
};

export const useDeleteStudyLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStudyLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study'] });
      qc.invalidateQueries({ queryKey: ['heatmap'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
      qc.invalidateQueries({ queryKey: ['study-documents'] });
    },
  });
};


// ─────────────────────────────────────────────────────────────────
// STUDY DOCUMENTS CRUD
// ─────────────────────────────────────────────────────────────────

export const useStudyDocuments = () =>
  useQuery({
    queryKey: ['study-documents'],
    queryFn:  () => getStudyDocuments().then((r) => r.data),
  });

export const useCreateStudyDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudyDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-documents'] });
    },
  });
};

export const useUpdateStudyDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateStudyDocument(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-documents'] });
      qc.invalidateQueries({ queryKey: ['study'] }); // Study log might link documents
    },
  });
};

export const useDeleteStudyDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStudyDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-documents'] });
      qc.invalidateQueries({ queryKey: ['study'] });
    },
  });
};


// ─────────────────────────────────────────────────────────────────
// REVISION CARDS CRUD
// ─────────────────────────────────────────────────────────────────

export const useRevisionCards = () =>
  useQuery({
    queryKey: ['revision-cards'],
    queryFn:  () => getRevisionCards().then((r) => r.data),
  });

export const useCreateRevisionCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRevisionCard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['revision-cards'] });
    },
  });
};

export const useDeleteRevisionCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRevisionCard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['revision-cards'] });
    },
  });
};

export const useReviewRevisionCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewRevisionCard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['revision-cards'] });
    },
  });
};


// ─────────────────────────────────────────────────────────────────
// TECH CRUD
// ─────────────────────────────────────────────────────────────────

export const useTechLogs = (params = {}) =>
  useQuery({
    queryKey: ['tech', params],
    queryFn:  () => getTechLogs(params).then((r) => r.data),
  });

export const useCreateTechLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTechLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tech'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['heatmap'] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
};

export const useDeleteTechLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTechLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tech'] });
      qc.invalidateQueries({ queryKey: ['heatmap'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
};
