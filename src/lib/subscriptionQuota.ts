import { StudentProfile } from './types';
import { SUBSCRIPTION_TIERS, SubscriptionTierId, HARDSHIP_REFERRAL_PROGRAM } from './aiModels';

export type QuotaFeature = 'document_upload' | 'simplify_and_blend';

export const FREE_MONTHLY_LIMITS: Record<QuotaFeature, number> = {
  document_upload: 3,     // 3 free timetable / lecture note uploads per month
  simplify_and_blend: 5,  // 5 free in-text simplify & blend rewrites per month
};

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export interface ProLoanRecord {
  isActive: boolean;
  activatedAt: string;
  dueDate: string;
  amountNgn: number;
}

export function getProLoanDetails(): ProLoanRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cohart_pro_loan_pass');
    if (!raw) return null;
    const data = JSON.parse(raw);
    const dueDate = new Date(data.dueDate);
    if (new Date() > dueDate) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function isExamPassLoanActive(): boolean {
  return Boolean(getProLoanDetails()?.isActive);
}

export function activateExamPassLoan(): ProLoanRecord {
  const now = new Date();
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day grace
  const record: ProLoanRecord = {
    isActive: true,
    activatedAt: now.toISOString(),
    dueDate: dueDate.toISOString(),
    amountNgn: 1500,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('cohart_pro_loan_pass', JSON.stringify(record));
    const monthKey = getCurrentMonthKey();
    localStorage.setItem(`cohart_tones_used_${monthKey}`, '0');
  }
  return record;
}

export function settleExamPassLoan(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cohart_pro_loan_pass');
  }
}

export function isUserPro(profile?: StudentProfile): boolean {
  if (isExamPassLoanActive()) return true;
  if (!profile) return false;
  // A student is considered Pro if verified coordinator, loan active, or marked as pro
  return Boolean(
    profile.is_verified_coordinator ||
    (profile as any).subscription_status === 'active' ||
    (profile as any).tier === 'pro' ||
    (profile as any).tier === 'pro_monthly' ||
    (profile as any).tier === 'pro_semester'
  );
}

export function getUserSubscriptionTier(profile?: StudentProfile): SubscriptionTierId {
  if (isExamPassLoanActive()) return 'pro_monthly';
  if (!profile) return 'freemium';
  if (isUserPro(profile)) {
    return ((profile as any).subscription_plan === 'pro_semester' ? 'pro_semester' : 'pro_monthly');
  }
  if ((profile as any).tier === 'freemium_2' || (profile as any).is_referral_buddy) {
    return 'freemium_2';
  }
  return 'freemium';
}

export function checkFeatureAccess(
  feature: QuotaFeature,
  profile?: StudentProfile
): {
  allowed: boolean;
  usedCount: number;
  remaining: number;
  maxLimit: number;
  isPro: boolean;
  tier: SubscriptionTierId;
  monthKey: string;
} {
  const isPro = isUserPro(profile);
  const tier = getUserSubscriptionTier(profile);
  // Freemium 2 gets 6 upload sessions instead of 3
  const maxLimit = tier === 'freemium_2' && feature === 'document_upload' ? 6 : FREE_MONTHLY_LIMITS[feature];
  const monthKey = getCurrentMonthKey();

  if (isPro) {
    return {
      allowed: true,
      usedCount: 0,
      remaining: 9999,
      maxLimit: 9999,
      isPro: true,
      tier,
      monthKey,
    };
  }

  let usedCount = 0;
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `cohart_quota_${feature}_${monthKey}`;
      usedCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
    } catch {
      usedCount = 0;
    }
  }

  const remaining = Math.max(0, maxLimit - usedCount);
  const allowed = remaining > 0;

  return {
    allowed,
    usedCount,
    remaining,
    maxLimit,
    isPro: false,
    tier,
    monthKey,
  };
}

