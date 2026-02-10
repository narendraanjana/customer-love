"use client";

import { useEffect, useState } from "react";
import PraiseGenerator from "@/components/PraiseGenerator";
import { auth, googleProvider } from "@/config/firebase";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";

export default function Page() {
  const [status, setStatus] = useState<
    "loading" | "unauthenticated" | "forbidden" | "authenticated"
  >("loading");
  const [toast, setToast] = useState<string | null>(null);

  // auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2300);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        if (user.email.endsWith("@gratefulness.me")) {
          setStatus("authenticated");
        } else {
          // Immediately sign out non-matching domains
          setStatus("forbidden");
          firebaseSignOut(auth).catch(() => {});
        }
      } else {
        setStatus("unauthenticated");
      }
    });
    return unsub;
  }, []);

  const signIn = async () => {
    try {
      const prevEmail = auth.currentUser?.email || null;
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      if (prevEmail && u.email && u.email !== prevEmail) {
        setToast(`Signed in as different account: ${u.email}`);
      }
      if (u.email && u.email.endsWith("@gratefulness.me")) {
        setToast(`Signed in as ${u.email}`);
        setStatus("authenticated");
      } else {
        setStatus("forbidden");
        setToast("Only @gratefulness.me accounts are allowed.");
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error("Sign-in error", err);
      setToast("Sign-in failed");
      setStatus("unauthenticated");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setStatus("unauthenticated");
  };

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {status === "loading" && <div>Checking authentication…</div>}

      {status === "authenticated" && <PraiseGenerator />}

      {status === "unauthenticated" && (
        <div style={{ textAlign: "center" }}>
          <button className="btn primary" onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      )}

      {status === "forbidden" && (
        <div style={{ textAlign: "center" }}>
          <h2>Access restricted</h2>
          <p>Only @gratefulness.me accounts can use the Praise Generator.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={signIn} style={{ marginRight: 8 }}>
              Sign in with Google
            </button>
            <button className="btn" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 24,
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "8px 14px",
            borderRadius: 8,
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
