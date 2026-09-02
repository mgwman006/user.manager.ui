import axios from 'axios';
import { AccountAction, AccountAuthRequestDTO, AccountAuthResponseDTO, AccountCreateDto, AccountDetailsDto, ApiError, ApiResponse, UserCreateRequestDto, UserDetailsDTO, OrganisationDTO, MembershipDetailsDTO } from '../types/types';

const apiUrl = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: `${apiUrl}/auth-manager/v1`, 
  headers: {
    'Content-Type': 'application/json',
  } ,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { message, data, statusCode } = error.response.data;

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
  getForUser: async (phoneNumber?: string, token?: string): Promise<OrganisationDTO[]> => {
    const url = phoneNumber ? `/users/${phoneNumber}/organisations` : `/organisations`;
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiClient.get<ApiResponse<OrganisationDTO[]>>(url, { headers });
    return handleResponse(res.data);
  },
  create: async (ownerId:number, payload: any, token?: string): Promise<OrganisationDTO> => {
    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await apiClient.post<ApiResponse<OrganisationDTO>>(`/organisations/${ownerId}`, payload, { headers });
    return handleResponse(res.data);
  }
};

export const membershipApi = {
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

export function handleResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message ?? "Request failed");
  }

  return response.data;
}
