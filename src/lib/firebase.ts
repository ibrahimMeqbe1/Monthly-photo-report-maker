import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App gracefully
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn("Firebase initialization failed, utilizing fallback mode:", error);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();

// Custom Firestore error handler as mandated by the Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. GMAIL (GOOGLE) SIGN IN
export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("لم يتم تهيئة نظام Firebase بعد.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

// 2. SIGN OUT
export async function logoutUser() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// 3. SYNC USER PROFILE TO FIRESTORE
export async function syncUserProfile(user: FirebaseUser) {
  if (!db) return null;
  const userRef = doc(db, "users", user.uid);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const initialProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "مستعمل جوجل",
        plan: "pro", // Default to unlimited Pro plan since user doesn't want limitations right now!
        exportQuotaLimit: 9999, // Unlimited quota as requested by user's bypass intent
        exportQuotaCurrent: 0,
        watermarkCustomAllowed: true,
        videoDurationLimit: 600,
      };
      await setDoc(userRef, initialProfile);
      return initialProfile;
    } else {
      return userSnap.data();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    return null;
  }
}

// 4. SAVE PROJECT TO FIRESTORE
export async function saveProjectToCloud(
  ownerId: string,
  projectId: string,
  name: string,
  slides: any[],
  theme: string,
  fontDisplay?: string,
  fontBody?: string,
  activeTemplateId?: string | null
) {
  if (!db) return null;
  const projectRef = doc(db, "projects", projectId);
  const projectData = {
    id: projectId,
    name,
    slides,
    theme,
    fontDisplay,
    fontBody,
    activeTemplateId,
    ownerId,
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(projectRef, projectData);
    return projectData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}`);
    return null;
  }
}

// 5. FETCH PROJECTS FROM CLOUD
export async function fetchUserProjectsFromCloud(ownerId: string) {
  if (!db) return [];
  const projectsCol = collection(db, "projects");
  const q = query(projectsCol, where("ownerId", "==", ownerId));
  try {
    const querySnapshot = await getDocs(q);
    const projects: any[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data());
    });
    return projects;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "projects");
    return [];
  }
}

// 6. DELETE PROJECT FROM CLOUD
export async function deleteProjectFromCloud(projectId: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, "projects", projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
  }
}
