import { useState } from 'react';
import { Alert, Button, Collapse, Flex, Form, Input, Modal, Result, Select, Spin, Tag, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons';
import { useAccount } from '../../store/account/AccountContext';
import { InvitationCreateRequestDTO, MembershipDetailsDTO } from '../../types/types';
import { NotificationInstance } from 'antd/es/notification/interface';
import { OrganizationCreateDTO } from '../../types/organisation';
import { createOrganisation, getUserMemberships, inviteOrganisationMember } from '../../services/organisationService';
import OrganisationMembers from './OrganisationMembers';

type OrganisationListProps = {
  membershipsData: MembershipDetailsDTO[];
  notificationApi: NotificationInstance;
  loading: boolean;
  loadFailed: boolean;
  onRefresh: () => void;
};

const { Text } = Typography;

export default function OrganisationList({ membershipsData, notificationApi, loading, loadFailed, onRefresh }: OrganisationListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<MembershipDetailsDTO | null>(null);
  const [openOrganisations, setOpenOrganisations] = useState<string[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [organisationForm] = Form.useForm<OrganizationCreateDTO>();
  const [membershipForm] = Form.useForm<Omit<InvitationCreateRequestDTO, "adminUserId">>();
  const { state, dispatch } = useAccount();

  async function handleCreateOrganisation(values: OrganizationCreateDTO): Promise<void> {
    setIsSubmitting(true);
    try {
      const createdOrganisation = await createOrganisation(state.accountDetails, values, notificationApi);
      if (!createdOrganisation) {
        return;
      }

      setIsModalOpen(false);
      organisationForm.resetFields();

      const updatedMemberships = await getUserMemberships(state.accountDetails, notificationApi);
      if (updatedMemberships) {
        dispatch({ type: "SET_MEMBERSHIPS", payload: updatedMemberships });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddMember(values: Omit<InvitationCreateRequestDTO, "adminUserId">): Promise<void> {
    if (!selectedOrganisation) {
      return;
    }
    setIsAddingMember(true);
    try {
      const invitation = await inviteOrganisationMember(
        state.accountDetails, selectedOrganisation.organizationId, values, notificationApi,
      );
      if (invitation) {
        notificationApi.success({
          message: "Invitation sent",
          description: `An invitation was sent to join ${selectedOrganisation.organizationName}.`,
        });
        setSelectedOrganisation(null);
        membershipForm.resetFields();
      }
    } finally {
      setIsAddingMember(false);
    }
  }


  return (
    <div>
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle" style={{ marginBottom: 16 }}>
        <h2>Your Organisations</h2>
        <Flex gap="small">
          <Button icon={<ReloadOutlined />} onClick={onRefresh} disabled={loading}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Create New Organisation
          </Button>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" style={{ padding: 40 }}><Spin size="large" /></Flex>
      ) : loadFailed ? (
        <Alert type="error" message="Unable to load organisations" action={<Button onClick={onRefresh}>Retry</Button>} />
      ) : membershipsData.length === 0 ? (
        <Result
          status="info"
          title="No organisations yet"
          subTitle="Create an organisation to start managing its members."
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Create Organisation</Button>}
        />
      ) : (
        <Flex vertical gap="middle">
          <div><Tag>{membershipsData.length} {membershipsData.length === 1 ? "organisation" : "organisations"}</Tag></div>
          <Collapse
            activeKey={openOrganisations}
            onChange={(keys) => setOpenOrganisations(keys)}
            items={membershipsData.map((item) => ({
              key: String(item.organizationId),
              label: (
                <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                  <Text strong>{item.organizationName || "Unnamed Organisation"}</Text>
                  {item.membershipRole && <Tag>Role: {item.membershipRole}</Tag>}
                </Flex>
              ),
              children: openOrganisations.includes(String(item.organizationId)) ? (
                <Flex vertical gap="middle">
                  <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                    <Text strong>Members</Text>
                    {(item.membershipRole === "OWNER" || item.membershipRole === "ADMIN") && (
                      <Button icon={<PlusOutlined />} onClick={() => setSelectedOrganisation(item)}>Add member</Button>
                    )}
                  </Flex>
                  <OrganisationMembers
                    key={item.organizationId}
                    organisationId={item.organizationId}
                    token={state.accountDetails?.token}
                    notificationApi={notificationApi}
                  />
                </Flex>
              ) : null,
            }))}
          />
        </Flex>
      )}

      <Modal
        title={`Invite member to ${selectedOrganisation?.organizationName ?? "organisation"}`}
        open={selectedOrganisation !== null}
        onCancel={() => { setSelectedOrganisation(null); membershipForm.resetFields(); }}
        closable={!isAddingMember}
        maskClosable={!isAddingMember}
        keyboard={!isAddingMember}
        footer={null}
      >
        <Form form={membershipForm} layout="vertical" onFinish={handleAddMember} initialValues={{ role: "MEMBER" }}>
          <Form.Item
            label="Invitee's phone number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Please enter the user's phone number." },
              { pattern: /^(?:0[0-9]{9}|\+?255[0-9]{9})$/, message: "Enter a valid Tanzanian phone number." },
            ]}
          >
            <Input placeholder="0712345678" />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select options={[
              { value: "MEMBER", label: "Member" },
              { value: "ADMIN", label: "Admin" },
            ]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isAddingMember}>Send invitation</Button>
        </Form>
      </Modal>

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
