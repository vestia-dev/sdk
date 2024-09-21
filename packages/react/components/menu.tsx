import {
  type MenuProps as RAMenuProps,
  Menu as RAMenu,
  MenuTrigger as RAMenuTrigger,
  Popover as RAPopover,
  type MenuItemProps as RAMenuItemProps,
  MenuItem as RAMenuItem,
} from "react-aria-components";
import { type ReactNode } from "react";
import { icons } from "lucide-react";
import Icon from "./icon";
import { css, cx } from "../styled-system/css";
import { useNavigate } from "../context";

export const Menu = ({
  className,
  ...props
}: RAMenuProps<object> & {
  buttonSlot: ReactNode;
  offset?: number;
  crossOffset?: number;
}) => {
  return (
    <RAMenuTrigger>
      {props.buttonSlot}
      <RAPopover offset={props.offset} crossOffset={props.crossOffset}>
        <RAMenu
          className={css({
            display: "flex",
            flexDirection: "column",
            border: "2px solid",
            bg: "background2",
            borderColor: "background2",
            borderRadius: "default",
            w: "52",
            _focusVisible: {
              outline: "none",
            },
          })}
          {...props}
        >
          {props.children}
        </RAMenu>
      </RAPopover>
    </RAMenuTrigger>
  );
};

export const MenuItemIcon = ({ name }: { name: keyof typeof icons }) => (
  <Icon name={name} />
);

export const MenuItem = ({
  className,
  external = false,
  href,
  ...props
}: RAMenuItemProps & { external?: boolean; href?: string }) => {
  return (
    <RAMenuItem
      className={css({
        display: "flex",
        p: "2",
        gap: "2",
        alignItems: "center",
        _focusVisible: {
          outline: "none",
          bg: "backgroundDim",
        },
        textStyle: "body",
        color: "text",
        cursor: "default",
        bg: "background",
        _hover: {
          bg: "backgroundDim",
        },
      })}
      href={external ? undefined : href}
      onAction={
        external
          ? () => {
              if (external) {
                window.open(href);
              }
            }
          : undefined
      }
      {...props}
    >
      {props.children}
    </RAMenuItem>
  );
};
