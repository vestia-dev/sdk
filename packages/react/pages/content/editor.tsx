import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLayouts, useParams, useStudioClient } from "../../context";
import { Button } from "../../components/button";
import { useGlobalDialog } from "../../components/dialog";
import { css } from "../../styled-system/css";
import Icon from "../../components/icon";
import { Plus } from "lucide-react";
import { Toolbar } from "../../components/toolbar";
import { ComponentRenderer } from "../../components/component-mapper";
import { useDragAndDrop } from "react-aria-components";
import { GridList } from "../../components/grid-list";
import { move, type QueryParameters, type QueryReturnType } from "../../utils";
import { Menu, MenuItem, MenuItemIcon } from "../../components/menu";
import { Select } from "../../components/form";

export const EditorPage = () => {
  const studioClient = useStudioClient();
  const params = useParams();
  const { setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const contentId = params.contentId as string;
  const layoutMap = useLayouts();
  const layoutOptions = Object.keys(layoutMap).map((layoutType) => ({
    label: layoutMap[layoutType]?.displayName || layoutType,
    value: layoutType,
  }));

  const {
    data: componentsData,
    isLoading: componentsLoading,
    isError: componentsError,
  } = useQuery({
    queryKey: ["getComponentsByContentId", contentId],
    queryFn: async () =>
      await studioClient.getComponentsByContentId({
        contentId: contentId as string,
      }),
  });

  const {
    data: contentData,
    isLoading: contentLoading,
    isError: contentError,
  } = useQuery({
    queryKey: ["getContentById", contentId],
    queryFn: async () =>
      await studioClient.getContentById({
        contentId: contentId as string,
      }),
  });

  const { mutate: updatePreviewLayout } = useMutation({
    mutationFn: async (vars: QueryParameters<"updatePreviewLayout">) =>
      await studioClient.updatePreviewLayout(vars),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: ["getContentById", contentId],
      });
      queryClient.setQueryData(
        ["getContentById", contentId],
        (oldData: QueryReturnType<"getContentById">) => ({
          content: { ...oldData?.content, previewLayout: vars.previewLayout },
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getContentById", contentId],
      });
    },
  });

  if (componentsError || contentError)
    return (
      <div
        className={css({
          w: "full",
          h: "60%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        })}
      >
        <Icon
          name="Frown"
          size={100}
          className={css({ opacity: 0.2, mb: 5 })}
        />
        <p className={css({ textStyle: "2xl" })}>
          Sorry, something went wrong. Please try again later.
        </p>
      </div>
    );

  return (
    <>
      <Toolbar>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center",
          })}
        ></div>
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center",
          })}
        >
          {contentLoading ? (
            <Select
              buttonSize="sm"
              buttonVariant="ghost"
              defaultSelectedKey={"loading"}
              items={[{ label: "Loading", value: "loading" }]}
              isDisabled
            />
          ) : null}

          {contentData?.content ? (
            <Select
              buttonSize="sm"
              buttonVariant="ghost"
              defaultSelectedKey={contentData.content.previewLayout || ""}
              items={[...layoutOptions, { label: "None", value: "" }]}
              onSelectionChange={(key) => {
                updatePreviewLayout({
                  previewLayout: key as string,
                  contentId,
                });
              }}
            />
          ) : null}

          <Button
            onPress={() => {
              setDialog({ type: "publish-content", values: { contentId } });
            }}
            variant="ghost"
            size="sm"
          >
            <Icon name="ArrowUpFromLine" className={css({ mr: 2 })} />
            Publish
          </Button>
        </div>
      </Toolbar>
      {componentsLoading ? (
        <div
          className={css({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            h: "85vh",
          })}
        >
          <Icon
            name="Loader"
            size={50}
            className={css({
              animation: "spin",
              animationDuration: "2s",
              opacity: 0.5,
            })}
          />
        </div>
      ) : (
        <Editor
          components={componentsData?.components}
          selectedLayout={contentData?.content?.previewLayout || ""}
        />
      )}
    </>
  );
};

