import type { DrSortState, SortPass, QueueItem, DecisionNote, MovePlan } from './types';
import { SEED_QUEUE } from './seed';

const STORAGE_KEY = 'dr_sort_state_v1';

export const INITIAL_STATE: DrSortState = {
  currentPass: null,
  queue: SEED_QUEUE,
  notes: [],
  moves: []
};

export function loadState(): DrSortState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_STATE;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse Dr.Sort state', e);
    return INITIAL_STATE;
  }
}

export function saveState(state: DrSortState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createPass(scope: string): SortPass {
  const pass: SortPass = {
    id: `pass-${Date.now()}`,
    cabinetId: 'cab-local-01',
    scopeLabel: scope,
    status: 'active',
    goals: ['Triage current inbox', 'Identify contradictions'],
    openedAt: new Date().toISOString()
  };
  return pass;
}

export function updateItemStatus(itemId: string, status: QueueItem['status']): void {
  const state = loadState();
  const item = state.queue.find(i => i.id === itemId);
  if (item) {
    item.status = status;
    saveState(state);
  }
}

export function addNote(note: Omit<DecisionNote, 'id' | 'createdAt'>): void {
  const state = loadState();
  const newNote: DecisionNote = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  state.notes.push(newNote);
  saveState(state);
}

export function stageMove(move: Omit<MovePlan, 'id' | 'state'>): void {
  const state = loadState();
  const newMove: MovePlan = {
    ...move,
    id: `move-${Date.now()}`,
    state: 'staged'
  };
  state.moves.push(newMove);
  // Also update item status to staged
  const item = state.queue.find(i => i.id === move.queueItemId);
  if (item) item.status = 'staged';
  saveState(state);
}

export function getReadinessScore(state: DrSortState): { percentage: number; unresolved: number; contradictions: number } {
  const total = state.queue.length;
  if (total === 0) return { percentage: 0, unresolved: 0, contradictions: 0 };
  
  const classified = state.queue.filter(i => i.status === 'staged').length;
  const unresolved = state.queue.filter(i => i.status !== 'staged').length;
  const contradictions = state.queue.filter(i => i.status === 'contradiction').length;
  
  return {
    percentage: Math.round((classified / total) * 100),
    unresolved,
    contradictions
  };
}
