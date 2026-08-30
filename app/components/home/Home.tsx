import { Outlet, useSearchParams } from 'react-router';
import { Layout, Image} from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import { useEffect } from 'react';
import { useAccount } from "../../store/account/AccountContext";

// Redirects to external auth-manager UI when user is unauthenticated (no token)


export default function Home() {
  
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
