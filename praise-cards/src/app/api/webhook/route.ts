import { NextRequest, NextResponse } from 'next/server';
import { ref, push } from 'firebase/database';
import { database } from '@/config/firebase';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const data = await request.json();

    // Extract only the fields we care about from the webhook payload
    const messageData = {
      id: data?.id ?? null,
      conversation: {
        id: data?.conversation?.id ?? null,
        waiting_since: data?.conversation?.waiting_since ?? null,
      },
      user: {
        name: data?.conversation?.recipient?.name ?? null,
        email: data?.conversation?.recipient?.handle ?? null,
      },
      email: {
        subject: data?.target?.data?.subject ?? null,
        text: data?.target?.data?.text ?? null,
      },
      source: {
        name: data?.source?.data?.[0]?.name ?? null,
      },
    };

    // Reference to newMessages collection in Firebase Realtime Database
    const messagesRef = ref(database, 'newMessages');

    // Push new data to Firebase
    await push(messagesRef, messageData);

    return NextResponse.json(
      { success: true, message: 'Data saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

// Optional: Allow GET requests to verify the endpoint is working
export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is active.',
  });
}
