import type { ComponentProps } from "react";
import { RouterProvider } from "react-aria-components";

export type Component = {
  componentId: string;
  type: string;
  displayName: string;
  controls?: { [index: string]: string | boolean | number | Component[] };
};

export type ComponentConstructor =
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<any>
  | React.ElementType;

export type ComponentConfig = {
  displayName: string;
  component: ComponentConstructor;
  controls?: Record<string, string>;
};

export type LayoutConfig = {
  displayName: string;
  component: ComponentConstructor;
};

export type ComponentMap = {
  [index: string]: ComponentConfig;
};

export type LayoutMap = {
  [index: string]: LayoutConfig;
};

export type VestiaConfig = {
  orgId: string;
  spaceId: string;
  environmentId: string;
  components: ComponentMap;
  layouts: LayoutMap;
  paths: {
    basePath: string;
    login: string;
    auth: string;
    content: string;
    flags: string;
    experiments: string;
    forms: string;
    assets: string;
  };
  routing: {
    navigate: ComponentProps<typeof RouterProvider>["navigate"];
    useHref: NonNullable<ComponentProps<typeof RouterProvider>["useHref"]>;
    useParams: () => Record<string, string | undefined>;
    useSearchParams: () => URLSearchParams;
  };
};

export const defineConfig = (config: VestiaConfig) => config;
