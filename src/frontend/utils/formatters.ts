export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'DIRECT_SETTLED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    case 'VERIFIED_CAPTURED':
      return 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
    case 'ESCROW_LOCKED':
      return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold animate-pulse';
    case 'DISPUTED_REFUNDED':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
  }
}

export function getTrustScoreBadge(score: number): { label: string; bg: string; text: string; border: string } {
  if (score >= 85) {
    return { label: 'High Trust', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  } else if (score >= 60) {
    return { label: 'Moderate', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  } else if (score >= 40) {
    return { label: 'Probation', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  } else {
    return { label: 'High Risk', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  }
}
