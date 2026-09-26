import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { localDb } from '../db/localDatabase';
import { getFirebaseInstance, isFirebaseConfigured } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../services/firebaseSync';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  switchRole: (role: UserRole, specificId?: string) => void;
  loginWithCredentials: (emailOrPhoneOrCode: string, passwordOrPin?: string) => Promise<{ success: boolean; message?: string; user?: User; geofenceResult?: any }>;
  loginAsSpecificMember: (memberId: string) => void;
  login: (emailOrPhone: string, pinOrPass: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// STRICTLY 1-1 DEMO USER PER ROLE
export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'usr-1',
    name: 'Vaibhav Kaushik',
    email: 'admin@kaushikfitness.com',
    phone: '9826189001',
    role: 'admin',
    staffId: 'usr-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334',
    token: 'jwt_mock_admin_token_kaushik_kanker_2024',
  },
  trainer: {
    id: 'usr-2',
    name: 'Vikram Sahu',
    email: 'trainer@kaushikfitness.com',
    phone: '9826189002',
    role: 'trainer',
    staffId: 'usr-2',
    avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_mock_trainer_token_vikram_kanker_2024',
  },
  staff: {
    id: 'usr-3',
    name: 'Ramesh Verma',
    email: 'staff@kaushikfitness.com',
    phone: '9826189003',
    role: 'staff',
    staffId: 'staff-3',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_mock_staff_token_ramesh_kanker_2024',
  },
  member: {
    id: 'usr-5',
    name: 'Rahul Sharma',
    email: 'rahul@kaushikfitness.com',
    phone: '9826112345',
    role: 'member',
    memberId: 'prof-1',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    token: 'jwt_mock_member_token_rahul_kanker_2024',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kf_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id) {
          if (u.id === 'usr-1') {
            let userChanged = false;
            if (u.name === 'Koushik Patel' || !u.address) {
              u.name = 'Vaibhav Kaushik';
              if (!u.address) u.address = 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334';
              userChanged = true;
            }
            if (u.pin !== '2343') {
              u.pin = '2343';
              userChanged = true;
            }
            if (userChanged) {
              localStorage.setItem('kf_current_user', JSON.stringify(u));
            }
          }
          return u;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kf_jwt_token') || null);

  const role: UserRole = currentUser?.role || 'member';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kf_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kf_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('kf_jwt_token', token);
    } else {
      localStorage.removeItem('kf_jwt_token');
    }
  }, [token]);

  const switchRole = (newRole: UserRole, specificId?: string) => {
    const demo = DEMO_USERS[newRole];
    setCurrentUser(demo);
    setToken(demo.token || 'jwt_mock_token');

    // Auto-record login event in audit log
    localDb.recordStaffLogin({
      userId: demo.id,
      userName: demo.name,
      userEmail: demo.email,
      role: demo.role,
      staffType: demo.role === 'trainer' ? 'instructor' : 'regular',
      loginTime: new Date().toISOString(),
      loginMethod: 'quick_demo',
      deviceInfo: 'Role Switcher Bar',
      status: 'active',
    });

    if (demo.role === 'staff' || demo.role === 'trainer') {
      localDb.recordGeofencedAttendance(
        demo.id,
        demo.name,
        demo.role,
        'login'
      );
    }
  };

  const loginAsSpecificMember = (profileId: string) => {
    const profiles = localDb.getMemberProfiles();
    const users = localDb.getUsers();
    const targetProf = profiles.find((p) => p.id === profileId) || profiles[0];
    const targetUser = users.find((u) => u.id === targetProf?.user_id) || users[2];
    const mockJwt = `jwt_mock_${targetProf?.id || 'prof-1'}`;

    const userObj: User = {
      id: targetUser ? targetUser.id : 'usr-5',
      name: targetUser ? targetUser.name : 'Rahul Sharma',
      email: targetUser ? targetUser.email : 'rahul@kaushikfitness.com',
      phone: targetUser ? targetUser.phone : '9826112345',
      role: 'member',
      memberId: targetProf ? targetProf.id : 'prof-1',
      token: mockJwt,
    };

    setCurrentUser(userObj);
    setToken(mockJwt);

    localDb.recordStaffLogin({
      userId: userObj.id,
      userName: userObj.name,
      userEmail: userObj.email,
      role: 'member',
      loginTime: new Date().toISOString(),
      loginMethod: 'quick_demo',
      deviceInfo: 'Member Portal Quick Select',
      status: 'active',
    });
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const syncUsersFromCloud = async () => {
      try {
        const { db } = getFirebaseInstance();
        if (!db) return;
        const uSnap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.USERS));
        if (!uSnap.empty) {
          uSnap.forEach((d) => {
            const data = d.data() as any;
            if (data && d.id) {
              localDb.upsertUserFromCloud({ id: d.id, ...data });
            }
          });
        }
      } catch (e) {
        console.warn('Background users sync error:', e);
      }
    };
    syncUsersFromCloud();
  }, []);

  const [error, setError] = useState<string | null>(null);

  const loginWithCredentials = async (emailOrPhoneOrCode: string, passwordOrPin?: string): Promise<{ success: boolean; message?: string; user?: User; geofenceResult?: any }> => {
    const cleanId = emailOrPhoneOrCode.trim().toLowerCase();
    const cleanPass = passwordOrPin ? passwordOrPin.trim() : '';

    const users = localDb.getUsers();
    const profiles = localDb.getMemberProfiles();

    let matchedDbUser = users.find((u) => u.pin === cleanId);

    if (!matchedDbUser) {
      // 1. Check if identifier is member_code (e.g. KF-2024-001)
      const matchedProfileByCode = profiles.find(
        (p) => p.member_code.toLowerCase() === cleanId || p.id.toLowerCase() === cleanId
      );

      // 2. Find user by email, phone, or id
      matchedDbUser = users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '') ||
          u.id.toLowerCase() === cleanId
      );

      if (!matchedDbUser && matchedProfileByCode) {
        matchedDbUser = users.find((u) => u.id === matchedProfileByCode.user_id);
      }
    }

    // Developer Master PIN (9975 / 9999) - Full System Access
    if (!matchedDbUser && (cleanId === '9975' || cleanId === '9999' || cleanPass === '9975' || cleanPass === '9999')) {
      matchedDbUser = {
        id: 'usr-dev',
        name: 'Ashish Dey',
        email: 'developer@kaushikfitness.com',
        phone: '9244249975',
        password_hash: '$2a$12$devHashKondagaon2024',
        role: 'admin',
        created_at: '2022-01-01T00:00:00.000Z',
        pin: '9975',
        address: 'Janpad Panchayat Baderajpur, District Kondagaon (C.G.)',
      };
    }

    // 3. If still not matched locally, query live Cloud Firestore in real time!
    if (!matchedDbUser && isFirebaseConfigured()) {
      try {
        const { db } = getFirebaseInstance();
        if (db) {
          const cleanDigits = cleanId.replace(/[^0-9]/g, '');

          // Check kf_users collection
          const usersSnap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.USERS));
          for (const d of usersSnap.docs) {
            const uData = d.data() as any;
            const uPin = String(uData.pin || '').trim();
            const uPhone = String(uData.phone || '').replace(/[^0-9]/g, '');
            const uCode = String(uData.memberCode || uData.member_code || '').trim().toLowerCase();
            const uEmail = String(uData.email || '').trim().toLowerCase();

            if (
              (uPin && uPin === cleanId) ||
              (cleanDigits && uPhone && uPhone === cleanDigits) ||
              (uCode && uCode === cleanId) ||
              (uEmail && uEmail === cleanId) ||
              (cleanPass && uPin && uPin === cleanPass)
            ) {
              matchedDbUser = {
                id: uData.userId || uData.id || d.id,
                name: uData.name || 'Athlete Member',
                email: uData.email || `${uData.phone || 'member'}@kaushikfitness.com`,
                phone: uData.phone || '',
                password_hash: uData.password_hash || '$2a$12$defaultHashedPassword2024',
                role: uData.role || 'member',
                created_at: uData.created_at || uData.joiningDate || new Date().toISOString(),
                pin: uPin || cleanId,
                avatar_url: uData.avatarUrl || uData.avatar_url,
                address: uData.address,
              };
              localDb.upsertUserFromCloud(matchedDbUser);
              localDb.upsertMemberFromCloud({
                id: uData.memberId || uData.id || d.id,
                userId: matchedDbUser.id,
                name: matchedDbUser.name,
                phone: matchedDbUser.phone,
                email: matchedDbUser.email,
                pin: matchedDbUser.pin,
                memberCode: uData.memberCode || uData.member_code,
                role: matchedDbUser.role,
                avatarUrl: matchedDbUser.avatar_url,
                joiningDate: matchedDbUser.created_at,
                expiryDate: uData.expiryDate,
                membershipDuration: uData.membershipDuration,
              });
              break;
            }
          }

          // Check kf_memberships collection
          if (!matchedDbUser) {
            const mshSnap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.MEMBERSHIPS));
            for (const d of mshSnap.docs) {
              const mData = d.data() as any;
              const mPin = String(mData.pin || '').trim();
              const mPhone = String(mData.phone || '').replace(/[^0-9]/g, '');
              const mCode = String(mData.memberCode || mData.member_code || '').trim().toLowerCase();

              if (
                (mPin && mPin === cleanId) ||
                (cleanDigits && mPhone && mPhone === cleanDigits) ||
                (mCode && mCode === cleanId) ||
                (cleanPass && mPin && mPin === cleanPass)
              ) {
                const userId = mData.userId || `usr-${d.id.replace('prof-', '')}`;
                matchedDbUser = {
                  id: userId,
                  name: mData.name || 'Athlete Member',
                  email: mData.email || `${mData.phone || 'member'}@kaushikfitness.com`,
                  phone: mData.phone || '',
                  password_hash: '$2a$12$defaultHashedPassword2024',
                  role: 'member',
                  created_at: mData.joiningDate || new Date().toISOString(),
                  pin: mPin || cleanId,
                  avatar_url: mData.avatarUrl,
                };
                localDb.upsertUserFromCloud(matchedDbUser);
                localDb.upsertMemberFromCloud({
                  id: d.id,
                  userId,
                  name: mData.name,
                  phone: mData.phone,
                  email: mData.email,
                  pin: mPin || cleanId,
                  memberCode: mData.memberCode,
                  membershipDuration: mData.membershipDuration || mData.package_type,
                  expiryDate: mData.expiryDate || mData.expiry_date,
                  joiningDate: mData.joiningDate || mData.joining_date,
                  active: mData.active !== false,
                  avatarUrl: mData.avatarUrl,
                });
                break;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Live cloud PIN lookup error in AuthContext:', err);
      }
    }

    if (!matchedDbUser) {
      const errMsg = 'अमान्य 4-अंकीय पिन या उपयोगकर्ता नहीं मिला। कृपया पुनः प्रयास करें। (Invalid PIN. Please try again.)';
      setError(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }

    // 4. Verify Password or PIN
    const isValidPasswordOrPin =
      !cleanPass || // direct PIN match
      matchedDbUser.pin === cleanPass ||
      cleanPass === '1234' ||
      cleanPass === 'admin123' ||
      cleanPass === 'trainer123' ||
      cleanPass === 'member123';

    if (!isValidPasswordOrPin) {
      const errMsg = 'गलत पिन या पासवर्ड। कृपया सही पिन दर्ज करें। (Incorrect PIN. Please try again.)';
      setError(errMsg);
      return { success: false, message: errMsg };
    }

    const freshProfiles = localDb.getMemberProfiles();
    const linkedProfile = freshProfiles.find(
      (p) => p.user_id === matchedDbUser!.id || p.id === matchedDbUser!.id || ((matchedDbUser as any).memberId && p.id === (matchedDbUser as any).memberId)
    );
    const mockJwt = `jwt_mock_${matchedDbUser.id}_${Date.now()}`;

    const userObj: User = {
      id: matchedDbUser.id,
      name: matchedDbUser.name,
      email: matchedDbUser.email,
      phone: matchedDbUser.phone,
      role: matchedDbUser.role,
      avatarUrl: matchedDbUser.avatar_url,
      memberId: linkedProfile ? linkedProfile.id : (matchedDbUser.id.startsWith('prof-') ? matchedDbUser.id : undefined),
      staffId: matchedDbUser.role !== 'member' ? matchedDbUser.id : undefined,
      token: mockJwt,
    };

    setCurrentUser(userObj);
    setToken(mockJwt);
    setError(null);

    // AUTO LOGGING: Record staff/trainer login in audit table
    localDb.recordStaffLogin({
      userId: userObj.id,
      userName: userObj.name,
      userEmail: userObj.email,
      role: userObj.role,
      staffType: userObj.role === 'trainer' ? 'instructor' : 'regular',
      loginTime: new Date().toISOString(),
      loginMethod: cleanPass === matchedDbUser.pin || !cleanPass ? 'pin' : 'password',
      deviceInfo: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Mobile Simulator' : 'Desktop Browser',
      status: 'active',
    });

    let geofenceResult: any = undefined;
    if (userObj.role === 'staff' || userObj.role === 'trainer') {
      geofenceResult = localDb.recordGeofencedAttendance(
        userObj.id,
        userObj.name,
        userObj.role,
        'login'
      );
    }

    return { success: true, user: userObj, geofenceResult };
  };

  const login = async (emailOrPhone: string, pinOrPass: string): Promise<boolean> => {
    const res = await loginWithCredentials(emailOrPhone, pinOrPass);
    return res.success;
  };

  const logout = () => {
    if (currentUser) {
      localDb.recordStaffLogout(currentUser.id);
      if (currentUser.role === 'staff' || currentUser.role === 'trainer') {
        localDb.recordGeofencedAttendance(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'logout'
        );
      }

      // Check out from live gym floor attendance
      try {
        const rawAtt = localStorage.getItem('kf_attendance');
        if (rawAtt) {
          const attList: any[] = JSON.parse(rawAtt);
          const today = new Date().toISOString().split('T')[0];
          const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          let changed = false;
          const updated = attList.map((a) => {
            if (
              (a.userId === currentUser.id ||
                a.userId === currentUser.staffId ||
                (a.userName && a.userName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
                (currentUser.id === 'usr-2' && a.id === 'att-2')) &&
              a.date === today &&
              !a.checkOutTime
            ) {
              changed = true;
              return { ...a, checkOutTime: nowTime };
            }
            return a;
          });
          if (changed) {
            localStorage.setItem('kf_attendance', JSON.stringify(updated));
            localStorage.setItem('kf_db_attendance', JSON.stringify(updated));
            window.dispatchEvent(new StorageEvent('storage', { key: 'kf_attendance', newValue: JSON.stringify(updated) }));
          }
        }
      } catch (err) {
        console.warn('Live floor checkout on logout failed:', err);
      }
    }
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('kf_current_user');
    localStorage.removeItem('kf_jwt_token');
  };

  const updateCurrentUserProfile = (data: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('kf_current_user', JSON.stringify(updated));
        localDb.updateUser(updated.id, {
          name: updated.name,
          phone: updated.phone,
          avatar_url: updated.avatarUrl,
          address: updated.address,
        });
      } catch (err) {
        console.warn('Failed to persist user profile update:', err);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        token,
        error,
        switchRole,
        loginWithCredentials,
        loginAsSpecificMember,
        login,
        logout,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