const Editor = ({
  components,
  selectedLayout,
}: {
  components:
    | QueryReturnType<"getComponentsByContentId">["components"]
    | undefined;
  selectedLayout: string;
}) => {
  const params = useParams();
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars: QueryParameters<"updateComponentOrder">) =>
      await studioClient.updateComponentOrder(vars),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: ["getComponentsByContentId", contentId],
      });
      queryClient.setQueryData(
        ["getComponentsByContentId", contentId],
        (oldData: QueryReturnType<"getComponentsByContentId">) => ({
          components: vars.componentOrder.map((componentId) =>
            oldData?.components.find((c) => c.componentId === componentId)
          ),
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId],
      });
    },
  });
  const contentId = params.contentId as string;

  let { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({
        "text/plain": components?.find((c) => c.componentId === key)
          ?.componentId!,
      })),
    onReorder(e) {
      const newOrder = move(
        e.target.key as string,
        e.keys as Iterable<string>,
        components,
        e.target.dropPosition
      );
      mutate({
        contentId,
        componentOrder: newOrder.map((c) => c.componentId),
      });
    },
  });

  return (
    <div className={css({ display: "flex" })}>
      <div
        className={css({
          flex: 1,
          p: 2,
          borderRight: "2px solid",
          borderColor: "background2",
          h: "calc(100vh - calc(var(--vestia-sizes-12) + var(--vestia-sizes-14)))",
          boxSizing: "border-box",
          overflow: "scroll",
          scrollbar: "hidden",
        })}
      >
        {components && components.length > 0 ? (
          <GridList.Container
            aria-label="Components list"
            selectionMode="none"
            items={components}
            dragAndDropHooks={dragAndDropHooks}
            className={css.raw({ marginBottom: "40px" })}
          >
            {(item) => (
              <GridList.Item id={item.componentId} textValue={item.displayName}>
                <div
                  className={css({
                    display: "flex",
                    justifyContent: "space-between",
                    minWidth: "full",
                  })}
                >
                  {item.displayName}
                  <Menu
                    buttonSlot={
                      <Button variant="ghost" size="icon">
                        <Icon name="Ellipsis" />
                      </Button>
                    }
                  >
                    <MenuItem
                      onAction={() =>
                        setDialog({
                          type: "edit-component",
                          values: {
                            contentId: item.contentId,
                            componentId: item.componentId,
                            type: item.type,
                            displayName: item.displayName,
                            controls: item.controls,
                          },
                        })
                      }
                    >
                      <MenuItemIcon name="Pencil" />
                      <span>Edit</span>
                    </MenuItem>
                    <MenuItem
                      onAction={() =>
                        setDialog({
                          type: "create-component",
                          values: {
                            contentId: item.contentId,
                            position: components.findIndex(
                              (component) =>
                                component.componentId === item.componentId
                            ),
                          },
                        })
                      }
                    >
                      <MenuItemIcon name="ArrowUpToLine" />
                      <span>Insert before</span>
                    </MenuItem>
                    <MenuItem
                      onAction={() => {
                        const position =
                          components.findIndex(
                            (component) =>
                              component.componentId === item.componentId
                          ) + 1;
                        console.log(position);
                        setDialog({
                          type: "create-component",
                          values: {
                            contentId: item.contentId,
                            position: position,
                          },
                        });
                      }}
                    >
                      <MenuItemIcon name="ArrowDownToLine" />
                      <span>Insert after</span>
                    </MenuItem>
                    <MenuItem
                      onAction={() =>
                        setDialog({
                          type: "delete-component",
                          values: {
                            contentId: item.contentId,
                            componentId: item.componentId,
                          },
                        })
                      }
                    >
                      <MenuItemIcon name="Trash" />
                      <span>Delete</span>
                    </MenuItem>
                  </Menu>
                </div>
              </GridList.Item>
            )}
          </GridList.Container>
        ) : (
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
            })}
          >
            <Icon name="Plus" size={20} className={css({ opacity: 0.2 })} />
            <p
              className={css({ textAlign: "center", padding: 0, opacity: 0.8 })}
            >
              Get started by adding a component
            </p>
          </div>
        )}
        <Button
          className={css({ w: "full", position: "sticky", bottom: 0 })}
          onPress={() =>
            setDialog({ type: "create-component", values: { contentId } })
          }
        >
          Add component
        </Button>
      </div>
      <div
        className={css({
          flex: 3,
          h: "calc(100vh - calc(var(--vestia-sizes-12) + var(--vestia-sizes-14)))",
          w: 0,
          overflow: "scroll",
          scrollbar: "hidden",
        })}
      >
        {components && components.length > 0 ? (
          <ComponentRenderer
            componentData={components}
            layout={selectedLayout}
          />
        ) : (
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.6,
              gap: 2,
              mt: 20,
            })}
          >
            <Icon
              name="SatelliteDish"
              size={100}
              className={css({ opacity: 0.2, mb: 5 })}
            />
            <p>Nothing to preview yet!</p>
          </div>
        )}
      </div>
    </div>
  );
};
