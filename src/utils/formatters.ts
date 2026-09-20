import { MembershipDuration, PTPackageDuration, MembershipPlan, PTPlan } from '../types';

export const DEFAULT_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: '1_month',
    name: '1 Month Standard (1 माह सामान्य)',
    durationMonths: 1,
    price: 1200,
    badge: 'Monthly',
    description: 'पूर्ण जिम फ्लोर एक्सेस, कार्डियो एवं स्ट्रेंथ जोन',
    features: ['फुल जिम फ्लोर एक्सेस', 'कार्डियो व स्ट्रेंथ इक्विपमेंट', 'लॉकर सुविधा', 'वॉटर डिस्पेंसर'],
    isActive: true,
  },
  {
    id: '3_months',
    name: '3 Months Quarter (3 माह त्रैमासिक)',
    durationMonths: 3,
    price: 3200,
    badge: 'Popular',
    description: '3 महीने की सदस्यता + वर्कआउट रूटीन चार्ट',
    features: ['सभी जिम जोन एक्सेस', 'मुफ्त वर्कआउट चार्ट', 'बॉडी वेट ट्रैकिंग', 'लॉकर सुविधा'],
    isActive: true,
  },
  {
    id: '6_months',
    name: '6 Months Half-Year (6 माह अर्धवार्षिक)',
    durationMonths: 6,
    price: 5800,
    badge: 'Save ₹1,400',
    description: '6 महीने की सदस्यता + डायट परामर्श एवं प्रगति ट्रैकिंग',
    features: ['सभी उपकरण व कार्डियो', 'डायट एवं न्यूट्रिशन गाइडेंस', 'मासिक बॉडी कंपोजिशन चेक', 'लॉकर सुविधा'],
    isActive: true,
  },
  {
    id: '1_year',
    name: '1 Year Annual Gold (1 वर्ष वार्षिक गोल्ड)',
    durationMonths: 12,
    price: 9999,
    badge: 'Best Value',
    description: 'वार्षिक वीआईपी सदस्यता + पर्सनल फिटनेस गाइडेंस',
    features: ['365 दिन असीमित प्रवेश', 'मुफ्त डायट व न्यूट्रिशन चार्ट', 'प्राथमिकता लॉकर', 'मुफ्त गेस्ट पास'],
    isActive: true,
  },
];

export const DEFAULT_PT_PLANS: PTPlan[] = [
  {
    id: '1_month',
    name: '1 Month Personal Training (1 माह व्यक्तिगत प्रशिक्षण)',
    durationMonths: 1,
    price: 2500,
    badge: '1-on-1',
    sessionsPerWeek: 6,
    description: 'प्रमाणित ट्रेनर के मार्गदर्शन में व्यक्तिगत वर्कआउट',
    features: ['प्रतिदिन 1-ऑन-1 ट्रेनर मार्गदर्शन', 'पोश्चर एवं फॉर्म सुधार', 'कस्टम वर्कआउट स्प्लिट'],
    isActive: true,
  },
  {
    id: '3_months',
    name: '3 Months Transformation PT (3 माह बॉडी ट्रांसफॉर्मेशन)',
    durationMonths: 3,
    price: 6500,
    badge: 'Best Results',
    sessionsPerWeek: 6,
    description: 'वजन घटाने/बढ़ाने हेतु संपूर्ण ट्रांसफॉर्मेशन पैकेज',
    features: ['पर्सनल ट्रेनर सपोर्ट', 'साप्ताहिक डायट चार्ट बदलाव', 'बॉडी फैट व इंच लॉस ट्रैकिंग'],
    isActive: true,
  },
  {
    id: '6_months',
    name: '6 Months Pro Athlete PT (6 माह प्रो एथलीट)',
    durationMonths: 6,
    price: 12000,
    badge: 'Elite Pro',
    sessionsPerWeek: 6,
    description: 'उन्नत स्ट्रेंथ, पावरलिफ्टिंग एवं बॉडीबिल्डिंग प्रशिक्षण',
    features: ['एडवांस्ड स्ट्रेंथ कोचिंग', 'मैक्रोन्यूट्रिएंट प्लानिंग', 'इंजरी प्रिवेंशन एवं रिकवरी'],
    isActive: true,
  },
  {
    id: 'none',
    name: 'No Personal Training (केवल जिम)',
    durationMonths: 0,
    price: 0,
    badge: 'Self',
    sessionsPerWeek: 0,
    description: 'सामान्य जिम मेंटॉरशिप के साथ स्वयं वर्कआउट',
    features: ['जिम फ्लोर ट्रेनर सहायता उपलब्ध'],
    isActive: true,
  },
];

