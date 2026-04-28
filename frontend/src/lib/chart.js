/**
 * GAIA — chart computation utilities.
 * Given a birth date + hemisphere + optional school cutoff,
 * returns sign, elements, seasons, cohort position, festival proximity, weather-body imprint.
 */
import { SIGNS } from '../data/gaia.js';

// Calendar-sign boundaries (approximate, tropical-inspired but inward-renamed).
// (month, day) -> inclusive lower bound. Order matters (latest first for binary-style lookup).
const BOUNDS = [
  { key: 'january',   start: [1, 21],  end: [2, 19] },
  { key: 'february',  start: [2, 20],  end: [3, 19] },
  { key: 'march',     start: [3, 20],  end: [4, 19] },
  { key: 'april',     start: [4, 20],  end: [5, 20] },
  { key: 'may',       start: [5, 21],  end: [6, 20] },
  { key: 'june',      start: [6, 21],  end: [7, 22] },
  { key: 'july',      start: [7, 23],  end: [8, 22] },
  { key: 'august',    start: [8, 23],  end: [9, 22] },
  { key: 'september', start: [9, 23],  end: [10, 22] },
  { key: 'october',   start: [10, 23], end: [11, 21] },
  { key: 'november',  start: [11, 22], end: [12, 21] },
  // december wraps
  { key: 'december',  start: [12, 22], end: [1, 20] },
];

function afterOrEqual(m, d, [bm, bd]) {
  return m > bm || (m === bm && d >= bd);
}
function beforeOrEqual(m, d, [bm, bd]) {
  return m < bm || (m === bm && d <= bd);
}

export function findSign(month, day) {
  for (const b of BOUNDS) {
    if (b.key === 'december') {
      if (afterOrEqual(month, day, b.start) || beforeOrEqual(month, day, b.end)) {
        return SIGNS.find((s) => s.id === 'december');
      }
    } else if (afterOrEqual(month, day, b.start) && beforeOrEqual(month, day, b.end)) {
      return SIGNS.find((s) => s.id === b.key);
    }
  }
  // Fallback: fall back by calendar month
  return SIGNS.find((s) => s.month === month) || SIGNS[0];
}

/** Solar season — for N hemisphere (flipped for S). Returns a poetic label. */
export function solarSeason(month, hemisphere = 'N') {
  const seasonsN = {
    winter: [12, 1, 2],
    spring: [3, 4, 5],
    summer: [6, 7, 8],
    autumn: [9, 10, 11],
  };
  const find = (m) => {
    for (const [name, months] of Object.entries(seasonsN)) {
      if (months.includes(m)) return name;
    }
    return 'winter';
  };
  let s = find(month);
  if (hemisphere === 'S') {
    const flip = { winter: 'summer', summer: 'winter', spring: 'autumn', autumn: 'spring' };
    s = flip[s];
  }
  return s;
}

/** Civic season — describes what the calendar is DOING around this birth date. */
export function civicSeason(month, day, lang = 'en') {
  // Northern-hemisphere civic defaults (bilingual).
  const rules = [
    { months: [1], label: { en: 'Institutional reset & austerity', fr: 'Reset institutionnel & austérité' } },
    { months: [2], label: { en: 'Between-seasons waiting', fr: 'Attente entre saisons' } },
    { months: [3], label: { en: 'Transition & shifting plans', fr: 'Transition & plans mouvants' } },
    { months: [4], label: { en: 'Planning & applications', fr: 'Plans & candidatures' } },
    { months: [5], label: { en: 'Exam season & social re-emergence', fr: 'Examens & remontée sociale' } },
    { months: [6], label: { en: 'Graduation & solstice rituals', fr: 'Remises de diplômes & solstice' } },
    { months: [7], label: { en: 'Vacation, leisure & travel', fr: 'Vacances, loisirs & voyages' } },
    { months: [8], label: { en: 'Ripening toward back-to-school', fr: 'Maturation vers la rentrée' } },
    { months: [9], label: { en: 'Institutional sorting (back-to-school)', fr: 'Tri institutionnel (rentrée)' } },
    { months: [10], label: { en: 'Harvest, masks & ancestors', fr: 'Récolte, masques & ancêtres' } },
    { months: [11], label: { en: 'Fiscal accounting & remembrance', fr: 'Bilans fiscaux & mémoire' } },
    { months: [12], label: { en: 'Holiday cluster & ritual compression', fr: 'Grappe de fêtes & compression rituelle' } },
  ];
  const hit = rules.find((r) => r.months.includes(month));
  return hit ? hit.label[lang] : rules[0].label[lang];
}

