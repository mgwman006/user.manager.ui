import { useState } from 'react';
import { List, Button, Modal, Form, Input, Select } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useAccount } from '../../store/account/AccountContext';
import { MembershipDetailsDTO } from '../../types/types';
import { NotificationInstance } from 'antd/es/notification/interface';
import { OrganizationCreateDTO } from '../../types/organisation';
import { createOrganisation, getUserMemberships } from '../../services/organisationService';

type OrganisationListProps = {
  membershipsData: MembershipDetailsDTO[];
  notificationApi: NotificationInstance;
};

export default function OrganisationList({ membershipsData, notificationApi }: OrganisationListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organisationForm] = Form.useForm<OrganizationCreateDTO>();
  const { state } = useAccount();
  const [memberships, setMemberships] = useState<MembershipDetailsDTO[]>(membershipsData);

  async function handleCreateOrganisation(values: OrganizationCreateDTO): Promise<void> {
    setIsSubmitting(true);
    const createdOrganisation = await createOrganisation(state.accountDetails,values,notificationApi,);
    if (!createdOrganisation) {
      return;
    }

    setIsModalOpen(false);
    organisationForm.resetFields();

    const updatedMemberships = await getUserMemberships(state.accountDetails, notificationApi);
    if (updatedMemberships) {
      setMemberships(updatedMemberships);
    }

    setIsSubmitting(false);
  }


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Your Organisations</h2>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Create New Organisation
        </Button>
      </div>

      <List
        bordered
        dataSource={memberships}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.organizationName || "Unnamed Organisation"}
              description={item.membershipRole ? `Role: ${item.membershipRole}` : undefined}
            />
          </List.Item>
        )}
      />

      <Modal
        title="Create New Organisation"
        onCancel={() => setIsModalOpen(false)}
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
          onFinish={handleCreateOrganisation}
          form={organisationForm}
          layout="horizontal"
          size="large"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
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
            label="Postal Code"
            name={['address', 'postalCode']}
            rules={[{ required: false, message: 'Please input the postal code!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Street Number"
            name={['address', 'streetNumber']}
            rules={[{ required: false, message: 'Please input the street number!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Street Name"
            name={['address', 'streetName']}
            rules={[{ required: true, message: 'Please input the street name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ward"
            name={['address', 'ward']}
            rules={[{ required: true, message: 'Please input the ward!' }]}
          >
            <Input />
          </Form.Item>


          <Form.Item
            label="City"
            name={['address', 'city']}
            rules={[{ required: true, message: 'Please input the city!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Region"
            name={['address', 'region']}
            rules={[{ required: true, message: 'Please input the region!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Country"
            name={['address', 'country']}
            rules={[{ required: true, message: 'Please input the country!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={null}
          >
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Create Organisation <RightOutlined />
            </Button>
          </Form.Item>
          
        </Form>
      </Modal>
    </div>
  );
}
