import React, { useEffect, useState } from 'react';
import { List, Button, Spin, Modal, Form, Input, Select } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useAccount } from '../../store/account/AccountContext';
import { organisationsApi, membershipApi } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { MembershipDetailsDTO, OrganisationDTO } from '../../types/types';
import { NotificationInstance } from 'antd/es/notification/interface';

export default function OrganisationList(membershipsData: MembershipDetailsDTO[], notificationApi: NotificationInstance) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { state } = useAccount();
  const [memberships, setMemberships] = useState<MembershipDetailsDTO[]>(membershipsData);


  async function createOrganisation(values: any): Promise<void> {
    try {
      const payload = {
        name: values.name,
        businessEmail: values.businessEmail,
        type: values.type,
        address: {
          street: values.street,
          area: values.area,
          city: values.city,
          region: values.region,
          country: values.country,
        },
      };

      const response = await organisationsApi.create(state.accountDetails?.userDetails?.id ?? 0, payload, state.accountDetails?.token);
      loadMemberships();
      setIsModalOpen(false);
    } catch (error: any) {
      setIsModalOpen(false);
      notificationApi.error({
        message: 'Unable to create organisation',
        description: error?.response?.data?.message || 'Please try again.',
      });
    }
  }

  async function loadMemberships(): Promise<void> {
    try {
      const response = await membershipApi.getByUserId(state.accountDetails?.userDetails?.id ?? 0, state.accountDetails?.token);
      setMemberships(response);
    } catch (error: any) {
      notificationApi.error({
        message: 'Unable to load memberships',
        description: error?.response?.data?.message || 'Please try again.',
      });
    }
  }


  return (
    <div 
      // /style={{ padding: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Your Organisations</h2>
        <div>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Create New Organisation
          </Button>
        </div>
      </div>

     
        <List
          bordered
          dataSource={memberships}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.organizationName ? item.organizationName : "Unnamed Organisation"}
                description={item.membershipRole ? `Role: ${item.membershipRole}` : undefined}
              />
            </List.Item>
          )}
        />
      
      <Modal
        title="Create New Organisation"
        onCancel={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
        footer={null}
        open={isModalOpen}
         width={{
          xs: '90%',
          sm: '80%',
          md: '60%',
          lg: '60%',
          xl: '60%',
          xxl: '60%',
        }}
      >
        <Form
          onFinish={createOrganisation}
          form={form}
          layout="horizontal"
          size="large"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18}}
        >
          <Form.Item
            style={{ width: '100%' }}
            label="Organisation Name"
            name="name"
            rules={[{ required: true, message: 'Please input the organisation name!' }]}
          >
            <Input width="100%" />
          </Form.Item>

          <Form.Item
            label="Business Email"
            name="businessEmail"
            rules={[{ required: true, message: 'Please input the business email!' }]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Organisation Type"
            name="type"
            rules={[{ required: true, message: 'Please select the organisation type!' }]}
          >
            <Select
              defaultValue="Select Type"
              options={[
                { value: 'CONSTRUCTION_COMPANY', label: 'Construction Company' },
                { value: 'PROPERTY_MANAGER', label: 'Property Manager' },
                { value: 'REAL_ESTATE_AGENCY', label: 'Real Estate Agency' },
                { value: 'SUPPLIER', label: 'Supplier' },
                { value: 'CONTRACTOR', label: 'Contractor' },
                { value: 'CONSULTANT', label: 'Consultant' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Street Address"
            name="street"
            rules={[{ required: true, message: 'Please input the street address!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Area"
            name="area"
            rules={[{ required: true, message: 'Please input the area!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: 'Please input the city!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Region"
            name="region"
            rules={[{ required: true, message: 'Please input the region!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Please input the country!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={null}
          >
            <Button type="primary" htmlType="submit">
              Create Organisation <RightOutlined />
            </Button>
          </Form.Item>
          
        </Form>
      </Modal>
    </div>
  );
}
