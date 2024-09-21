import { type MetaFunction } from "@remix-run/node";
import { Button, PageLayout } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [{ title: "Assets" }, { name: "description", content: "Assets" }];
};

export default function Assets() {
  return (
    <PageLayout title="Assets">
      <Button>My button</Button>
    </PageLayout>
  );
}