/** Cohort position relative to optional school cutoff (month/day). */
export function cohortPosition({ month, day, cutoffMonth, cutoffDay, lang = 'en' }) {
  if (!cutoffMonth || !cutoffDay) {
    return lang === 'fr'
      ? 'Non précisée — les cohortes varient selon le pays et la région.'
      : 'Unspecified — cohorts vary by country and region.';
  }
  // Distance in days (approximation) from birth date to cutoff (same year).
  const birthOrdinal = (month - 1) * 31 + day;
  const cutoffOrdinal = (cutoffMonth - 1) * 31 + cutoffDay;
  const diff = birthOrdinal - cutoffOrdinal;

  if (diff >= -15 && diff <= 0) {
    return lang === 'fr'
      ? 'Juste avant la date butoir — parmi les plus jeunes de la cohorte.'
      : 'Just before cutoff — among the youngest in the cohort.';
  }
  if (diff > 0 && diff <= 30) {
    return lang === 'fr'
      ? 'Juste après la date butoir — parmi les plus âgé·e·s, attente d\'un an possible.'
      : 'Just after cutoff — among the oldest; may have waited a year.';
  }
  if (diff < -15) {
    return lang === 'fr'
      ? 'Bien avant la date butoir — positionné·e dans la moitié jeune de la cohorte.'
      : 'Well before cutoff — placed in the younger half of the cohort.';
  }
  return lang === 'fr'
    ? 'Bien après la date butoir — positionné·e dans la moitié âgée de la cohorte.'
    : 'Well after cutoff — placed in the older half of the cohort.';
}

/** Festival proximity: distance (in days) to nearest major civic/religious marker. */
export function festivalProximity(month, day, lang = 'en') {
  const markers = [
    { m: 1, d: 1,  en: "New Year's Day",       fr: 'Nouvel An' },
    { m: 2, d: 14, en: "Valentine's Day",      fr: 'Saint-Valentin' },
    { m: 3, d: 20, en: 'Spring equinox',       fr: 'Équinoxe de printemps' },
    { m: 5, d: 1,  en: 'Labor Day / Mayday',   fr: 'Fête du Travail' },
    { m: 6, d: 21, en: 'Summer solstice',      fr: 'Solstice d\'été' },
    { m: 7, d: 4,  en: 'Independence rituals', fr: 'Rituels d\'indépendance' },
    { m: 9, d: 1,  en: 'Back-to-school week',  fr: 'Semaine de la rentrée' },
    { m: 9, d: 23, en: 'Autumn equinox',       fr: 'Équinoxe d\'automne' },
    { m: 10, d: 31, en: 'All-Hallows / harvest mask', fr: 'Toussaint / masques de la récolte' },
    { m: 11, d: 11, en: 'Remembrance',         fr: 'Souvenir / Armistice' },
    { m: 12, d: 21, en: 'Winter solstice',     fr: 'Solstice d\'hiver' },
    { m: 12, d: 25, en: 'Winter holiday cluster', fr: 'Grappe des fêtes d\'hiver' },
    { m: 12, d: 31, en: "New Year's Eve",      fr: 'Réveillon' },
  ];
  const birth = new Date(2024, month - 1, day).getTime();
  let best = null;
  let bestDist = Infinity;
  for (const mk of markers) {
    const t = new Date(2024, mk.m - 1, mk.d).getTime();
    const dist = Math.min(
      Math.abs(t - birth),
      Math.abs(t - birth - 365 * 86400000),
      Math.abs(t - birth + 365 * 86400000),
    );
    const days = Math.round(dist / 86400000);
    if (days < bestDist) {
      bestDist = days;
      best = { ...mk, days };
    }
  }
  const label = lang === 'fr' ? best.fr : best.en;
  if (bestDist === 0) {
    return lang === 'fr'
      ? `Ton anniversaire est conjoint à ${label}.`
      : `Your birthday is conjunct ${label}.`;
  }
  if (bestDist <= 3) {
    return lang === 'fr'
      ? `À ${bestDist} jour(s) de ${label} — quasi absorbé par le rituel collectif.`
      : `${bestDist} day(s) from ${label} — nearly absorbed by collective ritual.`;
  }
  if (bestDist <= 10) {
    return lang === 'fr'
      ? `À ${bestDist} jours de ${label} — proximité sensible.`
      : `${bestDist} days from ${label} — sensible proximity.`;
  }
  return lang === 'fr'
    ? `Marqueur le plus proche : ${label} (${bestDist} jours).`
    : `Nearest marker: ${label} (${bestDist} days).`;
}

