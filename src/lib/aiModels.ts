export type ModelTierId = 'spark' | 'core' | 'depth' | 'auto';

export interface AiModelConfig {
  id: ModelTierId;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  speed: 'Ultra-Fast' | 'Balanced' | 'Deep Reasoning';
  orchestrationLevel: 1 | 2 | 3;
  geminiModel: string;
  temperature: number;
  maxOutputTokens: number;
  isDefault?: boolean;
}

export const AI_BRAND_NAME = 'Lumen';

/**
 * Intellectual Library & Classical Intelligence Engine Naming Candidates:
 * Pure, simple to pronounce, sticky in memory, and zero collision with big AI labs.
 * Standalone prestige naming without cliché or appended suffixes.
 */
export const ENGINE_NAME_CANDIDATES = [
  {
    name: 'Lumen',
    origin: 'Latin (lūmen) — Pure light of understanding, intellectual illumination, and clarity of mind',
    pronunciation: 'LOO-men',
    tagline: 'Illuminating Academic Intelligence',
    tiers: ['Lumen Spark', 'Lumen Core', 'Lumen Depth', 'Lumen Auto'],
  },
  {
    name: 'Telos',
    origin: 'Ancient Greek (τέλος) — The ultimate aim, highest purpose, and peak potential of human learning',
    pronunciation: 'TEH-los',
    tagline: 'Peak Potential Reasoning Engine',
    tiers: ['Telos Spark', 'Telos Core', 'Telos Depth', 'Telos Auto'],
  },
  {
    name: 'Praxis',
    origin: 'Ancient Greek (πρᾶξις) — Translating deep theoretical knowledge into practical action and exam mastery',
    pronunciation: 'PRAK-sis',
    tagline: 'Actionable Scholarship Engine',
    tiers: ['Praxis Spark', 'Praxis Core', 'Praxis Depth', 'Praxis Auto'],
  },
  {
    name: 'Kairos',
    origin: 'Ancient Greek (καιρός) — The opportune, decisive moment where understanding clicks and clarity strikes',
    pronunciation: 'KY-ros',
    tagline: 'Breakthrough Cognition Engine',
    tiers: ['Kairos Spark', 'Kairos Core', 'Kairos Depth', 'Kairos Auto'],
  },
  {
    name: 'Zeno',
    origin: 'Ancient Greek (Ζήνων) — Master of stoic logic, dialectic reasoning, and step-by-step proofs',
    pronunciation: 'ZEE-no',
    tagline: 'Dialectic Logic & Proof System',
    tiers: ['Zeno Spark', 'Zeno Core', 'Zeno Depth', 'Zeno Auto'],
  },
  {
    name: 'Eidos',
    origin: 'Platonic Greek (εἶδος) — The pure, immutable form and essence of true knowledge behind every idea',
    pronunciation: 'AY-dos',
    tagline: 'Essential Form Cognition',
    tiers: ['Eidos Spark', 'Eidos Core', 'Eidos Depth', 'Eidos Auto'],
  },
];

export const AI_MODELS: Record<ModelTierId, AiModelConfig> = {
  spark: {
    id: 'spark',
    name: 'Lumen Axiom',
    badge: 'Axiom',
    tagline: 'Instant first-principles speed',
    description: 'Sub-second answers for instant lookups, definitions, venue routing, and rapid facts.',
    speed: 'Ultra-Fast',
    orchestrationLevel: 1,
    geminiModel: 'gemini-3.5-flash-lite',
    temperature: 0.2,
    maxOutputTokens: 2048,
  },
  core: {
    id: 'core',
    name: 'Lumen Codex',
    badge: 'Codex',
    tagline: 'Comprehensive academic manuscript',
    description: 'Balanced daily driver attuned to university lecture notes, syllabi breakdowns, quizzes, and course outlines.',
    speed: 'Balanced',
    orchestrationLevel: 2,
    geminiModel: 'gemini-3.5-flash-lite',
    temperature: 0.35,
    maxOutputTokens: 4096,
    isDefault: true,
  },
  depth: {
    id: 'depth',
    name: 'Lumen Opus',
    badge: 'Opus',
    tagline: 'Masterpiece deep reasoning & forensics',
    description: 'Deep chain-of-thought orchestration for CGPA forensics, mathematical proofs, exam derivations, and complex handouts.',
    speed: 'Deep Reasoning',
    orchestrationLevel: 3,
    geminiModel: 'gemini-3.6-flash',
    temperature: 0.2,
    maxOutputTokens: 6000,
  },
  auto: {
    id: 'auto',
    name: 'Lumen Nexus',
    badge: 'Nexus',
    tagline: 'Dynamic intelligence router',
    description: 'Intelligently analyzes query weight: routes to Axiom for quick lookups, elevates to Opus for multi-step reasoning.',
    speed: 'Balanced',
    orchestrationLevel: 2,
    geminiModel: 'gemini-3.5-flash-lite',
    temperature: 0.3,
    maxOutputTokens: 4096,
  },
};

