import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_USERS = {
  student1: {
    role: 'STUDENT',
    name: 'Udayraj',
    registrationNumber: '24BCE1082',
    email: 'udayraj@campus.tejas.edu',
    phoneNumber: '+91 82388 93551',
    cleanNumber: '918238893551',
    hostel: 'Block A (Aryabhata)',
    roomNumber: 'A-302',
    karmaPoints: 1070,
    badge: 'ENERGY CHAMPION',
  },
  student2: {
    role: 'STUDENT',
    name: 'Aniket Gawai',
    registrationNumber: '24BCE1095',
    email: 'aniket.gawai@svh.edu',
    phoneNumber: '+91 98340 31115',
    cleanNumber: '919834031115',
    hostel: 'Block A (Aryabhata)',
    roomNumber: 'A-204',
    karmaPoints: 420,
    badge: 'GREEN GUARDIAN',
  },
  student3: {
    role: 'STUDENT',
    name: 'Student Resident',
    registrationNumber: '24BCE1102',
    email: 'resident.9031717980@svh.edu',
    phoneNumber: '+91 90317 17980',
    cleanNumber: '919031717980',
    hostel: 'Block B (Bhaskara)',
    roomNumber: 'B-118',
    karmaPoints: 350,
    badge: 'ECO WARRIOR',
  },
  operator: {
    role: 'OPERATOR',
    name: 'Eng. Rajesh Verma',
    operatorId: 'OP-7701',
    designation: 'Chief Energy Officer & SCADA Director',
    email: 'scada.ops@campus.tejas.edu',
    department: 'Campus Electrical & Renewable Infrastructure',
    clearanceLevel: 'LEVEL 4 (FULL GRID CONTROL)',
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

  const login = (role, customData = null) => {
    let userData;
    if (customData) {
      userData = { role, ...customData };
    } else if (role === 'OPERATOR') {
      userData = DEFAULT_USERS.operator;
    } else {
      userData = DEFAULT_USERS.student1;
    }

    setUser(userData);
    localStorage.setItem('tejas_auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tejas_auth_user');
  };

  const isOperator = () => user?.role === 'OPERATOR';
  const isStudent = () => user?.role === 'STUDENT';

  return (
    <AuthContext.Provider value={{ user, login, logout, isOperator, isStudent }}>
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
