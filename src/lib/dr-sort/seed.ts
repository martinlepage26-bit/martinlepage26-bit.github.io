import type { QueueItem } from './types';

export const SEED_QUEUE: QueueItem[] = [
  {
    id: 'q-001',
    fileName: 'policy_draft_v2.pdf',
    relativePath: '/inbox/governance/',
    fileType: 'pdf',
    size: 1024 * 45,
    modifiedAt: '2026-03-28T14:20:00Z',
    textSnippet: 'This policy outlines the governance framework for agentic systems...',
    suggestedBin: 'Policy Frameworks',
    confidence: 0.88,
    status: 'ready',
    riskFlags: []
  },
  {
    id: 'q-002',
    fileName: 'literature_review_notes.md',
    relativePath: '/inbox/research/',
    fileType: 'md',
    size: 1024 * 12,
    modifiedAt: '2026-03-29T09:15:00Z',
    textSnippet: 'Key themes identified in the 2025 AI ethics survey include...',
    suggestedBin: 'Research Literature',
    confidence: 0.65,
    status: 'needs_review',
    riskFlags: ['missing_tags']
  },
  {
    id: 'q-003',
    fileName: 'contradictory_evidence_A.docx',
    relativePath: '/inbox/audit/',
    fileType: 'docx',
    size: 1024 * 88,
    modifiedAt: '2026-03-30T16:45:00Z',
    textSnippet: 'The audit logs show a discrepancy between the reported and actual...',
    suggestedBin: 'Audit Logs',
    confidence: 0.42,
    status: 'contradiction',
    riskFlags: ['high_risk', 'arbitration_required']
  },
  {
    id: 'q-004',
    fileName: 'duplicate_report_final.pdf',
    relativePath: '/inbox/reports/',
    fileType: 'pdf',
    size: 1024 * 156,
    modifiedAt: '2026-03-31T08:00:00Z',
    textSnippet: 'Final summary of the quarterly performance review...',
    suggestedBin: 'Quarterly Reports',
    confidence: 0.95,
    status: 'duplicate_risk',
    riskFlags: ['potential_duplicate']
  }
];
