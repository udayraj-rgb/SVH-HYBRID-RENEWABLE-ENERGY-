import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../api/api';
import { getCampusById } from '../data/campuses';

const AuthContext = createContext(null);

export const DEFAULT_USERS = {
  govt: {
    role: 'ROLE_GOVT',
    username: 'govt_admin',
    name: 'Shri Alok Sharma, IAS',
    designation: 'Director, Technical Education Rajasthan',
    department: 'Directorate of Technical Education (DTE), Jodhpur',
    clearanceLevel: 'STATEWIDE UNRESTRICTED CLEARANCE',
    campusId: null,
  },
  operator: {
    role: 'ROLE_OPERATOR',
    username: 'operator_bikaner',
    name: 'Eng. Rajesh Verma',
    operatorId: 'OP-7701',
    designation: 'Chief Microgrid Engineer & SCADA Director',
    department: 'Campus Electrical & Renewable Infrastructure',
    clearanceLevel: 'LEVEL 4 (CAMPUS SCADA CONTROL)',
    campusId: 1,
    campusName: 'BTU / Govt Engg College Bikaner',
  },
  student1: {
    role: 'ROLE_STUDENT',
    username: 'student_bikaner',
    name: 'Udayraj',
    registrationNumber: '24BCE1082',
    email: 'udayraj@campus.tejas.edu',
    phoneNumber: '+91 82388 93551',
    cleanNumber: '918238893551',
    hostel: 'Block A (Aryabhata)',
    roomNumber: 'A-302',
    karmaPoints: 1170,
    badge: 'ENERGY CHAMPION',
    campusId: 1,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tejas_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('tejas_jwt_token') || null);

  const loginWithCredentials = async (username, password, customProfile = null) => {
    try {
      const res = await loginApi(username, password);
      const jwtToken = res.token;
      const role = res.role || 'ROLE_STUDENT';
      const campusId = res.campusId != null ? Number(res.campusId) : (role === 'ROLE_GOVT' ? null : 1);

      let profileData = {};
      if (role === 'ROLE_GOVT' || role === 'GOVT') {
        profileData = {
          ...DEFAULT_USERS.govt,
          username: res.username || username,
          name: res.fullName || DEFAULT_USERS.govt.name,
          email: res.email || DEFAULT_USERS.govt.email,
          role: 'ROLE_GOVT',
        };
      } else if (role === 'ROLE_OPERATOR' || role === 'OPERATOR') {
        const campusInfo = getCampusById(campusId);
        profileData = {
          ...DEFAULT_USERS.operator,
          username: res.username || username,
          name: res.fullName || campusInfo.engineerName || DEFAULT_USERS.operator.name,
          email: res.email || DEFAULT_USERS.operator.email,
          operatorId: campusInfo.badgeId || `OP-${campusId}`,
          campusId: campusId || 1,
          campusName: res.campusName || campusInfo.name || 'Campus Microgrid',
          district: campusInfo.district,
          role: 'ROLE_OPERATOR',
        };
      } else {
        const campusInfo = getCampusById(campusId);
        const sampleStudents = campusInfo.students || [];
        const baseStudent = customProfile || sampleStudents[0] || DEFAULT_USERS.student1;
        profileData = {
          role: 'ROLE_STUDENT',
          username: res.username || username,
          name: baseStudent.name || res.fullName || 'Student Resident',
          registrationNumber: baseStudent.regNo || baseStudent.registrationNumber || `24RAJ${campusId}01`,
          email: baseStudent.email || res.email || 'student@campus.tejas.edu',
          phoneNumber: baseStudent.phone || baseStudent.phoneNumber || '+91 82388 93551',
          cleanNumber: baseStudent.cleanPhone || baseStudent.cleanNumber || '918238893551',
          hostel: baseStudent.hostel || (campusInfo.hostels?.[0]?.name || 'Block A'),
          roomNumber: baseStudent.room || baseStudent.roomNumber || 'A-101',
          karmaPoints: baseStudent.karmaPoints != null ? baseStudent.karmaPoints : 1000,
          badge: baseStudent.badge || 'ENERGY CHAMPION',
          year: baseStudent.year || '3rd Year B.Tech',
          dept: baseStudent.dept || 'Engineering',
          campusId: campusId || 1,
          campusName: res.campusName || campusInfo.name || 'Campus Microgrid',
          district: campusInfo.district,
        };
      }

      setUser(profileData);
      setToken(jwtToken);
      localStorage.setItem('tejas_auth_user', JSON.stringify(profileData));
      localStorage.setItem('tejas_jwt_token', jwtToken);

      return { success: true, role, user: profileData };
    } catch (err) {
      console.error('Backend login failed:', err);
      throw err;
    }
  };

  const login = (roleInput, customData = null) => {
    let role = roleInput;
    if (role === 'GOVT') role = 'ROLE_GOVT';
    if (role === 'OPERATOR') role = 'ROLE_OPERATOR';
    if (role === 'STUDENT') role = 'ROLE_STUDENT';

    let userData;
    if (customData) {
      userData = { role, ...customData };
    } else if (role === 'ROLE_GOVT') {
      userData = DEFAULT_USERS.govt;
    } else if (role === 'ROLE_OPERATOR') {
      userData = DEFAULT_USERS.operator;
    } else {
      userData = DEFAULT_USERS.student1;
    }

    setUser(userData);
    localStorage.setItem('tejas_auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tejas_auth_user');
    localStorage.removeItem('tejas_jwt_token');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('tejas_auth_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isGovt = () => user?.role === 'ROLE_GOVT' || user?.role === 'GOVT';
  const isOperator = () => user?.role === 'ROLE_OPERATOR' || user?.role === 'OPERATOR';
  const isStudent = () => user?.role === 'ROLE_STUDENT' || user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginWithCredentials,
        login,
        logout,
        updateUser,
        isGovt,
        isOperator,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
