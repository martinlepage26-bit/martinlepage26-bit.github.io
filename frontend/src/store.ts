// Tiny cross-screen message bus. Used when Library wants to push a draft's
// text into the Readback tab on focus, without expo-router URL params.

type Pending = { text: string; title?: string } | null;

let _pendingDraft: Pending = null;

export const pendingDraft = {
  set(p: Pending) {
    _pendingDraft = p;
  },
  consume(): Pending {
    const v = _pendingDraft;
    _pendingDraft = null;
    return v;
  },
};
