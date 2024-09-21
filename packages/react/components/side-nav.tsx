import {
  ListBox as RAListBox,
  ListBoxItem as RAListBoxItem,
  Button as RAButton,
} from "react-aria-components";
import { css } from "../styled-system/css";
import { useState } from "react";
import Icon, { type IconName } from "./icon";
import { Button } from "./button";
import { useConfig, usePaths, useStudioClient } from "../context";
import { useQuery } from "@tanstack/react-query";
import { Menu, MenuItem, MenuItemIcon } from "./menu";
import { useTokenCheck, type QueryReturnType } from "../utils";

const UserMenu = ({
  user,
}: {
  user: NonNullable<QueryReturnType<"getUser">["user"]>;
}) => {
  const { auth } = usePaths();
  return (
    <Menu
      offset={20}
      buttonSlot={
        <RAButton
          className={css({
            cursor: "default",
            backgroundColor: "transparent",
            backgroundImage: "none",
            borderWidth: 0,
            padding: 0,
            maxHeight: "30px",
            _hover: {
              opacity: 0.8,
            },
            _focusVisible: {
              outline: "none",
              ring: "2px solid",
              ringColor: "prometheus",
              ringOffset: "-2px",
            },
          })}
        >
          <img
            src={user.pictureUrl}
            className={css({
              maxWidth: "30px",
              borderRadius: "50%",
            })}
          />
        </RAButton>
      }
    >
      <MenuItem href="https://docs.vestia.dev/" id="docs" external>
        <MenuItemIcon name="BookText" />
        <span>Docs</span>
      </MenuItem>
      <MenuItem href={`${auth}/logout`} id="logout">
        <MenuItemIcon name="LogOut" />
        <span>Log out</span>
      </MenuItem>
    </Menu>
  );
};

const Container = ({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) => {
  useTokenCheck();
  const [open, setOpen] = useState<true | null>(true);
  const studioClient = useStudioClient();
  const config = useConfig();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => await studioClient.getUser(),
  });
  const { basePath } = usePaths();

  const withoutBasePath = path.split(basePath);
  const activeTab =
    withoutBasePath.length > 1
      ? withoutBasePath[1]?.split("/")[1]
      : withoutBasePath[0]?.split("/")[1];

  return (
    <aside
      data-open={open}
      className={css({
        textStyle: "body",
        _open: {
          minWidth: "200px",
        },
        minWidth: "60px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        bg: "background2",
        containerType: "inline-size",
        borderLeft: "2px solid",
        borderRight: "2px solid",
        borderColor: "background2",
      })}
    >
      <div
        className={css({
          width: "100%",
        })}
      >
        <Section>
          <span
            className={css({
              display: "flex",
              gap: "2",
              alignItems: "center",
            })}
          >
            <div
              className={css({
                display: "flex",
                bg: "background2",
                minWidth: "30px",
                minHeight: "30px",
                borderRadius: "50%",
                justifyContent: "center",
                alignItems: "center",
              })}
            >
              <strong>{config.orgId.charAt(0).toLocaleUpperCase()}</strong>
            </div>
            <span
              className={css({
                display: { base: "none", "@/sm": "inline" },
              })}
            >
              {config.orgId}
            </span>
          </span>
        </Section>
        <RAListBox
          aria-label="Navigation"
          selectionMode="single"
          selectedKeys={new Set([`${basePath}/${activeTab}`])}
        >
          {children}
        </RAListBox>
      </div>
      <div
        className={css({
          width: "100%",
        })}
      >
        {!open ? (
          <Section>
            {isLoading ? (
              <div
                className={css({
                  display: { base: "none", "@/sm": "inline" },
                  bg: "background2",
                  animation: "pulse",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                })}
              ></div>
            ) : null}
            {data?.user ? (
              <div
                className={css({
                  display: { base: "inherit", "@/sm": "none" },
                })}
              >
                <UserMenu user={data.user} />
              </div>
            ) : null}
          </Section>
        ) : null}

        <Section>
          {isLoading ? (
            <div
              className={css({
                display: { base: "none", "@/sm": "inline" },
                bg: "background2",
                animation: "pulse",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
              })}
            ></div>
          ) : null}
          {data?.user ? (
            <div
              className={css({ display: { base: "none", "@/sm": "inherit" } })}
            >
              <UserMenu user={data.user} />
            </div>
          ) : null}
          <Button
            onPress={() => setOpen(open ? null : true)}
            size="icon"
            variant="ghost"
          >
            <Icon name={open ? "PanelLeftClose" : "PanelLeftOpen"} />
          </Button>
        </Section>
      </div>
    </aside>
  );
};

