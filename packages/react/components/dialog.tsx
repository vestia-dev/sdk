import { createContext, useContext } from "react";
import {
  type DialogTriggerProps as RADialogTriggerProps,
  type DialogProps as RADialogProps,
  Dialog as RADialog,
  DialogTrigger as RADialogTrigger,
  Heading as RAHeading,
  Modal as RAModal,
  ModalOverlay as RAModalOverlay,
  type ModalOverlayProps as RAModalOverlayProps,
} from "react-aria-components";
import { css } from "../styled-system/css";
import { useComponents, useStudioClient } from "../context";
import {
  Form,
  SelectField,
  SubmitButton,
  TextField,
  zodURLFriendlyIDSchema,
} from "./form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryParameters, QueryReturnType } from "../utils";
import { useFormContext } from "react-hook-form";

export const DialogTrigger = ({ children }: RADialogTriggerProps) => (
  <RADialogTrigger>{children}</RADialogTrigger>
);

export const Dialog = ({
  heading,
  subheading,
  children,
  ...props
}: RADialogProps &
  RAModalOverlayProps & {
    heading: string;
    subheading: string;
  }) => {
  return (
    <RAModalOverlay
      isDismissable
      className={css({
        h: "100%",
        position: "absolute",
        top: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        w: "full",
        bg: "backgroundDim",
        color: "text",
      })}
      {...props}
    >
      <RAModal
        className={css({
          bg: "background",
          p: "6",
          border: "2px solid",
          borderColor: "background2",
          outline: "none",
          w: "1/2",
          textStyle: "body",
        })}
      >
        <RADialog
          className={css({
            outline: "none",
          })}
        >
          {() => (
            <>
              <RAHeading
                slot="title"
                className={css({
                  textStyle: "heading1",
                  margin: 0,
                })}
              >
                {heading}
              </RAHeading>
              <p className={css({ opacity: 0.8, mt: 2, mb: 4 })}>
                {subheading}
              </p>
              {children}
            </>
          )}
        </RADialog>
      </RAModal>
    </RAModalOverlay>
  );
};

export type DialogType =
  | "create-component"
  | "edit-component"
  | "delete-component"
  | "create-content"
  | "publish-content"
  | "delete-content"
  | "batch-delete-content";

export type DialogState<T extends DialogType | null = null> = {
  type: T | null;
  values: {
    contentId?: string;
    contentIds?: string[];
    position?: number;
    componentId?: string;
    type?: string;
    displayName?: string;
    controls?: Record<string, any>;
  } | null;
};

const GlobalDialogContext = createContext<{
  dialog: DialogState<DialogType | null>;
  setDialog: (options: DialogState<DialogType | null>) => void | null;
}>({ dialog: { type: null, values: null }, setDialog: () => null });

export const GlobalDialogProvider = GlobalDialogContext.Provider;

export const useGlobalDialog = () => useContext(GlobalDialogContext);

export const CreateContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"createContent">) =>
      await studioClient.createContent(vars),
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ["getContentByPrefix"],
        (oldData: QueryReturnType<"getContentByPrefix">) => ({
          content: oldData?.content
            ? [...oldData?.content, newData?.content]
            : [newData?.content],
        })
      );
      queryClient.invalidateQueries({ queryKey: ["getContentByPrefix"] });
      setDialog({ type: null, values: null });
    },
  });

  return (
    <Dialog
      heading="Create content"
      subheading="Let's give your content a name"
      isOpen={dialog.type === "create-content"}
      onOpenChange={() => setDialog({ type: null, values: null })}
    >
      <Form
        validationSchema={z.object({
          displayName: z.string().min(2, "Must be more than 2 characters long"),
          contentId: zodURLFriendlyIDSchema,
        })}
        onSubmit={(data) => {
          return mutate({
            displayName: data.displayName,
            contentId: data.contentId,
            previewLayout: "",
          });
        }}
      >
        <TextField
          name="displayName"
          label="Name"
          watch={({ value, setValue }) => {
            return setValue(
              "contentId",
              value.replaceAll(/(\s|[^a-zA-Z0-9_\-\/])/g, "-").toLowerCase()
            );
          }}
        />
        <TextField name="contentId" label="ID" />

        <SubmitButton>Create content</SubmitButton>
      </Form>
    </Dialog>
  );
};

export const DeleteContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"removeContent">) =>
      await studioClient.removeContent(vars),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: ["getContentByPrefix"],
      });
      queryClient.setQueryData(
        ["getContentByPrefix"],
        (oldData: QueryReturnType<"getContentByPrefix">) => ({
          content: oldData?.content.filter(
            (content) => content.contentId !== vars.contentId
          ),
        })
      );
      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getContentByPrefix"] });
    },
  });

  return (
    <Dialog
      heading={`Delete ${`"${dialog.values?.contentId}"` || "content"}`}
      subheading="This action is permanent. Ensure you have a back up of important content before proceeding."
      isOpen={dialog.type === "delete-content"}
      onOpenChange={() => setDialog({ type: null, values: null })}
    >
      <Form
        defaultValues={{
          contentId: dialog?.values?.contentId,
        }}
        validationSchema={z.object({
          contentId: zodURLFriendlyIDSchema,
        })}
        onSubmit={(data) => {
          return mutate({
            contentId: data.contentId,
          });
        }}
      >
        {!dialog.values?.contentId ? (
          <TextField name="contentId" label="ID" />
        ) : null}

        <SubmitButton>Delete content</SubmitButton>
      </Form>
    </Dialog>
  );
};

