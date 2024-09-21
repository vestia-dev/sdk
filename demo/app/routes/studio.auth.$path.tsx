import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { authHandler } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Auth | Vestia" },
    { name: "description", content: "The devtool ecosystem" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) =>
  authHandler({
    request,
    redirectPaths: {
      login: "/studio/content",
      logout: "/studio/login",
      error: "/studio/error",
      fallback: "/studio/fallback",
    },
    basePath: "/studio/auth",
  });
