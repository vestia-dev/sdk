import { type MetaFunction } from "@remix-run/node";
import { Login } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [{ title: "Assets" }, { name: "description", content: "Assets" }];
};

export default function LoginPage() {
  return <Login />;
}
