import { Button, Col, Form, notification, Row } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAccount } from "../../store/account/AccountContext";
import { useEffect, useState } from "react";
import { AccountState, MembershipDetailsDTO } from "../../types/types";
import OrganisationList from "../organisation/OrganisationList";
import { membershipApi } from "../../api/api";
import { handleApiError } from "../../utilities/error-handler";

const authUrl = import.meta.env.VITE_AUTH_URL?.trim();
const rentManagerUrl = import.meta.env.VITE_RENT_MANAGER_URL?.trim();

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
    const exp = payload?.exp;

    if (typeof exp !== "number") {
      return true;
    }

    return Date.now() >= exp * 1000;
  } catch (error) {
    console.error("Failed to decode JWT", error);
    return true;
  }
}

export default function UserProfile() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountStateString = searchParams.get("state");
  const [notificationApi, contextHolder] = notification.useNotification();
  const { state, dispatch } = useAccount();


  const navigateToAuth = (nextApp: string = "rent-manager", phone?: string) => {
    if (!authUrl) {
      console.error("VITE_AUTH_URL is not configured.");
      return;
    }

    const outGoingUrlValue = nextApp === "rent-manager" ? rentManagerUrl : null;
    if (!outGoingUrlValue) {
      console.error("Unable to resolve outgoing URL for auth redirect.");
      return;
    }

    const url = `${authUrl}?outGoingUrl=${encodeURIComponent(outGoingUrlValue)}&phoneNumber=${encodeURIComponent("")}`;
    window.location.href = url;
  };

  useEffect(() => {
    if (!accountStateString) {
      navigateToAuth();
      return;
    }

    try {
      console.log("Received account state from URL:", accountStateString);
      const receivedAccountState: AccountState = JSON.parse(accountStateString);
      const details = receivedAccountState.accountDetails;
      if (!details) {
        console.error("Account state payload is missing accountDetails");
        return;
      } 


      if (isTokenExpired(details.token)) 
      {
        notificationApi.error({
          message: "Session expired",
          description: "Your sign-in session has expired. Please sign in again.",
        });
        dispatch({ type: "LOGOUT" });
        navigateToAuth();
        return;
      }

      if (!state.accountDetails || state.accountDetails.token !== details.token) 
      {
        dispatch({ type: "FETCH_SUCCESS", payload: details });
      }
      
    } catch (error) 
    {
      console.error("Failed to parse account state from URL", error);
    }
  }, []);

  return (
    <div 
      // style={{ height: "100vh" }}
    >
      {contextHolder}
      <Row justify={'center'} align={'middle'} style={{ height: "100%" }}>
        <Col xs={20} sm={20} md={12} lg={12} xl={12} xxl={12}>
            <h1>Welcome, {state.accountDetails?.userDetails?.firstName} {state.accountDetails?.userDetails?.lastName}!</h1>
            {OrganisationList(state.accountDetails?.userDetails?.memberships || [], notificationApi)}
        </Col>
      </Row>
    </div>
  );
}
