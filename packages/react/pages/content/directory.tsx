import { useQuery } from "@tanstack/react-query";
import { usePaths, useSearchParams, useStudioClient } from "../../context";
import { GridList } from "../../components/grid-list";
import { Button } from "../../components/button";
import { useGlobalDialog } from "../../components/dialog";
import { css } from "../../styled-system/css";
import { Link } from "react-aria-components";
import { useState, type Dispatch } from "react";
import Icon from "../../components/icon";
import { Plus } from "lucide-react";
import { type Selection } from "react-aria-components";
import { Menu, MenuItem, MenuItemIcon } from "../../components/menu";
import type { QueryReturnType } from "../../utils";
import { Toolbar } from "../../components/toolbar";

type ContentArray = NonNullable<
  QueryReturnType<"getContentByPrefix">
>["content"];

const findGroups = (content: ContentArray) => {
  const groups: Record<string, any[]> = {};
  for (const item of content) {
    const parts = item.contentId.split("/");
    if (parts.length === 1) {
      groups["root"] = [];
    } else {
      const group = parts.slice(0, -1).join("/");
      groups[group] = [];
    }
  }
  return groups;
};

const isContentArray = (
  content: ContentArray | undefined
): content is ContentArray => {
  return (content as ContentArray)?.length > 0;
};

const groupContent = (content: ContentArray) => {
  const groups = findGroups(content);
  for (const item of content) {
    const { contentId } = item;
    const parts = contentId.split("/");
    if (groups[contentId]) {
      groups[contentId] = isContentArray(groups[contentId])
        ? [...groups[contentId], item]
        : [item];
    } else if (parts.length === 1) {
      groups["root"] = isContentArray(groups["root"])
        ? [...groups["root"], item]
        : [item];
    } else {
      const group = parts.slice(0, -1).join("/");
      groups[group] = isContentArray(groups[group])
        ? [...groups[group], item]
        : [item];
    }
  }
  return groups as Record<string, ContentArray>;
};

const NoContent = () => {
  const { setDialog } = useGlobalDialog();
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
        name="GalleryVertical"
        size={100}
        className={css({ opacity: 0.2, mb: 5 })}
      />
      <p className={css({ textStyle: "2xl" })}>
        It looks like you don&apos;t have any content
      </p>
      <Button
        onPress={() => {
          setDialog({ type: "create-content", values: null });
        }}
        variant="ghost"
      >
        <Icon name="Plus" className={css({ mr: 2 })} />
        Create content
      </Button>
    </div>
  );
};

export const DirectoryPage = () => {
  const { setDialog } = useGlobalDialog();
  const searchParams = useSearchParams();
  const prefix = searchParams.get("prefix");
  const studioClient = useStudioClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["getContentByPrefix"],
    queryFn: async () => await studioClient.getContentByPrefix({ prefix: "" }),
  });
  const [isSelecting, setIsSelecting] = useState(false);
  let [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  if (isLoading)
    return (
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
    );

  if (isError || !data)
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

  // groupedContent takes the shape of something like: {root: Array(1), blog: Array(2), blog/tech: Array(2)} where each item in the array is a Content entity
  const groupedContent = groupContent(data.content);
  const currentRoot = prefix || "root";
  const currentRootContent = groupedContent[currentRoot];
  const currentRootGroups = Object.keys(groupedContent).filter((group) => {
    // isNotCurrentRoot means we are not currently viewing this group
    const isNotCurrentRoot = group !== currentRoot;
    // isSubGroup means the group is nested at some level under the current root
    const isSubGroup = group.startsWith(prefix || "");
    // currentDepth is the depth of the current group i.e. the root group is at depth 0, a sub group is at depth 1, etc.
    const currentDepth =
      currentRoot === "root" ? 0 : currentRoot.split("/").length;
    // groupDepth is the depth of the group we are currently checking
    const groupDepth = group === "root" ? 0 : group.split("/").length;
    // isDirectDescendant means the group is a direct child of the current gorup
    const isDirectDescendant = groupDepth - currentDepth === 1;
    return isNotCurrentRoot && isDirectDescendant && isSubGroup;
  });

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
        >
          <Button
            onPress={() => {
              setIsSelecting(!isSelecting);
              setSelectedKeys(new Set([]));
            }}
            variant="ghost"
            size="sm"
          >
            {isSelecting ? <Icon name="X" /> : <Icon name="BoxSelect" />}
          </Button>
          {isSelecting ? (
            <>
              <Button
                onPress={() => {
                  let contentIds: string[] = [];
                  if (isContentArray(currentRootContent)) {
                    contentIds = currentRootContent.map(
                      (item) => item.contentId
                    );
                  }
                  if (contentIds.length > 0) {
                    setSelectedKeys(new Set([...selectedKeys, ...contentIds]));
                  }
                }}
                variant="ghost"
                size="sm"
              >
                Select all
              </Button>

              <Button
                onPress={() => {
                  if ((selectedKeys as Set<string>).size > 0) {
                    setDialog({
                      type: "batch-delete-content",
                      values: {
                        contentIds: Array.from(selectedKeys) as string[],
                      },
                    });
                  }
                }}
                variant="ghost"
                size="sm"
              >
                <Icon name="Trash" />
              </Button>
              <span className={css({ p: 2 })}>
                {(selectedKeys as Set<string>).size} selected
              </span>
            </>
          ) : null}
        </div>
        <Button
          onPress={() => {
            setDialog({ type: "create-content", values: null });
          }}
          variant="ghost"
          size="sm"
        >
          <Plus className={css({ mr: 2 })} />
          Create content
        </Button>
      </Toolbar>

      <DirectoryGroups currentRootGroups={currentRootGroups} />
      <DirectoryContent
        currentRootContent={currentRootContent}
        isSelecting={isSelecting}
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
      />
    </>
  );
};

