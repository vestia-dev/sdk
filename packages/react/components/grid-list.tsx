import { CheckSquare, Square } from "lucide-react";
import {
  type CheckboxProps as RACheckboxProps,
  type GridListItemProps as RAGridListItemProps,
  type GridListProps as RAGridListProps,
  Checkbox as RACheckbox,
  GridList as RAGridList,
  GridListItem,
} from "react-aria-components";
import { css, type Styles } from "../styled-system/css";
import type { SystemStyleObject } from "../styled-system/types";

function Container<T extends object>({
  children,
  className,
  ...props
}: Omit<RAGridListProps<T>, "className"> & { className?: SystemStyleObject }) {
  return (
    <RAGridList
      className={css(
        {
          backgroundColor: "background2",
          "& .react-aria-DropIndicator": {
            border: "1px solid",
            borderColor: "prometheus",
          },
        },
        className
      )}
      {...props}
    >
      {children}
    </RAGridList>
  );
}

function Item({ children, ...props }: RAGridListItemProps) {
  let textValue = typeof children === "string" ? children : undefined;
  return (
    <GridListItem
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
          _selected: "background2",
        },
        p: 2,
        display: "flex",
        alignItems: "center",
        textStyle: "body",
        gap: 2,
      })}
      textValue={textValue}
      {...props}
    >
      {(props) =>
        children && typeof children === "function" ? children(props) : children
      }
    </GridListItem>
  );
}

function Checkbox({ children, ...props }: RACheckboxProps) {
  return (
    <RACheckbox slot={props.slot} className={css({ display: "flex" })}>
      {({ isSelected }) => (isSelected ? <CheckSquare /> : <Square />)}
    </RACheckbox>
  );
}

export const GridList = {
  Container,
  Item,
  Checkbox,
};