/** Weather / body imprint — short poetic narrative of seasonal conditions. */
export function weatherImprint(month, hemisphere = 'N', lang = 'en') {
  const s = solarSeason(month, hemisphere);
  const copy = {
    winter: {
      en: 'Short days, indoor bodies, low light, shared warmth, seasonal illness.',
      fr: 'Jours courts, corps à l\'intérieur, faible lumière, chaleur partagée, maladies saisonnières.',
    },
    spring: {
      en: 'Lengthening light, unstable weather, body re-emerging, allergens and wind.',
      fr: 'Lumière qui s\'allonge, météo instable, corps qui ressort, allergènes et vent.',
    },
    summer: {
      en: 'Long light, exposed bodies, heat, travel, late-night porousness.',
      fr: 'Lumière longue, corps exposés, chaleur, voyages, porosité nocturne.',
    },
    autumn: {
      en: 'Retreating light, cooling air, layering, return to routine, harvest.',
      fr: 'Lumière qui recule, air qui rafraîchit, superposition, retour à la routine, récolte.',
    },
  };
  return copy[s][lang];
}

/** Full chart payload. */
export function buildChart({ date, hemisphere, cutoffMonth, cutoffDay, place, lang }) {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const sign = findSign(month, day);
  return {
    birth_date: d.toISOString().slice(0, 10),
    birth_place: place || null,
    hemisphere,
    school_cutoff_month: cutoffMonth || null,
    school_cutoff_day: cutoffDay || null,
    sign,
    elements: sign.elements,
    solar_season: solarSeason(month, hemisphere),
    civic_season: civicSeason(month, day, lang),
    cohort_position: cohortPosition({ month, day, cutoffMonth, cutoffDay, lang }),
    festival_proximity: festivalProximity(month, day, lang),
    weather_imprint: weatherImprint(month, hemisphere, lang),
  };
}

/** Build a payload suitable for the /api/reading endpoint. */
export function chartToPayload(chart, lang) {
  const s = chart.sign[lang];
  return {
    birth_date: chart.birth_date,
    birth_place: chart.birth_place,
    hemisphere: chart.hemisphere,
    school_cutoff_month: chart.school_cutoff_month,
    school_cutoff_day: chart.school_cutoff_day,
    sign_name: s.name,
    sign_archetype: s.subtitle,
    elements: chart.elements,
    solar_season: chart.solar_season,
    civic_season: chart.civic_season,
    cohort_position: chart.cohort_position,
    festival_proximity: chart.festival_proximity,
    weather_imprint: chart.weather_imprint,
  };
}
