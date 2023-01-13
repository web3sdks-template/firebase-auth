import type { AppProps } from "next/app";
import { ChainId, Web3sdksProvider } from "@web3sdks/react";
import "../styles/globals.css";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3sdksProvider
      desiredChainId={activeChainId}
      authConfig={{
        // The backend URL of the authentication endoints.
        authUrl: "/api/auth",
        // Set this to your domain to prevent signature malleability attacks.
        domain: "example.com",
        // The redirect URL after a successful login.
        loginRedirect: "/",
      }}
    >
      <Component {...pageProps} />
    </Web3sdksProvider>
  );
}

export default MyApp;
