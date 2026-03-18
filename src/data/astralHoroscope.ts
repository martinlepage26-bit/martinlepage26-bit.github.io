import type { AstralSign } from './astralYear';
import { zodiacSigns } from './astralYear';

export type AstralSignSlug = AstralSign['slug'];

export interface AstralDateInput {
  month: number;
  day: number;
}

export interface AstralHoroscopeRequest {
  sign?: AstralSignSlug;
  month?: number;
  day?: number;
}

export interface AstralHoroscopeGuidance {
  now: string;
  care: string;
  shadow: string;
}

export interface AstralHoroscopeProfile {
  sign: AstralSign;
  keyNote: string;
  seasonMood: string;
  bodyFeeling: string;
  movementPattern: string;
  shadow: string;
  ritual: string;
  guidance: string[];
  summary: string;
  message: string;
}

const SIGN_BY_SLUG = new Map<AstralSignSlug, AstralSign>(
  zodiacSigns.map((sign) => [sign.slug, sign] as const),
);

function isValidMonthDay(month: number, day: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  if (month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = new Map<number, number>([
    [1, 31],
    [2, 29],
    [3, 31],
    [4, 30],
    [5, 31],
    [6, 30],
    [7, 31],
    [8, 31],
    [9, 30],
    [10, 31],
    [11, 30],
    [12, 31],
  ]);

  return day <= (daysInMonth.get(month) ?? 0);
}

function toOrdinal(month: number, day: number): number {
  const monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let ordinal = day;
  for (let index = 0; index < month - 1; index += 1) {
    ordinal += monthLengths[index];
  }
  return ordinal;
}

function signCoversDate(sign: AstralSign, month: number, day: number): boolean {
  const start = toOrdinal(sign.startMonth, sign.startDay);
  const end = toOrdinal(sign.endMonth, sign.endDay);
  const current = toOrdinal(month, day);

  if (start <= end) {
    return current >= start && current <= end;
  }

  return current >= start || current <= end;
}

function normalizeSign(input: AstralHoroscopeRequest): AstralSign {
  if (input.sign) {
    const bySlug = SIGN_BY_SLUG.get(input.sign);
    if (!bySlug) {
      throw new Error(`Unknown Astral sign slug: ${input.sign}`);
    }
    return bySlug;
  }

  if (input.month == null || input.day == null) {
    throw new Error('Astral reading requests need either a sign slug or a month/day pair.');
  }

  if (!isValidMonthDay(input.month, input.day)) {
    throw new Error(`Invalid month/day pair: ${input.month}/${input.day}`);
  }

  const month = input.month;
  const day = input.day;
  const match = zodiacSigns.find((sign) => signCoversDate(sign, month, day));
  if (!match) {
    throw new Error(`Could not resolve an Astral sign for ${month}/${day}`);
  }

  return match;
}

function buildGuidance(sign: AstralSign): AstralHoroscopeGuidance {
  return {
    now: `Let ${sign.civicTheme} name the weather before you try to control it.`,
    care: `Keep close to ${sign.bodyRegister}. That is the body-level signal this sign is asking you to hear.`,
    shadow: `${sign.shadow}. Return to ${sign.ritual}`,
  };
}

function buildSummary(sign: AstralSign): string {
  return `${sign.name} carries ${sign.competence.toLowerCase()} through ${sign.element.toLowerCase()} time, with ${sign.civicTheme} at the center of the reading.`;
}

function buildMessage(sign: AstralSign): string {
  return [
    `For ${sign.name}, the book speaks in ${sign.element.toLowerCase()} weather rather than prediction.`,
    `The sign's key note is ${sign.competence.toLowerCase()}, and it appears here as ${sign.civicTheme}.`,
    `In the body, that feels like ${sign.bodyRegister}.`,
    `In relation, it moves as ${sign.socialPattern}.`,
    `When the shape turns difficult, the shadow is ${sign.shadow}.`,
    `The corrective gesture is simple and concrete: ${sign.ritual}`,
  ].join(' ');
}

export function determineAstralSign(month: number, day: number): AstralSign {
  if (!isValidMonthDay(month, day)) {
    throw new Error(`Invalid month/day pair: ${month}/${day}`);
  }

  const sign = zodiacSigns.find((entry) => signCoversDate(entry, month, day));
  if (!sign) {
    throw new Error(`Could not resolve an Astral sign for ${month}/${day}`);
  }

  return sign;
}

export function getAstralSignBySlug(slug: AstralSignSlug): AstralSign {
  const sign = SIGN_BY_SLUG.get(slug);
  if (!sign) {
    throw new Error(`Unknown Astral sign slug: ${slug}`);
  }

  return sign;
}

export function buildAstralHoroscopeProfile(input: AstralHoroscopeRequest): AstralHoroscopeProfile {
  const sign = normalizeSign(input);
  const guidance = buildGuidance(sign);

  return {
    sign,
    keyNote: sign.competence,
    seasonMood: sign.civicTheme,
    bodyFeeling: sign.bodyRegister,
    movementPattern: sign.socialPattern,
    shadow: sign.shadow,
    ritual: sign.ritual,
    guidance: [guidance.now, guidance.care, guidance.shadow],
    summary: buildSummary(sign),
    message: buildMessage(sign),
  };
}

export function buildAstralHoroscopeMessage(input: AstralHoroscopeRequest): string {
  return buildAstralHoroscopeProfile(input).message;
}
