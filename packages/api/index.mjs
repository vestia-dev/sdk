// index.ts
import "@vestia/functions/studio";
import { hc } from "hono/client";
import "hono/utils/http-status";
var APIClient = class {
  key;
  getToken;
  apiEndpoint;
  constructor({ key, getToken }) {
    this.key = key;
    this.apiEndpoint = "https://api.vestia.dev/";
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
    const client = hc(this.apiEndpoint, { headers });
    return client;
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
    return this.request((client) =>
      client.user.$put({
        json: {
          displayName,
        },
      })
    );
  }
  async getUserInvites() {
    return this.request((client) => client.user.invites.$get());
  }
  async handleInviteToOrg({ orgId, accepted }) {
    return await this.request((client) =>
      client.user.invites.$put({
        json: {
          orgId,
          accepted,
        },
      })
    );
  }
  async createOrgWithUser({ displayName, orgId, email }) {
    return this.request((client) =>
      client.orgs.$post({
        json: {
          displayName,
          orgId,
          email,
        },
      })
    );
  }
  async getOrg({ orgId }) {
    return this.request((client) =>
      client.orgs[":orgId"].$get({
        param: { orgId },
      })
    );
  }
  async updateOrgDisplayName({ displayName, orgId }) {
    return this.request((client) =>
      client.orgs[":orgId"].$put({
        param: { orgId },
        json: { displayName },
      })
    );
  }
  async removeOrg({ orgId }) {
    return this.request((client) =>
      client.orgs[":orgId"].$delete({
        param: { orgId },
      })
    );
  }
  async getOrgUsersAndInvites({ orgId }) {
    return this.request((client) =>
      client.orgs[":orgId"].users.$get({
        param: { orgId },
      })
    );
  }
  async getSpaces({ orgId }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces.$get({
        param: { orgId },
      })
    );
  }
  async getSpace({ orgId, spaceId }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces[":spaceId"].$get({
        param: { orgId, spaceId },
      })
    );
  }
  async inviteUserToOrg({ orgId, email }) {
    return this.request((client) =>
      client.orgs[":orgId"].invites.$post({
        param: { orgId },
        json: { email },
      })
    );
  }
  async createSpace({ orgId, spaceId, displayName, environments }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces.$post({
        param: { orgId },
        json: { spaceId, displayName, environments },
      })
    );
  }
  async removeSpace({ orgId, spaceId }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces[":spaceId"].$delete({
        param: { orgId, spaceId },
      })
    );
  }
  async createEnvironment({ orgId, spaceId, environmentId }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces[":spaceId"].environments.$post({
        param: { orgId, spaceId },
        json: { environmentId },
      })
    );
  }
  async removeEnvironment({ orgId, spaceId, environmentId }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces[":spaceId"].environments[
        ":environmentId"
      ].$delete({
        param: { orgId, spaceId, environmentId },
      })
    );
  }
  async getAPIKeys({ orgId, spaceId }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces[":spaceId"].keys.$get({
        param: { orgId, spaceId },
      })
    );
  }
  async createAPIKey({ orgId, spaceId, environmentId, displayName }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces[":spaceId"].environments[
        ":environmentId"
      ].keys.$post({
        param: { orgId, spaceId, environmentId },
        json: { displayName },
      })
    );
  }
  async removeAPIKey({ orgId, spaceId, environmentId, keyId }) {
    return this.request((client) =>
      client.orgs[":orgId"].spaces[":spaceId"].environments[
        ":environmentId"
      ].keys[":keyId"].$delete({
        param: { orgId, spaceId, environmentId, keyId },
      })
    );
  }
};
export { APIClient };
