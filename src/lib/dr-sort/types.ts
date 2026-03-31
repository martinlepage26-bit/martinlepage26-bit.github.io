export type PassStatus = 'reserved' | 'active' | 'paused' | 'completed';
export type ItemStatus = 'ready' | 'needs_review' | 'duplicate_risk' | 'contradiction' | 'deferred' | 'staged';
export type MoveState = 'staged' | 'applied' | 'rolled_back';

export interface SortPass {
  id: string;
  cabinetId: string;
  scopeLabel: string;
  status: PassStatus;
  goals: string[];
  openedAt: string;
  closedAt?: string;
}

export interface QueueItem {
  id: string;
  fileName: string;
  relativePath: string;
  fileType: string;
  size: number;
  modifiedAt: string;
  textSnippet: string;
  suggestedBin: string;
  confidence: number;
  status: ItemStatus;
  riskFlags: string[];
}

export interface DecisionNote {
  id: string;
  queueItemId: string;
  action: string;
  rationale: string;
  competingDestinations: string[];
  createdAt: string;
}

export interface MovePlan {
  id: string;
  queueItemId: string;
  sourceLabel: string;
  destinationLabel: string;
  state: MoveState;
}

export interface DrSortState {
  currentPass: SortPass | null;
  queue: QueueItem[];
  notes: DecisionNote[];
  moves: MovePlan[];
}