export function getUserTonesBalance(profile?: StudentProfile): {
  balance: number;
  monthlyPool: number;
  tier: SubscriptionTierId;
} {
  const tier = getUserSubscriptionTier(profile);
  const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.freemium;
  const monthKey = getCurrentMonthKey();
  let usedTones = 0;

  if (typeof window !== 'undefined') {
    try {
      usedTones = parseFloat(localStorage.getItem(`cohart_used_tones_${monthKey}`) || '0');
    } catch {
      usedTones = 0;
    }
  }

  const balance = Math.max(0, tierConfig.monthlyTones - usedTones);
  return {
    balance: Math.round(balance * 10) / 10,
    monthlyPool: tierConfig.monthlyTones,
    tier,
  };
}

export function deductUserTones(tonesCost: number, profile?: StudentProfile): number {
  if (isUserPro(profile)) return 9999;
  const monthKey = getCurrentMonthKey();
  let nextUsed = tonesCost;

  if (typeof window !== 'undefined') {
    try {
      const current = parseFloat(localStorage.getItem(`cohart_used_tones_${monthKey}`) || '0');
      nextUsed = current + tonesCost;
      localStorage.setItem(`cohart_used_tones_${monthKey}`, nextUsed.toString());
    } catch {}
  }
  return nextUsed;
}

export function recordFeatureUsage(
  feature: QuotaFeature,
  profile?: StudentProfile
): number {
  if (isUserPro(profile)) return 9999;

  const monthKey = getCurrentMonthKey();
  let nextCount = 1;

  if (typeof window !== 'undefined') {
    try {
      const storageKey = `cohart_quota_${feature}_${monthKey}`;
      const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
      nextCount = current + 1;
      localStorage.setItem(storageKey, nextCount.toString());
    } catch {}
  }

  return nextCount;
}

export const MAX_UPLOAD_BATCH_SIZE_BYTES = 10 * 1024 * 1024; // 10MB total batch limit

export const HEAVY_FILE_EXTENSIONS = [
  '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
  '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.bmp'
];

export function isHeavyFile(fileName: string, mime?: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return (
    HEAVY_FILE_EXTENSIONS.includes(ext) ||
    (mime?.startsWith('image/') ?? false) ||
    mime === 'application/pdf'
  );
}

export function getBatchUploadLimits(files: Array<{ name: string; type?: string }>): {
  maxAllowedFiles: number;
  hasHeavyFiles: boolean;
} {
  const hasHeavy = files.some((f) => isHeavyFile(f.name, f.type));
  return {
    maxAllowedFiles: hasHeavy ? 3 : 5,
    hasHeavyFiles: hasHeavy,
  };
}

export function validateUploadBatch(files: Array<{ name: string; type?: string; size: number }>): {
  valid: boolean;
  error?: string;
  maxAllowedFiles: number;
  hasHeavyFiles: boolean;
  totalSizeBytes: number;
} {
  if (!files || files.length === 0) {
    return { valid: true, maxAllowedFiles: 5, hasHeavyFiles: false, totalSizeBytes: 0 };
  }

  const { maxAllowedFiles, hasHeavyFiles } = getBatchUploadLimits(files);
  const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  if (files.length > maxAllowedFiles) {
    return {
      valid: false,
      error: hasHeavyFiles
        ? `You can upload at most 3 files at a time when attaching PDFs, images, or Office documents (you selected ${files.length}).`
        : `You can upload at most 5 files at a time for text and code documents (you selected ${files.length}).`,
      maxAllowedFiles,
      hasHeavyFiles,
      totalSizeBytes,
    };
  }

  if (totalSizeBytes > MAX_UPLOAD_BATCH_SIZE_BYTES) {
    const mbTotal = (totalSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Total combined upload size (${mbTotal}MB) exceeds the 10MB limit. Please select fewer or smaller files.`,
      maxAllowedFiles,
      hasHeavyFiles,
      totalSizeBytes,
    };
  }

  return {
    valid: true,
    maxAllowedFiles,
    hasHeavyFiles,
    totalSizeBytes,
  };
}

