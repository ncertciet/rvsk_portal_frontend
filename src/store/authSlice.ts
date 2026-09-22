import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PortalUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  /** Legacy 2-char state code, kept for backward-compatible screens (e.g. VSK). */
  stateCode?: string | null;
  stateKey: string | null;
  stateName: string | null;
  districtKey: string | null;
  districtName: string | null;
  blockKey: string | null;
  blockName: string | null;
  access?: Record<string, string[]>;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: PortalUser | null;
}

// Load persisted auth state from localStorage
function loadPersistedAuth(): AuthState {
  try {
    const stored = localStorage.getItem('rvsk_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.accessToken && parsed.user) {
        return { isAuthenticated: true, accessToken: parsed.accessToken, user: parsed.user };
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { isAuthenticated: false, accessToken: null, user: null };
}

const initialState: AuthState = loadPersistedAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ accessToken: string; user: PortalUser }>) {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      // Persist to localStorage
      localStorage.setItem('rvsk_auth', JSON.stringify({ accessToken: action.payload.accessToken, user: action.payload.user }));
    },
    logout(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem('rvsk_auth');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
