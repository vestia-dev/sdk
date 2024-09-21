import { type MetaFunction } from "@remix-run/node";
import { Content } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [{ title: "Content" }, { name: "description", content: "Content" }];
};

export default function ContentPage() {
  return <Content.EditorPage />;
}
