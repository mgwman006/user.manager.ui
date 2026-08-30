import React, { useEffect, useState } from 'react';
import { List, Button, Spin, notification, Modal, Form } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useAccount } from '../../store/account/AccountContext';
import { organisationsApi } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { MembershipDetailsDTO, OrganisationDTO } from '../../types/types';

export default function OrganisationList(memmbershipsData: MembershipDetailsDTO[]) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { state } = useAccount();


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

      const response = await organisationsApi.create(payload, state.accountDetails?.token);


      form.resetFields();
      setIsModalOpen(false);
      navigate('/organisations');
    } catch (error: any) {
      notification.error({
        message: 'Unable to create organisation',
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
          dataSource={memmbershipsData}
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
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
        >
          <Form.Item
            style={{ width: '100%' }}
            label="Organisation Name"
            name="name"
            rules={[{ required: true, message: 'Please input the organisation name!' }]}
          >
            <input width="100%" />
          </Form.Item>

          <Form.Item
            label="Business Email"
            name="businessEmail"
            rules={[{ required: true, message: 'Please input the business email!' }]}
          >
            <input type="email" />
          </Form.Item>

          <Form.Item
            label="Organisation Type"
            name="type"
            rules={[{ required: true, message: 'Please select the organisation type!' }]}
          >
            <select>
              <option value="">Select Type</option>
              <option value="CONSTRUCTION_COMPANY">Construction Company</option>
              <option value="PROPERTY_MANAGER">Property Manager</option>
              <option value="REAL_ESTATE_AGENCY">Real Estate Agency</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="CONTRACTOR">Contractor</option>
              <option value="CONSULTANT">Consultant</option>
              <option value="OTHER">Other</option>
              {/* Add more options as needed */}
            </select>
          </Form.Item>

          <Form.Item
            label="Street Address"
            name="street"
            rules={[{ required: true, message: 'Please input the street address!' }]}
          >
            <input />
          </Form.Item>

          <Form.Item
            label="Area"
            name="area"
            rules={[{ required: true, message: 'Please input the area!' }]}
          >
            <input />
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: 'Please input the city!' }]}
          >
            <input />
          </Form.Item>

          <Form.Item
            label="Region"
            name="region"
            rules={[{ required: true, message: 'Please input the region!' }]}
          >
            <input />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Please input the country!' }]}
          >
            <input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Organisation <RightOutlined />
            </Button>
          </Form.Item>
          
        </Form>
      </Modal>
    </div>
  );
}
