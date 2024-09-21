import React, { createContext, useContext } from "react";
import { StudioClient } from "@vestia/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { VestiaConfig } from "./config";
import { getToken, type DeepNonNullable, type DeepPartial } from "./utils";

export const VestiaContext = createContext<
  { config: VestiaConfig; client: StudioClient } | undefined
>(undefined);

const queryClient = new QueryClient();

export const VestiaProvider = ({
  config,
  children,
}: {
  config: Omit<VestiaConfig, "paths"> & {
    paths?: Partial<VestiaConfig["paths"]>;
  };
  children: React.ReactNode;
}) => {
  if (!config.orgId) {
    throw new Error("You must provide an orgId");
  }
  if (!config.spaceId) {
    throw new Error("You must provide a spaceId");
  }
  if (!config.environmentId) {
    throw new Error("You must provide an environmentId");
  }
  const studioClient = new StudioClient({
    orgId: config.orgId,
    spaceId: config.spaceId,
    environmentId: config.environmentId,
    getToken,
  });
  const defaultPaths = {
    basePath: "/studio",
    login: "/login",
    auth: "/auth",
    content: "/content",
    flags: "/flags",
    experiments: "/experiments",
    forms: "/forms",
    assets: "/assets",
  };

  const paths = config.paths
    ? { ...defaultPaths, ...config.paths }
    : defaultPaths;

  const mappedPaths = Object.keys(paths).reduce((acc, key) => {
    return {
      ...acc,
      [key]:
        key !== "basePath"
          ? `${paths["basePath"]}${paths[key as keyof VestiaConfig["paths"]]}`
          : paths[key],
    };
  }, defaultPaths);
  return (
    <QueryClientProvider client={queryClient}>
      <VestiaContext.Provider
        value={{
          config: { ...config, paths: mappedPaths },
          client: studioClient,
        }}
      >
        {children}
      </VestiaContext.Provider>
    </QueryClientProvider>
  );
};

export const useConfig = (): VestiaConfig => {
  const context = useContext(VestiaContext);

  if (!context) {
    throw new Error("useConfig must be used within a VestiaProvider");
  }

  return context.config;
};

export const useStudioClient = () => {
  const context = useContext(VestiaContext);

  if (!context) {
    throw new Error("useStudioClient must be used within a VestiaProvider");
  }

  return context.client;
};

export const usePaths = () => {
  const { paths } = useConfig();
  return paths;
};

export const useNavigate = () => {
  const {
    routing: { navigate },
  } = useConfig();
  return navigate;
};

export const useHref = (href: string) => {
  const {
    routing: { useHref },
  } = useConfig();
  return useHref(href);
};

export const useSearchParams = () => {
  const {
    routing: { useSearchParams },
  } = useConfig();
  return useSearchParams();
};

export const useParams = () => {
  const {
    routing: { useParams },
  } = useConfig();
  return useParams();
};

export const useComponents = () => {
  const { components } = useConfig();
  return components;
};

export const useLayouts = () => {
  const { layouts } = useConfig();
  return layouts;
};
