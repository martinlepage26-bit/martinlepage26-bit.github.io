import JSZip from 'jszip';

const STORAGE_KEY = 'martin-scripto-standalone-v2';
const EMPTY_SOURCE_LABEL = 'Paste text or upload a file';
const REVIEW_MODES = ['supportive', 'cold', 'harsh'];
const CONTROL_INTERVALS = ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'On trigger'];

const CHECKS = [
  {
    id: 'c1',
    label: 'Source classes explicitly separated',
    detail: 'Direct evidence, supported inference, and unresolved unknowns remain distinct lanes.',
  },
  {
    id: 'c2',
    label: 'No load-bearing claim travels without an anchor',
    detail: 'Each major claim has either a source note or an explicit uncertainty note attached to it.',
  },
  {
    id: 'c3',
    label: 'Pre-pass contradiction check complete',
    detail: 'The packet was checked for internal contradictions before this revision pass.',
  },
  {
    id: 'c4',
    label: 'Post-pass contradiction check complete',
    detail: 'The revision did not introduce new contradictions or erase key boundaries.',
  },
  {
    id: 'c5',
    label: 'Overclaims flagged and narrowed',
    detail: 'Claims exceeding their evidence floor were either tightened or explicitly marked as unresolved.',
  },
  {
    id: 'c6',
    label: 'Unresolved unknowns named',
    detail: 'Important gaps are visible rather than silently omitted in fluent summary language.',
  },
];

const OVERCLAIM_PATTERNS = [
  /\b(prove|proves|proved|proven|proof)\b/i,
  /\b(definitive(?:ly)?|undeniable|unquestionable|irrefutable|conclusive)\b/i,
  /\b(always|never|everyone|no one|all cases|every case|entirely|completely)\b/i,
  /\b(first(?: ever)?|unprecedented|groundbreaking|wholly new|entirely original)\b/i,
  /\b(causes|determines|guarantees|solves|results in|leads to)\b/i,
];

const CLAIM_PATTERN =
  /\b(argue|argues|argued|show|shows|showed|suggest|suggests|suggested|demonstrate|demonstrates|demonstrated|propose|proposes|proposed|contend|contends|contended|reveal|reveals|revealed|find|finds|found|trace|traces|traced|identify|identifies|identified|explain|explains|explained|indicate|indicates|indicated)\b/i;

const titleField = document.getElementById('packet-title');
const fileField = document.getElementById('packet-file');
const fileStatus = document.getElementById('packet-file-status');
const objectField = document.getElementById('packet-object');
const domainField = document.getElementById('packet-domain');
const pressureField = document.getElementById('packet-pressure');
const bodyField = document.getElementById('packet-body');
const contradictionNotesField = document.getElementById('contradiction-notes');
const claimList = document.getElementById('claim-list');
const controlList = document.getElementById('control-list');
const checkList = document.getElementById('check-list');
const exportPreview = document.getElementById('export-preview');
const exportStatus = document.getElementById('export-status');
const headerReadinessText = document.getElementById('header-readiness-text');
const ledgerDraftStatus = document.getElementById('ledger-draft-status');

const state = {
  step: 0,
  stepsDone: [false, false, false, false, false, false],
  sourceLabel: EMPTY_SOURCE_LABEL,
  claims: [],
  checks: Object.fromEntries(CHECKS.map((check) => [check.id, false])),
  reviews: {
    supportive: '',
    cold: '',
    harsh: '',
  },
  activeReview: 'supportive',
  controls: [],
  savedAt: '',
  saveError: '',
  saveTimer: null,
};

let idCursor = Date.now();

const nextId = () => {
  idCursor += 1;
  return idCursor;
};

const makeEmptyClaim = () => ({
  id: nextId(),
  text: '',
  cls: 'direct',
  note: '',
});

