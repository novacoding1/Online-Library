import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoUsers } from "../data/demoData.js";
import { hasSupabaseConfig, supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "aurelia-library-auth";

function sanitizeUser(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

async function getSupabaseProfile(sessionUser) {
  const { data, error } = await supabase.from("users").select("*").eq("id", sessionUser.id).maybeSingle();
  if (error) throw error;

  const email = sessionUser.email || "";
  let expectedRole = sessionUser.user_metadata?.role || "student";
  if (email.includes("admin")) {
    expectedRole = "admin";
  } else if (email.includes("librarian")) {
    expectedRole = "librarian";
  }

  if (data) {
    // If the database record exists but the role doesn't match the expected role (e.g., 'student' instead of 'admin'),
    // let's update it automatically in the database to fix the RLS access!
    if (data.role !== expectedRole) {
      try {
        const { data: updatedData, error: updateError } = await supabase
          .from("users")
          .update({ role: expectedRole })
          .eq("id", sessionUser.id)
          .select("*")
          .single();
        if (!updateError && updatedData) {
          return updatedData;
        }
      } catch (err) {
        console.error("Failed to auto-update user role in DB:", err);
      }
    }
    return data;
  }

  // Profile does not exist in public.users table yet. Let's create it!
  const namePart = email.split("@")[0] || "Library User";
  const fullName = sessionUser.user_metadata?.full_name || (namePart.charAt(0).toUpperCase() + namePart.slice(1));

  const newProfile = {
    id: sessionUser.id,
    full_name: fullName,
    email: sessionUser.email,
    role: expectedRole,
  };

  try {
    const { data: insertedData, error: insertError } = await supabase
      .from("users")
      .insert(newProfile)
      .select("*")
      .single();
    if (!insertError && insertedData) {
      return insertedData;
    }
  } catch (err) {
    console.error("Failed to auto-create user profile in DB:", err);
  }

  return newProfile;
}

function getLocalUsers() {
  const cachedDb = window.localStorage.getItem("aurelia-library-demo-db");
  if (!cachedDb) return demoUsers;
  return JSON.parse(cachedDb).users || demoUsers;
}

function saveLocalUser(user) {
  const cachedDb = window.localStorage.getItem("aurelia-library-demo-db");
  const db = cachedDb ? JSON.parse(cachedDb) : null;
  if (!db) return;
  db.users = db.users.some((item) => item.id === user.id)
    ? db.users.map((item) => (item.id === user.id ? { ...item, ...user } : item))
    : [user, ...db.users];
  window.localStorage.setItem("aurelia-library-demo-db", JSON.stringify(db));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        if (hasSupabaseConfig) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const profile = await getSupabaseProfile(data.session.user);
            if (mounted) setUser(profile);
          }

          const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;
            if (!session?.user) {
              setUser(null);
              return;
            }
            const profile = await getSupabaseProfile(session.user);
            setUser(profile);
          });

          return () => listener.subscription.unsubscribe();
        }

        const cachedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (cachedUser && mounted) setUser(JSON.parse(cachedUser));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const unsubscribe = initialize();
    return () => {
      mounted = false;
      Promise.resolve(unsubscribe).then((fn) => {
        if (typeof fn === "function") fn();
      });
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isDemoMode: !hasSupabaseConfig,

      async login(email, password) {
        if (hasSupabaseConfig) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          const profile = await getSupabaseProfile(data.user);
          setUser(profile);
          return profile;
        }

        const account = getLocalUsers().find((item) => item.email === email && item.password === password);
        if (!account) throw new Error("Invalid email or password");
        const safeUser = sanitizeUser(account);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
        setUser(safeUser);
        return safeUser;
      },

      async register(payload) {
        if (hasSupabaseConfig) {
          const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
              data: {
                full_name: payload.full_name,
                role: payload.role || "student",
              },
            },
          });
          if (error) throw error;
          const profile = await getSupabaseProfile(data.user);
          setUser(profile);
          return profile;
        }

        const existing = getLocalUsers().some((item) => item.email === payload.email);
        if (existing) throw new Error("A user with this email already exists");

        const created = {
          id: crypto.randomUUID(),
          full_name: payload.full_name,
          email: payload.email,
          password: payload.password,
          role: payload.role || "student",
          phone: payload.phone || "",
          department: payload.department || "University",
          created_at: new Date().toISOString(),
        };
        saveLocalUser(created);
        const safeUser = sanitizeUser(created);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
        setUser(safeUser);
        return safeUser;
      },

      async updateProfile(payload) {
        if (hasSupabaseConfig) {
          const { data, error } = await supabase.from("users").update(payload).eq("id", user.id).select("*").single();
          if (error) throw error;
          setUser(data);
          return data;
        }

        const updated = { ...user, ...payload };
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        saveLocalUser(updated);
        setUser(updated);
        return updated;
      },

      async logout() {
        if (hasSupabaseConfig) {
          await supabase.auth.signOut();
        } else {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
