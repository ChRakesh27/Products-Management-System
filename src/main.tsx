import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { LoadingProvider } from "./context/LoadingContext.tsx";
import { ThemeProvider } from "./context/ThemProvider.tsx";
import "./index.css";
import store from "./store/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);
