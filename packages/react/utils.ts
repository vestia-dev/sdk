import { useEffect } from "react";
import { AUTH_COOKIE_NAME } from "./auth";
import { useNavigate, usePaths } from "./context";
import type { StudioClient } from "@vestia/api";
import type { DropPosition } from "react-aria-components";

export const getCookie = (name: string) => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    if (cookie) {
      const [name, value] = cookie.split("=");
      return { name, value };
    }
  }
};

export const getToken = () => {
  const cookie = getCookie(AUTH_COOKIE_NAME);
  if (cookie) {
    return cookie.value;
  }
};

export const useTokenCheck = () => {
  const token = getToken();
  const paths = usePaths();
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate(paths.login, undefined);
    }
  }, []);
  return null;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type ExtractFunctionKeys<T> = {
  [P in keyof T]-?: T[P] extends Function ? P : never;
}[keyof T];

export type QueryReturnType<T extends ExtractFunctionKeys<StudioClient>> =
  NonNullable<Awaited<ReturnType<StudioClient[T]>>>;

export type QueryParameters<T extends ExtractFunctionKeys<StudioClient>> =
  Parameters<StudioClient[T]>[number];

export type DeepNonNullable<T> = {
  [K in keyof T]: DeepNonNullable<NonNullable<T[K]>>;
};

export type DeepPartial<T> = {
  [K in keyof T]: DeepPartial<Partial<T[K]>>;
};

export function move(
  key: string,
  keys: Iterable<string>,
  components:
    | QueryReturnType<"getComponentsByContentId">["components"]
    | undefined,
  dropPosition: DropPosition
) {
  if (!components) {
    return [];
  }
  let toIndex = components.findIndex((item) => item.componentId === key);
  if (toIndex === -1) {
    return components;
  }

  toIndex = dropPosition === "before" ? toIndex : toIndex + 1;

  // Find indices of keys to move. Sort them so that the order in the list is retained.
  let keyArray = Array.isArray(keys) ? keys : [...keys];
  let indices = keyArray
    .map((key) => components.findIndex((item) => item.componentId === key))
    .sort((a, b) => a - b);

  // Shift the target down by the number of items being moved from before the target
  toIndex -= indices.filter((index) => index < toIndex).length;

  let moves = indices.map((from) => ({
    from,
    to: toIndex++,
  }));

  // Shift later from indices down if they have a larger index
  for (let i = 0; i < moves.length; i++) {
    const moveA = moves[i];
    if (moveA) {
      for (let j = i + 1; j < moves.length; j++) {
        const moveB = moves[j];
        if (moveB && moveB.from > moveA.from) {
          moveB.from--;
        }
      }
    }
  }

  // Interleave the moves so they can be applied one by one rather than all at once
  for (let i = 0; i < moves.length; i++) {
    const moveA = moves[i];
    if (moveA) {
      for (let j = moves.length - 1; j > i; j--) {
        const moveB = moves[j];
        if (moveB) {
          if (moveB.from < moveA.to) {
            moveA.to++;
          } else {
            moveB.from++;
          }
        }
      }
    }
  }

  let copy = components.slice();
  for (const move of moves) {
    if (move.from >= 0 && move.from < copy.length) {
      const [item] = copy.splice(move.from, 1);
      if (item && move.to >= 0 && move.to <= copy.length) {
        copy.splice(move.to, 0, item);
      }
    }
  }

  return copy;
}
