// lib/firebase.ts
// 🔒 STUB ONLY — replace with real Firebase config when wiring day comes

export const db: any = {}; // fake Firestore

export const auth: any = {
  currentUser: {
    uid: 'stub-uid',
    email: 'stub@example.com',
  },
};

// fake helpers so code compiles
export async function signOut() {
  console.log('stub: signOut');
}
export async function deleteUser() {
  console.log('stub: deleteUser');
}
