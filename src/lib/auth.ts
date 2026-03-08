import type { Role } from '../types';

const REGION = import.meta.env.VITE_AWS_REGION ?? 'us-west-2';
const CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID as string;
const COGNITO_ENDPOINT = `https://cognito-idp.${REGION}.amazonaws.com/`;
const STORAGE_KEY = 'cognito_tokens';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  accessToken: string;
}

interface TokenStore {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ── JWT helpers ────────────────────────────────────────────────────────────────

function decodeJwt(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

function roleFromGroups(groups: string[]): Role {
  if (groups.includes('admin')) return 'admin';
  if (groups.includes('tech')) return 'tech';
  return 'user';
}

function buildAuthUser(tokens: TokenStore): AuthUser {
  const id = decodeJwt(tokens.idToken);
  const groups = (id['cognito:groups'] as string[]) ?? [];
  return {
    id: id.sub as string,
    name: (id.name ?? id.email) as string,
    email: id.email as string,
    role: roleFromGroups(groups),
    accessToken: tokens.accessToken,
  };
}

// ── Storage ────────────────────────────────────────────────────────────────────

function saveTokens(t: TokenStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

function loadTokens(): TokenStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Cognito API fetch ─────────────────────────────────────────────────────────

async function cognitoPost(target: string, body: object) {
  const res = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? data.__type ?? 'Cognito error');
  return data;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function signUp(
  name: string,
  email: string,
  password: string,
  role: 'user' | 'tech' = 'user',
): Promise<void> {
  await cognitoPost('SignUp', {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: 'name', Value: name },
      { Name: 'email', Value: email },
      { Name: 'custom:role', Value: role },
    ],
  });
}

export async function confirmSignUp(email: string, code: string): Promise<void> {
  await cognitoPost('ConfirmSignUp', {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const data = await cognitoPost('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  });

  const result = data.AuthenticationResult;
  const tokens: TokenStore = {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: result.RefreshToken,
    expiresAt: Date.now() + result.ExpiresIn * 1000,
  };
  saveTokens(tokens);
  return buildAuthUser(tokens);
}

export function signOut() {
  clearTokens();
}

export async function restoreSession(): Promise<AuthUser | null> {
  const tokens = loadTokens();
  if (!tokens) return null;

  // Still valid with a 60-second buffer
  if (Date.now() < tokens.expiresAt - 60_000) {
    return buildAuthUser(tokens);
  }

  // Try to refresh
  try {
    const data = await cognitoPost('InitiateAuth', {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: { REFRESH_TOKEN: tokens.refreshToken },
    });
    const result = data.AuthenticationResult;
    const refreshed: TokenStore = {
      ...tokens,
      accessToken: result.AccessToken,
      idToken: result.IdToken,
      expiresAt: Date.now() + result.ExpiresIn * 1000,
    };
    saveTokens(refreshed);
    return buildAuthUser(refreshed);
  } catch {
    clearTokens();
    return null;
  }
}
