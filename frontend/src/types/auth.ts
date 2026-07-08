export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};
