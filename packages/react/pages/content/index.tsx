import { useParams, usePaths, useSearchParams } from "../../context";
import { PageLayout } from "../../components/layout";
import { type ReactNode } from "react";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { DirectoryPage } from "./directory";
import { EditorPage } from "./editor";

export const Layout = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const prefix = searchParams.get("prefix");
  const { content } = usePaths();
  const params = useParams();
  let items: string[] = [];
  if (params.contentId) {
    items = params.contentId.split("/");
  } else if (prefix) {
    items = prefix.split("/");
  } else {
    items = [];
  }
  const breadcrumbs = items.map((item, index) => {
    const isLeafNode = Boolean(params.contentId) && index === items.length - 1;
    return {
      text: item,
      href: !isLeafNode
        ? `${content}?prefix=${items.slice(0, index + 1).join("/")}`
        : null,
      isLeafNode,
    };
  });

  return (
    <PageLayout header={<Breadcrumbs breadcrumbs={breadcrumbs} />}>
      {children}
    </PageLayout>
  );
};

export const Content = {
  Layout,
  DirectoryPage,
  EditorPage,
};
