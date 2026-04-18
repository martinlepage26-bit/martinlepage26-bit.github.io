import { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  NARRATIVE_GUIDE,
  createNarrativeSeed,
  deriveNarrativeVectors,
  evaluateNarrativeDraft,
  getRcaTemplate,
} from './narrativeGuide.js';

const LOTUS_DIMS = [
  {
    key: 'P',
    label: 'Perceptual Latitude',
    desc: 'Range of reality the person can still perceive without defensive narrowing.',
  },
  {
    key: 'R',
    label: 'Regulatory Bandwidth',
    desc: 'How much load can be metabolized without losing steering capacity.',
  },
  {
    key: 'A',
    label: 'Access',
    desc: 'What resources, pathways, and supports can actually be reached or used.',
  },
  {
    key: 'S',
    label: 'Social Legibility',
    desc: 'Whether the person can be recognized well enough to gain traction in systems.',
  },
  {
    key: 'C',
    label: 'Coherence',
    desc: 'How integrated the system is and whether interpretation stays revisable under load.',
  },
  {
    key: 'Sh',
    label: 'Shadow Remainder',
    desc: 'Unresolved, unintegrated pressure distorting the other dimensions.',
  },
];

const CONSTRAINT_DIMS = [
  { key: 'body', label: 'Body', desc: 'Physical health, pain, disability, sleep, sensory load.' },
  { key: 'time', label: 'Time', desc: 'Temporal pressure, urgency, lack of space to reflect.' },
  { key: 'economic', label: 'Economic', desc: 'Financial precarity, housing instability, material scarcity.' },
  { key: 'relational', label: 'Relational', desc: 'Conflict, loss, absence, or coercion in close bonds.' },
  { key: 'institutional', label: 'Institutional', desc: 'Legal, bureaucratic, or systemic barriers.' },
  { key: 'stigma', label: 'Stigma', desc: 'Social devaluation, labeling, discrimination.' },
  { key: 'isolation', label: 'Isolation', desc: 'Severance from supportive contact or community.' },
  { key: 'urgency', label: 'Urgency', desc: 'Crisis pressure collapsing planning horizon.' },
];

const SCAFFOLD_DIMS = [
  { key: 'relational', label: 'Relational', desc: 'Trusted others, attachment figures, peer support.' },
  { key: 'material', label: 'Material', desc: 'Housing, income, food, transport, devices.' },
  { key: 'clinical', label: 'Clinical', desc: 'Medical, therapeutic, psychiatric care access.' },
  { key: 'cultural', label: 'Cultural', desc: 'Belonging, identity affirmation, cultural continuity.' },
  { key: 'spiritual', label: 'Spiritual', desc: 'Meaning systems, practices, community of purpose.' },
  {
    key: 'organizational',
    label: 'Organizational',
    desc: 'Advocacy, unions, services, legal aid, navigation help.',
  },
  {
    key: 'interpretive',
    label: 'Interpretive',
    desc: 'Frameworks, language, insight that help make sense of the situation.',
  },
];

const AGENCY_DIMS = [
  { key: 'senseReality', label: 'Sense Reality', weight: 0.15 },
  { key: 'choosePressure', label: 'Choose Under Pressure', weight: 0.2 },
  { key: 'act', label: 'Act', weight: 0.2 },
  { key: 'protect', label: 'Protect', weight: 0.15 },
  { key: 'adapt', label: 'Adapt', weight: 0.15 },
  { key: 'coordinate', label: 'Coordinate', weight: 0.15 },
];

const APP_TABS = [
  { key: 'assessment', label: 'Assessment' },
  { key: 'lotus', label: 'LOTUS' },
  { key: 'constraints', label: 'Constraints' },
  { key: 'scaffolds', label: 'Scaffolds' },
  { key: 'results', label: 'Results' },
];

const PALETTE = {
  appBg: 'linear-gradient(180deg, rgba(255, 252, 254, 0.98) 0%, rgba(255, 245, 250, 0.98) 100%)',
  shell: 'rgba(255, 250, 252, 0.94)',
  shellStrong: 'rgba(255, 245, 249, 0.96)',
  panel: 'rgba(255, 250, 252, 0.88)',
  panelSoft: 'rgba(252, 239, 246, 0.9)',
  panelRose: 'rgba(247, 226, 237, 0.9)',
  border: 'rgba(214, 182, 199, 0.7)',
  borderStrong: 'rgba(204, 146, 177, 0.72)',
  ink: '#5a475f',
  inkSoft: '#857289',
  inkFaint: '#ac97a7',
  accent: '#d9709c',
  accentStrong: '#c75b89',
  accentInk: '#fff7fb',
  track: '#ead9e4',
  chartBase: '#e6d0de',
  scrollTrack: '#fbf0f6',
  scrollThumb: '#dbb7ca',
  success: '#69b78d',
  warning: '#d9a34f',
  danger: '#da7487',
};

const initScores = (dims) => Object.fromEntries(dims.map((dim) => [dim.key, 5]));

const phi = (x, threshold, steepness = 0.8) => {
  if (x <= threshold) {
    return x * 0.05;
  }

  return 0.05 * threshold + steepness * (x - threshold);
};

