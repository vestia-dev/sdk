type Key = string;
type GetToken = () => string | undefined;
declare class APIClient {
    protected key?: Key;
    protected getToken: GetToken;
    protected apiEndpoint: string;
    constructor({ key, getToken }: {
        key?: Key;
        getToken?: GetToken;
    });
    private createHonoClient;
    private request;
    getUser(): Promise<{
        orgs: {
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            role: string;
        }[];
        user: {
            email: string;
            displayName: string;
            pictureUrl?: string | undefined;
            createdAt: string;
            updatedAt?: string | undefined;
        } | null;
    } | null>;
    updateUser({ displayName }: {
        displayName: string;
    }): Promise<{
        user: {
            email?: string | undefined;
            displayName?: string | undefined;
            pictureUrl?: string | undefined;
            createdAt?: string | undefined;
            updatedAt?: string | undefined;
        };
    } | null>;
    getUserInvites(): Promise<{
        invites: {
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
        }[];
    } | null>;
    handleInviteToOrg({ orgId, accepted, }: {
        orgId: string;
        accepted: boolean;
    }): Promise<{
        orgUser: {
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            role: string;
        } | null;
    } | null>;
    createOrgWithUser({ displayName, orgId, email, }: {
        displayName: string;
        orgId: string;
        email: string;
    }): Promise<{
        org: {
            displayName: string;
            pictureUrl?: string | undefined;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
        };
        orgUser: {
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            role: string;
        };
    } | null>;
    getOrg({ orgId }: {
        orgId: string;
    }): Promise<{
        org: {
            displayName: string;
            pictureUrl?: string | undefined;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
        } | null;
    } | null>;
    updateOrgDisplayName({ displayName, orgId, }: {
        displayName: string;
        orgId: string;
    }): Promise<{
        org: {
            displayName?: string | undefined;
            pictureUrl?: string | undefined;
            createdAt?: string | undefined;
            updatedAt?: string | undefined;
            orgId?: string | undefined;
        };
    } | null>;
    removeOrg({ orgId }: {
        orgId: string;
    }): Promise<{
        success: boolean;
    } | null>;
    getOrgUsersAndInvites({ orgId }: {
        orgId: string;
    }): Promise<{
        orgUsers: {
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            role: string;
        }[];
        invites: {
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
        }[];
    } | null>;
    getSpaces({ orgId }: {
        orgId: string;
    }): Promise<{
        spaces: {
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
        }[];
    } | null>;
    getSpace({ orgId, spaceId }: {
        orgId: string;
        spaceId: string;
    }): Promise<{
        space: {
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
        };
        environments: {
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
            environmentId: string;
        }[];
        apiKeys: {
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
            environmentId: string;
            keyId: string;
        }[];
    } | null>;
    inviteUserToOrg({ orgId, email }: {
        orgId: string;
        email: string;
    }): Promise<{
        invite: {
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
        };
    } | null>;
    createSpace({ orgId, spaceId, displayName, environments, }: {
        orgId: string;
        spaceId: string;
        displayName: string;
        environments?: ("production" | "development")[];
    }): Promise<{
        space: {
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
        };
        environments: {
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
            environmentId: string;
        }[];
    } | null>;
    removeSpace({ orgId, spaceId }: {
        orgId: string;
        spaceId: string;
    }): Promise<{
        success: boolean;
    } | null>;
    createEnvironment({ orgId, spaceId, environmentId, }: {
        orgId: string;
        spaceId: string;
        environmentId: string;
    }): Promise<{
        environment: {
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
            environmentId: string;
        };
    } | null>;
    removeEnvironment({ orgId, spaceId, environmentId, }: {
        orgId: string;
        spaceId: string;
        environmentId: string;
    }): Promise<{
        success: boolean;
    } | null>;
    getAPIKeys({ orgId, spaceId }: {
        orgId: string;
        spaceId: string;
    }): Promise<{
        apiKeys: {
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            orgId: string;
            spaceId: string;
            environmentId: string;
            keyId: string;
        }[];
    } | null>;
    createAPIKey({ orgId, spaceId, environmentId, displayName, }: {
        orgId: string;
        spaceId: string;
        environmentId: string;
        displayName: string;
    }): Promise<{
        token: string;
    } | null>;
    removeAPIKey({ orgId, spaceId, environmentId, keyId, }: {
        orgId: string;
        spaceId: string;
        environmentId: string;
        keyId: string;
    }): Promise<{
        success: boolean;
    } | null>;
}

export { APIClient };
