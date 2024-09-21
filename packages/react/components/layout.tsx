import React, { useState } from "react";
import { css } from "../styled-system/css";
import { RouterProvider } from "react-aria-components";
import type { VestiaConfig } from "../config";
import { VestiaProvider } from "../context";
import {
  Dialogs,
  GlobalDialogProvider,
  type DialogState,
  type DialogType,
} from "./dialog";

export const StudioProvider = ({
  config,
  children,
}: { children: React.ReactNode } & {
  config: Omit<VestiaConfig, "paths"> & {
    paths?: Partial<VestiaConfig["paths"]>;
  };
}) => {
  return (
    <VestiaProvider config={config}>
      <RouterProvider
        navigate={config.routing.navigate}
        useHref={config.routing.useHref}
      >
        <StudioLayout>{children}</StudioLayout>
      </RouterProvider>
    </VestiaProvider>
  );
};

export const StudioLayout = ({ children }: { children: React.ReactNode }) => {
  const [dialog, setDialog] = useState<DialogState<DialogType | null>>({
    type: null,
    values: null,
  });

  return (
    <GlobalDialogProvider value={{ dialog, setDialog }}>
      <div
        className={css({
          width: "100%",
          display: "flex",
          bg: "background",
          color: "text",
          textStyle: "body",
        })}
      >
        {children}
        <Dialogs />
      </div>
    </GlobalDialogProvider>
  );
};

export const PageLayout = ({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) => (
  <main
    className={css({
      width: "100%",
      display: "flex",
      flexDirection: "column",
    })}
  >
    <div
      className={css({
        minH: 12,
        width: "100%",
        boxSizing: "border-box",
        bg: "background",
        borderTop: "2px solid",
        borderBottom: "2px solid",
        borderColor: "background2",
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 4,
      })}
    >
      {header}
    </div>
    {children}
  </main>
);
