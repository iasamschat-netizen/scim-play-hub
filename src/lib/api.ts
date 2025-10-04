import { toast } from "sonner";

const API_BASE_URL = "/admin";

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const apiRequest = async (
  endpoint: string,
  options: ApiRequestOptions = {}
) => {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (requiresAuth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      toast.error("Sessão expirada. Faça login novamente.");
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

export interface Client {
  id: string;
  client_id: string;
  client_name: string;
  client_secret?: string;
  grant_types: string[];
  redirect_uris: string[];
  scopes: string[];
  access_token_ttl: number;
  created_at: string;
}

export interface CreateClientPayload {
  client_id: string;
  client_name: string;
  client_secret?: string;
  grant_types: string[];
  redirect_uris: string[];
  scopes: string[];
  access_token_ttl: number;
}

export const clientsApi = {
  list: async (page = 1, size = 10): Promise<Client[]> => {
    return apiRequest(`/clients?page=${page}&size=${size}`);
  },

  get: async (id: string): Promise<Client> => {
    return apiRequest(`/clients/${id}`);
  },

  create: async (payload: CreateClientPayload): Promise<Client> => {
    return apiRequest("/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<CreateClientPayload>): Promise<Client> => {
    return apiRequest(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/clients/${id}`, {
      method: "DELETE",
    });
  },
};
