import { AddressDTO } from "./types";

export enum OrganizationType {
  CONSTRUCTION_COMPANY = "CONSTRUCTION_COMPANY",
  PROPERTY_MANAGER = "PROPERTY_MANAGER",
  REAL_ESTATE_AGENCY = "REAL_ESTATE_AGENCY",
  SUPPLIER = "SUPPLIER",
  CONTRACTOR = "CONTRACTOR",
  CONSULTANT = "CONSULTANT",
  OTHER = "OTHER"
}

export interface OrganizationCreateDTO {
  name: string;
  businessEmail: string;
  address: AddressDTO;
  type: OrganizationType;
}

export interface OrganisationDetailsDTO {
  id: number;
  name: string;
  businessEmail: string; 
  address: AddressDTO;
  type: OrganizationType;
}