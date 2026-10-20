import { PackageTier } from '../types';

export interface PackageQuotaConfig {
  tier: PackageTier;
  tierNameAr: string;
  maxVideos: number;
  maxStorageMb: number;
  allowedSoundtracks: number; // 1 or unlimited
  stereoAudioAllowed: boolean;
  priorityUploadSpeed: boolean;
}

export const PACKAGE_QUOTAS: Record<PackageTier, PackageQuotaConfig> = {
  0: {
    tier: 0,
    tierNameAr: 'الباقة المجانية',
    maxVideos: 1,
    maxStorageMb: 25,
    allowedSoundtracks: 1,
    stereoAudioAllowed: true,
    priorityUploadSpeed: false,
  },
  199: {
    tier: 199,
    tierNameAr: 'الباقة البرونزية',
    maxVideos: 2,
    maxStorageMb: 50,
    allowedSoundtracks: 2,
    stereoAudioAllowed: true,
    priorityUploadSpeed: false,
  },
  350: {
    tier: 350,
    tierNameAr: 'الباقة الفضية',
    maxVideos: 3,
    maxStorageMb: 80,
    allowedSoundtracks: 3,
    stereoAudioAllowed: true,
    priorityUploadSpeed: true,
  },
  399: {
    tier: 399,
    tierNameAr: 'باقة الفضة بلس',
    maxVideos: 4,
    maxStorageMb: 100,
    allowedSoundtracks: 4,
    stereoAudioAllowed: true,
    priorityUploadSpeed: true,
  },
  799: {
    tier: 799,
    tierNameAr: 'الباقة الاحترافية',
    maxVideos: 5,
    maxStorageMb: 140,
    allowedSoundtracks: 5,
    stereoAudioAllowed: true,
    priorityUploadSpeed: true,
  },
  900: {
    tier: 900,
    tierNameAr: 'الباقة الذهبية الممتازة',
    maxVideos: 6,
    maxStorageMb: 180,
    allowedSoundtracks: 8,
    stereoAudioAllowed: true,
    priorityUploadSpeed: true,
  },
  2500: {
    tier: 2500,
    tierNameAr: 'باقة VIP البلاتينية',
    maxVideos: 12,
    maxStorageMb: 450,
    allowedSoundtracks: 15,
    stereoAudioAllowed: true,
    priorityUploadSpeed: true,
  },
  5000: {
    tier: 5000,
    tierNameAr: 'الباقة السنوية الماسية',
    maxVideos: 20,
    maxStorageMb: 900,
    allowedSoundtracks: 30,
    stereoAudioAllowed: true,
    priorityUploadSpeed: true,
  },
  16000: {
    tier: 16000,
    tierNameAr: 'باقة المؤسسات والشركات الكبرى',
    maxVideos: 50,
    maxStorageMb: 2500,
    allowedSoundtracks: 100,
    stereoAudioAllowed: true,
    priorityUploadSpeed: true,
  },
};

/**
 * Returns quota configuration for a given package tier
 */
export function getPackageQuota(tier: PackageTier = 0): PackageQuotaConfig {
  return PACKAGE_QUOTAS[tier] || PACKAGE_QUOTAS[0];
}

/**
 * Validates if the business can add one more video under its quota
 */
export function validateVideoAdditionQuota(
  currentVideosCount: number,
  tier: PackageTier = 0
): { canAdd: boolean; remaining: number; max: number; messageAr: string } {
  const quota = getPackageQuota(tier);
  const remaining = Math.max(0, quota.maxVideos - currentVideosCount);
  const canAdd = remaining > 0;

  let messageAr = '';
  if (canAdd) {
    messageAr = `متبقي في حصتك ${remaining} من أصل ${quota.maxVideos} فيديو (${quota.tierNameAr})`;
  } else {
    messageAr = `⛔ وصلت للحد الأقصى لحصة باقتك (${quota.maxVideos} فيديوهات). يرجى حذف فيديو قديم أو ترقية الباقة لإضافة المزيد.`;
  }

  return { canAdd, remaining, max: quota.maxVideos, messageAr };
}
