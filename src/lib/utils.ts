import type { Offer } from './supabase';

export function getTimeRemaining(endTime: string): {
  total: number;
  hours: number;
  minutes: number;
  expired: boolean;
} {
  const total = Date.parse(endTime) - Date.now();
  const expired = total <= 0;

  if (expired) {
    return { total: 0, hours: 0, minutes: 0, expired: true };
  }

  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));

  return { total, hours, minutes, expired: false };
}

export function formatTimeRemaining(endTime: string): string {
  const { hours, minutes, expired } = getTimeRemaining(endTime);

  if (expired) {
    return 'Offer Window Closed';
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function getHighestOffer(offers: Offer[]): number | null {
  if (offers.length === 0) return null;
  return Math.max(...offers.map(o => o.offer_amount));
}

export function getLowestOffer(offers: Offer[]): number | null {
  if (offers.length === 0) return null;
  return Math.min(...offers.map(o => o.offer_amount));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isOfferWindowOpen(endTime: string): boolean {
  return Date.parse(endTime) > Date.now();
}
