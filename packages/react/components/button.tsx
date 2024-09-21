import { cva, type RecipeVariantProps } from "../styled-system/css";
import { styled } from "../styled-system/jsx";
import { Button as RAButton } from "react-aria-components";

export const buttonStyle = cva({
  base: {
    bg: "transparent",
    border: "none",
    cursor: "default",
    transition: "all 0.1s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textStyle: "button",
  },
  variants: {
    variant: {
      default: {
        bg: "prometheus",
        color: "black",
        opacity: {
          base: "1",
          _disabled: { base: "0.5", _hover: "0.5" },
          _hover: "0.8",
        },
        _focusVisible: {
          ringColor: "background2",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px",
        },
      },
      outline: {
        border: "2px solid",
        borderColor: "background2",
        color: { base: "black", _dark: "white" },
        opacity: {
          base: "1",
          _disabled: { base: "0.5", _hover: "0.5" },
          _hover: "0.8",
        },
        bg: "background",
        _focusVisible: {
          ringColor: "prometheus",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px",
        },
      },
      success: {
        bg: "emerald.400",
        color: "white",
        _focusVisible: {
          ringColor: "background",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px",
        },
      },
      destruct: {
        bg: "red.700",
        color: "white",
        _focusVisible: {
          ringColor: "background",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px",
        },
      },
      ghost: {
        color: { base: "black", _dark: "white" },
        opacity: {
          base: "1",
          _disabled: { base: "0.5", _hover: "0.5" },
          _hover: "0.8",
        },
        bg: {
          base: "transparent",
          _disabled: { _hover: "transparent" },
          _hover: "background2Dim",
        },
        _focusVisible: {
          ringColor: "prometheus",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px",
        },
      },
    },
    size: {
      default: {
        p: "4",
      },
      icon: {
        p: "1",
      },
      sm: {
        p: "2",
      },
      lg: {
        p: "6",
        fontSize: "xl",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonVariants = RecipeVariantProps<typeof buttonStyle>;

export const Button = styled(RAButton, buttonStyle);
