import { type MetaFunction } from "@remix-run/node";
import { Outlet, useLocation } from "@remix-run/react";
import { Content, SideNav } from "@vestia/react";

export const meta: MetaFunction = () => {
  return [{ title: "Content" }, { name: "description", content: "Content" }];
};

export default function StudioLayout() {
  const location = useLocation();
  return (
    <>
      <SideNav.Container path={location.pathname}>
        <SideNav.Content />
        <SideNav.Flags />
        <SideNav.Experiments />
        <SideNav.Forms />
        <SideNav.Assets />
      </SideNav.Container>
      <Outlet />
    </>
  );
}
