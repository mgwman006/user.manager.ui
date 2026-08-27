import { Button, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";
import { useEffect } from "react";


export default function UserProfile() {
  const { state } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    const token = state?.accountDetails?.token;
    const userDetails = state?.accountDetails?.userDetails;
    const hasUserDetails = !!(userDetails && userDetails.firstName && userDetails.lastName);
    const authUi = import.meta.env.VITE_AUTH_UI_URL || "";

    if (!token || !hasUserDetails) {
      if (authUi) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${authUi}?returnUrl=${returnUrl}`;
      } else {
        console.warn("No auth token or user details found and VITE_AUTH_UI_URL is not set. Set VITE_AUTH_UI_URL to redirect users to the auth manager.");
      }
    }
  }, [state]);

  if (!state?.accountDetails?.userDetails) {
    return null;
  }

  const user = state.accountDetails.userDetails;

  return (
    <div style={{ height: "100vh" }}>
      <Row justify={'center'} align={'middle'} style={{ height: "100%" }}>
        <Col xs={20} sm={20} md={6} lg={6} xl={6} xxl={6}>
          <div style={{ textAlign: 'center' }}>
            <h1>Profile</h1>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Phone:</strong> {state?.accountDetails?.phoneNumber}</p>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => navigate('/organisations')}>View Organisations</Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
