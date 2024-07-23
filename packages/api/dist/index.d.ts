import { StudioAppType, ResourcesAppType } from '@vestia/functions/api';
import { Hono } from 'hono';
import { hc } from 'hono/client';

type Key = string;
type GetToken = () => string | undefined;
type HonoApp = Hono<any, any, any>;
type HonoClient<T extends HonoApp> = ReturnType<typeof hc<T>>;
type DeepNonNullable<T> = {
    [K in keyof T]: DeepNonNullable<NonNullable<T[K]>>;
};
declare class APIClient<T extends HonoApp> {
    protected apiEndpoint: string;
    protected honoClient: HonoClient<T>;
    protected key?: Key;
    protected getToken?: GetToken;
    protected orgId?: string;
    protected spaceId?: string;
    protected environmentId?: string;
    constructor({ key, getToken, orgId, spaceId, environmentId, }: {
        key?: Key;
        getToken?: GetToken;
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
    });
    request<P extends {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
    }, Fn extends (client: HonoClient<T>, validOSEParams: DeepNonNullable<P>) => any>(fn: Fn, oseParams?: P): Promise<ReturnType<Awaited<ReturnType<Fn>>["json"]> | null>;
}
declare class StudioClient extends APIClient<StudioAppType> {
    getUser(): Promise<{
        orgs: {
            orgId: string;
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
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
            orgId: string;
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
        }[];
    } | null>;
    handleInviteToOrg({ orgId, accepted, }: {
        orgId?: string;
        accepted: boolean;
    }): Promise<{
        orgUser: {
            orgId: string;
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            role: string;
        } | null;
    } | null>;
    createOrgWithUser({ displayName, orgId, email, }: {
        displayName: string;
        orgId?: string;
        email: string;
    }): Promise<{
        org: {
            orgId: string;
            displayName: string;
            pictureUrl?: string | undefined;
            createdAt: string;
            updatedAt?: string | undefined;
        };
        orgUser: {
            orgId: string;
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            role: string;
        };
    } | null>;
    getOrg({ orgId }: {
        orgId?: string;
    }): Promise<{
        org: {
            orgId: string;
            displayName: string;
            pictureUrl?: string | undefined;
            createdAt: string;
            updatedAt?: string | undefined;
        } | null;
    } | null>;
    updateOrgDisplayName({ displayName, orgId, }: {
        displayName: string;
        orgId?: string;
    }): Promise<{
        org: {
            orgId?: string | undefined;
            displayName?: string | undefined;
            pictureUrl?: string | undefined;
            createdAt?: string | undefined;
            updatedAt?: string | undefined;
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
            orgId: string;
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
            role: string;
        }[];
        invites: {
            orgId: string;
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
        }[];
    } | null>;
    getSpaces({ orgId }: {
        orgId: string;
    }): Promise<{
        spaces: {
            orgId: string;
            spaceId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
        }[];
    } | null>;
    getSpace({ orgId, spaceId }: {
        orgId?: string;
        spaceId: string;
    }): Promise<{
        space: {
            orgId: string;
            spaceId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
        };
        environments: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            createdAt: string;
            updatedAt?: string | undefined;
        }[];
        apiKeys: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            keyId: string;
        }[];
    } | null>;
    inviteUserToOrg({ orgId, email }: {
        orgId?: string;
        email: string;
    }): Promise<{
        invite: {
            orgId: string;
            email: string;
            createdAt: string;
            updatedAt?: string | undefined;
        };
    } | null>;
    createSpace({ orgId, spaceId, displayName, environments, }: {
        orgId?: string;
        spaceId?: string;
        displayName: string;
        environments?: ("production" | "development")[];
    }): Promise<{
        space: {
            orgId: string;
            spaceId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
        };
        environments: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            createdAt: string;
            updatedAt?: string | undefined;
        }[];
    } | null>;
    removeSpace({ orgId, spaceId }: {
        orgId?: string;
        spaceId: string;
    }): Promise<{
        success: boolean;
    } | null>;
    createEnvironment({ orgId, spaceId, environmentId, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
    }): Promise<{
        environment: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            createdAt: string;
            updatedAt?: string | undefined;
        };
    } | null>;
    removeEnvironment({ orgId, spaceId, environmentId, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
    }): Promise<{
        success: boolean;
    } | null>;
    getAPIKeys({ orgId, spaceId }: {
        orgId?: string;
        spaceId: string;
    }): Promise<{
        apiKeys: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            keyId: string;
        }[];
    } | null>;
    createAPIKey({ orgId, spaceId, environmentId, displayName, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        displayName: string;
    }): Promise<{
        token: string;
    } | null>;
    removeAPIKey({ orgId, spaceId, environmentId, keyId, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        keyId: string;
    }): Promise<{
        success: boolean;
    } | null>;
    createContent({ orgId, spaceId, environmentId, displayName, contentId, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        displayName: string;
        contentId: string;
    }): Promise<{
        content: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            contentId: string;
            componentOrder: string[];
            published?: boolean | undefined;
        };
    } | null>;
    getContentByPrefix({ orgId, spaceId, environmentId, prefix, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        prefix: string;
    }): Promise<{
        content: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            contentId: string;
            componentOrder: string[];
            version: string;
        }[] | {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            contentId: string;
            componentOrder: string[];
            published?: boolean | undefined;
        }[];
    } | null>;
    updateComponentOrder({ orgId, spaceId, environmentId, contentId, componentOrder, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        contentId: string;
        componentOrder: string[];
    }): Promise<{
        content: {
            orgId?: string | undefined;
            spaceId?: string | undefined;
            environmentId?: string | undefined;
            displayName?: string | undefined;
            createdAt?: string | undefined;
            updatedAt?: string | undefined;
            contentId?: string | undefined;
            componentOrder?: string[] | undefined;
            published?: boolean | undefined;
        };
    } | null>;
    publishContent({ orgId, spaceId, environmentId, contentId, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        contentId: string;
    }): Promise<{
        content: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            contentId: string;
            componentOrder: string[];
            version: string;
        };
    } | null>;
    createComponent({ orgId, spaceId, environmentId, contentId, type, displayName, controls, position, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        contentId: string;
        type: string;
        displayName: string;
        controls: Record<string, any>;
        position: number | "end";
    }): Promise<{
        component: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            type: string;
            contentId: string;
            componentId: string;
            controls: {
                [x: string]: any;
            };
        };
        content: {
            orgId?: string | undefined;
            spaceId?: string | undefined;
            environmentId?: string | undefined;
            displayName?: string | undefined;
            createdAt?: string | undefined;
            updatedAt?: string | undefined;
            contentId?: string | undefined;
            componentOrder?: string[] | undefined;
            published?: boolean | undefined;
        };
    } | null>;
    getComponentsByContentId({ orgId, spaceId, environmentId, contentId, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        contentId: string;
    }): Promise<{
        components: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            type: string;
            contentId: string;
            componentId: string;
            controls: {
                [x: string]: any;
            };
        }[];
    } | null>;
    updateComponent({ orgId, spaceId, environmentId, contentId, componentId, displayName, controls, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        contentId: string;
        componentId: string;
        displayName: string;
        controls: Record<string, any>;
    }): Promise<{
        component: {
            orgId?: string | undefined;
            spaceId?: string | undefined;
            environmentId?: string | undefined;
            displayName?: string | undefined;
            createdAt?: string | undefined;
            updatedAt?: string | undefined;
            type?: string | undefined;
            contentId?: string | undefined;
            componentId?: string | undefined;
            controls?: {
                [x: string]: any;
            } | undefined;
        };
    } | null>;
    removeComponent({ orgId, spaceId, environmentId, contentId, componentId, componentOrder, }: {
        orgId?: string;
        spaceId?: string;
        environmentId?: string;
        contentId: string;
        componentId: string;
        componentOrder: string[];
    }): Promise<{
        content: {
            orgId?: string | undefined;
            spaceId?: string | undefined;
            environmentId?: string | undefined;
            displayName?: string | undefined;
            createdAt?: string | undefined;
            updatedAt?: string | undefined;
            contentId?: string | undefined;
            componentOrder?: string[] | undefined;
            published?: boolean | undefined;
        };
    } | null>;
}
declare class ResourceClient extends APIClient<ResourcesAppType> {
    getContent({ published }: {
        published: boolean;
    }): Promise<{
        content: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            contentId: string;
            componentOrder: string[];
            published?: boolean | undefined;
        }[];
    } | null>;
    getComponentsByContentId({ contentId, published, }: {
        contentId: string;
        published?: boolean;
    }): Promise<{
        components: {
            orgId: string;
            spaceId: string;
            environmentId: string;
            displayName: string;
            createdAt: string;
            updatedAt?: string | undefined;
            type: string;
            contentId: string;
            componentId: string;
            controls: {
                [x: string]: any;
            };
        }[];
    } | null>;
}

export { ResourceClient, StudioClient };
