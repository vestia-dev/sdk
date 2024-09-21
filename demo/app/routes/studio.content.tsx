import { type MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Content } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [{ title: "Content" }, { name: "description", content: "Content" }];
};

export default function ContentLayout() {
  return (
    <Content.Layout>
      <Outlet />
    </Content.Layout>
  );
}