/**
 * Fast client-side / server-side classifier to determine best model if 'auto' is picked.
 * Defaults to faster models unless the prompt explicitly needs reasoning.
 */
export function resolveAutoModelTier(
  prompt: string,
  hasAttachment: boolean = false,
  context?: string
): 'spark' | 'core' | 'depth' {
  const p = prompt.toLowerCase();

  // Tasks requiring heavy reasoning -> Depth
  const needsDeepReasoning =
    p.includes('cgpa') ||
    p.includes('calculate gpa') ||
    p.includes('grade point') ||
    p.includes('carry over') ||
    p.includes('audit result') ||
    p.includes('derive') ||
    p.includes('mathematical proof') ||
    p.includes('step by step calculation') ||
    p.includes('full syllabus') ||
    context === 'compress_handout' ||
    (hasAttachment && (p.includes('result') || p.includes('analysis')));

  if (needsDeepReasoning) {
    return 'depth';
  }

  // Quick single-hop tasks -> Spark
  const isSimpleLookup =
    p.length < 40 &&
    (p.includes('where is') ||
      p.includes('location of') ||
      p.includes('how to get to') ||
      p.includes('meaning of') ||
      p.includes('define') ||
      p.includes('what is') ||
      context === 'campus_navigation');

  if (isSimpleLookup) {
    return 'spark';
  }

  // Default balanced
  return 'core';
}

/**
 * Peak campus study hour detector (19:00 - 23:00 WAT, UTC+1).
 * Can apply small surge multiplier if servers are under intense concurrent load.
 */
export function isPeakCampusHour(): boolean {
  try {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const watHours = (utcHours + 1) % 24; // WAT is UTC+1
    return watHours >= 19 && watHours <= 23;
  } catch {
    return false;
  }
}

export interface ToneCalculationParams {
  modelTier: ModelTierId;
  inputChars: number;
  outputChars: number;
  toolStressFactor?: number; // 0 for pure chat, 1 for tools, 3 for multi-file/OCR, 5 for heavy chunking
  hasAttachments?: boolean;
  attachmentCount?: number;
  isPeakHour?: boolean;
}

export interface ToneConsumptionResult {
  totalTones: number;
  baseTones: number;
  computeTones: number;
  toolStressTones: number;
  peakMultiplier: number;
  summary: string;
}

/**
 * Dynamic Tone consumption engine:
 * Charges based on:
 * 1. Model tier base
 * 2. Actual input + output length
 * 3. Tools used and computational stress
 * Even if using Nova Depth (smartest), if input and output are small, charge remains very low!
 */
export function calculateToneCost(params: ToneCalculationParams): ToneConsumptionResult {
  const {
    modelTier,
    inputChars,
    outputChars,
    toolStressFactor = 0,
    hasAttachments = false,
    attachmentCount = 0,
    isPeakHour = isPeakCampusHour(),
  } = params;

  // Base tier charge
  const tierBaseRate: Record<ModelTierId, number> = {
    spark: 0.5,
    core: 1.0,
    depth: 1.8,
    auto: 1.0,
  };

  // Compute cost per 1,000 characters
  const charRates: Record<ModelTierId, number> = {
    spark: 0.2,
    core: 0.5,
    depth: 0.9,
    auto: 0.5,
  };

  const baseTones = tierBaseRate[modelTier] || 1.0;
  const totalChars = inputChars + outputChars;
  const computeTones = Math.max(0.1, (totalChars / 1000) * (charRates[modelTier] || 0.5));

  // Tool stress cost (reflects infrastructure load of OCR, file extraction, vector search)
  let toolStressTones = 0;
  if (toolStressFactor > 0) {
    toolStressTones += toolStressFactor * 0.7;
  }
  if (hasAttachments) {
    toolStressTones += Math.min(3.5, (attachmentCount || 1) * 1.0);
  }

  // Peak time multiplier (1.15x during peak campus evening hours)
  const peakMultiplier = isPeakHour ? 1.15 : 1.0;

  const rawTotal = (baseTones + computeTones + toolStressTones) * peakMultiplier;
  const totalTones = Math.max(1, Math.round(rawTotal * 10) / 10);

  return {
    totalTones,
    baseTones,
    computeTones: Math.round(computeTones * 10) / 10,
    toolStressTones: Math.round(toolStressTones * 10) / 10,
    peakMultiplier,
    summary: `${totalTones} Tones consumed (${modelTier} tier, ${Math.round(totalChars)} chars${toolStressTones > 0 ? ' + tools' : ''}${isPeakHour ? ' [peak]' : ''})`,
  };
}

