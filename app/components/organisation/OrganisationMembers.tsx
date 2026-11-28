import { useEffect, useState } from "react";
import { Alert, Button, List, Spin } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import { MembershipDetailsDTO } from "../../types/types";
import { getOrganisationMembers } from "../../services/organisationService";

type Props = {
  organisationId: number;
  token?: string;
  notificationApi: NotificationInstance;
};

export function getMemberDisplayName(member: MembershipDetailsDTO): string {
  const name = [member.userFirstName, member.userLastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return name || (member.userId === null ? `Membership #${member.id}` : `User #${member.userId}`);
}

export default function OrganisationMembers({ organisationId, token, notificationApi }: Props) {
  const [members, setMembers] = useState<MembershipDetailsDTO[]>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMembers(undefined);
    void getOrganisationMembers(token, organisationId, notificationApi).then((result) => {
      if (active) {
        setMembers(result);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [organisationId, token, notificationApi, attempt]);

  if (loading) {
    return <Spin tip="Loading members"><div style={{ minHeight: 80 }} /></Spin>;
  }
  if (!members) {
    return (
      <Alert
        type="error"
        message="Unable to load members"
        action={<Button onClick={() => setAttempt((value) => value + 1)}>Retry</Button>}
      />
    );
  }

  return (
    <List
      dataSource={members}
      rowKey="id"
      locale={{ emptyText: "No members" }}
      renderItem={(member) => (
        <List.Item>
          <List.Item.Meta
            title={getMemberDisplayName(member)}
            description={`Role: ${member.membershipRole}`}
          />
        </List.Item>
      )}
    />
  );
}
