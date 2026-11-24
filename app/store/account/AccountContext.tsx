import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef} from "react";
import { notification } from "antd";
import { onUnauthorized } from "../../api/api";
import { AccountAction, AccountState } from "../../types/types";
import { ACCOUNT_STORAGE_KEY } from "../../utilities/constant";
import { accountReducer } from "./accountReducer";

type AccountContextType = {
  state: AccountState;
  dispatch: React.Dispatch<AccountAction>;
  requireAuthentication: (reason?: string) => void;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const loadInitialState = (): AccountState => {
  try 
  {
    const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (stored) 
    {
      const parsed = JSON.parse(stored);
      return {
        accountDetails: parsed.accountDetails,
        loading: false,
        error: null,
        outGoingUrl: parsed.outGoingUrl || null
      };
    }
  } 
  catch (error) 
  {
    console.error("Failed to load state", error);
  }

  return {
    accountDetails: null,
    loading: false,
    error: null,
    outGoingUrl: null
  };
};

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, undefined,loadInitialState);
  const [notificationApi, contextHolder] = notification.useNotification();
  const currentToken = useRef(state.accountDetails?.token);
  const redirecting = useRef(false);
  currentToken.current = state.accountDetails?.token;

  const requireAuthentication = useCallback((reason?: string) => {
    if (redirecting.current) {
      return;
    }
    redirecting.current = true;
    dispatch({ type: "LOGOUT" });
    try {
      localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear account state", error);
    }

    const authUrl = import.meta.env.VITE_AUTH_URL?.trim();
    const userManagerUrl = import.meta.env.VITE_USER_MANAGER_APP_URL?.trim();
    if (!authUrl || !userManagerUrl) {
      notificationApi.error({
        message: "Unable to sign in",
        description: "Authentication redirect URLs are not configured.",
      });
      console.error("Authentication redirect URLs are not configured.");
      return;
    }

    if (reason) {
      notificationApi.error({ message: "Sign-in required", description: reason });
    }
    window.location.replace(`${authUrl}?outGoingUrl=${encodeURIComponent(userManagerUrl)}&phoneNumber=${encodeURIComponent("")}`);
  }, [notificationApi]);

  useEffect(() => onUnauthorized((authorization) => {
    if (authorization && authorization !== `Bearer ${currentToken.current}`) {
      return;
    }
    requireAuthentication("Your sign-in session is no longer valid. Please sign in again.");
  }), [requireAuthentication]);

  useEffect(() => {
    try 
    {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(state));
    } 
    catch (e) 
    {
      console.error("Failed to save state", e);
    }
  }, [state]);

  const value = useMemo(() => {
    return { state, dispatch, requireAuthentication };
  }, [state, dispatch, requireAuthentication]);

  return (
    <AccountContext.Provider value={value}>
      {contextHolder}
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within StudentProvider");
  }
  return context;
};