function computeLOTUS(lotus, constraints, scaffolds) {
  const avgConstraints =
    Object.values(constraints).reduce((sum, value) => sum + value, 0) / CONSTRAINT_DIMS.length;
  const avgScaffolds =
    Object.values(scaffolds).reduce((sum, value) => sum + value, 0) / SCAFFOLD_DIMS.length;

  const effectiveLotus = {};
  LOTUS_DIMS.forEach((dim) => {
    const raw =
      dim.key === 'Sh'
        ? lotus[dim.key]
        : Math.max(0, Math.min(10, lotus[dim.key] - avgConstraints * 0.3 + avgScaffolds * 0.3));
    effectiveLotus[dim.key] = dim.key === 'Sh' ? lotus[dim.key] : raw;
  });

  const P = effectiveLotus.P;
  const R = effectiveLotus.R;
  const A = effectiveLotus.A;
  const S = effectiveLotus.S;
  const C = effectiveLotus.C;
  const Sh = effectiveLotus.Sh;
  const shadowPenalty = Sh / 10;

  const agency = {
    senseReality: Math.max(0, (P + C) / 2 - shadowPenalty * 2),
    choosePressure: Math.max(0, (R + S) / 2 - shadowPenalty * 1.5),
    act: Math.max(0, (A + R) / 2 - shadowPenalty),
    protect: Math.max(0, (S + C) / 2 - shadowPenalty * 1.5),
    adapt: Math.max(0, (P + A) / 2 - shadowPenalty),
    coordinate: Math.max(0, (S + C + A) / 3 - shadowPenalty),
  };

  const finalRaw = AGENCY_DIMS.reduce((sum, dim) => sum + dim.weight * agency[dim.key], 0);

  const isolationPenalty = phi(constraints.isolation, 4);
  const urgencyPenalty = phi(constraints.urgency, 4);
  const bodyPenalty = phi(constraints.body, 5);
  const combinedPenalty = constraints.isolation > 6 && constraints.urgency > 6 ? 0.5 : 0;

  const aFinal = Math.max(
    0,
    Math.min(10, finalRaw - isolationPenalty - urgencyPenalty - bodyPenalty - combinedPenalty),
  );

  const suppressed = LOTUS_DIMS.filter((dim) => dim.key !== 'Sh')
    .map((dim) => ({ label: dim.label, val: effectiveLotus[dim.key] }))
    .sort((left, right) => left.val - right.val)
    .slice(0, 2);

  const topScaffolds = SCAFFOLD_DIMS.map((dim) => ({ label: dim.label, val: scaffolds[dim.key] }))
    .sort((left, right) => right.val - left.val)
    .slice(0, 3);

  const topConstraints = CONSTRAINT_DIMS.map((dim) => ({ label: dim.label, val: constraints[dim.key] }))
    .sort((left, right) => right.val - left.val)
    .slice(0, 3);

  return { effectiveLotus, agency, aFinal, suppressed, topScaffolds, topConstraints };
}

