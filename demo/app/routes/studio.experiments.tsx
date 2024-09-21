import { type MetaFunction } from "@remix-run/node";
import { Button, PageLayout } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Experiments" },
    { name: "description", content: "Experiments" },
  ];
};

export default function Experiments() {
  return (
    <PageLayout title="Experiments">
      <Button>My button</Button>
    </PageLayout>
  );
}
