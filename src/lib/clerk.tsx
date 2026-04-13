import { ClerkProvider } from "@clerk/react";
import { PropsWithChildren } from "react";

export const CustomClerkProvider = ({ children }: PropsWithChildren) => {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        cssLayerName: "clerk",
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
          tooltip: "tooltip",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
};
