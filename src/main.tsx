import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import "./styles.css";
import { createRouter } from "./router";
import { CustomClerkProvider } from "./lib/clerk";
import { CustomToaster } from "./lib/react-hot-toast";

const router = createRouter();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <CustomClerkProvider>
        <RouterProvider router={router} />
        <CustomToaster />
      </CustomClerkProvider>
    </React.StrictMode>,
  );
}
