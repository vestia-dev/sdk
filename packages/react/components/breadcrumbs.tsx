import { usePaths } from "../context";
import { Link } from "react-aria-components";
import { type ReactNode } from "react";
import Icon from "./icon";
import { css } from "../styled-system/css";

export const BreadcrumbItem = ({ children }: { children: ReactNode }) => (
  <span
    className={css({
      display: "flex",
      alignItems: "center",
      gap: 2,
    })}
  >
    {children}
  </span>
);

export const BreadcrumbLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Link
    className={css({
      display: "flex",
      alignItems: "center",
      color: "text",
      gap: 2,
      _focusVisible: {
        outline: "none",
        ring: "2px solid",
        ringColor: "prometheus",
      },
      textStyle: "body",
      opacity: 0.8,
      cursor: "default",
      _hover: {
        opacity: 1,
        borderBottom: "2px solid",
      },
    })}
    href={href}
  >
    {children}
  </Link>
);

export const Breadcrumbs = ({
  breadcrumbs,
}: {
  breadcrumbs: { text: string; href: string | null; isLeafNode: boolean }[];
}) => {
  const { content } = usePaths();

  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        gap: 2,
      })}
    >
      {breadcrumbs.length === 0 ? (
        <BreadcrumbItem>
          <Icon name="FolderRoot" /> Content
        </BreadcrumbItem>
      ) : (
        <BreadcrumbLink href={content}>
          <Icon name="FolderRoot" /> Content
        </BreadcrumbLink>
      )}
      {breadcrumbs.map((breadcrumb, index) =>
        index === breadcrumbs.length - 1 || !breadcrumb.href ? (
          <BreadcrumbItem key={breadcrumb.text}>
            <span>/</span>
            <Icon name={breadcrumb.isLeafNode ? "File" : "Folder"} />
            {breadcrumb.text}
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem key={breadcrumb.text}>
            {"/"}
            <BreadcrumbLink href={breadcrumb.href}>
              <Icon name="Folder" />
              {breadcrumb.text}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
      )}
    </div>
  );
};
