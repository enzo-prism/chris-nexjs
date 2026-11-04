import { createElement } from "react";

export default function NextImageStub({ src, alt, children }) {
  return createElement("img", { src, alt: alt ?? "" }, children);
}
