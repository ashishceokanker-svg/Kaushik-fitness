import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { localDb } from '../db/localDatabase';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  switchRole: (role: UserRole, specificId?: string) => void;
  loginWithCredentials: (emailOrPhoneOrCode: string, passwordOrPin?: string) => { success: boolean; message?: string; user?: User; geofenceResult?: any };
  loginAsSpecificMember: (memberId: string) => void;
  login: (emailOrPhone: string, pinOrPass: string) => boolean;
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
          if (u.id === 'usr-1' && (u.name === 'Koushik Patel' || !u.address)) {
            u.name = 'Vaibhav Kaushik';
            if (!u.address) u.address = 'मेन रोड, नया बस स्टैंड के पास, कांकेर (छ.ग.) - 494334';
            localStorage.setItem('kf_current_user', JSON.stringify(u));
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

  const [error, setError] = useState<string | null>(null);

  const loginWithCredentials = (emailOrPhoneOrCode: string, passwordOrPin?: string) => {
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

    if (!matchedDbUser) {
      const errMsg = 'अमान्य 4-अंकीय पिन या उपयोगकर्ता नहीं मिला। कृपया पुनः प्रयास करें। (Invalid PIN. Please try again.)';
      setError(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }

    // 3. Verify Password or PIN
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

    const linkedProfile = profiles.find((p) => p.user_id === matchedDbUser!.id);
    const mockJwt = `jwt_mock_${matchedDbUser.id}_${Date.now()}`;

    const userObj: User = {
      id: matchedDbUser.id,
      name: matchedDbUser.name,
      email: matchedDbUser.email,
      phone: matchedDbUser.phone,
      role: matchedDbUser.role,
      avatarUrl: matchedDbUser.avatar_url,
      memberId: linkedProfile ? linkedProfile.id : (matchedDbUser.role === 'member' ? 'prof-1' : undefined),
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

  const login = (emailOrPhone: string, pinOrPass: string): boolean => {
    const res = loginWithCredentials(emailOrPhone, pinOrPass);
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
