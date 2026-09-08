// Uploads a photo straight from the phone to Cloudinary — the backend never
// handles the image bytes, only the resulting URL (see workoutPosts.service.ts's
// isValidCloudinaryUrl for why it must be a res.cloudinary.com URL). See
// .env.example for how to get the two env vars this needs.
export class CloudinaryConfigError extends Error {}

export async function uploadWorkoutPhoto(localUri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new CloudinaryConfigError(
      'Cloudinary non configurato — imposta EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME e EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET (vedi .env.example).',
    );
  }

  const formData = new FormData();
  // React Native's fetch accepts this shape for a file field even though it
  // doesn't match the DOM FormData/Blob types — see Cloudinary's RN upload docs.
  formData.append('file', { uri: localUri, type: 'image/jpeg', name: 'workout.jpg' } as unknown as Blob);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Caricamento della foto non riuscito.');
  }

  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