const DirectoryGroups = ({
  currentRootGroups,
}: {
  currentRootGroups: string[];
}) => {
  const searchParams = useSearchParams();
  const prefix = searchParams.get("prefix");
  const { content } = usePaths();
  return currentRootGroups.length > 0 ? (
    <div
      className={css({
        m: 4,
        border: "2px solid",
        borderColor: "background2",
      })}
    >
      {currentRootGroups.map((group) => (
        <Link
          className={css({
            _focusVisible: {
              outline: "none",
              ring: "2px solid",
              ringColor: "prometheus",
              ringOffset: "-2px",
            },
            bg: {
              base: "background",
              _hover: "background2",
              _focusVisible: "background2",
            },
            p: 2,
            display: "flex",
            alignItems: "center",
            textStyle: "body",
            gap: 2,
            textDecoration: "none",
            color: "text",
          })}
          key={group}
          href={`${content}?prefix=${group}`}
        >
          {({ isHovered }) => (
            <div
              className={css({
                display: "flex",
                gap: 2,
                alignItems: "center",
              })}
            >
              {isHovered ? <Icon name="FolderOpen" /> : <Icon name="Folder" />}

              <span
                className={css({
                  fontWeight: "500",
                })}
              >
                {prefix ? group.slice(prefix.length + 1) : group}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  ) : null;
};
const DirectoryContent = ({
  currentRootContent,
  isSelecting,
  selectedKeys,
  setSelectedKeys,
}: {
  currentRootContent: ContentArray | undefined;
  isSelecting: boolean;
  selectedKeys: Selection;
  setSelectedKeys: Dispatch<Selection>;
}) => {
  const { setDialog } = useGlobalDialog();
  const { content } = usePaths();
  return currentRootContent && currentRootContent?.length > 0 ? (
    <div className={css({ m: 4 })}>
      <GridList.Container
        selectionMode={isSelecting ? "multiple" : "none"}
        selectionBehavior="toggle"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        aria-label="Content list"
      >
        {currentRootContent.map((item, index) => (
          <GridList.Item
            key={isSelecting ? item.contentId : `${item.contentId}-${index}`}
            id={isSelecting ? item.contentId : `${item.contentId}-${index}`}
            href={
              isSelecting
                ? undefined
                : `${content}/${encodeURIComponent(item.contentId)}`
            }
            textValue={item.displayName}
          >
            <div
              className={css({
                display: "flex",
                justifyContent: "space-between",
                minWidth: "full",
              })}
            >
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                })}
              >
                <div
                  className={css({
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 6,
                  })}
                >
                  {isSelecting ? (
                    <GridList.Checkbox slot="selection" />
                  ) : (
                    <Icon name="File" />
                  )}
                </div>
                <div
                  className={css({ display: "flex", flexDirection: "column" })}
                >
                  <span
                    className={css({
                      fontWeight: "500",
                    })}
                  >
                    {item.displayName}
                  </span>
                  <span
                    className={css({
                      textStyle: "caption",
                      opacity: 0.8,
                    })}
                  >
                    {item.contentId}
                  </span>
                </div>
              </div>
              {!isSelecting ? (
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
                        type: "delete-content",
                        values: { contentId: item.contentId },
                      })
                    }
                  >
                    <MenuItemIcon name="Pencil" />
                    <span>Edit name</span>
                  </MenuItem>
                  <MenuItem
                    onAction={() =>
                      setDialog({
                        type: "delete-content",
                        values: { contentId: item.contentId },
                      })
                    }
                  >
                    <MenuItemIcon name="Trash" />
                    <span>Delete</span>
                  </MenuItem>
                </Menu>
              ) : null}
            </div>
          </GridList.Item>
        ))}
      </GridList.Container>
    </div>
  ) : (
    <NoContent />
  );
};
