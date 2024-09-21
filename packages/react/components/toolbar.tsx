import { css } from "../styled-system/css";

export const Toolbar = ({ children }: { children: React.ReactNode }) => (
  <div
    className={css({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 2,
      px: 4,
      minH: 14,
      boxSizing: "border-box",
      borderBottom: "2px solid",
      borderColor: "background2",
    })}
  >
    {children}
  </div>
);