function formatList(items) {
  if (!items.length) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function buildInterpretiveRead({
  aFinal,
  suppressed,
  topConstraints,
  topScaffolds,
  topPressureSignals,
  topSupportSignals,
  wordCount,
  answeredCount,
  averageDraftQuality,
  averageArtifactCoverage,
  strongAnswerCount,
}) {
  const suppressedLabels = suppressed.map((item) => item.label);
  const constraintLabels = topConstraints.filter((item) => item.val >= 5).map((item) => item.label);
  const scaffoldLabels = topScaffolds.filter((item) => item.val >= 5).map((item) => item.label);
  const pressureSignals = topPressureSignals.map((signal) => signal.label.toLowerCase());
  const supportSignals = topSupportSignals.map((signal) => signal.label.toLowerCase());
  const unique = (items) => [...new Set(items.filter(Boolean))];

  let summary =
    'Your narrative describes agency as present but uneven, with some functions carrying much more strain than others.';

  if (aFinal >= 7) {
    summary =
      'Your narrative describes agency that remains substantially operative: the system still has usable room to perceive, choose, and act even under pressure.';
  } else if (aFinal < 4) {
    summary =
      'Your narrative describes agency being materially compressed by conditions. The issue looks less like a lack of will and more like a narrowing of usable room to move.';
  }

  let compression =
    'The main pattern is uneven compression rather than total collapse, so the important question is which functions are being pinched first.';

  if (suppressedLabels.includes('Perceptual Latitude') || suppressedLabels.includes('Coherence')) {
    compression =
      'The strongest compression appears interpretive: it may be harder to keep reality wide enough and coherent enough to steer without collapsing into a narrower story.';
  } else if (suppressedLabels.includes('Access') || suppressedLabels.includes('Social Legibility')) {
    compression =
      'The strongest compression appears translational: the bottleneck is less about having no intentions at all and more about getting traction through systems, pathways, or other people.';
  } else if (suppressedLabels.includes('Regulatory Bandwidth')) {
    compression =
      'The strongest compression appears regulatory: load may be rising faster than your ability to metabolize it while still making decisions under pressure.';
  }

  const pressure =
    pressureSignals.length || constraintLabels.length
      ? `The heaviest recurring pressure signals in your writing were ${formatList(
          unique([
            ...pressureSignals.slice(0, 2),
            ...constraintLabels.slice(0, 2).map((label) => label.toLowerCase()),
          ]).slice(0, 3),
        )}. Those pressures are likely doing more explanatory work than trait-based accounts of agency.`
      : 'No single pressure family dominates the profile yet, so the issue may be distributed across smaller pressures rather than one overwhelming driver.';

  const leverage =
    scaffoldLabels.length || supportSignals.length
      ? `The most promising restoring supports look like ${formatList(
          unique([
            ...supportSignals.slice(0, 2),
            ...scaffoldLabels.slice(0, 2).map((label) => label.toLowerCase()),
          ]).slice(0, 3),
        )}. Those are likely the quickest places to widen room to move again.`
      : 'The support pattern still looks thin or underdescribed, which suggests restoration may require building support before expecting much more individual output.';

  const coverage = `This read was built from ${answeredCount} answered prompts and about ${wordCount} narrative words. Average draft strength is ${Math.round(
    averageDraftQuality * 100,
  )}% and artifact completion is ${Math.round(averageArtifactCoverage * 100)}%, with ${strongAnswerCount} prompts currently carrying strong narrative evidence.`;

  return { summary, compression, pressure, leverage, coverage };
}

function Slider({ label, desc, value, onChange, inverted = false }) {
  const percent = (value / 10) * 100;
  const color = inverted ? `hsl(${(10 - value) * 10}, 62%, 64%)` : `hsl(${value * 11}, 62%, 60%)`;

  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '1rem',
          marginBottom: '0.3rem',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.82rem',
            color: PALETTE.ink,
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '1.05rem',
            color,
            fontWeight: 700,
            minWidth: '2rem',
            textAlign: 'right',
          }}
        >
          {value}
        </span>
      </div>
      {desc ? (
        <p style={{ fontSize: '0.72rem', color: PALETTE.inkSoft, margin: '0 0 0.4rem', lineHeight: 1.4 }}>{desc}</p>
      ) : null}
      <div style={{ position: 'relative', height: '4px', background: PALETTE.track, borderRadius: '999px' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${percent}%`,
            background: color,
            borderRadius: '2px',
            transition: 'width 0.15s',
          }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          width: '100%',
          cursor: 'pointer',
          opacity: 0,
          position: 'relative',
          top: '-4px',
          margin: 0,
          height: '16px',
        }}
      />
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: PALETTE.panel,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: '18px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 22px 54px rgba(184, 143, 166, 0.12)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div style={{ marginBottom: '1.2rem' }}>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.25rem',
            color: PALETTE.ink,
            margin: 0,
            fontWeight: 600,
          }}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            style={{
              fontSize: '0.75rem',
              color: PALETTE.inkFaint,
              margin: '0.3rem 0 0',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.5rem 1.1rem',
        background: active ? PALETTE.accent : 'rgba(255, 255, 255, 0.52)',
        color: active ? PALETTE.accentInk : PALETTE.inkSoft,
        border: `1px solid ${active ? PALETTE.accent : PALETTE.border}`,
        borderRadius: '999px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontWeight: active ? 700 : 400,
        letterSpacing: '0.04em',
        transition: 'all 0.15s',
        boxShadow: active ? '0 12px 26px rgba(217, 112, 156, 0.22)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

function ScoreMeter({ value, label, size = 60 }) {
  const percent = value / 10;
  const hue = percent * 120;
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * percent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={PALETTE.track} strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`hsl(${hue}, 70%, 55%)`}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fill={`hsl(${hue}, 70%, 55%)`}
          fontFamily="'JetBrains Mono', monospace"
          fontSize="13"
          fontWeight="700"
        >
          {value.toFixed(1)}
        </text>
      </svg>
      <span
        style={{
          fontSize: '0.65rem',
          color: PALETTE.inkSoft,
          textAlign: 'center',
          maxWidth: size + 20,
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SignalChip({ label, hits, questions, tone }) {
  const toneColor =
    tone === 'pressure' ? PALETTE.danger : tone === 'support' ? PALETTE.success : PALETTE.warning;
  const hitLabel = Number.isInteger(hits) ? `${hits}` : hits.toFixed(1).replace(/\.0$/, '');

  return (
    <div
      style={{
        padding: '0.75rem 0.85rem',
        borderRadius: '10px',
        border: `1px solid ${toneColor}33`,
        background: PALETTE.panelSoft,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.35rem',
          alignItems: 'baseline',
        }}
      >
        <span style={{ color: PALETTE.ink, fontSize: '0.8rem' }}>{label}</span>
        <span style={{ color: toneColor, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}>
          {hitLabel}
        </span>
      </div>
      {questions.length ? (
        <p style={{ color: PALETTE.inkSoft, margin: 0, fontSize: '0.7rem', lineHeight: 1.5 }}>
          Seen in: {questions.join(', ')}
        </p>
      ) : null}
    </div>
  );
}

function NarrativePrompt({ question, value, onChange }) {
  const [showRca, setShowRca] = useState(false);
  const feedback = evaluateNarrativeDraft(question, value);
  const toneColor = {
    neutral: PALETTE.inkSoft,
    warning: PALETTE.danger,
    partial: PALETTE.warning,
    good: PALETTE.success,
  };

  const insertRcaTemplate = () => {
    const template = getRcaTemplate(question);
    const nextValue = value.trim().length ? `${value.trim()}\n\n${template}` : template;
    onChange(nextValue);
  };

  return (
    <div
      style={{
        padding: '1.1rem 0',
        borderTop: `1px solid ${PALETTE.border}`,
      }}
    >
      <div style={{ marginBottom: '0.8rem' }}>
        <h4
          style={{
            margin: 0,
            color: PALETTE.ink,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.05rem',
            fontWeight: 600,
          }}
        >
          {question.title}
        </h4>
        <p style={{ margin: '0.45rem 0 0', color: PALETTE.ink, fontSize: '0.93rem', lineHeight: 1.75 }}>
          {question.prompt}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            padding: '0.35rem 0.55rem',
            borderRadius: '999px',
            background: PALETTE.panelSoft,
            border: `1px solid ${PALETTE.border}`,
            color: PALETTE.accentStrong,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
          }}
        >
          Aim for {feedback.target.min}-{feedback.target.max} words
        </span>
        <span
          style={{
            padding: '0.35rem 0.55rem',
            borderRadius: '999px',
            background: PALETTE.panelSoft,
            border: `1px solid ${toneColor[feedback.lengthTone]}33`,
            color: toneColor[feedback.lengthTone],
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
          }}
        >
          {feedback.words} words
        </span>
        {question.rca ? (
          <button
            type="button"
            onClick={() => setShowRca((prev) => !prev)}
            style={{
              padding: '0.35rem 0.55rem',
              borderRadius: '999px',
              background: showRca ? PALETTE.panelRose : PALETTE.panelSoft,
              border: `1px solid ${showRca ? PALETTE.borderStrong : PALETTE.border}`,
              color: showRca ? PALETTE.accentStrong : PALETTE.inkSoft,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              cursor: 'pointer',
            }}
          >
            {showRca ? 'Hide RCA' : 'Deepen with RCA'}
          </button>
        ) : null}
      </div>

      <div
        style={{
          padding: '0.75rem 0.9rem',
          borderRadius: '14px',
          background: PALETTE.panelSoft,
          border: `1px solid ${PALETTE.border}`,
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
            color: PALETTE.accentStrong,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.45rem',
          }}
        >
          Keep writing into these angles
        </div>
        <ul style={{ margin: 0, paddingLeft: '1rem', color: PALETTE.inkSoft, fontSize: '0.78rem', lineHeight: 1.65 }}>
          {question.probes.map((probe) => (
            <li key={probe}>{probe}</li>
          ))}
        </ul>
      </div>

      <div
        style={{
          padding: '0.75rem 0.9rem',
          borderRadius: '14px',
          background: PALETTE.panelSoft,
          border: `1px solid ${PALETTE.border}`,
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
            color: PALETTE.accentStrong,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.55rem',
          }}
        >
          Artifacts to include
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {feedback.artifacts.map((artifact) => (
            <span
              key={artifact.key}
              style={{
                padding: '0.35rem 0.55rem',
                borderRadius: '999px',
                background: artifact.met ? 'rgba(105, 183, 141, 0.12)' : PALETTE.panelRose,
                border: `1px solid ${artifact.met ? PALETTE.success : PALETTE.border}`,
                color: artifact.met ? PALETTE.success : PALETTE.inkSoft,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
              }}
            >
              {artifact.met ? 'Yes' : 'Add'}: {artifact.label}
            </span>
          ))}
        </div>
      </div>

      {showRca ? (
        <div
          style={{
            padding: '0.75rem 0.9rem',
            borderRadius: '14px',
            background: PALETTE.panelSoft,
            border: `1px solid ${PALETTE.border}`,
            marginBottom: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.75rem',
              alignItems: 'center',
              marginBottom: '0.55rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                color: PALETTE.accentStrong,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              RCA Deepener
            </div>
            <button
              type="button"
              onClick={insertRcaTemplate}
              style={{
                background: 'transparent',
                color: PALETTE.ink,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: '999px',
                padding: '0.35rem 0.6rem',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                cursor: 'pointer',
              }}
            >
              Insert RCA scaffold
            </button>
          </div>
          <p style={{ margin: '0 0 0.5rem', color: PALETTE.inkSoft, fontSize: '0.78rem', lineHeight: 1.6 }}>
            Use this only if the story still feels foggy. RCA is for rupture, exclusion, relapse, isolation, and acute pressure, not for every answer.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1rem', color: PALETTE.ink, fontSize: '0.78rem', lineHeight: 1.65 }}>
            {[
              'What happened?',
              'What triggered it?',
              'What did you tell yourself it meant?',
              'What did you do next?',
              'What did it cost?',
              'What support was missing?',
              'What still repeats now?',
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write in scenes, specifics, repetitions, costs, gains, people, and turning points. The parser works better with concrete detail than with summary labels."
        rows={7}
        style={{
          width: '100%',
          resize: 'vertical',
          minHeight: '9rem',
          borderRadius: '12px',
          border: `1px solid ${PALETTE.border}`,
          background: 'rgba(255, 255, 255, 0.78)',
          color: PALETTE.ink,
          padding: '0.95rem 1rem',
          fontFamily: "'Georgia', serif",
          fontSize: '0.94rem',
          lineHeight: 1.7,
          outline: 'none',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
        }}
      />

      <div
        style={{
          display: 'grid',
          gap: '0.35rem',
          marginTop: '0.6rem',
        }}
      >
        <p
          style={{
            margin: 0,
            color: toneColor[feedback.lengthTone],
            fontSize: '0.74rem',
            lineHeight: 1.5,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {feedback.lengthLabel}
        </p>
        <p
          style={{
            margin: 0,
            color: toneColor[feedback.specificityTone],
            fontSize: '0.74rem',
            lineHeight: 1.5,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {feedback.specificityLabel}
        </p>
      </div>

      <p
        style={{
          margin: '0.6rem 0 0',
          color: PALETTE.inkFaint,
          fontSize: '0.72rem',
          lineHeight: 1.5,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {question.hint}
      </p>
    </div>
  );
}

export default function LotusAgencyApp() {
  const [tab, setTab] = useState('assessment');
  const [lotus, setLotus] = useState(initScores(LOTUS_DIMS));
  const [constraints, setConstraints] = useState(initScores(CONSTRAINT_DIMS));
  const [scaffolds, setScaffolds] = useState(initScores(SCAFFOLD_DIMS));
  const [narrativeAnswers, setNarrativeAnswers] = useState(createNarrativeSeed);
  const [assessmentApplied, setAssessmentApplied] = useState(false);

  const narrativePreview = deriveNarrativeVectors(narrativeAnswers);
  const {
    answeredCount,
    totalQuestions,
    completionPercent,
    wordCount,
    coverageFactor,
    averageDraftQuality,
    averageArtifactCoverage,
    strongAnswerCount,
    topPressureSignals,
    topSupportSignals,
    topResourceSignals,
  } = narrativePreview;

  const results = computeLOTUS(lotus, constraints, scaffolds);
  const { effectiveLotus, agency, aFinal, suppressed, topScaffolds, topConstraints } = results;
  const interpretiveRead = buildInterpretiveRead({
    aFinal,
    suppressed,
    topConstraints,
    topScaffolds,
    topPressureSignals,
    topSupportSignals,
    wordCount,
    answeredCount,
    averageDraftQuality,
    averageArtifactCoverage,
    strongAnswerCount,
  });

  const radarData = AGENCY_DIMS.map((dim) => ({
    subject: dim.label,
    value: agency[dim.key],
    fullMark: 10,
  }));

  const effectiveLotusData = LOTUS_DIMS.map((dim) => ({
    name: dim.key,
    base: lotus[dim.key],
    eff: Number(effectiveLotus[dim.key].toFixed(2)),
  }));

  const agencyColor = aFinal >= 7 ? PALETTE.success : aFinal >= 4 ? PALETTE.warning : PALETTE.danger;

  const updateNarrativeAnswer = (id, value) => {
    setNarrativeAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const applyAssessment = (nextTab = 'results') => {
    const derived = deriveNarrativeVectors(narrativeAnswers);
    setLotus(derived.lotus);
    setConstraints(derived.constraints);
    setScaffolds(derived.scaffolds);
    setAssessmentApplied(true);
    setTab(nextTab);
  };

  const resetAssessment = () => {
    setNarrativeAnswers(createNarrativeSeed());
    setLotus(initScores(LOTUS_DIMS));
    setConstraints(initScores(CONSTRAINT_DIMS));
    setScaffolds(initScores(SCAFFOLD_DIMS));
    setAssessmentApplied(false);
    setTab('assessment');
  };

  return (
    <div
      className="lotus-agency-app"
      style={{
        width: '100%',
        background: PALETTE.appBg,
        color: PALETTE.ink,
        fontFamily: "'Georgia', serif",
        border: `1px solid ${PALETTE.border}`,
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 32px 90px rgba(193, 153, 177, 0.2)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <style>{`
        .lotus-agency-app input[type=range] { -webkit-appearance: none; background: transparent; }
        .lotus-agency-app input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${PALETTE.accent}; cursor: pointer; margin-top: -5px; box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7); }
        .lotus-agency-app input[type=range]::-webkit-slider-runnable-track { height: 4px; background: transparent; }
        .lotus-agency-app * { box-sizing: border-box; }
        .lotus-agency-app textarea::placeholder { color: ${PALETTE.inkFaint}; }
        .lotus-agency-app ::-webkit-scrollbar { width: 4px; }
        .lotus-agency-app ::-webkit-scrollbar-track { background: ${PALETTE.scrollTrack}; }
        .lotus-agency-app ::-webkit-scrollbar-thumb { background: ${PALETTE.scrollThumb}; border-radius: 999px; }
      `}</style>

      <div
        style={{
          background: 'linear-gradient(180deg, rgba(255, 248, 251, 0.98) 0%, rgba(249, 233, 242, 0.92) 100%)',
          borderBottom: `1px solid ${PALETTE.border}`,
          padding: '1.5rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'baseline',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '2rem',
                color: PALETTE.accentStrong,
                margin: 0,
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              LOTUS
            </h1>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                color: PALETTE.inkFaint,
                margin: '0.15rem 0 0',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Agency &amp; Social Positioning Analyzer
            </p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {APP_TABS.map((tabItem) => (
              <Tab
                key={tabItem.key}
                label={tabItem.label}
                active={tab === tabItem.key}
                onClick={() => setTab(tabItem.key)}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {tab === 'assessment' ? (
          <div>
            <SectionCard
              title="Narrative Interview Guide"
              subtitle="Use long-form writing to surface subjectivity, then translate the narrative into provisional LOTUS scores"
            >
              <p style={{ lineHeight: 1.8, fontSize: '0.94rem', color: PALETTE.ink }}>
                This intake is built from the LOTUS-MiroFish individual data structure: formative events, constraint
                pressures, isolation patterns, meaning systems, and corrective supports. Write concretely. The parser
                looks for repeated signals in your story and turns them into a draft profile you can still revise by
                hand.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '0.9rem',
                  marginTop: '1.25rem',
                }}
              >
                {NARRATIVE_GUIDE.map((section) => {
                  const answeredInSection = section.questions.filter(
                    (question) => (narrativeAnswers[question.id] ?? '').trim().length > 0,
                  ).length;

                  return (
                    <div
                      key={section.key}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: '14px',
                        border: `1px solid ${PALETTE.border}`,
                        background: PALETTE.panelSoft,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.68rem',
                          color: PALETTE.accentStrong,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          marginBottom: '0.45rem',
                        }}
                      >
                        {section.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: PALETTE.inkSoft, marginBottom: '0.55rem', lineHeight: 1.5 }}>
                        {section.subtitle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: PALETTE.ink }}>
                        {answeredInSection} / {section.questions.length} written
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1.2rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '0.5rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    color: PALETTE.inkSoft,
                  }}
                >
                  <span>
                    {answeredCount} / {totalQuestions} prompts answered • {wordCount} words
                  </span>
                  <span>{completionPercent}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: PALETTE.track }}>
                  <div
                    style={{
                      width: `${completionPercent}%`,
                      height: '100%',
                      borderRadius: '999px',
                      background: PALETTE.accent,
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            {NARRATIVE_GUIDE.map((section) => (
              <SectionCard key={section.key} title={section.title} subtitle={section.subtitle}>
                {section.questions.map((question) => (
                  <NarrativePrompt
                    key={question.id}
                    question={question}
                    value={narrativeAnswers[question.id] ?? ''}
                    onChange={(value) => updateNarrativeAnswer(question.id, value)}
                  />
                ))}
              </SectionCard>
            ))}

            <SectionCard title="Build the Profile" subtitle="Translate the narrative into LOTUS, constraint, and scaffold vectors">
              <p style={{ fontSize: '0.86rem', color: PALETTE.ink, lineHeight: 1.7 }}>
                The current parser is transparent and local-first. It looks for recurring cues around harm, access,
                recognition, body load, spirituality, interpretive scaffolds, and isolation. It then blends those cues
                into a provisional profile whose confidence rises with narrative coverage.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.8rem',
                  margin: '1.2rem 0 1.4rem',
                }}
              >
                <div
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '14px',
                    border: `1px solid ${PALETTE.border}`,
                    background: PALETTE.panelSoft,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    LOTUS preview
                  </div>
                  <div style={{ fontSize: '0.84rem', color: PALETTE.ink, marginTop: '0.45rem', lineHeight: 1.6 }}>
                    {LOTUS_DIMS.map((dim) => `${dim.key}:${narrativePreview.lotus[dim.key].toFixed(1)}`).join('  |  ')}
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '14px',
                    border: `1px solid ${PALETTE.border}`,
                    background: PALETTE.panelSoft,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Constraint preview
                  </div>
                  <div style={{ fontSize: '0.84rem', color: PALETTE.ink, marginTop: '0.45rem', lineHeight: 1.6 }}>
                    {CONSTRAINT_DIMS.map((dim) => `${dim.key}:${narrativePreview.constraints[dim.key].toFixed(1)}`).join(
                      '  |  ',
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '14px',
                    border: `1px solid ${PALETTE.border}`,
                    background: PALETTE.panelSoft,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Scaffold preview
                  </div>
                  <div style={{ fontSize: '0.84rem', color: PALETTE.ink, marginTop: '0.45rem', lineHeight: 1.6 }}>
                    {SCAFFOLD_DIMS.map((dim) => `${dim.key}:${narrativePreview.scaffolds[dim.key].toFixed(1)}`).join(
                      '  |  ',
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '14px',
                    border: `1px solid ${PALETTE.border}`,
                    background: PALETTE.panelSoft,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Parser trust
                  </div>
                  <div style={{ fontSize: '0.84rem', color: PALETTE.ink, marginTop: '0.45rem', lineHeight: 1.6 }}>
                    {Math.round(coverageFactor * 100)}% weighted trust
                    <br />
                    {Math.round(averageDraftQuality * 100)}% average draft strength
                    <br />
                    {Math.round(averageArtifactCoverage * 100)}% artifact completion
                    <br />
                    {strongAnswerCount} strong prompts • {answeredCount} answered • {wordCount} words
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.9rem',
                  marginBottom: '1.4rem',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.55rem',
                    }}
                  >
                    Pressure signals
                  </div>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {topPressureSignals.length ? (
                      topPressureSignals.map((signal) => (
                        <SignalChip
                          key={signal.key}
                          label={signal.label}
                          hits={signal.hits}
                          questions={signal.questions}
                          tone={signal.tone}
                        />
                      ))
                    ) : (
                      <div style={{ color: PALETTE.inkSoft, fontSize: '0.78rem' }}>
                        Write more concrete detail about what compresses your life to make pressure patterns legible.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.55rem',
                    }}
                  >
                    Restorative signals
                  </div>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {[...topSupportSignals, ...topResourceSignals].slice(0, 4).length ? (
                      [...topSupportSignals, ...topResourceSignals].slice(0, 4).map((signal) => (
                        <SignalChip
                          key={signal.key}
                          label={signal.label}
                          hits={signal.hits}
                          questions={signal.questions}
                          tone={signal.tone}
                        />
                      ))
                    ) : (
                      <div style={{ color: PALETTE.inkSoft, fontSize: '0.78rem' }}>
                        The current writing names much more pressure than restoration. If that is accurate, the profile
                        will score accordingly.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => applyAssessment('results')}
                  style={{
                    background: PALETTE.accent,
                    color: PALETTE.accentInk,
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.75rem 1.4rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    boxShadow: '0 18px 36px rgba(217, 112, 156, 0.22)',
                  }}
                >
                  Build Narrative Profile &amp; View Results →
                </button>
                <button
                  type="button"
                  onClick={() => applyAssessment('lotus')}
                  style={{
                    background: 'transparent',
                    color: PALETTE.ink,
                    border: `1px solid ${PALETTE.border}`,
                    borderRadius: '999px',
                    padding: '0.75rem 1.2rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                  }}
                >
                  Build Narrative Profile &amp; Review Vectors
                </button>
                <button
                  type="button"
                  onClick={resetAssessment}
                  style={{
                    background: 'transparent',
                    color: PALETTE.inkSoft,
                    border: `1px solid ${PALETTE.border}`,
                    borderRadius: '999px',
                    padding: '0.75rem 1.2rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {tab === 'lotus' ? (
          <SectionCard title="Review LOTUS Vector" subtitle="L_base = [P, R, A, S, C, Sh]">
            <p style={{ fontSize: '0.8rem', color: PALETTE.inkFaint, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {assessmentApplied
                ? 'These values were generated from the narrative interview guide. Adjust them if the parser missed context, irony, contradiction, or something too singular to catch locally.'
                : 'Score 0-10. For Shadow Remainder (Sh), a higher score means more unresolved pressure; it is the only inverted dimension.'}
            </p>
            {LOTUS_DIMS.map((dim) => (
              <Slider
                key={dim.key}
                label={`${dim.key} — ${dim.label}`}
                desc={dim.desc}
                value={lotus[dim.key]}
                inverted={dim.key === 'Sh'}
                onChange={(value) => setLotus((prev) => ({ ...prev, [dim.key]: value }))}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setTab('assessment')}
                style={{
                  background: 'transparent',
                  color: PALETTE.inkSoft,
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: '999px',
                  padding: '0.55rem 1.2rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                ← Back to Assessment
              </button>
              <button
                type="button"
                onClick={() => setTab('constraints')}
                style={{
                  background: PALETTE.accent,
                  color: PALETTE.accentInk,
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.55rem 1.4rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Next: Constraints →
              </button>
            </div>
          </SectionCard>
        ) : null}

        {tab === 'constraints' ? (
          <SectionCard
            title="Review Constraint Vector"
            subtitle="K = [body, time, economic, relational, institutional, stigma, isolation, urgency]"
          >
            <p style={{ fontSize: '0.8rem', color: PALETTE.inkFaint, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {assessmentApplied
                ? 'These scores come from the pressures named in the narrative intake. Adjust any value if the writing understated or overstated a constraint family.'
                : 'Score 0-10. Higher means greater constraint pressure. Isolation and urgency trigger nonlinear penalties above threshold 4; combined urgency and isolation above 6 compounds superlinearly.'}
            </p>
            {CONSTRAINT_DIMS.map((dim) => (
              <Slider
                key={dim.key}
                label={dim.label}
                desc={dim.desc}
                value={constraints[dim.key]}
                inverted
                onChange={(value) => setConstraints((prev) => ({ ...prev, [dim.key]: value }))}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setTab('lotus')}
                style={{
                  background: 'transparent',
                  color: PALETTE.inkSoft,
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: '999px',
                  padding: '0.55rem 1.2rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setTab('scaffolds')}
                style={{
                  background: PALETTE.accent,
                  color: PALETTE.accentInk,
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.55rem 1.4rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Next: Scaffolds →
              </button>
            </div>
          </SectionCard>
        ) : null}

        {tab === 'scaffolds' ? (
          <SectionCard
            title="Review Scaffold Vector"
            subtitle="G = [relational, material, clinical, cultural, spiritual, organizational, interpretive]"
          >
            <p style={{ fontSize: '0.8rem', color: PALETTE.inkFaint, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {assessmentApplied
                ? 'These values represent the supports and restoring conditions named in the interview. Raise or lower them if the lived reliability of a support is more complicated than the parser captured.'
                : 'Score 0-10. Higher means stronger scaffold support available. Scaffolds restore effective LOTUS capacity suppressed by constraints.'}
            </p>
            {SCAFFOLD_DIMS.map((dim) => (
              <Slider
                key={dim.key}
                label={dim.label}
                desc={dim.desc}
                value={scaffolds[dim.key]}
                onChange={(value) => setScaffolds((prev) => ({ ...prev, [dim.key]: value }))}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setTab('constraints')}
                style={{
                  background: 'transparent',
                  color: PALETTE.inkSoft,
                  border: `1px solid ${PALETTE.border}`,
                  borderRadius: '999px',
                  padding: '0.55rem 1.2rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setTab('results')}
                style={{
                  background: PALETTE.accent,
                  color: PALETTE.accentInk,
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.55rem 1.4rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Compute Results →
              </button>
            </div>
          </SectionCard>
        ) : null}

        {tab === 'results' ? (
          <div>
            <div
              style={{
                background: PALETTE.shellStrong,
                border: `1px solid ${agencyColor}33`,
                borderRadius: '22px',
                padding: '2rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 24px 56px rgba(187, 144, 171, 0.14)',
              }}
            >
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.7rem',
                  color: PALETTE.inkFaint,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  margin: '0 0 0.8rem',
                }}
              >
                A_final — Effective Agency Score
              </p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <svg width={140} height={140} viewBox="0 0 140 140">
                  <circle cx={70} cy={70} r={58} fill="none" stroke={PALETTE.track} strokeWidth="8" />
                  <circle
                    cx={70}
                    cy={70}
                    r={58}
                    fill="none"
                    stroke={agencyColor}
                    strokeWidth="8"
                    strokeDasharray={`${(aFinal / 10) * 2 * Math.PI * 58} ${2 * Math.PI * 58}`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                  <text
                    x={70}
                    y={65}
                    textAnchor="middle"
                    fill={agencyColor}
                    fontFamily="'Cormorant Garamond', serif"
                    fontSize="32"
                    fontWeight="700"
                  >
                    {aFinal.toFixed(1)}
                  </text>
                  <text
                    x={70}
                    y={85}
                    textAnchor="middle"
                    fill={PALETTE.inkFaint}
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize="9"
                  >
                    / 10
                  </text>
                </svg>
              </div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: agencyColor,
                  marginTop: '0.6rem',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {aFinal >= 7
                  ? 'High agency capacity'
                  : aFinal >= 4
                    ? 'Moderate — constraint pressure active'
                    : 'Suppressed — intervention warranted'}
              </p>
            </div>

            <SectionCard title="Subjective Read" subtitle="Interpretive synthesis from the narrative interview">
              <p style={{ fontSize: '0.9rem', color: PALETTE.ink, lineHeight: 1.8, margin: '0 0 0.9rem' }}>
                {interpretiveRead.summary}
              </p>
              <p style={{ fontSize: '0.86rem', color: PALETTE.inkSoft, lineHeight: 1.75, margin: '0 0 0.9rem' }}>
                {interpretiveRead.compression}
              </p>
              <p style={{ fontSize: '0.86rem', color: PALETTE.inkSoft, lineHeight: 1.75, margin: '0 0 0.9rem' }}>
                {interpretiveRead.pressure}
              </p>
              <p style={{ fontSize: '0.86rem', color: PALETTE.inkSoft, lineHeight: 1.75, margin: '0 0 0.9rem' }}>
                {interpretiveRead.leverage}
              </p>
              <p style={{ fontSize: '0.8rem', color: PALETTE.inkFaint, lineHeight: 1.7, margin: 0 }}>
                {interpretiveRead.coverage}
              </p>
            </SectionCard>

            <SectionCard title="Narrative Signal Trace" subtitle="What the local parser heard in the writing">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.9rem',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.55rem',
                    }}
                  >
                    Pressure
                  </div>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {topPressureSignals.map((signal) => (
                      <SignalChip
                        key={signal.key}
                        label={signal.label}
                        hits={signal.hits}
                        questions={signal.questions}
                        tone={signal.tone}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem',
                      color: PALETTE.accentStrong,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.55rem',
                    }}
                  >
                    Restorative signals
                  </div>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {[...topSupportSignals, ...topResourceSignals].slice(0, 4).map((signal) => (
                      <SignalChip
                        key={signal.key}
                        label={signal.label}
                        hits={signal.hits}
                        questions={signal.questions}
                        tone={signal.tone}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Agency Vector" subtitle="A_LOTUS — six functional dimensions">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                {AGENCY_DIMS.map((dim) => (
                  <ScoreMeter key={dim.key} value={Number(agency[dim.key].toFixed(1))} label={dim.label} size={70} />
                ))}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={PALETTE.track} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: PALETTE.inkSoft, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fill: PALETTE.inkFaint, fontSize: 9 }} />
                  <Radar
                    name="Agency"
                    dataKey="value"
                    stroke={PALETTE.accent}
                    fill={PALETTE.accent}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Effective LOTUS State" subtitle="L_eff — base vs. constrained/scaffolded">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={effectiveLotusData} barGap={4}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: PALETTE.inkSoft, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 10]} tick={{ fill: PALETTE.inkFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: PALETTE.shell,
                      border: `1px solid ${PALETTE.border}`,
                      borderRadius: '8px',
                      color: PALETTE.ink,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Bar dataKey="base" name="L_base" fill={PALETTE.chartBase} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="eff" name="L_eff" radius={[3, 3, 0, 0]}>
                    {effectiveLotusData.map((entry, index) => (
                      <Cell key={index} fill={`hsl(${(entry.eff / 10) * 110}, 56%, 60%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: PALETTE.inkFaint }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      background: PALETTE.chartBase,
                      borderRadius: 2,
                      marginRight: 5,
                    }}
                  />
                  L_base
                </span>
                <span style={{ fontSize: '0.7rem', color: PALETTE.inkFaint }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      background: PALETTE.success,
                      borderRadius: 2,
                      marginRight: 5,
                    }}
                  />
                  L_eff (color = magnitude)
                </span>
              </div>
            </SectionCard>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              <SectionCard title="Most Suppressed" subtitle="Lowest effective LOTUS dimensions">
                {suppressed.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.5rem 0',
                      borderBottom: `1px solid ${PALETTE.border}`,
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: PALETTE.ink }}>{item.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: PALETTE.danger }}>
                      {item.val.toFixed(1)}
                    </span>
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Heaviest Constraints" subtitle="Pressures doing the most compressive work">
                {topConstraints.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.5rem 0',
                      borderBottom: `1px solid ${PALETTE.border}`,
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: PALETTE.ink }}>{item.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: PALETTE.warning }}>
                      {item.val.toFixed(1)}
                    </span>
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Best Scaffolds" subtitle="Fastest-restoring supports available">
                {topScaffolds.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.5rem 0',
                      borderBottom: `1px solid ${PALETTE.border}`,
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: PALETTE.ink }}>{item.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: PALETTE.success }}>
                      {item.val.toFixed(1)}
                    </span>
                  </div>
                ))}
              </SectionCard>
            </div>

            <SectionCard title="Formula Trace" subtitle="Compact LOTUS computation log">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: PALETTE.inkFaint, lineHeight: 2 }}>
                <div><span style={{ color: PALETTE.accentStrong }}>L_base</span> = [{LOTUS_DIMS.map((dim) => lotus[dim.key].toFixed(1)).join(', ')}]</div>
                <div><span style={{ color: PALETTE.accentStrong }}>K</span> = [{CONSTRAINT_DIMS.map((dim) => constraints[dim.key].toFixed(1)).join(', ')}]</div>
                <div><span style={{ color: PALETTE.accentStrong }}>G</span> = [{SCAFFOLD_DIMS.map((dim) => scaffolds[dim.key].toFixed(1)).join(', ')}]</div>
                <div><span style={{ color: PALETTE.accentStrong }}>L_eff</span> = [{LOTUS_DIMS.map((dim) => effectiveLotus[dim.key].toFixed(2)).join(', ')}]</div>
                <div><span style={{ color: PALETTE.accentStrong }}>A_LOTUS</span> = [{AGENCY_DIMS.map((dim) => agency[dim.key].toFixed(2)).join(', ')}]</div>
                <div>
                  <span style={{ color: PALETTE.accentStrong }}>A_final</span> ={' '}
                  <span style={{ color: agencyColor, fontWeight: 700 }}>{aFinal.toFixed(2)}</span> (after nonlinear penalties)
                </div>
                <div style={{ marginTop: '0.8rem', color: PALETTE.inkFaint }}>
                  Weights: sense={AGENCY_DIMS[0].weight} | choose={AGENCY_DIMS[1].weight} | act={AGENCY_DIMS[2].weight}
                  {' '}| protect={AGENCY_DIMS[3].weight} | adapt={AGENCY_DIMS[4].weight} | coordinate={AGENCY_DIMS[5].weight}
                </div>
              </div>
            </SectionCard>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.72rem', color: PALETTE.inkFaint, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.8 }}>
                This tool scaffolds judgment. It does not diagnose, predict, or replace clinical assessment.
                <br />
                Narrative scoring remains provisional and reviewable. Symbolic overlays should never override lived data.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
