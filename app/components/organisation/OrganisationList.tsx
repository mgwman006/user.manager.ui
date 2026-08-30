import React, { useEffect, useState } from 'react';
import { List, Button, Spin, notification } from 'antd';
import { useAccount } from '../../store/account/AccountContext';
import { organisationsApi } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { OrganisationDTO } from '../../types/types';

export default function OrganisationList() {
  const { state, dispatch } = useAccount();
  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<OrganisationDTO[]>([]);
  const [notificationApi, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      if (!state?.accountDetails?.phoneNumber) return;
      setLoading(true);
      try {
        const token = state.accountDetails?.token;
        const response = await organisationsApi.getForUser(state.accountDetails.phoneNumber, token);
        setOrgs(response || []);
        dispatch({ type: 'SET_ORGANISATIONS', payload: response || [] });
      } catch (err:any) {
        notificationApi.error({ message: 'Failed to load organisations', description: err.message ?? String(err) });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [state?.accountDetails?.phoneNumber]);

  return (
    <div 
      // /style={{ padding: 24 }}
    >
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Your Organisations</h2>
        <div>
          <Button type="primary" onClick={() => navigate('/organisation')}>Create Organisation</Button>
        </div>
      </div>

      {loading ? (
        <Spin />
      ) : (
        <List
          bordered
          dataSource={orgs}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={item.role ? `Role: ${item.role}` : undefined}
              />
              <div>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
