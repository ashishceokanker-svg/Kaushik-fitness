import { MembershipDuration, PTPackageDuration } from '../types';

export const MEMBERSHIP_PRICING: Record<MembershipDuration, { label: string; months: number; price: number; badge: string }> = {
  '1_month': { label: '1 Month Standard', months: 1, price: 1200, badge: 'Monthly' },
  '3_months': { label: '3 Months Quarter', months: 3, price: 3200, badge: 'Popular' },
  '6_months': { label: '6 Months Half-Year', months: 6, price: 5800, badge: 'Save ₹1,400' },
  '1_year': { label: '1 Year Annual Gold', months: 12, price: 9999, badge: 'Best Value' },
};

export const PT_PRICING: Record<PTPackageDuration, { label: string; months: number; price: number }> = {
  '1_month': { label: '1 Month Personal Training', months: 1, price: 2500 },
  '3_months': { label: '3 Months Personal Training', months: 3, price: 6500 },
  '6_months': { label: '6 Months Personal Training', months: 6, price: 12000 },
  'none': { label: 'No Personal Training', months: 0, price: 0 },
};

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // Less than or equal to 7 days
  totalRemainingSeconds: number;
}

export function calculateCountdown(targetDateIso: string): CountdownResult {
  const target = new Date(targetDateIso).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      isExpiringSoon: false,
      totalRemainingSeconds: 0,
    };
  }

  const totalRemainingSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalRemainingSeconds / (3600 * 24));
  const hours = Math.floor((totalRemainingSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalRemainingSeconds % 3600) / 60);
  const seconds = totalRemainingSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    isExpiringSoon: days <= 7,
    totalRemainingSeconds,
  };
}

export function calculateExpiryDate(startDateIso: string, duration: MembershipDuration): string {
  const date = new Date(startDateIso);
  const monthsToAdd = MEMBERSHIP_PRICING[duration]?.months || 1;
  date.setMonth(date.getMonth() + monthsToAdd);
  return date.toISOString();
}

export function generateWhatsAppReminderUrl(memberName: string, phone: string, daysRemaining: number, expiryDate: string, dueAmount: number): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  let messageText = '';
  if (daysRemaining <= 0) {
    messageText = `Hello *${memberName}*, your membership at *Koushik Fitness Kanker* has EXPIRED on *${formatDate(expiryDate)}*. ${dueAmount > 0 ? `Pending dues: *₹${dueAmount}*. ` : ''}Please renew today to continue your workout uninterrupted! 🏋️‍♂️💪 Call/Visit us or pay via UPI: koushikfitness@upi.`;
  } else {
    messageText = `Namaste *${memberName}*! This is a gentle reminder from *Koushik Fitness Kanker* that your active membership expires in *${daysRemaining} day${daysRemaining > 1 ? 's' : ''}* (on *${formatDate(expiryDate)}*). ${dueAmount > 0 ? `Pending dues: *₹${dueAmount}*. ` : ''}Renew early to keep your fitness momentum going! 🏋️‍♂️🔥`;
  }

  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;
}
