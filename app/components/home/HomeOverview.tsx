import { BankOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Statistic, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";

const { Title, Text } = Typography;

export default function HomeOverview() {
  const navigate = useNavigate();
  const { state } = useAccount();
  const user = state.accountDetails?.userDetails;
  const organisations = user?.memberships ?? [];
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return (
    <div className="page-container">
      <Card className="welcome-card">
        <Row align="middle" justify="space-between" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Text className="eyebrow">ACCOUNT OVERVIEW</Text>
            <Title level={2}>Welcome, {fullName}</Title>
            <Text type="secondary">
              Manage your profile and keep track of the organisations connected to your account.
            </Text>
          </Col>
          <Col>
            <Button type="primary" size="large" onClick={() => navigate("/profile")}>
              View profile
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} className="overview-stats">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Organisations"
              value={organisations.length}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Account"
              value={state.accountDetails?.enabled ? "Active" : "Inactive"}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div className="section-heading">
        <Title level={4}>Quick access</Title>
        <Text type="secondary">Go directly to the areas you use most.</Text>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="quick-link-card">
            <Space direction="vertical" size={12}>
              <BankOutlined className="quick-link-icon" />
              <Title level={5}>Organisations</Title>
              <Text type="secondary">View your memberships or create an organisation.</Text>
              <Button type="link" onClick={() => navigate("/organisations")}>Manage organisations</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="quick-link-card">
            <Space direction="vertical" size={12}>
              <UserOutlined className="quick-link-icon" />
              <Title level={5}>User profile</Title>
              <Text type="secondary">Review the contact details associated with your account.</Text>
              <Button type="link" onClick={() => navigate("/profile")}>View profile</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
