import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Image,
  Layout,
  Menu,
  Spin,
  Typography,
} from "antd";
import {
  BankOutlined,
  HomeOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { AccountState } from "../../types/types";
import { useAccount } from "../../store/account/AccountContext";
import { getTokenExpiration, isTokenExpired } from "../../utilities/token";

const { Content, Header, Sider } = Layout;
const { Text } = Typography;
export default function Home() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch, requireAuthentication } = useAccount();
  const accountStateString = searchParams.get("state");
  const accountDetails = state.accountDetails;
  const userDetails = accountDetails?.userDetails;

  useEffect(() => {
    if (!accountStateString) {
      if (!accountDetails) {
        requireAuthentication();
      } else if (isTokenExpired(accountDetails.token)) {
        requireAuthentication("Your sign-in session has expired. Please sign in again.");
      } else if (!accountDetails.userDetails?.firstName?.trim() || !accountDetails.userDetails?.lastName?.trim()) {
        requireAuthentication("Your sign-in state is incomplete. Please sign in again.");
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
        requireAuthentication("Your sign-in session has expired. Please sign in again.");
        return;
      }

      if (!details.userDetails?.firstName?.trim() || !details.userDetails?.lastName?.trim()) {
        requireAuthentication("Your sign-in state is incomplete. Please sign in again.");
        return;
      }

      if (!accountDetails || accountDetails.token !== details.token || !accountDetails.userDetails) {
        dispatch({ type: "FETCH_SUCCESS", payload: details });
      }
      const remainingParams = new URLSearchParams(searchParams);
      remainingParams.delete("state");
      const search = remainingParams.toString();
      navigate({ pathname: location.pathname, search: search ? `?${search}` : "", hash: location.hash }, { replace: true });
    } catch (error) {
      console.error("Failed to parse account state from URL", error);
      requireAuthentication("The sign-in response was invalid. Please try again.");
    }
  }, [accountStateString, accountDetails, dispatch, requireAuthentication, navigate, location.pathname, location.hash, searchParams]);

  useEffect(() => {
    if (accountStateString || !accountDetails?.token) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const checkExpiration = () => {
      clearTimeout(timer);
      const expiration = getTokenExpiration(accountDetails.token);
      if (expiration === undefined || Date.now() >= expiration) {
        requireAuthentication("Your sign-in session has expired. Please sign in again.");
        return;
      }
      timer = setTimeout(checkExpiration, Math.min(expiration - Date.now(), 2_147_483_647));
    };

    checkExpiration();
    window.addEventListener("focus", checkExpiration);
    document.addEventListener("visibilitychange", checkExpiration);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", checkExpiration);
      document.removeEventListener("visibilitychange", checkExpiration);
    };
  }, [accountStateString, accountDetails?.token, requireAuthentication]);

  const selectedKey = location.pathname === "/" ? "/" : location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
            { key: "/invitations", icon: <MailOutlined />, label: "Invitations" },
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
          {accountDetails && !accountStateString && !isTokenExpired(accountDetails.token) ? <Outlet /> : <div className="dashboard-loading"><Spin size="large" /></div>}
        </Content>
      </Layout>
    </Layout>
  );
}