export type SubscriptionTierId = 'freemium' | 'freemium_2' | 'pro_monthly' | 'pro_semester';

export interface SubscriptionTierConfig {
  id: SubscriptionTierId;
  name: string;
  tagline: string;
  priceNgn: number;
  monthlyTones: number;
  uploadSessionsPerMonth: number;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTierId, SubscriptionTierConfig> = {
  freemium: {
    id: 'freemium',
    name: 'Freemium Scholar',
    tagline: 'Basic free access for every university student',
    priceNgn: 0,
    monthlyTones: 150,
    uploadSessionsPerMonth: 3,
    features: [
      '150 Study Tones per month',
      '3 Multi-file document upload sessions',
      'Lumen Spark & Lumen Core access',
      'Standard campus navigation',
    ],
  },
  freemium_2: {
    id: 'freemium_2',
    name: 'Freemium 2 (Referral Buddy Tier)',
    tagline: 'Enhanced freemium unlocked through friends',
    priceNgn: 0,
    monthlyTones: 350,
    uploadSessionsPerMonth: 6,
    features: [
      '350 Study Tones per month (more than 2x standard free)',
      '6 Multi-file document upload sessions',
      'Lumen Spark, Core, and periodic Depth access',
      '10% discount on future Pro upgrade',
      'Zero cost, accessible via friend referral',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Scholar Monthly',
    tagline: 'Standard monthly pass for serious university study',
    priceNgn: 1500,
    monthlyTones: 2000,
    uploadSessionsPerMonth: 9999,
    features: [
      '2,000 Study Tones per month',
      'Unlimited multi-file document uploads',
      'Full Lumen Depth deep chain-of-thought orchestration',
      'Departmental lecture archive deep search',
      'Zero server queue during peak exam rush',
      '400-page textbook chunking with instant notifications',
    ],
  },
  pro_semester: {
    id: 'pro_semester',
    name: 'Pro Semester Pass',
    tagline: 'Complete 4-month academic term coverage',
    priceNgn: 4500,
    monthlyTones: 7000,
    uploadSessionsPerMonth: 9999,
    features: [
      '7,000 Study Tones per semester',
      'Unlimited uploads for all semester courses & exams',
      'All Lumen models unlocked with highest priority',
      'Multi-semester CGPA transcript consolidation for 300L/400L',
      'Personalized lecturer keyword preservation',
    ],
  },
};

export const HARDSHIP_REFERRAL_PROGRAM = {
  name: 'Broke Student Hardship Relief Program',
  discountPercent: 90, // Student pays ONLY 10% of subscription price (₦150)
  validityMonths: 1, // Strictly 1st month of referral only
  expirationRule: 'The 10% hardship price is strictly valid in that first referral month. If not renewed, it expires and the account reverts to normal Freemium or Freemium 2.',
  requiredPeers: 3, // Requires 3 real verified student referrals
  peerDiscountPercent: 10, // Friends get 10% discount on Pro
  peerAlternativeTier: 'freemium_2' as SubscriptionTierId, // Or friends get Freemium 2
  referralCashbackNgn: 400, // Broke student earns cash when referred friend pays!
};

export const CAMPUS_GAMES_AND_REWARDS = {
  name: 'Cohart Campus Arena & Student Rewards',
  frequency: 'Bi-Weekly (Every 2 Weeks)',
  competitions: [
    {
      type: 'bi_weekly_trivia',
      title: 'Bi-Weekly Campus Quiz Battle',
      rewards: 'Cash prizes, airtime/data packs, and free Pro passes',
      cadence: 'Every other Saturday at 8 PM WAT',
    },
    {
      type: 'departmental_clash',
      title: 'Inter-Departmental Academic Derby',
      rewards: 'Grand cash prize pool paid directly to top winning scholars',
      cadence: 'Monthly Faculty & Department Tournaments',
    },
    {
      type: 'streak_rewards',
      title: 'Consistent Scholar Study Streaks',
      rewards: 'Bonus Study Tones, student merch, and surprise gift drops',
      cadence: 'Active continuous milestones',
    },
  ],
  payoutMethod: 'Prompt direct bank transfer or student airtime voucher immediately upon event conclusion',
};