const Section = ({ children }: { children: React.ReactNode }) => (
  <div
    className={css({
      h: 12,
      px: { base: "unset", "@/sm": "6" },
      py: "2",
      width: "100%",
      display: "flex",
      justifyContent: { base: "center", "@/sm": "space-between" },
      alignItems: "center",
      boxSizing: "border-box",
      bg: "background",
      borderTop: "2px solid",
      borderBottom: "2px solid",
      borderColor: "background2",
    })}
  >
    {children}
  </div>
);

const Item = ({
  href,
  text,
  icon,
}: {
  href: string;
  text: string;
  icon: IconName;
}) => {
  return (
    <RAListBoxItem
      id={href}
      href={href}
      className={css({
        display: "flex",
        justifyContent: { base: "center", "@/sm": "unset" },
        alignItems: "center",
        textStyle: "body",
        _focusVisible: {
          outline: "none",
        },
        borderBottom: "2px solid",
        borderColor: "background2",
        cursor: "default",
        bg: {
          base: "transparent",
          _focusVisible: "backgroundDim",
          _hover: "backgroundDim",
          _selected: "background",
        },
        width: "100%",
        textAlign: "left",
        h: 14,
        px: { base: "unset", "@/sm": "6" },
        boxSizing: "border-box",
        transition: "all 0.1s",
        color: "inherit",
        position: "relative",
      })}
      textValue={text}
    >
      {({ isFocusVisible, isHovered }) => (
        <>
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2",
            })}
          >
            <Icon name={icon} />
            <span
              className={css({
                display: { base: "none", "@/sm": "inherit" },
              })}
            >
              {text}
            </span>
          </div>
          {isFocusVisible || isHovered ? <Tooltip>{text}</Tooltip> : null}
        </>
      )}
    </RAListBoxItem>
  );
};

const Tooltip = ({ children }: { children: React.ReactNode }) => (
  <div
    className={css({
      display: { base: "inherit", "@/sm": "none" },
      zIndex: 1000,
      left: "120%",
      position: "absolute",
    })}
  >
    <div
      className={css({
        bg: "background2",
        py: "1",
        px: "2",
        _before: {
          content: `""`,
          display: "block",
          width: "0",
          height: "0",
          position: "absolute",
          left: "-8px",
          top: "25%",
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderRight: "8px solid",
          borderRightColor: "background2",
        },
      })}
    >
      <span className={css({})}>{children}</span>
    </div>
  </div>
);

const Content = ({ text }: { text?: string }) => {
  const { content } = usePaths();
  return (
    <Item icon="GalleryVertical" href={content} text={text || "Content"} />
  );
};
const Flags = ({ text }: { text?: string }) => {
  const { flags } = usePaths();
  return <Item icon="ToggleRight" href={flags} text={text || "Flags"} />;
};
const Experiments = ({ text }: { text?: string }) => {
  const { experiments } = usePaths();
  return (
    <Item icon="FlaskConical" href={experiments} text={text || "Experiments"} />
  );
};
const Forms = ({ text }: { text?: string }) => {
  const { forms } = usePaths();
  return <Item icon="Send" href={forms} text={text || "Forms"} />;
};
const Assets = ({ text }: { text?: string }) => {
  const { assets } = usePaths();
  return <Item icon="FolderOpen" href={assets} text={text || "Assets"} />;
};

export const SideNav = {
  Container,
  Content,
  Flags,
  Experiments,
  Forms,
  Assets,
};
