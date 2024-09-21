import {
  defineConfig,
  defineSemanticTokens,
  defineTextStyles,
  defineTokens,
} from "@pandacss/dev";
import type { TextStyle } from "./styled-system/types/composition";

const commonTextStyles: TextStyle = {
  fontFamily: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
  textDecoration: "inherit",
  lineHeight: "1.5",
};

export default defineConfig({
  include: ["./**/*.{js,jsx,ts,tsx}"],
  // Useful for theme customization
  theme: {
    extend: {
      containerSizes: {
        sm: "10rem",
      },
      tokens: defineTokens({
        colors: {
          white: { value: "rgb(255 255 255 / 100%)" },
          whiteDim: { value: "rgb(255 255 255 / 80%)" },
          nyx: { value: "rgb(19 19 19 / 100%)" },
          nyxDim: { value: "rgb(19 19 19 / 80%)" },
          erebus: { value: "rgb(32 32 32 / 100%)" },
          erebusDim: { value: "rgb(32 32 32 / 60%)" },
          prometheus: { value: "#e27b49" },
          helios: { value: "rgb(255 227 214 / 100%)" },
          heliosDim: { value: "rgb(255 227 214 / 60%)" },
          oceanus: { value: "#49bfe2" },
          red: { value: "red" },
        },
      }),
      textStyles: defineTextStyles({
        heading1: {
          description: "The body text style - used in paragraphs",
          value: {
            ...commonTextStyles,
            fontWeight: "500",
            fontSize: "24px",
          },
        },
        body: {
          description: "The body text style - used in paragraphs",
          value: {
            ...commonTextStyles,
            fontWeight: "400",
            fontSize: "16px",
          },
        },
        caption: {
          description: "The caption text style - used for small text",
          value: {
            ...commonTextStyles,
            fontWeight: "400",
            fontSize: "12px",
          },
        },
        button: {
          description: "The button text style",
          value: {
            ...commonTextStyles,
            fontWeight: "500",
            fontSize: "14px",
          },
        },
      }),
      semanticTokens: defineSemanticTokens({
        colors: {
          text: { value: { base: "{colors.nyx}", _dark: "white" } },
          background: {
            value: { base: "{colors.white}", _dark: "{colors.nyx}" },
          },
          backgroundDim: {
            value: { base: "{colors.whiteDim}", _dark: "{colors.nyxDim}" },
          },
          background2: {
            value: { base: "{colors.helios}", _dark: "{colors.erebus}" },
          },
          background2Dim: {
            value: { base: "{colors.heliosDim}", _dark: "{colors.erebusDim}" },
          },
          primary: { value: "{colors.prometheus}" },
        },
      }),
    },
  },
  prefix: "vestia",
  outdir: "styled-system",
  outExtension: "js",
  jsxFramework: "react",
});
