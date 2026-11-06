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
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'COMPLETED':
    case 'SHIPPED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'APPROVED':
    case 'PAYPAL_PROCESSING':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'PENDING_APPROVAL':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

