import type { Component } from "../config";
import { useComponents, useLayouts } from "../context";
import { children } from "../controls";
import { css } from "../styled-system/css";

export const ComponentMapper = ({
  componentData,
}: {
  componentData: Component[];
}) => {
  const componentMap = useComponents();
  return componentData.map((component) => {
    if (!component) {
      return null;
    }
    if (component?.type in componentMap) {
      const Component = componentMap[component.type]!.component;

      if (!component?.controls) {
        return <Component key={component.componentId} />;
      }

      if (
        "children" in component.controls &&
        Array.isArray(component.controls.children)
      ) {
        const { children, ...otherControls } = component.controls;
        return (
          <Component key={component.componentId} {...otherControls}>
            <ComponentRenderer componentData={children} />
          </Component>
        );
      }

      return <Component key={component.componentId} {...component.controls} />;
    } else {
      return (
        <p key={component.componentId}>
          Component {component.type} Not Defined
        </p>
      );
    }
  });
};

export const ComponentRenderer = ({
  componentData,
  layout,
}: {
  componentData: Component[];
  layout?: string;
}) => {
  const layoutMap = useLayouts();
  if (!layout) {
    return <ComponentMapper componentData={componentData} />;
  }
  const LayoutComponent = layoutMap[layout]?.component;
  if (!LayoutComponent) {
    return <ComponentMapper componentData={componentData} />;
  } else {
    return (
      <LayoutComponent className={css({ height: "70vh", overflow: "scroll" })}>
        <ComponentMapper componentData={componentData} />
      </LayoutComponent>
    );
  }
};