export const PublishContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"publishContent">) =>
      await studioClient.publishContent(vars),
    onSuccess: (newData) => {
      queryClient.invalidateQueries({ queryKey: ["getContentByPrefix"] });
      setDialog({ type: null, values: null });
    },
  });

  return (
    <Dialog
      heading={`Publish ${`"${dialog.values?.contentId}"` || "content"}`}
      subheading="Any changes you've made will go live."
      isOpen={dialog.type === "publish-content"}
      onOpenChange={() => setDialog({ type: null, values: null })}
    >
      <Form
        defaultValues={{
          contentId: dialog?.values?.contentId,
        }}
        validationSchema={z.object({
          contentId: zodURLFriendlyIDSchema,
        })}
        onSubmit={(data) => {
          return mutate({
            contentId: data.contentId,
          });
        }}
      >
        {!dialog.values?.contentId ? (
          <TextField name="contentId" label="ID" />
        ) : null}

        <SubmitButton>Publish content</SubmitButton>
      </Form>
    </Dialog>
  );
};

export const BatchDeleteContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"batchRemoveContent">) =>
      await studioClient.batchRemoveContent(vars),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: ["getContentByPrefix"],
      });
      queryClient.setQueryData(
        ["getContentByPrefix"],
        (oldData: QueryReturnType<"getContentByPrefix">) => ({
          content: oldData?.content.filter(
            (content) => !vars.contentIds.includes(content.contentId)
          ),
        })
      );

      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getContentByPrefix"] });
    },
  });

  return (
    <Dialog
      heading="Delete content"
      subheading="This action is permanent. Ensure you have a back up of important content before proceeding."
      isOpen={dialog.type === "batch-delete-content"}
      onOpenChange={() => setDialog({ type: null, values: null })}
    >
      <p>You are about to delete the following items:</p>
      <div
        className={css({
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          p: 2,
          border: "2px solid",
          borderColor: "background2",
        })}
      >
        {dialog.values?.contentIds?.map((contentId) => (
          <span
            className={css({ bg: "background2", p: 1, whiteSpace: "nowrap" })}
            key={contentId}
          >
            {contentId}
          </span>
        ))}
      </div>
      <Form
        defaultValues={{
          contentIds: dialog?.values?.contentIds,
        }}
        validationSchema={z.object({
          contentIds: z.array(zodURLFriendlyIDSchema),
        })}
        onSubmit={(data) => {
          return mutate({
            contentIds: data.contentIds,
          });
        }}
      >
        <SubmitButton>Delete content</SubmitButton>
      </Form>
    </Dialog>
  );
};

const ComponentControls = ({ defaultType }: { defaultType?: string }) => {
  const { watch } = useFormContext();
  const components = useComponents();

  const type = defaultType || watch("type", false);
  if (!type) return null;
  const selectedComponentControls = components[type]?.controls || {};
  const controlKeys = Object.keys(selectedComponentControls);
  return controlKeys.length > 0 ? (
    controlKeys.map((key) => (
      <TextField key={key} name={`controls.${key}`} label={key} />
    ))
  ) : (
    <p>This component type has no controls</p>
  );
};

export const CreateComponentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const components = useComponents();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"createComponent">) =>
      await studioClient.createComponent(vars),
    onSuccess: (newData, vars) => {
      queryClient.setQueryData(
        ["getComponentsByContentId", dialog.values?.contentId],
        (oldData: QueryReturnType<"getComponentsByContentId">) => {
          if (newData?.component) {
            let newComponents = [];
            if (vars.position === "end") {
              newComponents = [...oldData?.components, newData.component];
            } else {
              const copy = [...oldData?.components];
              console.log(copy, vars.position);
              copy.splice(vars.position, 0, newData.component);
              newComponents = copy;
            }
            console.log("1");
            return {
              components: newComponents,
            };
          } else {
            console.log("2");
            return oldData;
          }
        }
      );
      queryClient.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId],
      });
      setDialog({ type: null, values: null });
    },
  });

  const items = Object.keys(components).map((componentId) => ({
    value: componentId,
    label: components[componentId]?.displayName || componentId,
  }));

  return (
    <Dialog
      heading="Create component"
      subheading="Let's give your component a name"
      isOpen={dialog.type === "create-component"}
      onOpenChange={() => setDialog({ type: null, values: null })}
    >
      <Form
        defaultValues={{
          contentId: dialog?.values?.contentId,
        }}
        validationSchema={z.object({
          displayName: z.string().min(2, "Must be more than 2 characters long"),
          contentId: zodURLFriendlyIDSchema,
          type: z.string(),
          controls: z.record(z.string(), z.any()).optional(),
        })}
        onSubmit={(data) => {
          return mutate({
            contentId: data.contentId,
            displayName: data.displayName,
            type: data.type,
            controls: data.controls || {},
            position:
              dialog.values?.position === undefined
                ? "end"
                : dialog.values?.position,
          });
        }}
      >
        <TextField name="displayName" label="Name" />
        {!dialog.values?.contentId ? (
          <TextField name="contentId" label="Content ID" />
        ) : null}
        <SelectField name="type" label="Type" items={items} />
        <ComponentControls />
        <SubmitButton>Create component</SubmitButton>
      </Form>
    </Dialog>
  );
};

