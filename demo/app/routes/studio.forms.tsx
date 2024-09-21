import { type MetaFunction } from "@remix-run/node";
import { Button, PageLayout } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [{ title: "Forms" }, { name: "description", content: "Forms" }];
};

export default function Forms() {
  return (
    <PageLayout title="Forms">
      <Button>My button</Button>
    </PageLayout>
  );
}
