import { Outlet } from 'react-router';
import { Layout, Image} from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import { useEffect } from 'react';
import { useAccount } from "../../store/account/AccountContext";

// Redirects to external auth-manager UI when user is unauthenticated (no token)


export default function Home() {
  const { state } = useAccount();

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

  return (
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          background: '#0F172A',
          height: 64,
        }}
      >
        {/* LOGO */}
        <div style={{
          background: '#fff',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}>
          <Image
            preview={false}
            src="/tante-logo.svg"
            width={96}          // fixed px — never grows
            height={29}         // keeps aspect ratio locked
            style={{ display: 'block' }}
          />
        </div>
      </Header>

      

      <Content style={{ backgroundColor: '#fff' }}>
        <Outlet />
      </Content>

      {/* <Footer style={{ backgroundColor: '#fff'  }}>
       
        
      </Footer> */}
    </Layout>
  );
}
