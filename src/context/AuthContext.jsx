import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

// Context create karna
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. App khulte hi check karo ki user pehle se login toh nahi hai
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Background mein login/logout events par nazar rakhna
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Google Login Function
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // Login ke baad wapas apni site par lana
      }
    });
    if (error) console.error("Login Error:", error.message);
  };

  // Logout Function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout Error:", error.message);
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Baaki components mein use karne ke liye custom hook
export const useAuth = () => useContext(AuthContext);