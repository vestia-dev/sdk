// ../../node_modules/hono/dist/utils/cookie.js
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};

// ../../node_modules/hono/dist/client/utils.js
var mergePath = (base, path) => {
  base = base.replace(/\/+$/, "");
  base = base + "/";
  path = path.replace(/^\/+/, "");
  return base + path;
};
var replaceUrlParam = (urlString, params) => {
  for (const [k, v] of Object.entries(params)) {
    const reg = new RegExp("/:" + k + "(?:{[^/]+})?");
    urlString = urlString.replace(reg, `/${v}`);
  }
  return urlString;
};
var replaceUrlProtocol = (urlString, protocol) => {
  switch (protocol) {
    case "ws":
      return urlString.replace(/^http/, "ws");
    case "http":
      return urlString.replace(/^ws/, "http");
  }
};
var removeIndexString = (urlSting) => {
  if (/^https?:\/\/[^\/]+?\/index$/.test(urlSting)) {
    return urlSting.replace(/\/index$/, "/");
  }
  return urlSting.replace(/\/index$/, "");
};
function isObject(item) {
  return typeof item === "object" && item !== null && !Array.isArray(item);
}
function deepMerge(target, source) {
  if (!isObject(target) && !isObject(source)) {
    return source;
  }
  const merged = { ...target };
  for (const key in source) {
    const value = source[key];
    if (isObject(merged[key]) && isObject(value)) {
      merged[key] = deepMerge(merged[key], value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

// ../../node_modules/hono/dist/client/client.js
var createProxy = (callback, path) => {
  const proxy = new Proxy(() => {
  }, {
    get(_obj, key) {
      if (typeof key !== "string" || key === "then") {
        return void 0;
      }
      return createProxy(callback, [...path, key]);
    },
    apply(_1, _2, args) {
      return callback({
        path,
        args
      });
    }
  });
  return proxy;
};
var ClientRequestImpl = class {
  url;
  method;
  queryParams = void 0;
  pathParams = {};
  rBody;
  cType = void 0;
  constructor(url, method) {
    this.url = url;
    this.method = method;
  }
  fetch = async (args, opt) => {
    if (args) {
      if (args.query) {
        for (const [k, v] of Object.entries(args.query)) {
          if (v === void 0) {
            continue;
          }
          this.queryParams ||= new URLSearchParams();
          if (Array.isArray(v)) {
            for (const v2 of v) {
              this.queryParams.append(k, v2);
            }
          } else {
            this.queryParams.set(k, v);
          }
        }
      }
      if (args.form) {
        const form = new FormData();
        for (const [k, v] of Object.entries(args.form)) {
          if (Array.isArray(v)) {
            for (const v2 of v) {
              form.append(k, v2);
            }
          } else {
            form.append(k, v);
          }
        }
        this.rBody = form;
      }
      if (args.json) {
        this.rBody = JSON.stringify(args.json);
        this.cType = "application/json";
      }
      if (args.param) {
        this.pathParams = args.param;
      }
    }
    let methodUpperCase = this.method.toUpperCase();
    const headerValues = {
      ...args?.header ?? {},
      ...typeof opt?.headers === "function" ? await opt.headers() : opt?.headers ? opt.headers : {}
    };
    if (args?.cookie) {
      const cookies = [];
      for (const [key, value] of Object.entries(args.cookie)) {
        cookies.push(serialize(key, value, { path: "/" }));
      }
      headerValues["Cookie"] = cookies.join(",");
    }
    if (this.cType) {
      headerValues["Content-Type"] = this.cType;
    }
    const headers = new Headers(headerValues ?? void 0);
    let url = this.url;
    url = removeIndexString(url);
    url = replaceUrlParam(url, this.pathParams);
    if (this.queryParams) {
      url = url + "?" + this.queryParams.toString();
    }
    methodUpperCase = this.method.toUpperCase();
    const setBody = !(methodUpperCase === "GET" || methodUpperCase === "HEAD");
    return (opt?.fetch || fetch)(url, {
      body: setBody ? this.rBody : void 0,
      method: methodUpperCase,
      headers,
      ...opt?.init
    });
  };
};
var hc = (baseUrl, options) => createProxy(function proxyCallback(opts) {
  const parts = [...opts.path];
  if (parts[parts.length - 1] === "toString") {
    if (parts[parts.length - 2] === "name") {
      return parts[parts.length - 3] || "";
    }
    return proxyCallback.toString();
  }
  if (parts[parts.length - 1] === "valueOf") {
    if (parts[parts.length - 2] === "name") {
      return parts[parts.length - 3] || "";
    }
    return proxyCallback;
  }
  let method = "";
  if (/^\$/.test(parts[parts.length - 1])) {
    const last = parts.pop();
    if (last) {
      method = last.replace(/^\$/, "");
    }
  }
  const path = parts.join("/");
  const url = mergePath(baseUrl, path);
  if (method === "url") {
    if (opts.args[0] && opts.args[0].param) {
      return new URL(replaceUrlParam(url, opts.args[0].param));
    }
    return new URL(url);
  }
  if (method === "ws") {
    const webSocketUrl = replaceUrlProtocol(
      opts.args[0] && opts.args[0].param ? replaceUrlParam(url, opts.args[0].param) : url,
      "ws"
    );
    const targetUrl = new URL(webSocketUrl);
    for (const key in opts.args[0]?.query) {
      targetUrl.searchParams.set(key, opts.args[0].query[key]);
    }
    return new WebSocket(targetUrl.toString());
  }
  const req = new ClientRequestImpl(url, method);
  if (method) {
    options ??= {};
    const args = deepMerge(options, { ...opts.args[1] ?? {} });
    return req.fetch(opts.args[0], args);
  }
  return req;
}, []);

// app/client/index.ts
var APIClient = class {
  key;
  getToken;
  apiEndpoint;
  constructor({ key, getToken }) {
    this.key = key;
    this.apiEndpoint = import.meta.env.VITE_API_URL;
    if (getToken) {
      this.getToken = getToken;
    } else {
      this.getToken = () => key;
    }
  }
  createHonoClient() {
    const headers = {};
    const jwt = this.key || this.getToken();
    if (jwt) {
      headers["authorization"] = jwt;
    }
    return hc(this.apiEndpoint, { headers });
  }
  async request(fn) {
    const res = await fn(this.createHonoClient());
    if (!res.ok) {
      console.error(res.statusText);
      return null;
    }
    return res.json();
  }
  async getUser() {
    return this.request((client) => client.user.$get());
  }
  async updateUser({ displayName }) {
    return this.request(
      (client) => client.user.$put({
        json: {
          displayName
        }
      })
    );
  }
  async getUserInvites() {
    return this.request((client) => client.user.invites.$get());
  }
  async handleInviteToOrg({
    orgId,
    accepted
  }) {
    return await this.request(
      (client) => client.user.invites.$put({
        json: {
          orgId,
          accepted
        }
      })
    );
  }
  async createOrgWithUser({
    displayName,
    orgId,
    email
  }) {
    return this.request(
      (client) => client.orgs.$post({
        json: {
          displayName,
          orgId,
          email
        }
      })
    );
  }
  async getOrg({ orgId }) {
    return this.request(
      (client) => client.orgs[":orgId"].$get({
        param: { orgId }
      })
    );
  }
  async updateOrgDisplayName({
    displayName,
    orgId
  }) {
    return this.request(
      (client) => client.orgs[":orgId"].$put({
        param: { orgId },
        json: { displayName }
      })
    );
  }
  async removeOrg({ orgId }) {
    return this.request(
      (client) => client.orgs[":orgId"].$delete({
        param: { orgId }
      })
    );
  }
  async getOrgUsersAndInvites({ orgId }) {
    return this.request(
      (client) => client.orgs[":orgId"].users.$get({
        param: { orgId }
      })
    );
  }
  async getSpaces({ orgId }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces.$get({
        param: { orgId }
      })
    );
  }
  async getSpace({ orgId, spaceId }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces[":spaceId"].$get({
        param: { orgId, spaceId }
      })
    );
  }
  async inviteUserToOrg({ orgId, email }) {
    return this.request(
      (client) => client.orgs[":orgId"].invites.$post({
        param: { orgId },
        json: { email }
      })
    );
  }
  async createSpace({
    orgId,
    spaceId,
    displayName,
    environments
  }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces.$post({
        param: { orgId },
        json: { spaceId, displayName, environments }
      })
    );
  }
  async removeSpace({ orgId, spaceId }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces[":spaceId"].$delete({
        param: { orgId, spaceId }
      })
    );
  }
  async createEnvironment({
    orgId,
    spaceId,
    environmentId
  }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces[":spaceId"].environments.$post({
        param: { orgId, spaceId },
        json: { environmentId }
      })
    );
  }
  async removeEnvironment({
    orgId,
    spaceId,
    environmentId
  }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].$delete({
        param: { orgId, spaceId, environmentId }
      })
    );
  }
  async getAPIKeys({ orgId, spaceId }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces[":spaceId"].keys.$get({
        param: { orgId, spaceId }
      })
    );
  }
  async createAPIKey({
    orgId,
    spaceId,
    environmentId,
    displayName
  }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].keys.$post({
        param: { orgId, spaceId, environmentId },
        json: { displayName }
      })
    );
  }
  async removeAPIKey({
    orgId,
    spaceId,
    environmentId,
    keyId
  }) {
    return this.request(
      (client) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].keys[":keyId"].$delete({
        param: { orgId, spaceId, environmentId, keyId }
      })
    );
  }
};
export {
  APIClient
};
