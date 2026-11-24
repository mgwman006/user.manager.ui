import { Button, Card, Descriptions, Space, Typography } from "antd";
import { useAccount } from "../../store/account/AccountContext";

const { Title, Text } = Typography;
export default function Settings() {
  const { state, requireAuthentication } = useAccount();
  const account = state.accountDetails;

  return (
    <div className="page-container">
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
            <Button danger onClick={() => requireAuthentication()}>Sign out</Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
