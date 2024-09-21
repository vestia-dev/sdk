import { AUTH_URL } from "@vestia/api";

export const AUTH_COOKIE_NAME = "vestia_auth_token";

export const authHandler = async ({
  request,
  redirectPaths,
  basePath = "/auth",
}: {
  request: Request;
  redirectPaths: {
    login: string;
    logout: string;
    error: string;
    fallback: string;
  };
  basePath?: string;
}) => {
  const { searchParams, origin, pathname } = new URL(request.url);

  if (pathname === `${basePath}/callback`) {
    const code = searchParams.get("code");

    if (code) {
      const tokenResponse = await fetch(`${AUTH_URL}/token`, {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "client",
          code,
          redirect_uri: `${origin}${basePath}/callback`,
        }),
      });

      if (tokenResponse.ok) {
        const { access_token } = await tokenResponse.json();

        return new Response(null, {
          status: 303,
          headers: {
            Location: redirectPaths.login,
            "Set-Cookie": `${AUTH_COOKIE_NAME}=${access_token}; Path=/; Max-Age=2592000`,
          },
        });
      } else {
        return new Response(null, {
          status: 303,
          headers: {
            Location: redirectPaths.error,
          },
        });
      }
    }
  } else if (pathname === `${basePath}/logout`) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: redirectPaths.logout,
        "Set-Cookie": `${AUTH_COOKIE_NAME}=null; Path=/; Max-Age=0`,
      },
    });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: redirectPaths.fallback,
    },
  });
};

export { AUTH_URL };
