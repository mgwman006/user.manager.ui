import { notification, Typography } from "antd";
import { useAccount } from "../../store/account/AccountContext";
import OrganisationList from "./OrganisationList";

const { Title } = Typography;

export default function OrganisationsPage() {
  const { state } = useAccount();
  const [notificationApi, contextHolder] = notification.useNotification();
  const memberships = state.accountDetails?.userDetails?.memberships ?? [];

  return (
    <div className="page-container">
      {contextHolder}
      <Title level={2}>Organisations</Title>
      <p className="page-description">Manage your organisation memberships and create new organisations.</p>
      <OrganisationList membershipsData={memberships} notificationApi={notificationApi} />
    </div>
  );
}
