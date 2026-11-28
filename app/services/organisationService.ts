import { NotificationInstance } from "antd/es/notification/interface";
import { invitationApi, membershipApi, organisationsApi } from "../api/api";
import { OrganizationCreateDTO, OrganisationDetailsDTO } from "../types/organisation";
import { AccountDetailsDto, ApiError, InvitationCreateRequestDTO, InvitationDetailsDTO, MembershipDetailsDTO } from "../types/types";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.details === "string") {
      return error.details;
    }

    if (error.details) {
      return Object.values(error.details).join(", ");
    }

    return error.message;
  }

  return error instanceof Error ? error.message : "Please try again.";
}

function getAccountUserId(account: AccountDetailsDto | null): number | undefined {
  return account?.userDetails?.id;
}

async function loadUserMemberships(
  account: AccountDetailsDto,
  userId: number,
): Promise<MembershipDetailsDTO[]> {
  return membershipApi.getByUserId(userId, account.token);
}

export async function createOrganisation(
  account: AccountDetailsDto | null,
  organisation: OrganizationCreateDTO,
  notificationApi: NotificationInstance,
): Promise<OrganisationDetailsDTO | undefined> {
  const ownerId = getAccountUserId(account);
  if (!account || ownerId === undefined) {
    notificationApi.error({
      message: "Unable to create organisation",
      description: "Your account details are not available. Please sign in again.",
    });
    return undefined;
  }

  if (!account.token?.trim()) {
    notificationApi.error({
      message: "Unable to create organisation",
      description: "Your sign-in session is missing. Please sign in again.",
    });
    return undefined;
  }

  try {
    return await organisationsApi.create(ownerId, organisation, account.token);
  } catch (error: unknown) {
    notificationApi.error({
      message: "Unable to create organisation",
      description: getErrorMessage(error),
    });
    return undefined;
  }
}

export async function getUserMemberships(
  account: AccountDetailsDto | null,
  notificationApi: NotificationInstance,
): Promise<MembershipDetailsDTO[] | undefined> {
  const userId = getAccountUserId(account);
  if (!account || userId === undefined) {
    notificationApi.error({
      message: "Unable to load memberships",
      description: "Your account details are not available. Please sign in again.",
    });
    return undefined;
  }

  try {
    return await loadUserMemberships(account, userId);
  } catch (error: unknown) {
    notificationApi.error({
      message: "Unable to load memberships",
      description: getErrorMessage(error),
    });
    return undefined;
  }
}

export async function inviteOrganisationMember(
  account: AccountDetailsDto | null,
  organisationId: number,
  request: Omit<InvitationCreateRequestDTO, "adminUserId">,
  notificationApi: NotificationInstance,
): Promise<InvitationDetailsDTO | undefined> {
  if (!account?.token?.trim()) {
    notificationApi.error({
      message: "Unable to send invitation",
      description: "Your sign-in session is missing. Please sign in again.",
    });
    return undefined;
  }

  const adminUserId = account.userDetails?.id;
  if (adminUserId === undefined || !Number.isSafeInteger(adminUserId) || adminUserId <= 0) {
    notificationApi.error({
      message: "Unable to send invitation",
      description: "Your user details are not available. Please sign in again.",
    });
    return undefined;
  }

  try {
    return await invitationApi.create(organisationId, { ...request, adminUserId }, account.token);
  } catch (error: unknown) {
    notificationApi.error({
      message: "Unable to send invitation",
      description: getErrorMessage(error),
    });
    return undefined;
  }
}

export async function getOrganisationMembers(
  token: string | undefined,
  organisationId: number,
  notificationApi: NotificationInstance,
): Promise<MembershipDetailsDTO[] | undefined> {
  if (!token?.trim()) {
    notificationApi.error({
      message: "Unable to load members",
      description: "Your sign-in session is missing. Please sign in again.",
    });
    return undefined;
  }

  try {
    return await membershipApi.getForOrganisation(organisationId, token);
  } catch (error: unknown) {
    notificationApi.error({
      message: "Unable to load members",
      description: getErrorMessage(error),
    });
    return undefined;
  }
}
