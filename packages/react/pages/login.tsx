import { useState, useEffect } from "react";
import { AUTH_URL } from "../auth";
import { css } from "../styled-system/css";
import { buttonStyle } from "../components/button";
import { CustomIcons } from "../components/icon";
import { usePaths } from "../context";

export const Login = () => {
  const [isClient, setIsClient] = useState(false);
  const paths = usePaths();

  let params = new URLSearchParams();

  if (isClient) {
    params = new URLSearchParams({
      client_id: "client",
      response_type: "code",
      redirect_uri: `${window.location.origin}${paths.auth}/callback`,
    });
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main
      className={css({
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textStyle: "body",
      })}
    >
      <div
        className={css({
          border: "2px solid",
          borderColor: "background2",
          p: "4",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "40%",
        })}
      >
        <h1 className={css({ textStyle: "heading1" })}>Login</h1>
        <a
          className={css({
            textDecoration: "none",
            ...buttonStyle.raw({ variant: "default" }),
          })}
          href={`${AUTH_URL}/google/authorize/?` + params}
        >
          <CustomIcons.google
            className={css({
              h: "4",
              mr: "2",
            })}
          />
          Continue with Google
        </a>
      </div>
    </main>
  );
};
