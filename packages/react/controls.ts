const CONTROL_TYPES = {
  CHILDREN: "CHILDREN",
  STRING: "STRING",
  RICH_TEXT: "RICH_TEXT",
  HREF: "HREF",
};

export function children() {
  return CONTROL_TYPES.CHILDREN;
}
export function string() {
  return CONTROL_TYPES.STRING;
}
export function richtext() {
  return CONTROL_TYPES.RICH_TEXT;
}
export function href() {
  return CONTROL_TYPES.HREF;
}
