import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App, { AuthenticatedShopline } from "./App";
import "./styles.base.css";
import "./styles.css";

const auth0Domain = (import.meta.env.VITE_AUTH0_DOMAIN || "").trim();
const auth0ClientId = (import.meta.env.VITE_AUTH0_CLIENT_ID || "").trim();
const auth0Audience = (import.meta.env.VITE_AUTH0_AUDIENCE || "").trim();
const auth0Configured = Boolean(auth0Domain && auth0ClientId && auth0Audience);

function ShoplineRoot() {
  if (!auth0Configured) return <App />;

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience,
        scope: "openid profile email",
      }}
      cacheLocation="memory"
    >
      <AuthenticatedShopline />
    </Auth0Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ShoplineRoot />
  </React.StrictMode>
);
