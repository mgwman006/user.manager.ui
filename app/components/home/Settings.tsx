import { Button, Card, Descriptions, Space, Typography, notification } from "antd";
import { useAccount } from "../../store/account/AccountContext";

const { Title, Text } = Typography;
const authUrl = import.meta.env.VITE_AUTH_URL?.trim();
const userManagerUrl = import.meta.env.VITE_USER_MANAGER_APP_URL?.trim();

export default function Settings() {
  const { state, dispatch } = useAccount();
  const [notificationApi, contextHolder] = notification.useNotification();
  const account = state.accountDetails;

  const signOut = () => {
    dispatch({ type: "LOGOUT" });
    if (!authUrl || !userManagerUrl) {
      notificationApi.error({
        message: "Unable to sign out",
        description: "Authentication redirect URLs are not configured.",
      });
      console.error("Authentication redirect URLs are not configured.");
      return;
    }

    window.location.href = `${authUrl}?outGoingUrl=${encodeURIComponent(userManagerUrl)}&phoneNumber=${encodeURIComponent("")}`;
  };

  return (
    <div className="page-container">
      {contextHolder}
      <Title level={2}>Settings</Title>
      <p className="page-description">Review your account access and sign-in session.</p>
      <Card title="Account access">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Email">{account?.email || "—"}</Descriptions.Item>
            <Descriptions.Item label="Phone number">{account?.phoneNumber || "—"}</Descriptions.Item>
            <Descriptions.Item label="Session status">
              <Text type="success">Signed in</Text>
            </Descriptions.Item>
          </Descriptions>
          <div>
            <Button danger onClick={signOut}>Sign out</Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
