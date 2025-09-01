import { getDeviceId } from './device';

type UploadPayload = {
  audioUri: string;
  filename: string;
  mimeType: string;
  userId: string;
  title: string;
  durationSec: number;
  contextbox: string;
  clientId: string;
};

export async function uploadToMake(payload: UploadPayload): Promise<{ storyId: string }> {
  const deviceId = await getDeviceId();
  const secret = process.env.EXPO_PUBLIC_WELLTOLD_SECRET;
  const webhookUrl = process.env.EXPO_PUBLIC_MAKE_WEBHOOK;

  if (!webhookUrl || !secret) {
    throw new Error('Missing webhook URL or secret');
  }

  const formData = new FormData();
  
  // Add audio file
  formData.append('file', {
    uri: payload.audioUri,
    type: payload.mimeType,
    name: payload.filename,
  } as any);

  // Add other fields
  formData.append('filename', payload.filename);
  formData.append('mimeType', payload.mimeType);
  formData.append('userId', payload.userId);
  formData.append('deviceId', deviceId);
  formData.append('title', payload.title);
  formData.append('durationSec', payload.durationSec.toString());
  formData.append('contextbox', payload.contextbox);
  formData.append('clientId', payload.clientId);
  formData.append('createdAtISO', new Date().toISOString());
  formData.append('secret', secret);

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'X-Device-Id': deviceId,
      'X-Welltold-Secret': secret,
    },
    body: formData,
  });

  if (response.status === 409) {
    // Duplicate - treat as success
    const data = await response.json().catch(() => ({}));
    return { storyId: data.storyId || 'duplicate' };
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Clip too long/large. Please re-record.');
    }
    if (response.status === 429 || response.status === 503) {
      throw new Error('Server busy. Try again soon.');
    }
    throw new Error('Couldn\'t upload. Retry.');
  }

  const data = await response.json();
  return { storyId: data.storyId || 'uploaded' };
}
