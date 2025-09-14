// lib/make.ts
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const WEBHOOK_URL = process.env.EXPO_PUBLIC_MAKE_WEBHOOK || '';
const SECRET      = process.env.EXPO_PUBLIC_WELLTOLD_SECRET || '';
const FAKE_MAKE   = process.env.EXPO_PUBLIC_FAKE_MAKE === '1' || !WEBHOOK_URL || !SECRET;

export type UploadResult = { storyId: string };

export async function uploadToMake(form: FormData): Promise<UploadResult> {
  if (FAKE_MAKE) return fakeUploadToFirestore(form);
  return realUploadToWebhook(form);
}

/* ---------------------- Dev (no webhook) ---------------------- */
async function fakeUploadToFirestore(form: FormData): Promise<UploadResult> {
  const userId      = String(form.get('userId') || 'dev-user');
  const title       = String(form.get('title') || 'Untitled Story');
  const contextbox  = String(form.get('contextbox') || '');
  const durationSec = Number(form.get('durationSec') || 0);
  const storyId     = String(form.get('clientId') || Date.now());

  const ref = doc(db, `users/${userId}/vaultentry/${storyId}`);

  await setDoc(ref, {
    id: storyId,
    title,
    contextbox,
    durationSec,
    recordingUrl: '',
    transcript: '',
    feedback: '',
    status: 'queued',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  setTimeout(() => updateDoc(ref, { status: 'transcribing', updatedAt: serverTimestamp() }), 2500);
  setTimeout(() => updateDoc(ref, { status: 'analyzing',   updatedAt: serverTimestamp() }), 5000);
  setTimeout(() => updateDoc(ref, { status: 'ready',       updatedAt: serverTimestamp() }), 9000);

  return { storyId };
}

/* ---------------------- Prod (webhook) ---------------------- */
async function realUploadToWebhook(form: FormData): Promise<UploadResult> {
  const deviceId = String(form.get('deviceId') || 'unknown');

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'X-Device-Id': deviceId,
      'X-Welltold-Secret': SECRET,
      'Accept': 'application/json',
      'Accept-Encoding': 'identity', // ✅ recorder fix: prevent gzip/truncated body
      // DO NOT set Content-Type for FormData; RN/fetch will set proper boundary.
    },
    body: form,
  });

  if (res.status === 409) {
    const data = await safeJson(res);
    return { storyId: String(data?.storyId || form.get('clientId') || '') };
  }
  if (res.ok) {
    const data = await safeJson(res);
    return { storyId: String(data?.storyId || form.get('clientId') || '') };
  }

  if (res.status === 413) throw new Error('TOO_LARGE_OR_LONG');
  if (res.status === 429) throw new Error('BUSY_TRY_LATER');
  if (res.status === 503) throw new Error('BUSY_TRY_LATER');

  throw new Error((await res.text().catch(() => 'UPLOAD_FAILED')) || 'UPLOAD_FAILED');
}

async function safeJson(r: Response) {
  try { return await r.json(); } catch { return null; }
}