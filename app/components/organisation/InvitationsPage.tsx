import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Flex, List, Popconfirm, Space, Spin, Tag, Typography, notification } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { invitationApi } from "../../api/api";
import { getUserMemberships } from "../../services/organisationService";
import { useAccount } from "../../store/account/AccountContext";
import { InvitationDetailsDTO } from "../../types/types";
import { handleApiError } from "../../utilities/error-handler";

const { Title, Text } = Typography;

export default function InvitationsPage() {
  const { state, dispatch } = useAccount();
  const [notificationApi, contextHolder] = notification.useNotification();
  const account = state.accountDetails;
  const token = account?.token;
  const [invitations, setInvitations] = useState<InvitationDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [action, setAction] = useState<{ id: number; type: "accept" | "decline" }>();
  const actionInProgress = useRef(false);
  const mounted = useRef(false);
  const currentToken = useRef(token);
  currentToken.current = token;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setInvitations([]);

    if (!token?.trim()) {
      setLoading(false);
      setLoadFailed(true);
      notificationApi.error({
        message: "Unable to load invitations",
        description: "Your sign-in session is missing. Please sign in again.",
      });
      return () => { active = false; };
    }

    void invitationApi.getPending(token).then((result) => {
      if (active) setInvitations(result);
    }).catch((error: unknown) => {
      if (active) {
        setLoadFailed(true);
        handleApiError(error, notificationApi);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [token, notificationApi, refresh]);

  async function respond(invitation: InvitationDetailsDTO, type: "accept" | "decline") {
    if (actionInProgress.current) return;
    if (!account || !token?.trim()) {
      notificationApi.error({
        message: "Unable to respond to invitation",
        description: "Your sign-in session is missing. Please sign in again.",
      });
      return;
    }

    actionInProgress.current = true;
    setAction({ id: invitation.id, type });
    const isCurrentSession = () => mounted.current && currentToken.current === token;
    try {
      const updated = type === "accept"
        ? await invitationApi.accept(invitation.id, token)
        : { ...invitation, status: "DECLINED" as const };
      if (type === "decline") {
        await invitationApi.decline(invitation.id, token);
      }
      if (!isCurrentSession()) return;

      setInvitations((items) => items.map((item) => item.id === invitation.id ? updated : item));
      notificationApi.success({
        message: type === "accept" ? "Invitation accepted" : "Invitation declined",
        description: invitation.organizationName,
      });

      if (type === "accept") {
        const memberships = await getUserMemberships(account, notificationApi);
        if (isCurrentSession() && memberships) {
          dispatch({ type: "SET_MEMBERSHIPS", payload: memberships });
        }
      }
    } catch (error: unknown) {
      if (isCurrentSession()) handleApiError(error, notificationApi);
    } finally {
      actionInProgress.current = false;
      if (mounted.current) setAction(undefined);
    }
  }

  return (
    <div className="page-container">
      {contextHolder}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <Title level={2}>Invitations</Title>
        <Button
          icon={<ReloadOutlined />}
          disabled={loading || !!action}
          onClick={() => setRefresh((value) => value + 1)}
        >
          Refresh
        </Button>
      </Flex>
      <p className="page-description">Review invitations to join organisations.</p>
      <Alert
        type="info"
        showIcon
        message="Only pending invitations are available from the server. Responses shown here disappear when you refresh or leave this page."
        style={{ marginBottom: 16 }}
      />
      <Card>
        {loading ? (
          <Flex justify="center" style={{ padding: 40 }}><Spin size="large" /></Flex>
        ) : loadFailed ? (
          <Alert type="error" message="Unable to load invitations" action={
            <Button onClick={() => setRefresh((value) => value + 1)}>Retry</Button>
          } />
        ) : (
          <List
            dataSource={invitations}
            rowKey="id"
            locale={{ emptyText: "No pending invitations" }}
            renderItem={(invitation) => (
              <List.Item>
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle" style={{ width: "100%" }}>
                  <Space direction="vertical" size={4}>
                    <Text strong>{invitation.organizationName}</Text>
                    <Text type="secondary">Role: {invitation.role}</Text>
                    <Tag color={invitation.status === "PENDING" ? "gold" : invitation.status === "ACCEPTED" ? "green" : "default"}>
                      {invitation.status}
                    </Tag>
                  </Space>
                  {invitation.status === "PENDING" && (
                    <Space wrap>
                      <Button type="primary" disabled={!!action} loading={action?.id === invitation.id && action.type === "accept"} onClick={() => void respond(invitation, "accept")}>
                        Accept
                      </Button>
                      <Popconfirm title="Decline this invitation?" onConfirm={() => respond(invitation, "decline")} okText="Decline">
                        <Button danger disabled={!!action} loading={action?.id === invitation.id && action.type === "decline"}>Decline</Button>
                      </Popconfirm>
                    </Space>
                  )}
                </Flex>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
