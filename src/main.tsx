import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/react";

import "./styles.css";
import { createRouter } from "./router";
import { ThemeProvider } from "./utils/theme-provider";

const router = createRouter();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ClerkProvider
        appearance={{
          cssLayerName: "clerk",
          variables: { colorBackground: "bg-base-300" },
          elements: {
            button: "btn",
            card: "rounded-box bg-base-300",
            input: "input",
            dividerText: "text-base-content",
            headerTitle: "text-base-content",
            headerSubtitle: "text-base-content",
            form: "text-base-content",
            footer: "bg-base-200",
          },
        }}
      >
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ClerkProvider>
    </React.StrictMode>,
  );
}
