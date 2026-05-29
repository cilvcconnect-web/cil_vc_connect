import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase Core Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Configure Google OAuth Scopes for Drive, Sheets & Calendar
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/calendar');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize Authentication listener
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Initiate Google Sign Inn popup
export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve OAuth access token from authorization response.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    
    // Explicitly check for popup blocker or user closure cases
    if (error && (error.code === 'auth/popup-closed-by-user' || error.message?.includes('popup-closed-by-user'))) {
      throw new Error('The Google Sign-In popup was closed or blocked. If you did not close it, check if your browser blocked popups, or try opening this application in a new tab.');
    }
    if (error && (error.code === 'auth/cancelled-popup-request' || error.message?.includes('cancelled-popup-request'))) {
      throw new Error('A previous authentication request was cancelled or nested. Please try again.');
    }
    if (error && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Failed to connect with Google. Please verify your connection status.');
  } finally {
    isSigningIn = false;
  }
};

// Retrieve cached OAuth accessToken
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Terminate session
export const logoutFirebase = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ==========================================
// FIRESTORE ERROR HANDLING (MANDATORY INSTRUCTIONS)
// ==========================================

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Firebase connection on start as required by security guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Verify configuration and rules.', error);
    }
  }
}
testConnection();

// ==========================================
// GOOGLE DRIVE INTEGRATIONS
// ==========================================

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

/**
 * Uploads a text/JSON document to Google Drive.
 */
export async function uploadToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileContent: string,
  mimeType: string = 'text/plain'
): Promise<GoogleDriveFile> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: mimeType }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`failed to upload file to Google Drive: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Lists the most recently modified files in the user's Google Drive.
 */
export async function listGoogleDriveFiles(accessToken: string): Promise<GoogleDriveFile[]> {
  const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=20&orderBy=modifiedTime desc&fields=files(id,name,mimeType,webViewLink)', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`failed to fetch files from Google Drive: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
}

// ==========================================
// GOOGLE SHEETS INTEGRATIONS
// ==========================================

export interface CreateSheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates a brand new Google Sheet.
 */
export async function createGoogleSheet(accessToken: string, title: string): Promise<CreateSheetResponse> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`failed to create Google Sheet: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
  };
}

/**
 * Appends rows of raw value data directly to an existing spreadsheet.
 */
export async function appendToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values,
    }),
  });

  if (!response.ok) {
    throw new Error(`failed to append data to Google Sheet: ${response.statusText}`);
  }

  return await response.json();
}

// ==========================================
// GOOGLE CALENDAR INTEGRATIONS
// ==========================================

export interface GoogleCalendarEvent {
  summary: string;
  location?: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export interface GoogleCalendarResponse {
  id: string;
  htmlLink: string;
}

/**
 * Creates an event on the user's primary Google Calendar.
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<GoogleCalendarResponse> {
  const body = {
    summary: event.summary,
    location: event.location,
    description: event.description,
    start: {
      dateTime: event.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
    end: {
      dateTime: event.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
    reminders: {
      useDefault: true,
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`failed to create Google Calendar event: ${response.statusText} - ${errText}`);
  }

  return await response.json();
}

