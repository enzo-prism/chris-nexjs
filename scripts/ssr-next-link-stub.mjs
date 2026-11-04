import { createElement } from "react";

export default function NextLinkStub({ href, children, ...rest }) {
  const url = typeof href === "string" ? href : href?.pathname ?? "#";
  return createElement("a", { href: url, ...rest }, children);
}
