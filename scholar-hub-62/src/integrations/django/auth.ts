// Django Authentication API client
import { djangoAPI } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  student_id: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  tokens: AuthTokens;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  tokens: AuthTokens;
}

export class DjangoAuthClient {
  private static instance: DjangoAuthClient;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
  }

  static getInstance(): DjangoAuthClient {
    if (!DjangoAuthClient.instance) {
      DjangoAuthClient.instance = new DjangoAuthClient();
    }
    return DjangoAuthClient.instance;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    console.log('Sending registration data:', userData);
    console.log('Data types:', {
      username: typeof userData.username,
      email: typeof userData.email,
      first_name: typeof userData.first_name,
      last_name: typeof userData.last_name,
      student_id: typeof userData.student_id,
      date_of_birth: typeof userData.date_of_birth,
      gender: typeof userData.gender,
    });

    const response = await fetch(`${this.baseURL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Registration response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Registration error:', errorData);
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    const tokenToUse = refreshToken || this.getRefreshToken();
    if (!tokenToUse) {
      // If no refresh token, just clear local tokens
      this.clearTokens();
      return { message: 'Logged out locally' };
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: tokenToUse }),
      });

      // Always clear local tokens regardless of response
      this.clearTokens();

      if (!response.ok) {
        // Don't throw error for logout failures, just log
        console.warn('Logout API call failed, but local tokens cleared');
        return { message: 'Logged out locally' };
      }

      return response.json();
    } catch (error) {
      // Always clear local tokens on logout attempt
      this.clearTokens();
      console.warn('Logout error, but local tokens cleared:', error);
      return { message: 'Logged out locally' };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  async getProfile(): Promise<AuthResponse['user']> {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        // If token is expired, try to refresh it
        if (response.status === 401) {
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            try {
              const newTokens = await this.refreshToken(refreshToken);
              this.setTokens(newTokens);
              // Retry the request with new token
              const retryResponse = await fetch(`${this.baseURL}/auth/profile/`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${newTokens.access}`,
                },
              });
              if (retryResponse.ok) {
                return retryResponse.json();
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens
              this.clearTokens();
            }
          }
        }
        throw new Error('Failed to get profile');
      }

      return response.json();
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Token management
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('django_access_token', tokens.access);
    localStorage.setItem('django_refresh_token', tokens.refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('django_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('django_refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('django_access_token');
    localStorage.removeItem('django_refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Export singleton instance
export const djangoAuth = DjangoAuthClient.getInstance();