export function getSavedMembershipPlans(): MembershipPlan[] {
  try {
    const raw = localStorage.getItem('kf_membership_plans');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse kf_membership_plans', e);
  }
  return DEFAULT_MEMBERSHIP_PLANS;
}

export function getSavedPTPlans(): PTPlan[] {
  try {
    const raw = localStorage.getItem('kf_pt_plans');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse kf_pt_plans', e);
  }
  return DEFAULT_PT_PLANS;
}

function buildMembershipRecord(): Record<string, { label: string; months: number; price: number; badge: string }> {
  const plans = getSavedMembershipPlans();
  const map: Record<string, { label: string; months: number; price: number; badge: string }> = {};
  for (const p of plans) {
    if (p.isActive !== false) {
      map[p.id] = {
        label: p.name,
        months: p.durationMonths,
        price: p.price,
        badge: p.badge || '',
      };
    }
  }
  return map;
}

function buildPTRecord(): Record<string, { label: string; months: number; price: number }> {
  const plans = getSavedPTPlans();
  const map: Record<string, { label: string; months: number; price: number }> = {};
  for (const p of plans) {
    if (p.isActive !== false) {
      map[p.id] = {
        label: p.name,
        months: p.durationMonths,
        price: p.price,
      };
    }
  }
  if (!map['none']) {
    map['none'] = { label: 'No Personal Training', months: 0, price: 0 };
  }
  return map;
}

export const MEMBERSHIP_PRICING: Record<MembershipDuration, { label: string; months: number; price: number; badge: string }> = new Proxy(
  {} as Record<MembershipDuration, { label: string; months: number; price: number; badge: string }>,
  {
    get(_target, prop: string) {
      const rec = buildMembershipRecord();
      return rec[prop] || { label: prop.replace(/_/g, ' ').toUpperCase(), months: 1, price: 1200, badge: '' };
    },
    ownKeys() {
      const rec = buildMembershipRecord();
      return Reflect.ownKeys(rec);
    },
    getOwnPropertyDescriptor(_target, prop) {
      const rec = buildMembershipRecord();
      if (prop in rec) {
        return {
          configurable: true,
          enumerable: true,
          value: rec[prop as string],
          writable: true,
        };
      }
      return undefined;
    },
    has(_target, prop) {
      const rec = buildMembershipRecord();
      return prop in rec;
    },
  }
);

export const PT_PRICING: Record<PTPackageDuration, { label: string; months: number; price: number }> = new Proxy(
  {} as Record<PTPackageDuration, { label: string; months: number; price: number }>,
  {
    get(_target, prop: string) {
      const rec = buildPTRecord();
      return rec[prop] || { label: prop.replace(/_/g, ' ').toUpperCase(), months: 0, price: 0 };
    },
    ownKeys() {
      const rec = buildPTRecord();
      return Reflect.ownKeys(rec);
    },
    getOwnPropertyDescriptor(_target, prop) {
      const rec = buildPTRecord();
      if (prop in rec) {
        return {
          configurable: true,
          enumerable: true,
          value: rec[prop as string],
          writable: true,
        };
      }
      return undefined;
    },
    has(_target, prop) {
      const rec = buildPTRecord();
      return prop in rec;
    },
  }
);

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