const makeEmptyControl = () => ({
  id: nextId(),
  finding: '',
  owner: '',
  evidence: '',
  interval: '',
});

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const compact = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const countWords = (text) => (String(text).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;

const splitSentences = (text) =>
  (String(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map((sentence) => compact(sentence))
    .filter(Boolean);

const countCitationSignals = (text) =>
  (String(text).match(/\((?:[^)]*\d{4}[^)]*)\)|\[[0-9]{1,3}\]|\b[A-Z][a-z]+,\s*\d{4}\b/g) ?? []).length;

const countQuoteSignals = (text) => (String(text).match(/["“][^"”]{8,}["”]/g) ?? []).length;

const truncate = (text, limit = 170) => {
  const clean = compact(text);
  if (clean.length <= limit) {
    return clean;
  }
  return `${clean.slice(0, limit - 1).trim()}...`;
};

const getSetupValue = (field) => field?.value?.trim?.() ?? '';
const getClaimsWithText = () => state.claims.filter((claim) => compact(claim.text));
const getCompleteControls = () =>
  state.controls.filter(
    (control) => compact(control.finding) && compact(control.owner) && compact(control.evidence) && compact(control.interval),
  );
const getCheckCount = () => CHECKS.filter((check) => state.checks[check.id]).length;
const getReviewCount = () => REVIEW_MODES.filter((mode) => compact(state.reviews[mode])).length;
const hasPacketSetup = () =>
  Boolean(getSetupValue(objectField) && getSetupValue(domainField) && getSetupValue(pressureField) && getSetupValue(bodyField));
const hasClaimsMapped = () => getClaimsWithText().length > 0;
const hasRecursiveCheckWork = () => getCheckCount() > 0 || Boolean(compact(contradictionNotesField?.value || ''));
const hasReviewsRun = () => getReviewCount() > 0;
const hasCompleteControlRow = () => getCompleteControls().length > 0;
const canExportPacket = () =>
  hasPacketSetup() && hasClaimsMapped() && hasRecursiveCheckWork() && hasReviewsRun() && hasCompleteControlRow();

const getStepBlockMessage = (targetStep) => {
  if (targetStep <= 0) {
    return '';
  }

  if (!hasPacketSetup()) {
    return 'Complete packet setup with governing object, consequence domain, recursive pressure, and manuscript body first.';
  }

  if (targetStep <= 1) {
    return '';
  }

  if (!hasClaimsMapped()) {
    return 'Map at least one claim before moving on.';
  }

  if (targetStep <= 2) {
    return '';
  }

  if (!hasRecursiveCheckWork()) {
    return 'Mark at least one recursive check or record contradiction notes before Henry review.';
  }

  if (targetStep <= 3) {
    return '';
  }

  if (!hasReviewsRun()) {
    return 'Run at least one reviewer before assigning controls.';
  }

  if (targetStep <= 4) {
    return '';
  }

  if (!hasCompleteControlRow()) {
    return 'Complete at least one control row before export.';
  }

  return '';
};

const getMaxReachableStep = () => {
  let max = 0;

  if (hasPacketSetup()) {
    max = 1;
  }

  if (max >= 1 && hasClaimsMapped()) {
    max = 2;
  }

  if (max >= 2 && hasRecursiveCheckWork()) {
    max = 3;
  }

  if (max >= 3 && hasReviewsRun()) {
    max = 4;
  }

  if (max >= 4 && hasCompleteControlRow()) {
    max = 5;
  }

  return max;
};

const classifySeededClaim = (sentence) => {
  if (OVERCLAIM_PATTERNS.some((pattern) => pattern.test(sentence))) {
    return 'unresolved';
  }

  if (
    /\((?:[^)]*\d{4}[^)]*)\)|\[[0-9]{1,3}\]|\baccording to\b|\barchive\b|\binterview\b|\bdata\b|\bsource\b/i.test(
      sentence,
    )
  ) {
    return 'direct';
  }

  if (/\b(may|might|could|suggest|appears|likely|indicates|implies)\b/i.test(sentence)) {
    return 'inferred';
  }

  return 'inferred';
};

const buildAnchorNote = (sentence, cls) => {
  if (cls === 'direct') {
    return 'Map the citation, source excerpt, or artifact that directly holds this claim.';
  }
  if (cls === 'inferred') {
    return 'Name the evidence class this inference depends on and why the jump is still bounded.';
  }
  if (OVERCLAIM_PATTERNS.some((pattern) => pattern.test(sentence))) {
    return 'This wording likely outruns its support and needs a narrower boundary or a stronger source anchor.';
  }
  return 'Keep the uncertainty explicit until a source anchor is attached.';
};

const getOverclaimSentence = () => {
  const sentences = splitSentences(bodyField?.value || '');
  return sentences.find((sentence) => OVERCLAIM_PATTERNS.some((pattern) => pattern.test(sentence))) || '';
};

const getReadiness = () => {
  const object = getSetupValue(objectField);
  const domain = getSetupValue(domainField);
  const pressure = getSetupValue(pressureField);
  const body = getSetupValue(bodyField);
  const claimCount = getClaimsWithText().length;
  const checkCount = getCheckCount();
  const reviewCount = getReviewCount();
  const controlCount = getCompleteControls().length;

  let score = 0;
  if (object) score += 1;
  if (domain) score += 1;
  if (pressure) score += 1;
  if (body.length >= 120) score += 1;
  if (claimCount >= 2) score += 1;
  if (checkCount >= 4) score += 1;
  if (reviewCount >= 2) score += 1;
  if (controlCount >= 1) score += 1;

  if (score <= 3) {
    return {
      score,
      label: 'Not ready',
      pillClass: 'not-ready',
      headerLabel: 'Not ready',
    };
  }

  if (!canExportPacket() || score <= 6) {
    return {
      score,
      label: 'Revise before external review',
      pillClass: 'revise',
      headerLabel: 'Revise',
    };
  }

  return {
    score,
    label: 'Ready for review',
    pillClass: 'ready',
    headerLabel: 'Ready for review',
  };
};

const showToast = (message, variant = '') => {
  const toast = document.getElementById('scripto-toast');
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.className = `scripto-toast show${variant ? ` ${variant}` : ''}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'scripto-toast';
  }, 2600);
};

const syncCompletionState = () => {
  state.stepsDone = [
    hasPacketSetup(),
    hasClaimsMapped(),
    hasRecursiveCheckWork(),
    hasReviewsRun(),
    hasCompleteControlRow(),
    canExportPacket(),
  ];

  state.stepsDone.forEach((done, index) => {
    const dot = document.getElementById(`step-done-${index}`);
    if (dot) {
      dot.classList.toggle('visible', done);
    }
  });

  updateProgressPips();
  updateStepPanels();
};

const updateCharCounts = () => {
  const titleCount = document.getElementById('title-count');
  const objectCount = document.getElementById('object-count');
  const bodyCount = document.getElementById('body-count');

  if (titleCount) {
    titleCount.textContent = `${getSetupValue(titleField).length} / 90`;
    titleCount.className = `scripto-inline-count${getSetupValue(titleField).length > 80 ? ' warn' : ''}`;
  }

  if (objectCount) {
    objectCount.textContent = `${getSetupValue(objectField).length} / 180`;
    objectCount.className = `scripto-inline-count${getSetupValue(objectField).length > 160 ? ' warn' : ''}`;
  }

  if (bodyCount) {
    bodyCount.textContent = `${countWords(bodyField?.value || '')} words`;
    bodyCount.className = 'scripto-inline-count';
  }
};

const updateStepPanels = () => {
  document.querySelectorAll('[data-step-button]').forEach((button) => {
    const buttonStep = Number(button.getAttribute('data-step-button'));
    button.classList.toggle('active', buttonStep === state.step);
    button.disabled = false;
    button.removeAttribute('aria-disabled');
    button.classList.remove('locked');
  });

  document.querySelectorAll('[data-step-panel]').forEach((panel) => {
    panel.classList.toggle('active', Number(panel.getAttribute('data-step-panel')) === state.step);
  });
};

const updateProgressPips = () => {
  const classes = ['lit', 'lit', 'warn', 'warn', 'lit', 'pass'];

  state.stepsDone.forEach((done, index) => {
    const headerPip = document.getElementById(`hp${index}`);
    const ledgerPip = document.getElementById(`rb${index}`);
    if (headerPip) {
      headerPip.className = `scripto-score-pip${done ? ` ${classes[index]}` : ''}`;
    }
    if (ledgerPip) {
      ledgerPip.className = `scripto-readiness-segment${done ? ` ${classes[index]}` : ''}`;
    }
  });
};

const setLedgerValue = (id, value, fallback = 'not set') => {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  const clean = compact(value);
  if (clean) {
    element.textContent = clean;
    element.classList.remove('is-empty');
  } else {
    element.textContent = fallback;
    element.classList.add('is-empty');
  }
};

const updateLedger = () => {
  syncCompletionState();

  const claims = getClaimsWithText();
  const direct = claims.filter((claim) => claim.cls === 'direct').length;
  const inferred = claims.filter((claim) => claim.cls === 'inferred').length;
  const unresolved = claims.filter((claim) => claim.cls === 'unresolved').length;
  const checkCount = getCheckCount();
  const reviewCount = getReviewCount();
  const readiness = getReadiness();
  const wordCount = countWords(bodyField?.value || '');

  document.getElementById('ledger-source').textContent = state.sourceLabel || EMPTY_SOURCE_LABEL;
  setLedgerValue('ledger-object', getSetupValue(objectField));
  setLedgerValue('ledger-domain', getSetupValue(domainField));
  setLedgerValue('ledger-pressure', getSetupValue(pressureField));
  document.getElementById('ledger-words').textContent = `${wordCount.toLocaleString()} words`;
  document.getElementById('ledger-claims').textContent =
    claims.length === 0
      ? '0 mapped'
      : `${claims.length} mapped (${direct} direct, ${inferred} inferred, ${unresolved} unresolved)`;
  document.getElementById('ledger-checks').textContent = `${checkCount} / ${CHECKS.length} passed`;
  document.getElementById('ledger-reviews').textContent = `${reviewCount} / ${REVIEW_MODES.length} run`;
  document.getElementById('ledger-readiness').innerHTML =
    `<span class="scripto-status-pill ${readiness.pillClass}">${escapeHtml(readiness.label)}</span>`;

  if (ledgerDraftStatus) {
    ledgerDraftStatus.textContent = state.saveError
      ? state.saveError
      : state.savedAt
        ? `Saved locally at ${new Date(state.savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        : 'Autosave idle';
  }

  if (headerReadinessText) {
    headerReadinessText.textContent = readiness.headerLabel;
    headerReadinessText.className = `scripto-header-status ${readiness.pillClass}`;
  }
};

const renderClaimSummary = () => {
  const claims = getClaimsWithText();
  const direct = claims.filter((claim) => claim.cls === 'direct').length;
  const inferred = claims.filter((claim) => claim.cls === 'inferred').length;
  const unresolved = claims.filter((claim) => claim.cls === 'unresolved').length;

  document.getElementById('claim-total-label').textContent =
    claims.length === 1 ? '1 claim mapped' : `${claims.length} claims mapped`;
  document.getElementById('claim-direct-label').textContent = `${direct} direct`;
  document.getElementById('claim-inferred-label').textContent = `${inferred} inferred`;
  document.getElementById('claim-unresolved-label').textContent = `${unresolved} unresolved`;
};

const scheduleSave = () => {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    saveDraft();
  }, 350);
};

const renderClaims = () => {
  if (!claimList) {
    return;
  }

  claimList.innerHTML = state.claims
    .map((claim) => {
      const badgeLabel = claim.cls === 'direct' ? 'DIRECT' : claim.cls === 'inferred' ? 'INFERRED' : 'UNRESOLVED';
      return `
        <article class="scripto-claim-row ${escapeHtml(claim.cls)}">
          <div class="scripto-claim-top">
            <input
              class="scripto-input"
              type="text"
              data-claim-text="${claim.id}"
              value="${escapeHtml(claim.text)}"
              placeholder="State the claim that is carrying argumentative weight."
            />
            <select class="scripto-select claim-select" data-claim-class="${claim.id}">
              <option value="direct" ${claim.cls === 'direct' ? 'selected' : ''}>Direct evidence</option>
              <option value="inferred" ${claim.cls === 'inferred' ? 'selected' : ''}>Supported inference</option>
              <option value="unresolved" ${claim.cls === 'unresolved' ? 'selected' : ''}>Unresolved unknown</option>
            </select>
            <span class="scripto-chip ${escapeHtml(claim.cls)}">${badgeLabel}</span>
            <button class="scripto-icon-button" data-remove-claim="${claim.id}" type="button" aria-label="Remove claim">
              x
            </button>
          </div>
          <input
            class="scripto-input claim-anchor"
            type="text"
            data-claim-note="${claim.id}"
            value="${escapeHtml(claim.note)}"
            placeholder="Anchor note: citation, source class, excerpt, or reason it remains unresolved."
          />
        </article>
      `;
    })
    .join('');

  claimList.querySelectorAll('[data-claim-text]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const id = Number(event.currentTarget.getAttribute('data-claim-text'));
      const claim = state.claims.find((entry) => entry.id === id);
      if (!claim) {
        return;
      }
      claim.text = event.currentTarget.value;
      if (!claim.note.trim()) {
        claim.note = buildAnchorNote(claim.text, claim.cls);
      }
      renderClaimSummary();
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });

  claimList.querySelectorAll('[data-claim-class]').forEach((select) => {
    select.addEventListener('change', (event) => {
      const id = Number(event.currentTarget.getAttribute('data-claim-class'));
      const claim = state.claims.find((entry) => entry.id === id);
      if (!claim) {
        return;
      }
      claim.cls = event.currentTarget.value;
      renderClaims();
      renderClaimSummary();
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });

  claimList.querySelectorAll('[data-claim-note]').forEach((input) => {
    input.addEventListener('input', (event) => {
      const id = Number(event.currentTarget.getAttribute('data-claim-note'));
      const claim = state.claims.find((entry) => entry.id === id);
      if (!claim) {
        return;
      }
      claim.note = event.currentTarget.value;
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });

  claimList.querySelectorAll('[data-remove-claim]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const id = Number(event.currentTarget.getAttribute('data-remove-claim'));
      state.claims = state.claims.filter((claim) => claim.id !== id);
      if (state.claims.length === 0) {
        state.claims.push(makeEmptyClaim());
      }
      renderClaims();
      renderClaimSummary();
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });
};

const renderChecks = () => {
  if (!checkList) {
    return;
  }

  checkList.innerHTML = CHECKS.map((check) => {
    const checked = Boolean(state.checks[check.id]);
    return `
      <label class="scripto-check-row">
        <input type="checkbox" data-check-id="${check.id}" ${checked ? 'checked' : ''} />
        <span>
          <strong>${escapeHtml(check.label)}</strong>
          <small>${escapeHtml(check.detail)}</small>
        </span>
      </label>
    `;
  }).join('');

  checkList.querySelectorAll('[data-check-id]').forEach((input) => {
    input.addEventListener('change', (event) => {
      const id = event.currentTarget.getAttribute('data-check-id');
      state.checks[id] = Boolean(event.currentTarget.checked);
      const count = getCheckCount();
      document.getElementById('check-progress-text').textContent = `${count} / ${CHECKS.length} passed`;
      document.getElementById('check-progress-fill').style.width = `${(count / CHECKS.length) * 100}%`;
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });

  const count = getCheckCount();
  document.getElementById('check-progress-text').textContent = `${count} / ${CHECKS.length} passed`;
  document.getElementById('check-progress-fill').style.width = `${(count / CHECKS.length) * 100}%`;
};

const renderControls = () => {
  if (!controlList) {
    return;
  }

  controlList.innerHTML = state.controls
    .map(
      (control) => `
        <article class="scripto-control-row">
          <div class="scripto-control-grid">
            <div>
              <label class="scripto-label" for="control-finding-${control.id}">Finding or claim path</label>
              <input
                id="control-finding-${control.id}"
                class="scripto-input"
                type="text"
                data-control-field="${control.id}"
                data-control-key="finding"
                value="${escapeHtml(control.finding)}"
                placeholder="What needs governing attention?"
              />
            </div>
            <div>
              <label class="scripto-label" for="control-owner-${control.id}">Owner</label>
              <input
                id="control-owner-${control.id}"
                class="scripto-input"
                type="text"
                data-control-field="${control.id}"
                data-control-key="owner"
                value="${escapeHtml(control.owner)}"
                placeholder="Name or accountable role"
              />
            </div>
            <div>
              <label class="scripto-label" for="control-evidence-${control.id}">Evidence required</label>
              <input
                id="control-evidence-${control.id}"
                class="scripto-input"
                type="text"
                data-control-field="${control.id}"
                data-control-key="evidence"
                value="${escapeHtml(control.evidence)}"
                placeholder="What proof or source class is required?"
              />
            </div>
            <div>
              <label class="scripto-label" for="control-interval-${control.id}">Review interval</label>
              <select
                id="control-interval-${control.id}"
                class="scripto-select"
                data-control-field="${control.id}"
                data-control-key="interval"
              >
                <option value="">Select interval</option>
                ${CONTROL_INTERVALS.map(
                  (interval) =>
                    `<option value="${escapeHtml(interval)}" ${control.interval === interval ? 'selected' : ''}>${escapeHtml(interval)}</option>`,
                ).join('')}
              </select>
            </div>
          </div>
          <div class="scripto-button-row compact">
            <button class="scripto-icon-button" data-remove-control="${control.id}" type="button" aria-label="Remove control row">
              x
            </button>
          </div>
        </article>
      `,
    )
    .join('');

  controlList.querySelectorAll('[data-control-field]').forEach((field) => {
    field.addEventListener('input', (event) => {
      const id = Number(event.currentTarget.getAttribute('data-control-field'));
      const key = event.currentTarget.getAttribute('data-control-key');
      const control = state.controls.find((entry) => entry.id === id);
      if (!control || !key) {
        return;
      }
      control[key] = event.currentTarget.value;
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });

    field.addEventListener('change', (event) => {
      const id = Number(event.currentTarget.getAttribute('data-control-field'));
      const key = event.currentTarget.getAttribute('data-control-key');
      const control = state.controls.find((entry) => entry.id === id);
      if (!control || !key) {
        return;
      }
      control[key] = event.currentTarget.value;
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });

  controlList.querySelectorAll('[data-remove-control]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const id = Number(event.currentTarget.getAttribute('data-remove-control'));
      state.controls = state.controls.filter((control) => control.id !== id);
      if (state.controls.length === 0) {
        state.controls.push(makeEmptyControl());
      }
      renderControls();
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });
};

const renderReviews = () => {
  REVIEW_MODES.forEach((mode) => {
    const panel = document.querySelector(`[data-review-panel="${mode}"]`);
    const tab = document.querySelector(`[data-review-tab="${mode}"]`);
    const output = document.getElementById(`review-output-${mode}`);
    const isActive = state.activeReview === mode;

    panel?.classList.toggle('active', isActive);
    tab?.classList.toggle('active', isActive);

    if (output) {
      const text = compact(state.reviews[mode]);
      output.textContent = text || 'Awaiting review trigger.';
      output.classList.toggle('loaded', Boolean(text));
    }
  });
};

const getStrongestClaim = () => {
  const claims = getClaimsWithText();
  return (
    claims.find((claim) => claim.cls === 'direct' && compact(claim.note)) ||
    claims.find((claim) => claim.cls === 'direct') ||
    claims.find((claim) => claim.cls === 'inferred') ||
    claims[0] ||
    null
  );
};

const getWeakestClaim = () => {
  const claims = getClaimsWithText();
  return (
    claims.find((claim) => claim.cls === 'unresolved') ||
    claims.find((claim) => claim.cls === 'inferred' && !compact(claim.note)) ||
    claims.find((claim) => OVERCLAIM_PATTERNS.some((pattern) => pattern.test(claim.text))) ||
    claims[0] ||
    null
  );
};

const generateReview = (mode) => {
  const claims = getClaimsWithText();
  const direct = claims.filter((claim) => claim.cls === 'direct');
  const inferred = claims.filter((claim) => claim.cls === 'inferred');
  const unresolved = claims.filter((claim) => claim.cls === 'unresolved');
  const checkCount = getCheckCount();
  const reviewCount = getReviewCount();
  const completeControls = getCompleteControls();
  const overclaimSentence = getOverclaimSentence();
  const strongest = getStrongestClaim();
  const weakest = getWeakestClaim();

  const reviewBlockMessage = getStepBlockMessage(3);

  if (reviewBlockMessage) {
    return reviewBlockMessage;
  }

  if (mode === 'supportive') {
    const sentenceOne = strongest
      ? `The strongest anchor in this packet is "${truncate(strongest.text)}".`
      : 'The packet is strongest where it makes the governing object explicit before any review pressure starts.';

    const sentenceTwo = direct.length
      ? `It already keeps ${direct.length} direct claim${direct.length === 1 ? '' : 's'} separate from ${inferred.length} supported inference${inferred.length === 1 ? '' : 's'} and ${unresolved.length} unresolved unknown${unresolved.length === 1 ? '' : 's'}, which helps the draft resist evidence laundering.`
      : 'The next improvement is to map at least one clearly direct claim so the manuscript has a visible evidentiary floor.';

    const sentenceThree =
      checkCount > 0
        ? `The recursive check stack has ${checkCount} of ${CHECKS.length} gates marked, so the review trail is already becoming legible.`
        : 'Recursive checks have not been marked yet, so the packet still needs a visible contradiction trail.';

    const sentenceFour =
      completeControls.length > 0
        ? 'At least one control row is already named, which means a human reviewer can see who owns the next decision.'
        : 'Attach one owner-led control next so accountability travels with the packet instead of staying implicit.';

    return [sentenceOne, sentenceTwo, sentenceThree, sentenceFour].join(' ');
  }

  if (mode === 'cold') {
    const issues = [];

    if (claims.length === 0) {
      issues.push('No load-bearing claims are mapped yet, so the packet cannot distinguish evidence from inference.');
    }

    if (direct.length === 0 && claims.length > 0) {
      issues.push('The argument currently lacks a clearly direct claim lane, which makes the evidence floor hard to verify.');
    }

    if (unresolved.length > 0) {
      issues.push(
        `${unresolved.length} unresolved claim${unresolved.length === 1 ? '' : 's'} still carry argumentative weight and need either narrowing or explicit support.`,
      );
    }

    if (overclaimSentence) {
      issues.push(`This wording still outruns its support: "${truncate(overclaimSentence)}".`);
    }

    if (checkCount < 4) {
      issues.push(`Only ${checkCount} of ${CHECKS.length} recursive checks are marked, so the packet remains under-instrumented.`);
    }

    if (completeControls.length === 0) {
      issues.push('No complete control row is attached to a load-bearing claim path.');
    }

    while (issues.length < 4) {
      issues.push('Keep the packet narrow and reviewable by naming exactly which source class carries each major sentence.');
    }

    return issues.slice(0, 4).join(' ');
  }

  const weakText = weakest?.text || overclaimSentence || 'The packet has not mapped a concrete sentence yet.';
  let reason = 'it does not yet carry enough visible support or boundary language to survive cross-examination.';

  if (weakest?.cls === 'unresolved') {
    reason = 'it is explicitly unresolved but still positioned as if it can travel like a stable finding.';
  } else if (OVERCLAIM_PATTERNS.some((pattern) => pattern.test(weakText))) {
    reason = 'its wording overstates what the visible evidence can actually carry.';
  } else if (weakest && !compact(weakest.note)) {
    reason = 'it relies on inference without a named source anchor or uncertainty note.';
  }

  const harshLines = [
    `The sentence most likely to fail cross-examination is "${truncate(weakText)}".`,
    `It is vulnerable because ${reason}`,
    'A reviewer could ask where its source class lives, why its boundary is not narrower, and who owns the correction if it fails.',
    reviewCount >= 2
      ? 'Until that challenge is answered directly in the packet, this should remain a revise call rather than a publishable claim.'
      : 'Run the full reviewer stack and bind at least one control before letting this sentence travel externally.',
  ];

  return harshLines.join(' ');
};

const runReview = async (mode) => {
  const output = document.getElementById(`review-output-${mode}`);
  if (!output) {
    return;
  }

  const reviewBlockMessage = getStepBlockMessage(3);
  if (reviewBlockMessage) {
    output.textContent = reviewBlockMessage;
    output.classList.remove('loaded');
    showToast(reviewBlockMessage, 'warn');
    return;
  }

  state.activeReview = mode;
  renderReviews();
  output.textContent = 'Applying local review pressure...';
  output.classList.remove('loaded');

  await new Promise((resolve) => setTimeout(resolve, 220));

  const review = generateReview(mode);
  state.reviews[mode] = review;
  renderReviews();
  updateLedger();
  if (state.step === 5) {
    renderExport();
  }
  scheduleSave();
  showToast(`${mode.charAt(0).toUpperCase()}${mode.slice(1)} review complete`);
};

const runAllReviews = async () => {
  const reviewBlockMessage = getStepBlockMessage(3);
  if (reviewBlockMessage) {
    showToast(reviewBlockMessage, 'warn');
    return;
  }

  for (const mode of REVIEW_MODES) {
    state.activeReview = mode;
    renderReviews();
    await runReview(mode);
  }
};

const buildExport = () => {
  const object = getSetupValue(objectField) || '(not specified)';
  const domain = getSetupValue(domainField) || '(not specified)';
  const pressure = getSetupValue(pressureField) || '(not specified)';
  const title = getSetupValue(titleField) || 'SCRIPTO packet';
  const readiness = getReadiness();
  const wordCount = countWords(bodyField?.value || '');
  const quoteCount = countQuoteSignals(bodyField?.value || '');
  const citationSignals = countCitationSignals(bodyField?.value || '');
  const checkCount = getCheckCount();
  const claims = getClaimsWithText();
  const controls = getCompleteControls();
  const notes = compact(contradictionNotesField?.value || '');

  const claimLines = claims.length
    ? claims
        .map(
          (claim) =>
            `- [${claim.cls.toUpperCase()}] ${claim.text || '(empty claim)'}\n  Anchor note: ${claim.note || '(not specified)'}`,
        )
        .join('\n')
    : '- No claims mapped yet.';

  const reviewLines = REVIEW_MODES.filter((mode) => compact(state.reviews[mode])).length
    ? REVIEW_MODES.filter((mode) => compact(state.reviews[mode]))
        .map((mode) => `### ${mode.toUpperCase()}\n${state.reviews[mode]}`)
        .join('\n\n')
    : 'No reviewer output recorded yet.';

  const controlLines = controls.length
    ? controls
        .map(
          (control) =>
            `- Finding: ${control.finding}\n  Owner: ${control.owner}\n  Evidence required: ${control.evidence}\n  Review interval: ${control.interval}`,
        )
        .join('\n')
    : '- No complete controls assigned yet.';

  return `# ${title}

Generated: ${new Date().toISOString().split('T')[0]}
Source label: ${state.sourceLabel || EMPTY_SOURCE_LABEL}

## Packet header
- Governing object: ${object}
- Consequence domain: ${domain}
- Recursive pressure: ${pressure}
- Word count: ${wordCount}
- Quote signals: ${quoteCount}
- Citation signals: ${citationSignals}

## Readiness call
${readiness.label}

## Claim register
${claimLines}

## Recursive checks
- Passed: ${checkCount} / ${CHECKS.length}
${notes ? `- Contradiction notes: ${notes}` : '- Contradiction notes: none recorded'}

## Henry reviewer stack
${reviewLines}

## Control register
${controlLines}

## Disclosure
This packet was produced under deterministic packet discipline. Claims are bounded to their visible evidence class. Unresolved unknowns are named rather than omitted. Reviewer outputs on this public surface are local heuristic readings of the current packet state, not hidden external peer review. Human review remains required before external circulation.`;
};

const setExportActionState = () => {
  ['download-packet-button', 'copy-packet-button'].forEach((id) => {
    const button = document.getElementById(id);
    if (!button) {
      return;
    }

    button.disabled = false;
    button.removeAttribute('aria-disabled');
  });
};

const renderExport = () => {
  const readiness = getReadiness();
  const claims = getClaimsWithText();
  const controls = getCompleteControls();
  const exportEnabled = canExportPacket();

  document.getElementById('export-readiness').textContent = readiness.label;
  document.getElementById('export-word-count').textContent = String(countWords(bodyField?.value || ''));
  document.getElementById('export-claim-count').textContent = String(claims.length);
  document.getElementById('export-control-count').textContent = String(controls.length);
  setExportActionState(exportEnabled);

  if (!exportEnabled) {
    exportPreview.value = '';
    exportStatus.textContent = getStepBlockMessage(5);
    return;
  }

  exportPreview.value = buildExport();
  exportStatus.textContent = readiness.label === 'Ready for review' ? 'Ready for bounded export' : 'Bounded export available with revise call';
};

const copyPacket = async () => {
  if (!canExportPacket()) {
    exportStatus.textContent = getStepBlockMessage(5);
    showToast(getStepBlockMessage(5), 'warn');
    return;
  }

  try {
    await navigator.clipboard.writeText(buildExport());
    exportStatus.textContent = 'Copied to clipboard';
    showToast('Packet copied');
  } catch {
    exportStatus.textContent = 'Copy failed';
    showToast('Copy failed', 'warn');
  }
};

const downloadPacket = () => {
  if (!canExportPacket()) {
    exportStatus.textContent = getStepBlockMessage(5);
    showToast(getStepBlockMessage(5), 'warn');
    return;
  }

  const blob = new Blob([buildExport()], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `scripto-packet-${new Date().toISOString().split('T')[0]}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Packet downloaded');
};

const collectDraft = () => ({
  step: state.step,
  stepsDone: state.stepsDone,
  sourceLabel: state.sourceLabel,
  claims: state.claims,
  checks: state.checks,
  reviews: state.reviews,
  activeReview: state.activeReview,
  controls: state.controls,
  savedAt: new Date().toISOString(),
  fields: {
    title: titleField?.value || '',
    object: objectField?.value || '',
    domain: domainField?.value || '',
    pressure: pressureField?.value || '',
    body: bodyField?.value || '',
    contradictionNotes: contradictionNotesField?.value || '',
  },
});

const saveDraft = () => {
  try {
    const payload = collectDraft();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    state.savedAt = payload.savedAt;
    state.saveError = '';
    state.saveTimer = null;
    updateLedger();
  } catch (error) {
    state.savedAt = '';
    state.saveTimer = null;
    const nextSaveError =
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'Autosave unavailable for this draft size'
        : 'Autosave unavailable in this browser';
    const shouldNotify = state.saveError !== nextSaveError;
    state.saveError = nextSaveError;
    updateLedger();
    if (shouldNotify) {
      showToast(state.saveError, 'warn');
    }
  }
};

const applyDraft = (draft) => {
  state.step = Number(draft.step) || 0;
  state.stepsDone = Array.isArray(draft.stepsDone) && draft.stepsDone.length === 6 ? draft.stepsDone : [false, false, false, false, false, false];
  state.sourceLabel = draft.sourceLabel || EMPTY_SOURCE_LABEL;
  state.claims = Array.isArray(draft.claims) && draft.claims.length ? draft.claims : [makeEmptyClaim()];
  state.checks = { ...Object.fromEntries(CHECKS.map((check) => [check.id, false])), ...(draft.checks || {}) };
  state.reviews = {
    supportive: draft.reviews?.supportive || '',
    cold: draft.reviews?.cold || '',
    harsh: draft.reviews?.harsh || '',
  };
  state.activeReview = REVIEW_MODES.includes(draft.activeReview) ? draft.activeReview : 'supportive';
  state.controls = Array.isArray(draft.controls) && draft.controls.length ? draft.controls : [makeEmptyControl()];
  state.savedAt = draft.savedAt || '';
  state.saveError = '';

  idCursor = Math.max(
    idCursor,
    ...state.claims.map((claim) => Number(claim.id) || 0),
    ...state.controls.map((control) => Number(control.id) || 0),
  );

  if (titleField) titleField.value = draft.fields?.title || '';
  if (objectField) objectField.value = draft.fields?.object || '';
  if (domainField) domainField.value = draft.fields?.domain || '';
  if (pressureField) pressureField.value = draft.fields?.pressure || '';
  if (bodyField) bodyField.value = draft.fields?.body || '';
  if (contradictionNotesField) contradictionNotesField.value = draft.fields?.contradictionNotes || '';

  renderClaims();
  renderClaimSummary();
  renderChecks();
  renderControls();
  renderReviews();
  updateCharCounts();
  state.step = Math.min(state.step, getMaxReachableStep());
  updateLedger();
  if (state.step === 5) {
    renderExport();
  }
};

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }

    const draft = JSON.parse(raw);
    applyDraft(draft);
    showToast('Restored saved local draft');
    return true;
  } catch {
    return false;
  }
};

const clearLocalDraft = () => {
  try {
    clearTimeout(state.saveTimer);
    state.saveTimer = null;
    localStorage.removeItem(STORAGE_KEY);
    state.savedAt = '';
    state.saveError = '';
    updateLedger();
    showToast('Local draft cleared');
  } catch {
    showToast('Could not clear local draft', 'warn');
  }
};

const downloadSnapshot = () => {
  const blob = new Blob([JSON.stringify(collectDraft(), null, 2)], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `scripto-snapshot-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Snapshot downloaded');
};

const resetSession = () => {
  state.step = 0;
  state.stepsDone = [false, false, false, false, false, false];
  state.sourceLabel = EMPTY_SOURCE_LABEL;
  state.claims = [makeEmptyClaim()];
  state.checks = Object.fromEntries(CHECKS.map((check) => [check.id, false]));
  state.reviews = { supportive: '', cold: '', harsh: '' };
  state.activeReview = 'supportive';
  state.controls = [makeEmptyControl()];
  state.savedAt = '';
  state.saveError = '';
  clearTimeout(state.saveTimer);
  state.saveTimer = null;

  if (titleField) titleField.value = '';
  if (fileField) fileField.value = '';
  if (objectField) objectField.value = '';
  if (domainField) domainField.value = '';
  if (pressureField) pressureField.value = '';
  if (bodyField) bodyField.value = '';
  if (contradictionNotesField) contradictionNotesField.value = '';
  if (fileStatus) {
    fileStatus.innerHTML =
      'No file loaded yet. Upload <code>.txt</code>, <code>.md</code>, or <code>.docx</code>. Older <code>.doc</code> files should be resaved as <code>.docx</code> first.';
  }

  renderClaims();
  renderClaimSummary();
  renderChecks();
  renderControls();
  renderReviews();
  updateCharCounts();
  updateLedger();
  exportPreview.value = '';
  exportStatus.textContent = getStepBlockMessage(5) || 'Ready for bounded export';
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
  showToast('Session reset');
};

const seedClaimsFromManuscript = () => {
  const sentences = splitSentences(bodyField?.value || '');
  if (!sentences.length) {
    showToast('Add manuscript text first', 'warn');
    return;
  }

  const existing = new Set(state.claims.map((claim) => compact(claim.text).toLowerCase()).filter(Boolean));
  const candidates = sentences
    .filter((sentence) => sentence.length >= 45)
    .filter((sentence) => CLAIM_PATTERN.test(sentence) || OVERCLAIM_PATTERNS.some((pattern) => pattern.test(sentence)))
    .slice(0, 10);

  const seeded = [];
  for (const sentence of candidates) {
    const key = compact(sentence).toLowerCase();
    if (!key || existing.has(key)) {
      continue;
    }
    const cls = classifySeededClaim(sentence);
    seeded.push({
      id: nextId(),
      text: sentence,
      cls,
      note: buildAnchorNote(sentence, cls),
    });
    existing.add(key);
    if (seeded.length === 5) {
      break;
    }
  }

  if (!seeded.length) {
    showToast('No new claim candidates found in the manuscript', 'warn');
    return;
  }

  const keepClaims = state.claims.filter((claim) => compact(claim.text) || compact(claim.note));
  state.claims = [...keepClaims, ...seeded];
  renderClaims();
  renderClaimSummary();
  updateLedger();
  if (state.step === 5) {
    renderExport();
  }
  scheduleSave();
  showToast(`Seeded ${seeded.length} claim candidate${seeded.length === 1 ? '' : 's'}`);
};

const extractDocxParagraphs = (xmlText) => {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const paragraphs = Array.from(doc.getElementsByTagName('*')).filter((node) => node.localName === 'p');

  return paragraphs
    .map((paragraph) => {
      const pieces = [];
      Array.from(paragraph.getElementsByTagName('*')).forEach((node) => {
        if (node.localName === 't') {
          pieces.push(node.textContent || '');
        } else if (node.localName === 'tab') {
          pieces.push('\t');
        } else if (node.localName === 'br' || node.localName === 'cr') {
          pieces.push('\n');
        }
      });
      return pieces.join('').replace(/\n{2,}/g, '\n').trim();
    })
    .filter(Boolean);
};

const parseDocxFile = async (file) => {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')?.async('string');
  if (!documentXml) {
    throw new Error('The .docx file did not contain a readable document body.');
  }

  const parts = [extractDocxParagraphs(documentXml).join('\n\n')];
  for (const extraPath of ['word/footnotes.xml', 'word/endnotes.xml']) {
    const extraXml = await zip.file(extraPath)?.async('string');
    if (extraXml) {
      const extraParagraphs = extractDocxParagraphs(extraXml);
      if (extraParagraphs.length) {
        parts.push(extraParagraphs.join('\n\n'));
      }
    }
  }

  return parts.filter(Boolean).join('\n\n');
};

const handleFileChange = async () => {
  const file = fileField?.files?.[0];
  if (!file) {
    return;
  }

  if (fileStatus) {
    fileStatus.textContent = `Loading ${file.name}...`;
  }

  try {
    let text = '';
    const name = file.name.toLowerCase();

    if (name.endsWith('.doc')) {
      throw new Error('Older .doc files are not parsed directly here yet. Please resave the file as .docx and upload again.');
    }

    if (name.endsWith('.docx')) {
      text = await parseDocxFile(file);
    } else {
      text = await file.text();
    }

    if (bodyField) {
      bodyField.value = text;
    }
    if (titleField && !getSetupValue(titleField)) {
      titleField.value = file.name.replace(/\.[^.]+$/, '');
    }

    state.sourceLabel = file.name;

    if (fileStatus) {
      fileStatus.textContent = `Loaded ${file.name}. Detected approximately ${countWords(text).toLocaleString()} words locally in the browser.`;
    }

    updateCharCounts();
    updateLedger();
    if (state.step === 5) {
      renderExport();
    }
    scheduleSave();
  } catch (error) {
    if (fileStatus) {
      fileStatus.textContent = error instanceof Error ? error.message : 'File load failed.';
    }
    showToast('File load failed', 'warn');
  }
};

const goStep = (step, { warnOnBlocked = false } = {}) => {
  const maxReachableStep = getMaxReachableStep();
  if (step > state.step && step > maxReachableStep) {
    if (warnOnBlocked) {
      showToast(getStepBlockMessage(step), 'warn');
    }
    return false;
  }

  state.step = step;
  updateStepPanels();
  if (step === 5) {
    renderExport();
  }
  return true;
};

const advanceStep = (from) => {
  const targetStep = Math.min(from + 1, 5);
  const blockMessage = getStepBlockMessage(targetStep);

  if (blockMessage) {
    showToast(blockMessage, 'warn');
    return;
  }

  if (from < 5) {
    goStep(targetStep);
  }

  if (targetStep === 5) {
    renderExport();
  }

  scheduleSave();
};

const attachGlobalListeners = () => {
  document.querySelectorAll('[data-step-button]').forEach((button) => {
    button.addEventListener('click', () => {
      goStep(Number(button.getAttribute('data-step-button')), { warnOnBlocked: true });
    });
  });

  document.querySelectorAll('[data-advance-button]').forEach((button) => {
    button.addEventListener('click', () => {
      advanceStep(Number(button.getAttribute('data-advance-button')));
    });
  });

  document.querySelectorAll('[data-review-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.activeReview = tab.getAttribute('data-review-tab');
      renderReviews();
    });
  });

  document.querySelectorAll('[data-run-review]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-run-review');
      if (mode) {
        runReview(mode);
      }
    });
  });

  titleField?.addEventListener('input', () => {
    updateCharCounts();
    updateLedger();
    if (state.step === 5) {
      renderExport();
    }
    scheduleSave();
  });

  [objectField, domainField, pressureField].forEach((field) => {
    field?.addEventListener('input', () => {
      updateCharCounts();
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
    field?.addEventListener('change', () => {
      updateCharCounts();
      updateLedger();
      if (state.step === 5) {
        renderExport();
      }
      scheduleSave();
    });
  });

  bodyField?.addEventListener('input', () => {
    if (state.sourceLabel === EMPTY_SOURCE_LABEL) {
      state.sourceLabel = 'Pasted manuscript';
    }
    updateCharCounts();
    updateLedger();
    if (state.step === 5) {
      renderExport();
    }
    scheduleSave();
  });

  contradictionNotesField?.addEventListener('input', () => {
    if (state.step === 5) {
      renderExport();
    }
    scheduleSave();
  });

  fileField?.addEventListener('change', handleFileChange);
  document.getElementById('seed-claims-primary')?.addEventListener('click', seedClaimsFromManuscript);
  document.getElementById('seed-claims-secondary')?.addEventListener('click', seedClaimsFromManuscript);
  document.getElementById('add-claim-button')?.addEventListener('click', () => {
    state.claims.push(makeEmptyClaim());
    renderClaims();
    renderClaimSummary();
    updateLedger();
    scheduleSave();
  });
  document.getElementById('add-control-button')?.addEventListener('click', () => {
    state.controls.push(makeEmptyControl());
    renderControls();
    updateLedger();
    scheduleSave();
  });
  document.getElementById('run-all-reviews-button')?.addEventListener('click', runAllReviews);
  document.getElementById('download-packet-button')?.addEventListener('click', downloadPacket);
  document.getElementById('copy-packet-button')?.addEventListener('click', copyPacket);
  document.getElementById('download-snapshot-button')?.addEventListener('click', downloadSnapshot);
  document.getElementById('clear-draft-button')?.addEventListener('click', clearLocalDraft);
  document.getElementById('reset-session-button')?.addEventListener('click', resetSession);

  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key === 'ArrowRight' && state.step < 5) {
      advanceStep(state.step);
    }
    if (event.altKey && event.key === 'ArrowLeft' && state.step > 0) {
      goStep(state.step - 1);
    }
  });
};

const init = () => {
  state.claims = [makeEmptyClaim()];
  state.controls = [makeEmptyControl()];
  renderClaims();
  renderClaimSummary();
  renderChecks();
  renderControls();
  renderReviews();
  updateCharCounts();
  updateLedger();
  attachGlobalListeners();
  const restored = loadDraft();
  if (!restored) {
    scheduleSave();
  }
};

init();
