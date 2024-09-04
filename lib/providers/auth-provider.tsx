import axios from 'axios';
import React, { createContext, useEffect } from 'react';

import { BASE_URL } from '../axios-client';
import { storage } from '../mmkv/storage';

export interface AuthContextType {
  user: UserData;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

type AuthProviderProps = {
  children: React.ReactNode;
  unauthorized?: React.ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, unauthorized }) => {
  const [user, setUser] = React.useState<UserData | null>(null);

  function initializeUser() {
    const u = storage.getString('userData');

    const userData = u ? JSON.parse(u) : null;

    setUser(userData);
  }

  useEffect(initializeUser, []);

  const signIn = async (email: string, password: string) => {
    const response = await axios.post<{ data: UserResponseData }>(`${BASE_URL}/accounts/login`, {
      email,
      password,
    });

    const data = response.data.data;
    const { accessToken, refreshToken, ...restUser }: UserData = {
      accountId: data.AccountId,
      loginId: data.LoginId,
      accountType: data.AccountType,
      email: data.Email,
      name: data.Name,
      accessToken: data.AccessToken,
      refreshToken: data.RefreshToken,
    };

    setUser({ ...restUser, accessToken, refreshToken });
    storage.set('user-data', JSON.stringify({ ...restUser, accessToken, refreshToken }));
    storage.set('user-access-token', accessToken);
    storage.set('user-refresh-token', refreshToken);
  };

  const signOut = () => {
    setUser(null);
    storage.delete('user-data');
    storage.delete('user-access-token');
    storage.delete('user-refresh-token');
  };

  return (
    <AuthContext.Provider
      value={{
        user: user as UserData,
        signIn,
        signOut,
      }}>
      {user ? children : unauthorized}
    </AuthContext.Provider>
  );
};
