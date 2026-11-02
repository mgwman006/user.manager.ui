import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Image,
  Layout,
  Menu,
  notification,
  Spin,
  Typography,
} from "antd";
import {
  BankOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { AccountState } from "../../types/types";
import { useAccount } from "../../store/account/AccountContext";

const { Content, Header, Sider } = Layout;
const { Text } = Typography;
const authUrl = import.meta.env.VITE_AUTH_URL?.trim();
const userManagerUrl = import.meta.env.VITE_USER_MANAGER_APP_URL?.trim();

function isTokenExpired(token?: string): boolean {
  if (!token) {
    return true;
  }

  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload?.exp !== "number" || Date.now() >= payload.exp * 1000;
  } catch (error) {
    console.error("Failed to decode JWT", error);
    return true;
  }
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationApi, contextHolder] = notification.useNotification();
  const { state, dispatch } = useAccount();
  const accountStateString = searchParams.get("state");
  const accountDetails = state.accountDetails;
  const userDetails = accountDetails?.userDetails;

  useEffect(() => {
    const navigateToAuth = () => {
      if (!authUrl || !userManagerUrl) {
        console.error("Authentication redirect URLs are not configured.");
        return;
      }

      window.location.href = `${authUrl}?outGoingUrl=${encodeURIComponent(userManagerUrl)}&phoneNumber=${encodeURIComponent("")}`;
    };

    if (!accountStateString) {
      if (!accountDetails) {
        navigateToAuth();
      } else if (isTokenExpired(accountDetails.token)) {
        notificationApi.error({
          message: "Session expired",
          description: "Your sign-in session has expired. Please sign in again.",
        });
        dispatch({ type: "LOGOUT" });
        navigateToAuth();
      } else if (!accountDetails.userDetails?.firstName?.trim() || !accountDetails.userDetails?.lastName?.trim()) {
        notificationApi.error({
          message: "User details missing",
          description: "Your sign-in state is incomplete. Please sign in again.",
        });
        dispatch({ type: "LOGOUT" });
        navigateToAuth();
      }
      return;
    }

    try {
      const receivedAccountState: AccountState = JSON.parse(accountStateString);
      const details = receivedAccountState.accountDetails;

      if (!details) {
        throw new Error("Account state payload is missing accountDetails");
      }

      if (isTokenExpired(details.token)) {
        notificationApi.error({
          message: "Session expired",
          description: "Your sign-in session has expired. Please sign in again.",
        });
        dispatch({ type: "LOGOUT" });
        navigateToAuth();
        return;
      }

      if (!details.userDetails?.firstName?.trim() || !details.userDetails?.lastName?.trim()) {
        notificationApi.error({
          message: "User details missing",
          description: "Your sign-in state is incomplete. Please sign in again.",
        });
        dispatch({ type: "LOGOUT" });
        navigateToAuth();
        return;
      }

      if (!accountDetails || accountDetails.token !== details.token || !accountDetails.userDetails) {
        dispatch({ type: "FETCH_SUCCESS", payload: details });
      }
    } catch (error) {
      console.error("Failed to parse account state from URL", error);
      notificationApi.error({
        message: "Unable to sign in",
        description: "The sign-in response was invalid. Please try again.",
      });
      dispatch({ type: "LOGOUT" });
      navigateToAuth();
    }
  }, [accountStateString, accountDetails, dispatch, notificationApi]);

  const selectedKey = location.pathname === "/" ? "/" : location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {contextHolder}
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
        <div className="dashboard-brand">
          <Image preview={false} src="/tante-logo.svg" width={100} height={30} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: "/", icon: <HomeOutlined />, label: "Home" },
            { key: "/profile", icon: <UserOutlined />, label: "User Profile" },
            { key: "/organisations", icon: <BankOutlined />, label: "Organisations" },
            { key: "/settings", icon: <SettingOutlined />, label: "Settings" },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="dashboard-header">
          <Text strong className="dashboard-header-title">User Manager</Text>
          <div className="dashboard-user">
            <Avatar icon={<UserOutlined />} />
            <Text className="dashboard-user-name">
              {userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : "Loading account"}
            </Text>
          </div>
        </Header>
        <Content className="dashboard-content">
          {accountDetails ? <Outlet /> : <div className="dashboard-loading"><Spin size="large" /></div>}
        </Content>
      </Layout>
    </Layout>
  );
}
