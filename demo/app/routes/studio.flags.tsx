import { type MetaFunction } from "@remix-run/node";
import { Button, PageLayout } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [{ title: "Flags" }, { name: "description", content: "Flags" }];
};

export default function Flags() {
  return (
    <PageLayout title="Flags">
      <Button>My button</Button>
    </PageLayout>
  );
}
