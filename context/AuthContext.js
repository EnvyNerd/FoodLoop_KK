import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY='auth_token';

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { checkToken(); }, []);

  async function checkToken() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        setUserToken(token);
        // TODO: validate token with backend, fetch user profile
      }
    } catch (e) {
      console.log('Error reading token:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email, password, role) {
    const data = await apiLogin(email, password, role);
    const token = data.token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setUserToken(token);
    setUser(data.user || null);
    return data;
  }

  async function signUp(name, email, password) {
    const data = await apiRegister(name, email, password);
    const token = data.token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setUserToken(token);
    setUser(data.user || null);
    return data;
  }

  async function signOut() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.log('Error deleting token:', e);
    }
    setUserToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ userToken, user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function useIsSignedIn() {
  const { userToken } = useAuth();
  return !!userToken;
}

export function useIsSignedOut() {
  return !useIsSignedIn();
}
