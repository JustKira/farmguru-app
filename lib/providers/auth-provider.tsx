import axios from 'axios';
import { Href, usePathname, useRouter } from 'expo-router';
import React, { createContext, useEffect } from 'react';

import { BASE_URL } from '../axios-client';
import { storage } from '../mmkv/storage';

export interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  oauth: (data: { accessToken: string; refreshToken: string }) => void;
  isLoading: boolean;
}

type AuthProviderProps = {
  children: React.ReactNode;
  signInPath: Href<string>;
  protectedRoutes: RegExp[];
  onSignInSuccess?: (user?: {
    accountId: string;
    loginId: string;
    accountType: string;
    email: string;
    name: string;
  }) => Promise<void>;
  onSignOutSuccess?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  protectedRoutes,
  signInPath,
  onSignInSuccess,
  onSignOutSuccess,
}) => {
  const pathName = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(true);

  // function initializeUser() {
  //   const u = storage.getString('user-data');
  //   const userData = u ? JSON.parse(u) : null;
  // }

  // useEffect(initializeUser, []);

  useEffect(() => {
    // Only perform route checks after loading is complete
    const isProtectedRoute = protectedRoutes.some((regex) => regex.test(pathName));
    const u = storage.getString('user-refresh-token');

    if (isProtectedRoute && !u) {
      // If the user is not authenticated and is trying to access a protected route, redirect to the sign-in page
      router.replace(signInPath);
    }
  }, [pathName]);

  const oauth = async ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) => {
    storage.set('user-access-token', accessToken);
    storage.set('user-refresh-token', refreshToken);

    if (onSignInSuccess) {
      onSignInSuccess();
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

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

    storage.set('user-data', JSON.stringify({ ...restUser }));
    storage.set('user-access-token', accessToken);
    storage.set('user-refresh-token', refreshToken);

    if (onSignInSuccess) {
      onSignInSuccess({ ...restUser });
    }

    setIsLoading(false);
  };

  const signOut = () => {
    setIsLoading(true);
    storage.delete('user-data');
    storage.delete('user-access-token');
    storage.delete('user-refresh-token');

    if (onSignOutSuccess) {
      onSignOutSuccess();
    }

    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        oauth,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
