import { createRoot } from "react-dom/client";
import "@/styles/style.css";

import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";

import { Provider as ReduxProvider } from "react-redux";

import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "@/stores/store";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      </PersistGate>
    </ReduxProvider>
  </BrowserRouter>,
);
