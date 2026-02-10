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
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      if (u.email && u.email.endsWith("@gratefulness.me")) {
        setStatus("authenticated");
      } else {
        setStatus("forbidden");
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error("Sign-in error", err);
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
          <h2>Sign in to continue</h2>
          <p>Use your @gratefulness.me Google account.</p>
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
    </div>
  );
}
