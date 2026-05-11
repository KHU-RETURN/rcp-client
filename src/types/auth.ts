export interface Session {
  id: string;
  name: string;
  role: string;
  subtitle: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  source?: string;
}

export type MockUser = Session;

export interface SignupForm {
  name: string;
  handle: string;
  rolePreset: 'student' | 'admin';
  subtitle: string;
}

export interface AuthMessage {
  type: 'error' | 'saved';
  text: string;
}
