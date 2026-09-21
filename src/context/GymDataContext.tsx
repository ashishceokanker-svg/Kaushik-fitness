import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Member,
  Staff,
  AttendanceRecord,
  FinancialTransaction,
  ProgressLog,
  MembershipDuration,
  PTPackageDuration,
  PaymentMethod,
  BodyIndexLog,
  BodyPhotoLog,
  GymEnquiry,
  SupplementItem,
  SupplementSaleTransaction,
  MembershipPlan,
  PTPlan,
} from '../types';
import { localDb } from '../db/localDatabase';
import {
  INITIAL_ATTENDANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_PROGRESS_LOGS,
} from '../data/initialData';
import {
  calculateCountdown,
  calculateExpiryDate,
  MEMBERSHIP_PRICING,
  PT_PRICING,
  getSavedMembershipPlans,
  getSavedPTPlans,
  DEFAULT_MEMBERSHIP_PLANS,
  DEFAULT_PT_PLANS,
} from '../utils/formatters';
import { isFirebaseConfigured, getFirebaseInstance } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  syncDocToFirestore,
  deleteDocFromFirestore,
  subscribeToLiveCollection,
  FIRESTORE_COLLECTIONS,
} from '../services/firebaseSync';

interface GymDataContextType {
  // Cloud Synchronization
  isCloudSynced: boolean;
  refreshFromLocal: () => void;
  members: Member[];
  staff: Staff[];
  attendance: AttendanceRecord[];
  transactions: FinancialTransaction[];
  progressLogs: ProgressLog[];
  bodyIndexLogs: BodyIndexLog[];
  bodyPhotoLogs: BodyPhotoLog[];
  enquiries: GymEnquiry[];
  
  // Member actions
  addMember: (memberData: Omit<Member, 'id' | 'memberCode' | 'pin'> & { pin?: string }) => Member;
  updateMember: (id: string, data: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  renewMember: (
    id: string,
    duration: MembershipDuration,
    ptDuration?: PTPackageDuration,
    discount?: number,
    paidAmount?: number,
    discountType?: 'flat' | 'percentage'
  ) => void;
  
  // Staff actions
  addStaff: (staffData: Omit<Staff, 'id' | 'staffCode' | 'userId'> & { pin?: string }) => Staff;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // Attendance actions
  markAttendance: (identifier: string, method?: 'pin') => Promise<{ success: boolean; message: string; record?: AttendanceRecord; personName?: string }>;
  checkOutPerson: (recordId: string, customTime?: string) => void;
  checkOutByUserId: (identifier: string, customTime?: string) => void;
  checkOutAllActive: () => void;

  // Financial actions
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'transactionNumber' | 'date'>) => FinancialTransaction;
  
  // Progress log actions
  addProgressLog: (log: Omit<ProgressLog, 'id'>) => ProgressLog;

  // Body Index & Physical Changes Tracker
  getBodyIndexLogs: (memberId: string) => BodyIndexLog[];
  addBodyIndexLog: (log: Omit<BodyIndexLog, 'id'>) => BodyIndexLog;

  // 4-Side Body Photo Tracker & Comparison
  getBodyPhotoLogs: (memberId: string) => BodyPhotoLog[];
  saveBodyPhotoLog: (log: Omit<BodyPhotoLog, 'id' | 'createdAt'> & { id?: string }) => BodyPhotoLog;
  deleteBodyPhotoLog: (id: string) => void;

  // Gym Enquiries / Leads
  addEnquiry: (enquiry: Omit<GymEnquiry, 'id' | 'createdAt' | 'status'>) => GymEnquiry;
  updateEnquiryStatus: (id: string, status: GymEnquiry['status'], followUpNote?: string) => void;

  // Supplements & POS Inventory
  supplements: SupplementItem[];
  supplementSales: SupplementSaleTransaction[];
  addSupplementStock: (id: string, qty: number, newCostPrice?: number) => void;
  sellSupplement: (sale: Omit<SupplementSaleTransaction, 'id' | 'invoiceNumber'>) => SupplementSaleTransaction;
  saveSupplementProduct: (item: SupplementItem) => void;

  // Universal PIN Management
  changeUserPin: (userIdOrMemberId: string, newPin: string) => boolean;

  // Member Activation / Renewal
  activateMember: (memberId: string, duration?: MembershipDuration, customExpiryDate?: string) => void;
  
  // Membership & PT Plans Management (CRUD)
  membershipPlans: MembershipPlan[];
  ptPlans: PTPlan[];
  saveMembershipPlan: (plan: MembershipPlan) => void;
  deleteMembershipPlan: (id: string) => void;
  savePTPlan: (plan: PTPlan) => void;
  deletePTPlan: (id: string) => void;
  resetPlansToDefault: () => void;

  // Reset & Database Export
  resetToDemoData: () => void;
  exportSqlDump: () => string;
  exportJsonDump: () => string;

  // Computed properties
  liveGymCount: number;
  expiringSoonMembers: Member[];
  expiredMembers: Member[];
  totalActiveMembers: number;
  totalMonthlyRevenue: number;
  totalMonthlyExpenses: number;
  totalPendingDues: number;
}

const GymDataContext = createContext<GymDataContextType | undefined>(undefined);

