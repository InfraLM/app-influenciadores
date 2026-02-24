// Enhanced API Client with better Supabase compatibility

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface QueryBuilder<T = any> {
  select(columns?: string): SelectBuilder<T>;
  insert(data: any): InsertBuilder<T>;
  update(data: any): UpdateBuilder<T>;
  upsert(data: any, options?: { onConflict?: string }): UpsertBuilder<T>;
  delete(): DeleteBuilder<T>;
}

interface SelectBuilder<T> {
  eq(column: string, value: any): this;
  neq(column: string, value: any): this;
  gt(column: string, value: any): this;
  lt(column: string, value: any): this;
  gte(column: string, value: any): this;
  lte(column: string, value: any): this;
  in(column: string, values: any[]): this;
  order(column: string, options?: { ascending?: boolean }): this;
  limit(count: number): this;
  single(): Promise<{ data: T | null; error: any }>;
  maybeSingle(): Promise<{ data: T | null; error: any }>;
}

interface InsertBuilder<T> {
  select(): { single(): Promise<{ data: T; error: any }> };
}

interface UpsertBuilder<T> {
  select(): { single(): Promise<{ data: T; error: any }> };
}

interface UpdateBuilder<T> {
  eq(column: string, value: any): {
    select(): { single(): Promise<{ data: T; error: any }> };
  };
}

interface DeleteBuilder<T> {
  eq(column: string, value: any): Promise<{ error: any }>;
}

export class ApiClient {
  private token: string | null = null;
  private authStateCallback: ((event: string, session: any) => void) | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; error: null } | { data: null; error: any }> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await response.json();

      if (!response.ok) {
        return { data: null, error: json };
      }

      return { data: json, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const result = await this.fetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (result.data && result.data.session) {
        this.setToken(result.data.session.access_token);
        if (this.authStateCallback) {
          this.authStateCallback('SIGNED_IN', result.data);
        }
      }

      return result;
    },

    signUp: async ({ email, password, options }: any) => {
      const result = await this.fetch<any>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          name: options?.data?.name || '',
        }),
      });

      if (result.data && result.data.session) {
        this.setToken(result.data.session.access_token);
        if (this.authStateCallback) {
          this.authStateCallback('SIGNED_IN', result.data);
        }
      }

      return result;
    },

    signOut: async () => {
      await this.fetch('/auth/logout', { method: 'POST' });
      this.setToken(null);
      if (this.authStateCallback) {
        this.authStateCallback('SIGNED_OUT', null);
      }
      return { error: null };
    },

    getSession: async () => {
      if (!this.token) {
        return { data: { session: null }, error: null };
      }

      const result = await this.fetch<any>('/auth/session');
      if (result.data) {
        return { data: { session: result.data }, error: null };
      }
      return { data: { session: null }, error: result.error };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.authStateCallback = null;
            },
          },
        },
      };
    },
  };

  from(table: string): QueryBuilder {
    return {
      select: (columns = '*') => {
        const params = new URLSearchParams();
        const filters: Record<string, any> = {};

        const buildQuery = () => {
          Object.keys(filters).forEach(key => {
            params.append(key, filters[key]);
          });
          return params.toString();
        };

        const builder: any = {
          eq: (column: string, value: any) => {
            filters[column] = value;
            return builder;
          },
          in: (column: string, values: any[]) => {
            params.append(`${column}__in`, values.join(','));
            return builder;
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            params.append('order', `${column}:${options?.ascending ? 'asc' : 'desc'}`);
            return builder;
          },
          limit: (count: number) => {
            params.append('limit', count.toString());
            return builder;
          },
          single: async () => {
            const query = buildQuery();
            const result = await this.fetch<any>(`/${table}?${query}`);
            if (result.data && Array.isArray(result.data)) {
              return { data: result.data[0] || null, error: result.error };
            }
            return result;
          },
          maybeSingle: async () => {
            const query = buildQuery();
            const result = await this.fetch<any>(`/${table}?${query}`);
            if (result.data && Array.isArray(result.data)) {
              return { data: result.data[0] || null, error: null };
            }
            return { data: null, error: result.error };
          },
        };

        // Make it thenable for backward compatibility
        builder.then = async (resolve: any) => {
          const query = buildQuery();
          const result = await this.fetch<any>(`/${table}?${query}`);
          resolve(result);
        };

        return builder;
      },

      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            return this.fetch<any>(`/${table}`, {
              method: 'POST',
              body: JSON.stringify(data),
            });
          },
        }),
      }),

      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              return this.fetch<any>(`/${table}/${value}`, {
                method: 'PUT',
                body: JSON.stringify(data),
              });
            },
          }),
        }),
      }),

      upsert: (data: any, options?: { onConflict?: string }) => ({
        select: () => ({
          single: async () => {
            return this.fetch<any>(`/${table}/upsert`, {
              method: 'POST',
              body: JSON.stringify({ data, onConflict: options?.onConflict }),
            });
          },
        }),
      }),

      delete: () => ({
        eq: (column: string, value: any) => this.fetch(`/${table}/${value}`, {
          method: 'DELETE',
        }),
      }),
    };
  }

  async rpc(functionName: string, params?: Record<string, any>): Promise<{ data: any; error: any }> {
    return this.fetch<any>(`/rpc/${functionName}`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }
}

export const apiClient = new ApiClient();
