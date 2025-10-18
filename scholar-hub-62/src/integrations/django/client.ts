// Django API client to replace Supabase
const DJANGO_API_BASE = 'http://localhost:8000/api/';

interface ApiResponse<T> {
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

class DjangoAPIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = DJANGO_API_BASE) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add authorization header for authenticated requests
    if (options.method && options.method !== 'GET') {
      const accessToken = localStorage.getItem('django_access_token');
      if (accessToken) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${accessToken}`,
        };
      }
    }

    // Add CSRF token for non-GET requests
    if (options.method && options.method !== 'GET') {
      // For development, we'll disable CSRF protection in Django settings instead
      // This is a temporary solution for development
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Django API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async getAll<T>(resource: string, params?: Record<string, any>): Promise<T[]> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const endpoint = searchParams ? `${resource}/?${searchParams}` : `${resource}/`;

    const config: RequestInit = {};
    const accessToken = localStorage.getItem('django_access_token');
    if (accessToken) {
      config.headers = {
        'Authorization': `Bearer ${accessToken}`,
      };
    }

    const response = await this.request<any>(endpoint, config);
    if (Array.isArray(response)) {
      return response;
    }
    return response.results || [];
  }

  async getById<T>(resource: string, id: string | number): Promise<T> {
    const config: RequestInit = {};
    const accessToken = localStorage.getItem('django_access_token');
    if (accessToken) {
      config.headers = {
        'Authorization': `Bearer ${accessToken}`,
      };
    }
    return this.request<T>(`${resource}/${id}/`, config);
  }

  async create<T>(resource: string, data: Partial<T>): Promise<T> {
    return this.request<T>(`${resource}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update<T>(resource: string, id: string | number, data: Partial<T>): Promise<T> {
    return this.request<T>(`${resource}/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(resource: string, id: string | number, data: Partial<T>): Promise<T> {
    return this.request<T>(`${resource}/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(resource: string, id: string | number): Promise<void> {
    const response = await fetch(`${this.baseURL}${resource}/${id}/`, {
      method: 'DELETE',
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // For DELETE requests, don't try to parse JSON if response is empty
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return;
    }

    // Only try to parse JSON if there's content
    try {
      await response.json();
    } catch (error) {
      // Ignore JSON parsing errors for empty responses
    }
  }

  // Specific resource methods
  async getStudents(params?: Record<string, any>) {
    return this.getAll<any>('students', params);
  }

  async getStudent(id: string | number) {
    return this.getById<any>('students', id);
  }

  async createStudent(data: any) {
    return this.create<any>('students', data);
  }

  async updateStudent(id: string | number, data: any) {
    return this.update<any>('students', id, data);
  }

  async deleteStudent(id: string | number) {
    return this.delete('students', id);
  }

  async getClasses(params?: Record<string, any>) {
    return this.getAll<any>('classes', params);
  }

  async getClass(id: string | number) {
    return this.getById<any>('classes', id);
  }

  async createClass(data: any) {
    return this.create<any>('classes', data);
  }

  async updateClass(id: string | number, data: any) {
    return this.update<any>('classes', id, data);
  }

  async deleteClass(id: string | number) {
    return this.delete('classes', id);
  }

  async getSubjects(params?: Record<string, any>) {
    return this.getAll<any>('subjects', params);
  }

  async getSubject(id: string | number) {
    return this.getById<any>('subjects', id);
  }

  async createSubject(data: any) {
    return this.create<any>('subjects', data);
  }

  async updateSubject(id: string | number, data: any) {
    return this.update<any>('subjects', id, data);
  }

  async deleteSubject(id: string | number) {
    return this.delete('subjects', id);
  }

  async getGrades(params?: Record<string, any>) {
    return this.getAll<any>('grades', params);
  }

  async getGrade(id: string | number) {
    return this.getById<any>('grades', id);
  }

  async createGrade(data: any) {
    return this.create<any>('grades', data);
  }

  async updateGrade(id: string | number, data: any) {
    return this.update<any>('grades', id, data);
  }

  async deleteGrade(id: string | number) {
    return this.delete('grades', id);
  }

  async getAttendance(params?: Record<string, any>) {
    return this.getAll<any>('attendance', params);
  }

  async getAttendanceById(id: string | number) {
    return this.getById<any>('attendance', id);
  }

  async createAttendance(data: any) {
    return this.create<any>('attendance', data);
  }

  async updateAttendance(id: string | number, data: any) {
    return this.update<any>('attendance', id, data);
  }

  async deleteAttendance(id: string | number) {
    return this.delete('attendance', id);
  }

  async getUsers(params?: Record<string, any>) {
    return this.getAll<any>('users', params);
  }
}

// Export singleton instance
export const djangoAPI = new DjangoAPIClient();

// Export class for custom instances
export { DjangoAPIClient };