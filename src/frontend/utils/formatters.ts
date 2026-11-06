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
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    case 'APPROVED':
    case 'PAYPAL_PROCESSING':
      return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    case 'PENDING_APPROVAL':
      return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-medium';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
  }
}
