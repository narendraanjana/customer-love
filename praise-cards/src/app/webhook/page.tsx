"use client";

import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "@/config/firebase";

type MessageItem = {
  id: string;
  timestamp?: string;
  [key: string]: unknown;
};

export default function WebhookInboxPage() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const messagesRef = ref(database, "newMessages");
    const unsub = onValue(
      messagesRef,
      (snap) => {
        if (!snap.exists()) {
          setItems([]);
          setLoading(false);
          return;
        }

        const val = snap.val() as Record<string, Omit<MessageItem, "id">>;
        const list: MessageItem[] = Object.entries(val).map(([id, v]) => ({
          id,
          ...(v ?? {}),
        }));

        list.sort((a, b) => {
          const at = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bt = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bt - at;
        });

        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("Realtime DB read failed:", err);
        setError("Failed to load messages.");
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return items;
    const q = filter.toLowerCase();
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [items, filter]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Webhook Inbox</h1>
          <p className="sub">
            Live view of <code>newMessages</code> in Firebase Realtime Database.
          </p>
        </div>
        <div className="stats">
          <div>
            <span className="label">Total</span>
            <span className="value">{items.length}</span>
          </div>
          <div>
            <span className="label">Showing</span>
            <span className="value">{filtered.length}</span>
          </div>
        </div>
      </header>

      <div className="controls">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by text or JSON..."
        />
      </div>

      {loading ? (
        <div className="state">Loading…</div>
      ) : error ? (
        <div className="state error">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="state">No messages yet.</div>
      ) : (
        <div className="list">
          {filtered.map((item) => (
            <div key={item.id} className="card">
              <div className="meta">
                <span className="id">{item.id}</span>
                <span className="time">
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleString()
                    : "no timestamp"}
                </span>
              </div>
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .page {
          margin: 0 auto;
          max-width: 1100px;
          padding: 32px 18px 80px;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .header {
          display: flex;
          gap: 20px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        h1 {
          font-size: 28px;
          margin: 0 0 6px;
        }
        .sub {
          color: #6b7280;
          margin: 0;
        }
        .stats {
          display: flex;
          gap: 14px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 12px;
        }
        .label {
          display: block;
          font-size: 12px;
          color: #6b7280;
        }
        .value {
          font-size: 18px;
          font-weight: 700;
        }
        .controls {
          margin: 18px 0 16px;
        }
        input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .state {
          padding: 24px;
          text-align: center;
          color: #6b7280;
        }
        .state.error {
          color: #b91c1c;
        }
        .list {
          display: grid;
          gap: 14px;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px;
          background: #fff;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
        }
        .meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #6b7280;
        }
        .id {
          font-weight: 600;
        }
        pre {
          margin: 0;
          background: #f8fafc;
          border-radius: 8px;
          padding: 10px;
          overflow: auto;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