export const EditComponentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const components = useComponents();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"updateComponent">) =>
      await studioClient.updateComponent(vars),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId],
      });
      queryClient.setQueryData(
        ["getComponentsByContentId", dialog.values?.contentId],
        (oldData: QueryReturnType<"getComponentsByContentId">) => ({
          components: oldData?.components
            ? oldData?.components.map((component) => {
                if (component.componentId === vars.componentId) {
                  return { ...component, ...vars };
                }
                return component;
              })
            : null,
        })
      );

      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId],
      });
    },
  });

  const item = {
    value: dialog.values?.type!,
    label:
      components[dialog.values?.type!]?.displayName! || dialog.values?.type!,
  };

  return (
    <Dialog
      heading="Edit component"
      subheading="Configure your component"
      isOpen={dialog.type === "edit-component"}
      onOpenChange={() => setDialog({ type: null, values: null })}
    >
      <Form
        defaultValues={{
          contentId: dialog?.values?.contentId,
          componentId: dialog?.values?.componentId,
          displayName: dialog?.values?.displayName,
          controls: dialog?.values?.controls,
        }}
        validationSchema={z.object({
          displayName: z.string().min(2, "Must be more than 2 characters long"),
          contentId: zodURLFriendlyIDSchema,
          componentId: z.string(),
          controls: z.record(z.string(), z.any()),
        })}
        onSubmit={(data) => {
          return mutate({
            contentId: data.contentId,
            componentId: data.componentId,
            displayName: data.displayName,
            controls: data.controls,
          });
        }}
      >
        <TextField name="displayName" label="Name" />

        {!dialog.values?.contentId ? (
          <TextField name="contentId" label="Content ID" />
        ) : null}

        {!dialog.values?.componentId ? (
          <TextField name="componentId" label="Content ID" />
        ) : null}

        <SelectField
          name="type"
          label="Type"
          items={[item]}
          defaultSelectedKey={dialog.values?.type}
          isDisabled
        />

        <ComponentControls defaultType={dialog.values?.type} />

        <SubmitButton>Edit component</SubmitButton>
      </Form>
    </Dialog>
  );
};

export const DeleteComponentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"removeComponent">) =>
      await studioClient.removeComponent(vars),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId],
      });
      queryClient.setQueryData(
        ["getComponentsByContentId", dialog.values?.contentId],
        (oldData: QueryReturnType<"getComponentsByContentId">) => ({
          components: oldData?.components
            ? oldData?.components.filter((component) => {
                return component.componentId !== vars.componentId;
              })
            : null,
        })
      );

      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId],
      });
    },
  });

  return (
    <Dialog
      heading="Delete component"
      subheading="This action is permanent."
      isOpen={dialog.type === "delete-component"}
      onOpenChange={() => setDialog({ type: null, values: null })}
    >
      <Form
        defaultValues={{
          contentId: dialog?.values?.contentId,
          componentId: dialog?.values?.componentId,
        }}
        validationSchema={z.object({
          contentId: zodURLFriendlyIDSchema,
          componentId: z.string(),
        })}
        onSubmit={(data) => {
          return mutate({
            contentId: data.contentId,
            componentId: data.componentId,
          });
        }}
      >
        {!dialog.values?.contentId ? (
          <TextField name="contentId" label="Content ID" />
        ) : null}

        {!dialog.values?.componentId ? (
          <TextField name="componentId" label="Content ID" />
        ) : null}

        <SubmitButton>Delete component</SubmitButton>
      </Form>
    </Dialog>
  );
};

export const Dialogs = () => {
  const { dialog } = useGlobalDialog();

  return (
    <>
      {dialog.type === "create-content" ? <CreateContentDialog /> : null}
      {dialog.type === "publish-content" ? <PublishContentDialog /> : null}
      {dialog.type === "delete-content" ? <DeleteContentDialog /> : null}
      {dialog.type === "batch-delete-content" ? (
        <BatchDeleteContentDialog />
      ) : null}
      {dialog.type === "create-component" ? <CreateComponentDialog /> : null}
      {dialog.type === "edit-component" ? <EditComponentDialog /> : null}
      {dialog.type === "delete-component" ? <DeleteComponentDialog /> : null}
    </>
  );
};
