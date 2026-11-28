import { notification, Typography } from "antd";
import { useEffect, useState } from "react";
import { useAccount } from "../../store/account/AccountContext";
import { getUserMemberships } from "../../services/organisationService";
import OrganisationList from "./OrganisationList";

const { Title } = Typography;

export default function OrganisationsPage() {
  const { state, dispatch } = useAccount();
  const [notificationApi, contextHolder] = notification.useNotification();
  const account = state.accountDetails;
  const userId = account?.userDetails?.id;
  const token = account?.token;
  const memberships = account?.userDetails?.memberships ?? [];
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!account || userId === undefined || !token) {
      setLoading(false);
      setLoadFailed(true);
      return;
    }

    let active = true;
    setLoading(true);
    setLoadFailed(false);
    void getUserMemberships(account, notificationApi).then((result) => {
      if (active) {
        if (result) {
          dispatch({ type: "SET_MEMBERSHIPS", payload: result });
        } else {
          setLoadFailed(true);
        }
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [userId, token, dispatch, notificationApi, refresh]);

  return (
    <div className="page-container">
      {contextHolder}
      <Title level={2}>Organisations</Title>
      <p className="page-description">Manage your organisation memberships and create new organisations.</p>
      <OrganisationList
        membershipsData={memberships}
        notificationApi={notificationApi}
        loading={loading}
        loadFailed={loadFailed}
        onRefresh={() => setRefresh((value) => value + 1)}
      />
    </div>
  );
}
