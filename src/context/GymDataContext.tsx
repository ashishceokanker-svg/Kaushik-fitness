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
} from '../types';
import { localDb } from '../db/localDatabase';
import {
  INITIAL_ATTENDANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_PROGRESS_LOGS,
} from '../data/initialData';
import { calculateCountdown, calculateExpiryDate, MEMBERSHIP_PRICING, PT_PRICING } from '../utils/formatters';
import { isFirebaseConfigured } from '../services/firebase';
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
  enquiries: GymEnquiry[];
  
  // Member actions
  addMember: (memberData: Omit<Member, 'id' | 'memberCode' | 'pin'>) => Member;
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
  addStaff: (staffData: Omit<Staff, 'id' | 'staffCode' | 'pin' | 'userId'>) => Staff;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // Attendance actions
  markAttendance: (identifier: string, method?: 'pin') => { success: boolean; message: string; record?: AttendanceRecord; personName?: string };

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

  const [enquiries, setEnquiries] = useState<GymEnquiry[]>(() => localDb.getEnquiries());

  // Supplement inventory and sales states
  const [supplements, setSupplements] = useState<SupplementItem[]>(() => localDb.getSupplements());
  const [supplementSales, setSupplementSales] = useState<SupplementSaleTransaction[]>(() => localDb.getSupplementSales());

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

  // Subscribe to real-time live updates if Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    setIsCloudSynced(true);

    const unsubMembers = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.MEMBERSHIPS, () => {
      setMembers(localDb.getJoinedMembers());
    });

    const unsubAttendance = subscribeToLiveCollection(FIRESTORE_COLLECTIONS.ATTENDANCE, (items: AttendanceRecord[]) => {
      if (items && items.length > 0) {
        setAttendance(items);
        localStorage.setItem('kf_attendance', JSON.stringify(items));
        localStorage.setItem('kf_db_attendance', JSON.stringify(items));
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

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubAttendance) unsubAttendance();
      if (unsubTx) unsubTx();
      if (unsubSupplements) unsubSupplements();
      if (unsubSales) unsubSales();
    };
  }, []);

  // Member CRUD using local relational database
  const addMember = (memberData: Omit<Member, 'id' | 'memberCode' | 'pin'>): Member => {
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
    });

    setMembers(localDb.getJoinedMembers());

    // Async sync to Firestore
    syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIPS, registered.id, registered);
    if (registered.userId) {
      syncDocToFirestore(FIRESTORE_COLLECTIONS.USERS, registered.userId, registered);
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
    syncDocToFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIPS, id, data);
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.MEMBERSHIPS, id);
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

    const baseFee = MEMBERSHIP_PRICING[duration].price;
    const ptFee = PT_PRICING[ptDuration]?.price || 0;
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
  const addStaff = (staffData: Omit<Staff, 'id' | 'staffCode' | 'pin' | 'userId'>): Staff => {
    const newStaff = localDb.addStaffUser(staffData);
    setStaff(localDb.getStaffMembers());
    return newStaff;
  };

  const updateStaff = (id: string, data: Partial<Staff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  // Attendance (PIN-based entry)
  const markAttendance = (identifier: string, _method: 'pin' = 'pin') => {
    const trimmed = identifier.trim().toUpperCase();

    // Look for matching member
    const matchedMember = members.find(
      (m) =>
        m.memberCode.toUpperCase() === trimmed ||
        m.pin === trimmed ||
        m.phone === trimmed ||
        m.id === identifier
    );

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
    return localDb.saveBodyPhotoLog(log);
  };

  const deleteBodyPhotoLog = (id: string): void => {
    localDb.deleteBodyPhotoLog(id);
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
        addTransaction,
        addProgressLog,
        getBodyIndexLogs,
        addBodyIndexLog,
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
