import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useHref,
  useSearchParams,
  useNavigate,
  useParams,
} from "@remix-run/react";
import "@vestia/react/styles.css";
import { children, string, StudioProvider } from "@vestia/react";
import { ComponentProps } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const components: ComponentProps<
  typeof StudioProvider
>["config"]["components"] = {
  "page-title": {
    displayName: "Page Title",
    component: ({ children }: { children: React.ReactNode }) => (
      <h1>{children}</h1>
    ),
    controls: { children: children() },
  },
  button: {
    displayName: "Button",
    component: ({ children }: { children: React.ReactNode }) => (
      <button>{children}</button>
    ),
    controls: { variant: string(), children: children() },
  },
  paragraph: {
    displayName: "Paragraph",
    component: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    controls: { children: children() },
  },
  span: {
    displayName: "Span",
    component: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    controls: { children: children() },
  },
  section: {
    displayName: "Section",
    component: ({ children }: { children: React.ReactNode }) => (
      <section>{children}</section>
    ),
    controls: { children: children() },
  },
  main: {
    displayName: "Main",
    component: ({ children }: { children: React.ReactNode }) => (
      <main>{children}</main>
    ),
    controls: { children: children() },
  },
  div: {
    displayName: "Div",
    component: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    controls: { children: children() },
  },
  anchor: {
    displayName: "Anchor",
    component: ({
      href,
      children,
    }: {
      href: string;
      children: React.ReactNode;
    }) => <a href={href}>{children}</a>,
    controls: { href: string(), children: children() },
  },
  hr: { displayName: "Horizontal Rule", component: () => <hr /> },
};

const layouts: ComponentProps<typeof StudioProvider>["config"]["layouts"] = {
  "flex-col": {
    displayName: "Column",
    component: ({ children }: { children: React.ReactNode }) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          gap: "10px",
        }}
      >
        {children}
      </div>
    ),
  },
  "flex-row": {
    displayName: "Row",
    component: ({ children }: { children: React.ReactNode }) => (
      <div
        style={{
          display: "flex",
          padding: "10px",
          gap: "10px",
        }}
      >
        {children}
      </div>
    ),
  },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 0 }}>
        <StudioProvider
          config={{
            orgId: "matts-org",
            spaceId: "blog",
            environmentId: "development",
            components,
            layouts,
            paths: {
              basePath: "/studio",
            },
            routing: {
              navigate,
              useHref,
              useParams,
              useSearchParams: () => useSearchParams()[0],
            },
          }}
        >
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </StudioProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
