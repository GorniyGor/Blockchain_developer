import '../styles/globals.css'
import { Provider } from "@self.id/react";

export default function App({ Component, pageProps }) {
  return (
    <Provider client={{ ceramic: "testnet-clay" }} threeidConnect={true}>
        <Component {...pageProps} />
    </Provider>
  );
}