export const GymDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Members loaded directly via relational join
  const [members, setMembers] = useState<Member[]>(() => localDb.getJoinedMembers());

  // Staff loaded from users table
  const [staff, setStaff] = useState<Staff[]>(() => localDb.getStaffMembers());

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('kf_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('kf_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>(() => {
    const saved = localStorage.getItem('kf_progress_logs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_LOGS;
  });

  const [bodyIndexLogs, setBodyIndexLogs] = useState<BodyIndexLog[]>(() => {
    // Return all body index logs from all members
    const profs = localDb.getMemberProfiles();
    return profs.flatMap((p) => localDb.getBodyIndexLogs(p.id));
  });

  const [bodyPhotoLogs, setBodyPhotoLogs] = useState<BodyPhotoLog[]>(() => localDb.getAllBodyPhotoLogs());

  const [enquiries, setEnquiries] = useState<GymEnquiry[]>(() => localDb.getEnquiries());

  // Supplement inventory and sales states
  const [supplements, setSupplements] = useState<SupplementItem[]>(() => localDb.getSupplements());
  const [supplementSales, setSupplementSales] = useState<SupplementSaleTransaction[]>(() => localDb.getSupplementSales());

  // Membership & PT Plans Management (CRUD)
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(() => getSavedMembershipPlans());
  const [ptPlans, setPtPlans] = useState<PTPlan[]>(() => getSavedPTPlans());

  useEffect(() => {
    localStorage.setItem('kf_membership_plans', JSON.stringify(membershipPlans));
  }, [membershipPlans]);

  useEffect(() => {
    localStorage.setItem('kf_pt_plans', JSON.stringify(ptPlans));
  }, [ptPlans]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kf_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('kf_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kf_progress_logs', JSON.stringify(progressLogs));
  }, [progressLogs]);

  // Real-time cross-tab synchronization: Listen to localStorage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kf_attendance' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setAttendance(parsed);
          }
        } catch (err) {
          console.warn('Error parsing storage sync for kf_attendance:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(() => isFirebaseConfigured());

  const refreshFromLocal = () => {
    setMembers(localDb.getJoinedMembers());
    setStaff(localDb.getStaffMembers());
    const savedAtt = localStorage.getItem('kf_attendance');
    if (savedAtt) setAttendance(JSON.parse(savedAtt));
    const savedTx = localStorage.getItem('kf_transactions');
    if (savedTx) setTransactions(JSON.parse(savedTx));
    setSupplements(localDb.getSupplements());
    setSupplementSales(localDb.getSupplementSales());
    setEnquiries(localDb.getEnquiries());
    setIsCloudSynced(isFirebaseConfigured());
  };

  // Subscribe to real-time live updates and perform initial sync if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    setIsCloudSynced(true);

    // Initial immediate parallel fetch from Cloud Firestore on mount
    const initialSyncFromCloud = async () => {
      try {
        const { db } = getFirebaseInstance();
        if (!db) return;

        // Fetch all primary collections in parallel
        const [usersSnap, membersSnap, profSnap, attSnap, txSnap, mPlansSnap, ptPlansSnap, bpSnap] = await Promise.allSettled([
          getDocs(collection(db, FIRESTORE_COLLECTIONS.USERS)),
          getDocs(collection(db, FIRESTORE_COLLECTIONS.MEMBERSHIPS)),
          getDocs(collection(db, FIRESTORE_COLLECTIONS.MEMBER_PROFILES)),
          getDocs(collection(db, FIRESTORE_COLLECTIONS.ATTENDANCE)),
          getDocs(collection(db, FIRESTORE_COLLECTIONS.TRANSACTIONS)),
          getDocs(collection(db, FIRESTORE_COLLECTIONS.MEMBERSHIP_PLANS)),
          getDocs(collection(db, FIRESTORE_COLLECTIONS.PT_PLANS)),
          getDocs(collection(db, FIRESTORE_COLLECTIONS.BODY_PHOTOS)),
        ]);

        // 1. Process Users (All logins, PINs, Staff, Trainers, Members)
        if (usersSnap.status === 'fulfilled' && !usersSnap.value.empty) {
          usersSnap.value.forEach((d) => {
            const data = d.data() as any;
            if (data && d.id) {
              localDb.upsertUserFromCloud({ id: d.id, ...data });
            }
          });
        }

        // 2. Process Memberships
        if (membersSnap.status === 'fulfilled' && !membersSnap.value.empty) {
          membersSnap.value.forEach((docSnap) => {
            const data = docSnap.data() as Partial<Member>;
            if (data && docSnap.id && (data.name || data.phone || data.memberCode || (data as any).pin)) {
              localDb.upsertMemberFromCloud({ id: docSnap.id, ...data } as Member);
            }
          });
        }

        // 3. Process Member Profiles
        if (profSnap.status === 'fulfilled' && !profSnap.value.empty) {
          profSnap.value.forEach((docSnap) => {
            const data = docSnap.data() as Partial<Member>;
            if (data && docSnap.id && (data.name || data.phone || data.memberCode || (data as any).pin)) {
              localDb.upsertMemberFromCloud({ id: docSnap.id, ...data } as Member);
            }
          });
        }

        setMembers(localDb.getJoinedMembers());
        setStaff(localDb.getStaffMembers());

        // 4. Process Attendance
        if (attSnap.status === 'fulfilled' && !attSnap.value.empty) {
          const attItems: AttendanceRecord[] = [];
          attSnap.value.forEach((d) => attItems.push({ id: d.id, ...d.data() } as AttendanceRecord));
          if (attItems.length > 0) {
            setAttendance(attItems);
            localStorage.setItem('kf_attendance', JSON.stringify(attItems));
            localStorage.setItem('kf_db_attendance', JSON.stringify(attItems));
          }
        }

        // 5. Process Transactions
        if (txSnap.status === 'fulfilled' && !txSnap.value.empty) {
          const txItems: FinancialTransaction[] = [];
          txSnap.value.forEach((d) => txItems.push({ id: d.id, ...d.data() } as FinancialTransaction));
          if (txItems.length > 0) {
            setTransactions(txItems);
            localStorage.setItem('kf_transactions', JSON.stringify(txItems));
            localStorage.setItem('kf_db_transactions', JSON.stringify(txItems));
          }
        }

        // 6. Process Membership Plans
        if (mPlansSnap.status === 'fulfilled' && !mPlansSnap.value.empty) {
          const list: MembershipPlan[] = [];
          mPlansSnap.value.forEach((d) => list.push({ id: d.id, ...d.data() } as MembershipPlan));
          if (list.length > 0) {
            setMembershipPlans(list);
            localStorage.setItem('kf_membership_plans', JSON.stringify(list));
          }
        }

        // 7. Process PT Plans
        if (ptPlansSnap.status === 'fulfilled' && !ptPlansSnap.value.empty) {
          const list: PTPlan[] = [];
          ptPlansSnap.value.forEach((d) => list.push({ id: d.id, ...d.data() } as PTPlan));
          if (list.length > 0) {
            setPtPlans(list);
            localStorage.setItem('kf_pt_plans', JSON.stringify(list));
          }
        }

        // 8. Process Body Photos
        if (bpSnap.status === 'fulfilled' && !bpSnap.value.empty) {
          bpSnap.value.forEach((d) => {
            const data = d.data() as BodyPhotoLog;
            if (data && d.id) {
              localDb.saveBodyPhotoLog({ ...data, id: d.id });
            }
          });
          setBodyPhotoLogs(localDb.getAllBodyPhotoLogs());
        }
      } catch (err) {
        console.warn('Initial cloud fetch error:', err);
      }
    };
    initialSyncFromCloud();

    // Live subscription for incoming members across devices
    const handleIncomingMembers = (items: Array<Partial<Member> & { id?: string }>) => {
      if (items && items.length > 0) {
        items.forEach((item) => {
          if (item && item.id && (item.name || item.phone || item.memberCode || (item as any).pin)) {
            localDb.upsertMemberFromCloud(item as Member);
          }
        });
        setMembers(localDb.getJoinedMembers());
      }
    };

    const unsubMembers = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.MEMBERSHIPS, handleIncomingMembers);
    const unsubProfiles = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.MEMBER_PROFILES, handleIncomingMembers);

    // Live subscription for users & PINs
    const unsubUsers = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.USERS, (items: any[]) => {
      if (items && items.length > 0) {
        items.forEach((item) => {
          if (item && item.id) {
            localDb.upsertUserFromCloud(item);
          }
        });
        setMembers(localDb.getJoinedMembers());
        setStaff(localDb.getStaffMembers());
      }
    });

    const unsubAttendance = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.ATTENDANCE, (items: AttendanceRecord[]) => {
      if (items && items.length > 0) {
        setAttendance((prev) => {
          const map = new Map(prev.map((r) => [r.id, r]));
          items.forEach((item) => {
            const existing = map.get(item.id);
            if (existing) {
              map.set(item.id, { ...existing, ...item });
            } else if (item.userName) {
              map.set(item.id, item);
            }
          });
          const merged = Array.from(map.values());
          localStorage.setItem('kf_attendance', JSON.stringify(merged));
          localStorage.setItem('kf_db_attendance', JSON.stringify(merged));
          return merged;
        });
      }
    });

    const unsubTx = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.TRANSACTIONS, (items: FinancialTransaction[]) => {
      if (items && items.length > 0) {
        setTransactions(items);
        localStorage.setItem('kf_transactions', JSON.stringify(items));
        localStorage.setItem('kf_db_transactions', JSON.stringify(items));
      }
    });

    const unsubSupplements = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.SUPPLEMENTS, (items: SupplementItem[]) => {
      if (items && items.length > 0) {
        setSupplements(items);
        localStorage.setItem('kf_db_supplements', JSON.stringify(items));
      }
    });

    const unsubSales = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.SUPPLEMENT_SALES, (items: SupplementSaleTransaction[]) => {
      if (items && items.length > 0) {
        setSupplementSales(items);
        localStorage.setItem('kf_db_supplement_sales', JSON.stringify(items));
      }
    });

    const unsubMPlans = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.MEMBERSHIP_PLANS, (items: MembershipPlan[]) => {
      if (items && items.length > 0) {
        setMembershipPlans(items);
        localStorage.setItem('kf_membership_plans', JSON.stringify(items));
      }
    });

    const unsubPTPlans = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.PT_PLANS, (items: PTPlan[]) => {
      if (items && items.length > 0) {
        setPtPlans(items);
        localStorage.setItem('kf_pt_plans', JSON.stringify(items));
      }
    });

    const unsubBodyPhotos = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.BODY_PHOTOS, (items: BodyPhotoLog[]) => {
      if (items && items.length > 0) {
        items.forEach((item) => {
          if (item && item.id) {
            localDb.saveBodyPhotoLog(item);
          }
        });
        setBodyPhotoLogs(localDb.getAllBodyPhotoLogs());
      }
    });

    // Auto sync heartbeat & screen wakeup listeners for mobile browsers
    const handleWakeup = () => {
      if (document.visibilityState === 'visible') {
        initialSyncFromCloud();
      }
    };
    window.addEventListener('visibilitychange', handleWakeup);
    window.addEventListener('focus', handleWakeup);
    const syncInterval = setInterval(initialSyncFromCloud, 20000);

    return () => {
      window.removeEventListener('visibilitychange', handleWakeup);
      window.removeEventListener('focus', handleWakeup);
      clearInterval(syncInterval);
      if (unsubMembers) unsubMembers();
      if (unsubProfiles) unsubProfiles();
      if (unsubUsers) unsubUsers();
      if (unsubAttendance) unsubAttendance();
      if (unsubTx) unsubTx();
      if (unsubSupplements) unsubSupplements();
      if (unsubSales) unsubSales();
      if (unsubMPlans) unsubMPlans();
      if (unsubPTPlans) unsubPTPlans();
      if (unsubBodyPhotos) unsubBodyPhotos();
    };
  }, []);

  // Member CRUD using local relational database
  const addMember = (memberData: Omit<Member, 'id' | 'memberCode' | 'pin'> & { pin?: string }): Member => {
    const registered = localDb.registerMember({
      name: memberData.name,
      email: memberData.email,
      phone: memberData.phone,
      age: memberData.age,
      gender: memberData.gender,
      heightCm: memberData.heightCm,
      weightKg: memberData.weightKg,
      targetWeightKg: memberData.targetWeightKg,
      fitnessGoal: memberData.fitnessGoal,
      emergencyContact: memberData.emergencyContact,
      medicalConditions: memberData.medicalConditions,
      duration: memberData.membershipDuration,
      hasPT: memberData.personalTraining,
      ptDuration: memberData.ptDuration,
      assignedTrainerId: memberData.assignedTrainerId,
      discountType: memberData.discountType,
      discountValue: memberData.discountValue,
      initialPayment: memberData.paidAmount,
      paymentMethod: memberData.paymentMethod,
      workoutSlot: memberData.workoutSlot,
      avatarUrl: memberData.avatarUrl,
      pin: memberData.pin,
    });

    setMembers(localDb.getJoinedMembers());

    // Async sync to Firestore
    syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIPS, registered.id, registered);
    syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBER_PROFILES, registered.id, registered);
    if (registered.userId) {
      syncDocToFirestore(FIRESTORE_COLLECTIONS.USERS, registered.userId, {
        id: registered.userId,
        name: registered.name,
        email: registered.email,
        phone: registered.phone,
        role: 'member',
        pin: registered.pin,
        created_at: registered.joiningDate,
        avatar_url: registered.avatarUrl,
      });
    }

    // Automatically record revenue transaction if payment was made
    if (registered.paidAmount > 0) {
      addTransaction({
        type: 'revenue',
        category: registered.personalTraining ? 'pt_fee' : 'membership_fee',
        amount: registered.paidAmount,
        memberId: registered.id,
        memberName: registered.name,
        paymentMethod: registered.paymentMethod,
        paymentStatus: 'completed',
        description: `New Registration - ${MEMBERSHIP_PRICING[registered.membershipDuration]?.label}${registered.personalTraining ? ' + PT' : ''}`,
      });
    }

    return registered;
  };

  const updateMember = (id: string, data: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    localDb.upsertMemberFromCloud({ id, ...data });
    syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIPS, id, data);
    syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBER_PROFILES, id, data);
  };

  const deleteMember = (id: string) => {
    const existingMember = members.find((m) => m.id === id || m.userId === id);
    const userId = existingMember?.userId;
    const profileId = existingMember?.id || id;

    // 1. Delete from local database permanently
    localDb.deleteMember(profileId);
    if (userId) {
      localDb.deleteMember(userId);
    }

    // 2. Immediately update state with fresh local database data
    setMembers(localDb.getJoinedMembers());

    // 3. Delete from Firestore cloud collections
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIPS, profileId);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIPS, `msh-${profileId}`);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.MEMBER_PROFILES, profileId);
    if (userId && userId !== 'usr-1' && userId !== 'usr-dev') {
      deleteDocFromFirestore(FIRESTORE_COLLECTIONS.USERS, userId);
    }
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.USERS, profileId);
  };

  const renewMember = (
    id: string,
    duration: MembershipDuration,
    ptDuration: PTPackageDuration = 'none',
    discount: number = 0,
    paidAmount: number = 0,
    discountType: 'flat' | 'percentage' = 'flat'
  ) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const mPlan = membershipPlans.find((p) => p.id === duration);
    const baseFee = mPlan ? mPlan.price : (MEMBERSHIP_PRICING[duration]?.price || 1200);
    const pPlan = ptPlans.find((p) => p.id === ptDuration);
    const ptFee = pPlan ? pPlan.price : (PT_PRICING[ptDuration]?.price || 0);
    const subtotal = baseFee + ptFee;
    const discountAmt =
      discountType === 'percentage'
        ? Math.round((subtotal * discount) / 100)
        : Math.min(subtotal, discount);
    const totalPayable = Math.max(0, subtotal - discountAmt);
    const paid = paidAmount > 0 ? paidAmount : totalPayable;
    const dueAmount = Math.max(0, totalPayable - paid);

    const nowIso = new Date().toISOString();
    const baseDate = new Date(member.expiryDate) > new Date() ? member.expiryDate : nowIso;
    const newExpiry = calculateExpiryDate(baseDate, duration);

    const updated: Partial<Member> = {
      membershipDuration: duration,
      expiryDate: newExpiry,
      personalTraining: ptDuration !== 'none',
      ptDuration,
      baseFee,
      ptFee,
      discountType,
      discountValue: discount,
      totalPayable,
      paidAmount: paid,
      dueAmount,
      paymentStatus: dueAmount === 0 ? 'paid' : (paid > 0 ? 'partial' : 'pending'),
      lastPaymentDate: nowIso,
      active: true,
    };

    updateMember(id, updated);

    if (paid > 0) {
      addTransaction({
        type: 'revenue',
        category: ptDuration !== 'none' ? 'pt_fee' : 'membership_fee',
        amount: paid,
        memberId: id,
        memberName: member.name,
        paymentMethod: 'upi',
        paymentStatus: 'completed',
        description: `Membership Renewal (${MEMBERSHIP_PRICING[duration].label})`,
      });
    }
  };

  // Staff CRUD
  const addStaff = (staffData: Omit<Staff, 'id' | 'staffCode' | 'userId'> & { pin?: string }): Staff => {
    const newStaff = localDb.addStaffUser(staffData);
    setStaff(localDb.getStaffMembers());

    // Instant Cloud Firestore sync for multi-device login & attendance
    if (isFirebaseConfigured()) {
      syncDocToFirestore(FIRESTORE_COLLECTIONS.USERS, newStaff.userId || newStaff.id, {
        id: newStaff.userId || newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        password_hash: '$2a$12$defaultHashedPassword2024',
        role: newStaff.role,
        created_at: new Date().toISOString(),
        pin: newStaff.pin,
        avatar_url: newStaff.avatarUrl,
        address: newStaff.address,
      });
    }

    return newStaff;
  };

  const updateStaff = (id: string, data: Partial<Staff>) => {
    const updatedStaff = localDb.updateStaff(id, data);
    setStaff(localDb.getStaffMembers());
    setMembers(localDb.getJoinedMembers());

    if (updatedStaff) {
      const uId = updatedStaff.userId || updatedStaff.id;
      syncDocToFirestore(FIRESTORE_COLLECTIONS.USERS, uId, {
        id: uId,
        name: updatedStaff.name,
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        role: updatedStaff.role,
        pin: updatedStaff.pin,
        avatar_url: updatedStaff.avatarUrl,
        address: updatedStaff.address,
      });
      syncDocToFirestore('kf_staff_profiles', updatedStaff.id, updatedStaff);
    }
  };

  const deleteStaff = (id: string) => {
    if (id === 'usr-1' || id === 'staff-1' || id === 'usr-dev') {
      alert('संस्थापक / मुख्य निदेशक प्रोफाइल को हटाया नहीं जा सकता।');
      return;
    }

    const staffMember = staff.find((s) => s.id === id || s.userId === id);
    const userId = staffMember?.userId || id;
    const staffId = staffMember?.id || id;

    // 1. Delete from local database
    localDb.deleteStaff(id);
    if (userId && userId !== id) {
      localDb.deleteStaff(userId);
    }

    // 2. Immediately refresh staff and members state
    setStaff(localDb.getStaffMembers());
    setMembers(localDb.getJoinedMembers());

    // 3. Delete from Firestore
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.USERS, userId);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.USERS, staffId);
    deleteDocFromFirestore('kf_staff_profiles', staffId);
    deleteDocFromFirestore('kf_staff_profiles', userId);
  };

  // Attendance (PIN-based entry)
  const markAttendance = async (identifier: string, _method: 'pin' = 'pin'): Promise<{ success: boolean; message: string; record?: AttendanceRecord; personName?: string }> => {
    const trimmed = identifier.trim().toUpperCase();

    // 1. Look in memory or fresh localDb
    let currentMembers = members.length > 0 ? members : localDb.getJoinedMembers();
    let matchedMember = currentMembers.find(
      (m) =>
        m.memberCode.toUpperCase() === trimmed ||
        m.pin === trimmed ||
        m.phone === trimmed ||
        m.id === identifier
    );

    // 2. If not found locally, live query Cloud Firestore (for immediate cross-mobile recognition)
    if (!matchedMember && isFirebaseConfigured()) {
      try {
        const { db } = getFirebaseInstance();
        if (db) {
          const mSnap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.MEMBERSHIPS));
          for (const d of mSnap.docs) {
            const data = d.data() as any;
            const pPin = String(data.pin || '').trim();
            const pCode = String(data.memberCode || data.member_code || '').trim().toUpperCase();
            const pPhone = String(data.phone || '').trim();

            if (pPin === trimmed || pCode === trimmed || pPhone === trimmed || d.id === identifier) {
              localDb.upsertMemberFromCloud({ id: d.id, ...data });
              currentMembers = localDb.getJoinedMembers();
              setMembers(currentMembers);
              matchedMember = currentMembers.find((m) => m.id === d.id || m.pin === trimmed);
              break;
            }
          }

          if (!matchedMember) {
            const uSnap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.USERS));
            for (const d of uSnap.docs) {
              const data = d.data() as any;
              const uPin = String(data.pin || '').trim();
              const uPhone = String(data.phone || '').trim();
              if (uPin === trimmed || uPhone === trimmed || d.id === identifier) {
                localDb.upsertUserFromCloud({ id: d.id, ...data });
                currentMembers = localDb.getJoinedMembers();
                setMembers(currentMembers);
                setStaff(localDb.getStaffMembers());
                matchedMember = currentMembers.find((m) => m.pin === trimmed || m.userId === d.id);
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Live attendance cloud lookup error:', e);
      }
    }

    if (matchedMember) {
      // Automatic PIN disable when membership is expired or inactive
      const isExpired =
        new Date(matchedMember.expiryDate).getTime() < Date.now() ||
        matchedMember.status === 'expired' ||
        !matchedMember.active;

      if (isExpired) {
        return {
          success: false,
          message: `❌ पिन अक्षम है (PIN Disabled)! ${matchedMember.name} की सदस्यता समाप्त हो चुकी है। ऐप लॉक है। कृपया रिसेप्शन या एडमिन से रिन्यू कराएं।`,
          personName: matchedMember.name,
        };
      }

      const todayDate = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const existingToday = attendance.find(
        (a) => a.userId === matchedMember.id && a.date === todayDate && !a.checkOutTime
      );

      if (existingToday) {
        setAttendance((prev) =>
          prev.map((a) => (a.id === existingToday.id ? { ...a, checkOutTime: nowTime } : a))
        );
        syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, existingToday.id, { checkOutTime: nowTime });
        return {
          success: true,
          message: `Checked out successfully! Have a great recovery, ${matchedMember.name}! 👋`,
          record: existingToday,
          personName: matchedMember.name,
        };
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        userId: matchedMember.id,
        userName: matchedMember.name,
        userType: 'member',
        memberCode: matchedMember.memberCode,
        timestamp: new Date().toISOString(),
        date: todayDate,
        checkInTime: nowTime,
        method: 'pin',
      };

      setAttendance((prev) => [newRecord, ...prev]);
      syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, newRecord.id, newRecord);

      return {
        success: true,
        message: `Welcome to Kaushik Fitness, ${matchedMember.name}! Have an intense workout! 🏋️‍♂️🔥`,
        record: newRecord,
        personName: matchedMember.name,
      };
    }

    // Look for matching staff
    const matchedStaff = staff.find(
      (s) =>
        s.staffCode.toUpperCase() === trimmed ||
        s.pin === trimmed ||
        s.phone === trimmed ||
        s.id === identifier
    );

    if (matchedStaff) {
      const todayDate = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const existingToday = attendance.find(
        (a) => a.userId === matchedStaff.id && a.date === todayDate && !a.checkOutTime
      );

      if (existingToday) {
        setAttendance((prev) =>
          prev.map((a) => (a.id === existingToday.id ? { ...a, checkOutTime: nowTime } : a))
        );
        syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, existingToday.id, { checkOutTime: nowTime });
        return {
          success: true,
          message: `Staff shift completed! Clocked out: ${matchedStaff.name} (${matchedStaff.designation})`,
          record: existingToday,
          personName: matchedStaff.name,
        };
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        userId: matchedStaff.id,
        userName: matchedStaff.name,
        userType: 'staff',
        staffCode: matchedStaff.staffCode,
        timestamp: new Date().toISOString(),
        date: todayDate,
        checkInTime: nowTime,
        method: 'pin',
      };

      setAttendance((prev) => [newRecord, ...prev]);
      syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, newRecord.id, newRecord);

      return {
        success: true,
        message: `Duty Clock-in Verified: ${matchedStaff.name} (${matchedStaff.designation}) ⏱️`,
        record: newRecord,
        personName: matchedStaff.name,
      };
    }

    return {
      success: false,
      message: 'Invalid Pass or PIN. Member or Staff not found in Kaushik Fitness records.',
    };
  };

  const checkOutPerson = (recordId: string, customTime?: string) => {
    const timeToSet =
      customTime ||
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let updatedRecord: AttendanceRecord | undefined;

    setAttendance((prev) => {
      const next = prev.map((a) => {
        if (a.id === recordId) {
          updatedRecord = { ...a, checkOutTime: timeToSet };
          return updatedRecord;
        }
        return a;
      });
      try {
        localStorage.setItem('kf_attendance', JSON.stringify(next));
        localStorage.setItem('kf_db_attendance', JSON.stringify(next));
      } catch (e) {
        console.warn('Local storage write failed for checkOutPerson:', e);
      }
      return next;
    });

    if (updatedRecord) {
      // If checked-out person is staff/trainer, also clock them out in StaffDailyAttendance
      if (updatedRecord.userType === 'staff' || updatedRecord.staffCode) {
        const sId = updatedRecord.userId || 'usr-2';
        const staffMember = staff.find((s) => s.id === sId || s.staffCode === updatedRecord?.staffCode);
        localDb.recordGeofencedAttendance(
          sId,
          updatedRecord.userName,
          (staffMember?.role as any) || 'trainer',
          'logout'
        );
      }
      syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, recordId, updatedRecord);
    } else {
      syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, recordId, {
        checkOutTime: timeToSet,
      });
    }
  };

  const checkOutByUserId = (identifier: string, customTime?: string) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const rec = attendance.find(
      (a) =>
        (a.userId === identifier ||
          a.userName.trim().toLowerCase() === identifier.trim().toLowerCase() ||
          a.memberCode === identifier ||
          a.staffCode === identifier ||
          (identifier === 'usr-2' && a.id === 'att-2')) &&
        a.date === todayDate &&
        !a.checkOutTime
    );
    if (rec) {
      checkOutPerson(rec.id, customTime);
    }
  };

  const checkOutAllActive = () => {
    const timeToSet = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const todayDate = new Date().toISOString().split('T')[0];
    const activeList = attendance.filter((a) => a.date === todayDate && !a.checkOutTime);

    setAttendance((prev) => {
      const next = prev.map((a) =>
        a.date === todayDate && !a.checkOutTime ? { ...a, checkOutTime: timeToSet } : a
      );
      try {
        localStorage.setItem('kf_attendance', JSON.stringify(next));
        localStorage.setItem('kf_db_attendance', JSON.stringify(next));
      } catch (e) {
        console.warn('Local storage write failed for checkOutAllActive:', e);
      }
      return next;
    });

    activeList.forEach((a) => {
      const updated = { ...a, checkOutTime: timeToSet };
      if (a.userType === 'staff' || a.staffCode) {
        localDb.recordGeofencedAttendance(a.userId || 'usr-2', a.userName, 'trainer', 'logout');
      }
      syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, a.id, updated);
    });
  };

  // Transactions
  const addTransaction = (tx: Omit<FinancialTransaction, 'id' | 'transactionNumber' | 'date'>): FinancialTransaction => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      transactionNumber: `TXN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  // Progress log
  const addProgressLog = (log: Omit<ProgressLog, 'id'>): ProgressLog => {
    const newLog: ProgressLog = {
      ...log,
      id: `prog-${Date.now()}`,
    };
    setProgressLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  // Body Index & Physical Changes Tracker
  const getBodyIndexLogs = (memberId: string): BodyIndexLog[] => {
    return localDb.getBodyIndexLogs(memberId);
  };

  const addBodyIndexLog = (log: Omit<BodyIndexLog, 'id'>): BodyIndexLog => {
    const newLog = localDb.addBodyIndexLog(log);
    // Refresh members and bodyIndexLogs in state
    setMembers(localDb.getJoinedMembers());
    const profs = localDb.getMemberProfiles();
    setBodyIndexLogs(profs.flatMap((p) => localDb.getBodyIndexLogs(p.id)));
    return newLog;
  };

  // 4-Side Body Photo Tracker & Comparison
  const getBodyPhotoLogs = (memberId: string): BodyPhotoLog[] => {
    return localDb.getBodyPhotoLogs(memberId);
  };

  const saveBodyPhotoLog = (log: Omit<BodyPhotoLog, 'id' | 'createdAt'> & { id?: string }): BodyPhotoLog => {
    const saved = localDb.saveBodyPhotoLog(log);
    setBodyPhotoLogs(localDb.getAllBodyPhotoLogs());
    // Cloud sync to Firestore
    syncDocToFirestore(FIRESTORE_COLLECTIONS.BODY_PHOTOS, saved.id, saved);
    return saved;
  };

  const deleteBodyPhotoLog = (id: string): void => {
    localDb.deleteBodyPhotoLog(id);
    setBodyPhotoLogs(localDb.getAllBodyPhotoLogs());
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.BODY_PHOTOS, id);
  };

  // Gym Enquiries / Leads
  const addEnquiry = (enquiry: Omit<GymEnquiry, 'id' | 'createdAt' | 'status'>): GymEnquiry => {
    const newEnq = localDb.addEnquiry(enquiry);
    setEnquiries(localDb.getEnquiries());
    return newEnq;
  };

  const updateEnquiryStatus = (id: string, status: GymEnquiry['status'], followUpNote?: string) => {
    localDb.updateEnquiryStatus(id, status, followUpNote);
    setEnquiries(localDb.getEnquiries());
  };

  // ===============================================================
  // SUPPLEMENT INVENTORY & POS SYSTEM
  // ===============================================================

  const addSupplementStock = (id: string, qty: number, newCostPrice?: number) => {
    localDb.addSupplementStock(id, qty, newCostPrice);
    setSupplements(localDb.getSupplements());
  };

  const sellSupplement = (saleData: Omit<SupplementSaleTransaction, 'id' | 'invoiceNumber'>): SupplementSaleTransaction => {
    const newSale = localDb.recordSupplementSale(saleData);
    setSupplements(localDb.getSupplements());
    setSupplementSales(localDb.getSupplementSales());

    // Record directly in financial ledger as revenue
    const newTx: FinancialTransaction = {
      id: `tx-sup-${Date.now()}`,
      transactionNumber: `TXN-SUP-${String(transactions.length + 1).padStart(3, '0')}`,
      date: newSale.date,
      type: 'revenue',
      category: 'supplement_sale',
      amount: newSale.totalAmount,
      memberName: newSale.buyerName,
      memberId: newSale.buyerMemberId,
      paymentMethod: newSale.paymentMethod,
      paymentStatus: 'completed',
      description: `सप्लीमेंट बिक्री: ${newSale.quantity}x ${newSale.supplementName} (${newSale.buyerName})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    return newSale;
  };

  const saveSupplementProduct = (item: SupplementItem) => {
    localDb.saveSupplement(item);
    setSupplements(localDb.getSupplements());
  };

  // Universal PIN Management (Admin can change anyone's PIN)
  const changeUserPin = (userIdOrMemberId: string, newPin: string): boolean => {
    const success = localDb.updateUserPin(userIdOrMemberId, newPin);
    if (success) {
      setMembers(localDb.getJoinedMembers());
      setStaff(localDb.getStaffMembers());
    }
    return success;
  };

  // Member Activation / Unlocking
  const activateMember = (memberId: string, duration: MembershipDuration = '1_month', customExpiryDate?: string) => {
    localDb.reactivateMember(memberId, duration, customExpiryDate);
    setMembers(localDb.getJoinedMembers());
  };

  // Membership & PT Plans Management (CRUD)
  const saveMembershipPlan = (plan: MembershipPlan) => {
    setMembershipPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === plan.id);
      let updated: MembershipPlan[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...plan, updatedAt: new Date().toISOString() };
      } else {
        updated = [...prev, { ...plan, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      }
      localStorage.setItem('kf_membership_plans', JSON.stringify(updated));
      syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIP_PLANS, plan.id, plan);
      return updated;
    });
  };

  const deleteMembershipPlan = (id: string) => {
    setMembershipPlans((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('kf_membership_plans', JSON.stringify(updated));
      deleteDocFromFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIP_PLANS, id);
      return updated;
    });
  };

  const savePTPlan = (plan: PTPlan) => {
    setPtPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === plan.id);
      let updated: PTPlan[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...plan, updatedAt: new Date().toISOString() };
      } else {
        updated = [...prev, { ...plan, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      }
      localStorage.setItem('kf_pt_plans', JSON.stringify(updated));
      syncDocToFirestore(FIRESTORE_COLLECTIONS.PT_PLANS, plan.id, plan);
      return updated;
    });
  };

  const deletePTPlan = (id: string) => {
    setPtPlans((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('kf_pt_plans', JSON.stringify(updated));
      deleteDocFromFirestore(FIRESTORE_COLLECTIONS.PT_PLANS, id);
      return updated;
    });
  };

  const resetPlansToDefault = () => {
    setMembershipPlans(DEFAULT_MEMBERSHIP_PLANS);
    setPtPlans(DEFAULT_PT_PLANS);
    localStorage.setItem('kf_membership_plans', JSON.stringify(DEFAULT_MEMBERSHIP_PLANS));
    localStorage.setItem('kf_pt_plans', JSON.stringify(DEFAULT_PT_PLANS));
    for (const p of DEFAULT_MEMBERSHIP_PLANS) {
      syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIP_PLANS, p.id, p);
    }
    for (const p of DEFAULT_PT_PLANS) {
      syncDocToFirestore(FIRESTORE_COLLECTIONS.PT_PLANS, p.id, p);
    }
  };

  const resetToDemoData = () => {
    localDb.resetDatabase();
    setMembers(localDb.getJoinedMembers());
    setStaff(localDb.getStaffMembers());
    setAttendance(INITIAL_ATTENDANCE);
    setTransactions(INITIAL_TRANSACTIONS);
    setProgressLogs(INITIAL_PROGRESS_LOGS);
    setSupplements(localDb.getSupplements());
    setSupplementSales(localDb.getSupplementSales());
    const profs = localDb.getMemberProfiles();
    setBodyIndexLogs(profs.flatMap((p) => localDb.getBodyIndexLogs(p.id)));
    setEnquiries(localDb.getEnquiries());
    localStorage.removeItem('kf_attendance');
    localStorage.removeItem('kf_transactions');
    localStorage.removeItem('kf_progress_logs');
  };

  // Computed values
  const todayDate = new Date().toISOString().split('T')[0];
  const liveGymCount = attendance.filter((a) => a.date === todayDate && !a.checkOutTime).length;

  const expiringSoonMembers = members.filter((m) => {
    const cd = calculateCountdown(m.expiryDate);
    return !cd.isExpired && cd.isExpiringSoon;
  });

  const expiredMembers = members.filter((m) => {
    const cd = calculateCountdown(m.expiryDate);
    return cd.isExpired;
  });

  const totalActiveMembers = members.filter((m) => {
    const cd = calculateCountdown(m.expiryDate);
    return !cd.isExpired;
  });

  const totalMonthlyRevenue = transactions
    .filter((t) => t.type === 'revenue' && t.paymentStatus === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.paymentStatus === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPendingDues = members.reduce((sum, m) => sum + (m.dueAmount || 0), 0);

  return (
    <GymDataContext.Provider
      value={{
        isCloudSynced,
        refreshFromLocal,
        members,
        staff,
        attendance,
        transactions,
        progressLogs,
        bodyIndexLogs,
        enquiries,
        addMember,
        updateMember,
        deleteMember,
        renewMember,
        addStaff,
        updateStaff,
        deleteStaff,
        markAttendance,
        checkOutPerson,
        checkOutByUserId,
        checkOutAllActive,
        addTransaction,
        addProgressLog,
        getBodyIndexLogs,
        addBodyIndexLog,
        bodyPhotoLogs,
        getBodyPhotoLogs,
        saveBodyPhotoLog,
        deleteBodyPhotoLog,
        addEnquiry,
        updateEnquiryStatus,
        supplements,
        supplementSales,
        addSupplementStock,
        sellSupplement,
        saveSupplementProduct,
        changeUserPin,
        activateMember,
        membershipPlans,
        ptPlans,
        saveMembershipPlan,
        deleteMembershipPlan,
        savePTPlan,
        deletePTPlan,
        resetPlansToDefault,
        resetToDemoData,
        exportSqlDump: () => localDb.exportSqlDump(),
        exportJsonDump: () => localDb.exportJsonDump(),
        liveGymCount,
        expiringSoonMembers,
        expiredMembers,
        totalActiveMembers: totalActiveMembers.length,
        totalMonthlyRevenue,
        totalMonthlyExpenses,
        totalPendingDues,
      }}
    >
      {children}
    </GymDataContext.Provider>
  );
};

export const useGymData = () => {
  const context = useContext(GymDataContext);
  if (!context) {
    throw new Error('useGymData must be used within a GymDataProvider');
  }
  return context;
};
