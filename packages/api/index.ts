export type ComponentData = {
  orgId: string;
  spaceId: string;
  environmentId: string;
  contentId: string;
  componentId: string;
  displayName: string;
  type: string;
  controls?: Record<string, any>;
};

type Key = string;
type GetToken = () => string | undefined;

type RequestParams = {
  method: string;
  path: string;
  body?: Record<string, any>;
  cache?: RequestCache;
};

export class APIClient {
  protected key?: Key;
  protected getToken: GetToken;
  protected apiEndpoint: string;

  constructor({ key, getToken }: { key?: Key; getToken?: GetToken }) {
    this.key = key;
    this.apiEndpoint = "https://cr69bb8s69.execute-api.us-east-1.amazonaws.com";
    if (getToken) {
      this.getToken = getToken;
    } else {
      this.getToken = () => key;
    }
  }

  async request({ method, path, body, cache = "no-cache" }: RequestParams) {
    const headers: HeadersInit = { "Content-Type": "application/json" };

    const jwt = this.key || this.getToken();
    if (jwt) {
      headers["authorization"] = jwt;
    }

    console.log(`Making ${method} request to ${path}`);

    const response = await fetch(`${this.apiEndpoint}${path}`, {
      method,
      headers,
      body: JSON.stringify(body),
      cache,
    });
    if (!response.ok) {
      console.error(response.statusText);
      return null;
    }
    const result = await response.json();
    if (result?.body) {
      return JSON.parse(result.body);
    } else {
      throw new Error("Response did not contain a body");
    }
  }

  async get(args: Omit<RequestParams, "method" | "body">) {
    return this.request({ ...args, method: "GET" });
  }

  async post(args: Omit<RequestParams, "method">) {
    return this.request({ ...args, method: "POST" });
  }

  async put(args: Omit<RequestParams, "method">) {
    return this.request({ ...args, method: "PUT" });
  }

  async patch(args: Omit<RequestParams, "method">) {
    return this.request({ ...args, method: "PATCH" });
  }

  async delete(args: Omit<RequestParams, "method">) {
    return this.request({ ...args, method: "DELETE" });
  }
}

export class StudioClient extends APIClient {
  protected orgId: string;
  protected spaceId: string;
  protected environmentId: string;

  constructor({
    orgId,
    spaceId,
    environmentId,
    key,
    getToken,
  }: {
    orgId?: string;
    spaceId?: string;
    environmentId?: string;
    key?: Key;
    getToken?: GetToken;
  }) {
    super({ key, getToken });
    if (!orgId || !spaceId || !environmentId) {
      throw new Error("Configuration not provided");
    }
    this.orgId = orgId;
    this.spaceId = spaceId;
    this.environmentId = environmentId;
  }

  async getUser(): Promise<{
    user: { pictureUrl: string; email: string };
    orgs: { orgId: string }[];
  }> {
    return this.get({ path: "/user" });
  }

  async getOrgUsers(): Promise<{
    orgUsers: {
      orgId: string;
      email: string;
      role: string;
    }[];
  }> {
    return this.get({
      path: `/orgs/${this.orgId}/users`,
    });
  }

  async getSpaces(): Promise<{
    spaces: {
      orgId: string;
      spaceId: string;
      displayName: string;
    }[];
  }> {
    return this.get({
      path: `/orgs/${this.orgId}/spaces`,
    });
  }

  async getSpace(): Promise<{
    space: {
      orgId: string;
      spaceId: string;
      displayName: string;
    };
    environments: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      displayName: string;
    }[];
  }> {
    return this.get({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}`,
    });
  }

  async createContent({
    contentId,
    displayName,
  }: {
    contentId: string;
    displayName: string;
  }): Promise<{
    content: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      contentId: string;
      displayName: string;
    };
  }> {
    return this.post({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content`,
      body: {
        contentId,
        displayName,
      },
    });
  }

  async publishContent({ contentId }: { contentId: string }): Promise<{
    content: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      contentId: string;
      displayName: string;
    };
  }> {
    return this.post({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content/publish`,
      body: {
        contentId,
      },
    });
  }

  async getContent(): Promise<{
    content: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      contentId: string;
      displayName: string;
    }[];
  }> {
    return this.get({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content`,
    });
  }

  async updateComponentOrder({
    contentId,
    componentOrder,
  }: {
    contentId: string;
    componentOrder: string[];
  }): Promise<{
    content: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      contentId: string;
      displayName: string;
    }[];
  }> {
    return this.put({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content/${contentId}`,
      body: {
        componentOrder,
      },
    });
  }

  async removeComponent({
    contentId,
    componentId,
    componentOrder,
  }: {
    contentId: string;
    componentId: string;
    componentOrder: string[];
  }): Promise<{
    content: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      contentId: string;
      displayName: string;
    }[];
  }> {
    return this.delete({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content/${contentId}/components/${componentId}`,
      body: {
        componentOrder,
      },
    });
  }

  async getContentByPrefix({ prefix }: { prefix: string }): Promise<{
    content: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      contentId: string;
      displayName: string;
    }[];
  }> {
    return this.get({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content?prefix=${prefix}`,
    });
  }

  async createComponent({
    contentId,
    displayName,
    type,
    controls,
    position,
  }: {
    contentId: string;
    displayName: string;
    type: string;
    controls: Record<string, string>;
    position: number | "end";
  }): Promise<{
    component: ComponentData;
  }> {
    return this.post({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content/${contentId}/components`,
      body: {
        type,
        displayName,
        controls,
        position,
      },
    });
  }

  async updateComponent({
    contentId,
    componentId,
    displayName,
    controls,
  }: {
    contentId: string;
    componentId: string;
    displayName: string;
    controls: Record<string, string>;
  }): Promise<{
    component: ComponentData;
  }> {
    return this.put({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content/${contentId}/components/${componentId}`,
      body: {
        displayName,
        controls,
      },
    });
  }

  async getComponentsByContentId({
    contentId,
  }: {
    contentId: string;
  }): Promise<{
    components: ComponentData[];
  } | null> {
    return this.get({
      path: `/orgs/${this.orgId}/spaces/${this.spaceId}/environments/${this.environmentId}/content/${contentId}/components`,
    });
  }
}

export class ResourceClient extends APIClient {
  async getContent({
    published = false,
  }: { published?: boolean } = {}): Promise<{
    content: {
      orgId: string;
      spaceId: string;
      environmentId: string;
      contentId: string;
      displayName: string;
    }[];
  }> {
    return this.get({
      path: `/content${published ? "?published=true" : ""}`,
    });
  }

  async getComponentsByContentId({
    contentId,
    published = false,
  }: {
    contentId: string;
    published?: boolean;
  }): Promise<{
    components: [] | ComponentData[];
  } | null> {
    return this.get({
      path: `/content/${contentId}/components${
        published ? "?published=true" : ""
      }`,
    });
  }
}
