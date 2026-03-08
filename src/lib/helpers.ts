export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function getDealAge(createdAt: string, closedAt: string | null): number {
  const end = closedAt ? new Date(closedAt) : new Date();
  return Math.floor((end.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysInStage(lastTransitionAt: string | null, createdAt: string): number {
  const ref = lastTransitionAt || createdAt;
  return Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24));
}

export const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Note', 'Prospecting Touch'] as const;
export const OPPORTUNITY_TYPES = ['New', 'Upsell', 'Renewal', 'Pilot'] as const;
export const FORECAST_CATEGORIES = ['Pipeline', 'Best Case', 'Commit'] as const;
export const COMPANY_STATUSES = ['Prospect', 'Customer', 'Former'] as const;
export const LEAD_STATUSES = ['MQL', 'SQL', 'Qualified', 'Unqualified'] as const;
export const UNQUALIFY_REASONS = [
  'No budget',
  'No need / bad fit',
  'No response',
  'Wrong timing',
  'Not ICP',
  'Other',
] as const;

export const PUSHBACK_REASONS = [
  'Champion left',
  'Technical issues',
  'M&A at firm',
  'Product issue',
  'Partnership delays',
] as const;
export const CONTACT_ROLES = ['Decision Maker', 'Operations', 'Associate', 'Other'] as const;
export const FIRM_SIZES = ['2-10', '11-50', '51-200', '200+'] as const;
export const DEAL_SOURCES = ['Ad', 'Referral', 'Website', 'Newsletter', 'Cold Outreach', 'Other'] as const;
