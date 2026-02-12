import Link from "next/link";

export default function Page() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Review Praise Messages</h1>
      <p style={{ marginTop: 8 }}>Review incoming praise messages queued for moderation.</p>

      <div style={{ marginTop: 20 }}>
        <Link href="/praiseGenerator">
          <button className="btn">Back to Generator</button>
        </Link>
      </div>

      <div style={{ marginTop: 28 }}>
        <p>Review UI will list incoming messages with actions:</p>
        <ul>
          <li>Regenerate (shuffle design)</li>
          <li>Copy image</li>
          <li>Upload to Praise Wall</li>
          <li>Show upload time (e.g. "1 day ago")</li>
        </ul>
      </div>
    </div>
  );
}
