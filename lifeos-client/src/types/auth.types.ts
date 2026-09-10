export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  authProvider: 'email' | 'google';
  profileImage?: string;
  timezone: string;
  language: string;
  theme?: 'light' | 'dark' | 'system';
  height?: number;
  weight?: number;
  gender?: string;
  dateOfBirth?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export interface ILoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
}
