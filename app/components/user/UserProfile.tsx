import { Card, Descriptions, Typography } from "antd";
import { useAccount } from "../../store/account/AccountContext";

const { Title } = Typography;

export default function UserProfile() {
  const { state } = useAccount();
  const account = state.accountDetails;
  const user = account?.userDetails;

  return (
    <div className="page-container">
      <Title level={2}>User Profile</Title>
      <p className="page-description">View the personal and account details associated with your profile.</p>
      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="First name">{user?.firstName || "—"}</Descriptions.Item>
          <Descriptions.Item label="Last name">{user?.lastName || "—"}</Descriptions.Item>
          <Descriptions.Item label="Email">{account?.email || "—"}</Descriptions.Item>
          <Descriptions.Item label="Phone number">{account?.phoneNumber || user?.phoneNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Account status">{account?.enabled ? "Active" : "Inactive"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
