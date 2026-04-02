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
          variables: {
            colorForeground: "text-base-content",
            colorDanger: "text-error",
          },
          elements: {
            userButtonTrigger: "bg-base-100 rounded-box",
            userButtonPopoverActionButton: "btn btn-primary mx-2 mb-2",
            userButtonPopoverFooter: "hidden",
            userButtonPopoverMain: "bg-base-300",
            modalBackdrop: "bg-base-100/60",
            button: "btn btn-soft",
            badge: "badge",
            card: "rounded-box bg-base-300",
            input: "input",
            footer: "hidden",
            formFieldInput: "text-base-content text-xs",
            formFieldErrorText: "text-error",
            formFieldWarningText: "text-warning",
            dividerLine: "bg-primary",
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
