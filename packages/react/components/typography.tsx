import { css } from "../styled-system/css";
import React from "react";

export const PageTitle = ({ children }: { children: React.ReactNode }) => (
  <h1
    className={css({
      textStyle: "heading1",
    })}
  >
    {children}
  </h1>
);
