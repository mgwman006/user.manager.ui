import axios from 'axios';
import { AccountAuthRequestDTO, AccountAuthResponseDTO, AccountCreateDto, AccountDetailsDto, ApiError, ApiResponse, UserCreateRequestDto, UserDetailsDTO, MembershipDetailsDTO, InvitationCreateRequestDTO, InvitationDetailsDTO } from '../types/types';
import { OrganizationCreateDTO, OrganisationDetailsDTO } from '../types/organisation';

const apiUrl = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: `${apiUrl}/auth-manager/v1`, 
  headers: {
    'Content-Type': 'application/json',
  } ,
});

type UnauthorizedListener = (authorization?: string) => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => { unauthorizedListeners.delete(listener); };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const authorization = error.config?.headers?.get?.("Authorization");
        unauthorizedListeners.forEach((listener) => listener(
          typeof authorization === "string" ? authorization : undefined,
        ));
      }
      const { message, data, statusCode } = error.response.data ?? {};

      return Promise.reject(
        new ApiError({
          message: message ?? "SERVER_ERROR",
          data: data ?? null,
          statusCode: statusCode ?? error.response.status,
        })
      );
    }

    if (error.request) {
      return Promise.reject(
        new ApiError({
          message: "NETWORK_ERROR",
          data: "No response from server",
          statusCode: 0,
        })
      );
    }

    return Promise.reject(
      new ApiError({
        message: "CLIENT_ERROR",
        data: "Unexpected error occurred",
        statusCode: 0,
      })
    );
  }
);


export const authApi = {
  getAccount: async (phoneNumber?: string) => {
    const res = await apiClient.get<ApiResponse<AccountDetailsDto>>("/auth/account", {
      params: { phoneNumber },
    });

    return handleResponse(res.data);
  },
  logIn: async (request: AccountAuthRequestDTO) => {
    const res =  await apiClient.post<ApiResponse<AccountAuthResponseDTO>>(`/auth`,request);
    return handleResponse(res.data);
  },
  register: async (request: AccountCreateDto) => {
    const res =  await apiClient.post<ApiResponse<AccountDetailsDto>>(`/auth/account`,request);
    return handleResponse(res.data);
  }
};

export const usersApi = {
  getByPhoneNumber: async (phoneNumber: string): Promise<UserDetailsDTO> => {
    const res = await apiClient.get<ApiResponse<UserDetailsDTO>>(`/users/${phoneNumber}`);
    return handleResponse(res.data);
  },
  registerUser: async (request: UserCreateRequestDto): Promise<UserDetailsDTO> => {
    const res = await apiClient.post<ApiResponse<UserDetailsDTO>>(`/users`, request);
    return handleResponse(res.data);
  },
};

export const organisationsApi = {
  getForUser: async (phoneNumber?: string, token?: string): Promise<OrganisationDetailsDTO[]> => {
    const url = phoneNumber ? `/users/${phoneNumber}/organisations` : `/organisations`;
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiClient.get<ApiResponse<OrganisationDetailsDTO[]>>(url, { headers });
    return handleResponse(res.data);
  },
  create: async (ownerId:number, payload: OrganizationCreateDTO, token: string): Promise<OrganisationDetailsDTO> => {
    if (!token?.trim()) {
      throw new Error("Your sign-in session is missing. Please sign in again.");
    }

    const res = await apiClient.post<ApiResponse<OrganisationDetailsDTO>>(
      `/organisations/${ownerId}`, 
      payload, 
      { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return handleResponse(res.data);
  }
};

export const membershipApi = {
  getForOrganisation: async (organizationId: number, token: string): Promise<MembershipDetailsDTO[]> => {
    const res = await apiClient.get<ApiResponse<MembershipDetailsDTO[]>>(
      `/memberships/organisations/${organizationId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return handleResponse(res.data);
  },
  getByUserId: async (userId: number, token?: string) => {
    const res = await apiClient.get<ApiResponse<MembershipDetailsDTO[]>>(`/memberships/${userId}`, 
      { 
        headers : { 
          'Authorization': `Bearer ${token}` 
        }
      });
    return handleResponse(res.data);
  }
};

export const invitationApi = {
  create: async (organizationId: number, request: InvitationCreateRequestDTO, token: string): Promise<InvitationDetailsDTO> => {
    const res = await apiClient.post<ApiResponse<InvitationDetailsDTO>>(
      `/invitations/organisations/${organizationId}`,
      request,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return handleResponse(res.data);
  },
  getPending: async (token: string): Promise<InvitationDetailsDTO[]> => {
    const res = await apiClient.get<ApiResponse<InvitationDetailsDTO[]>>(
      "/invitations/pending",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return handleResponse(res.data);
  },
  accept: async (invitationId: number, token: string): Promise<InvitationDetailsDTO> => {
    const res = await apiClient.post<ApiResponse<InvitationDetailsDTO>>(
      `/invitations/${invitationId}/accept`,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return handleResponse(res.data);
  },
  decline: async (invitationId: number, token: string): Promise<void> => {
    const res = await apiClient.post<ApiResponse<void>>(
      `/invitations/${invitationId}/decline`,
      undefined,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return handleResponse(res.data);
  },
};

export function handleResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message ?? "Request failed");
  }

  return response.data;
}
