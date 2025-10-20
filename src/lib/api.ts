const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const joinUrl = (base: string, path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
};

// Token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = joinUrl(DEFAULT_BASE_URL, path);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new ApiError(`Invalid JSON response from ${url}`, response.status, text);
    }
  }

  if (!response.ok) {
    throw new ApiError(`Request to ${url} failed with status ${response.status}`, response.status, data);
  }

  return data as T;
}

// Authentication API functions
export interface LoginRequest {
  taiKhoan: string;
  matKhau: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    maNV: string;
    tenNV: string;
    chucVu: string;
    taiKhoan: string;
    email?: string;
    soDienThoai?: string;
    diaChi?: string;
    trangThai?: string;
  };
}

export interface User {
  maNV: string;
  tenNV: string;
  chucVu: string;
  taiKhoan: string;
  email?: string;
  soDienThoai?: string;
  diaChi?: string;
  trangThai?: string;
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async verifyToken(): Promise<{ user: User }> {
    return apiFetch<{ user: User }>('/api/auth/verify');
  },

  async logout(): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },
};
