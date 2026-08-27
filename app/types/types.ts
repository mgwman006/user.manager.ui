export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export interface AccountDetailsDto {
  id: number;
  phoneNumber: string;
  email: string;
  enabled: boolean;
  userDetails: UserDetailsDTO,
  token?: string,
  organisations?: OrganisationDTO[]
}

// types/api.ts
export type ApiErrorData = {
  message: string;       // error type e.g. "VALIDATION_FAILED", "UNAUTHORIZED"
  data: string | Record<string, string> | null;  // detailed error e.g. "Invalid phone number" or { field: "message" }
  statusCode: number;
};

export class ApiError extends Error {
  statusCode: number;
  details: string | Record<string, string> | null;

  constructor(values: ApiErrorData) {
    super(values.message);
    this.statusCode =values. statusCode;
    this.details = values.data;
  }
}


export type AccountState = {
  accountDetails: AccountDetailsDto | null;
  loading: boolean;
  error: string | null;
  outGoingUrl: string | null;
};

export type AccountAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: AccountDetailsDto }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "APPEND_USER"; payload: UserDetailsDTO }
  | { type: "SET_ORGANISATIONS"; payload: OrganisationDTO[] }
  | { type: "APPEND_JWT"; payload: string }
  | { type: "ADD_OUTGOING_URL"; outGoingUrl : string | null };


export interface AccountAuthRequestDTO
{ 
  phoneNumber:string;
  passWord:string
}

export interface AccountAuthResponseDTO
{
  phoneNumber:string
  jwtToken:string
}

export interface AccountCreateDto
{ 
  phoneNumber:string;
  passWord:string
}

export interface UserDetailsDTO
{
  id:number,
  firstName:string,
  lastName:string,
  phoneNumber:string,
  tenantId:number,
  memberships: MembershipDetailsDTO[]
}

export interface MembershipDetailsDTO
{
  id:number;
  userId:number,
  rentalProfileId:number,
  businessRoles:string[]
}

export interface UserCreateRequestDto
{
  firstName: string,
  lastName: string,
  phoneNumber: string
}

export interface OrganisationDTO {
  id: number;
  name: string;
  role?: string;
  createdAt?: string;
}


