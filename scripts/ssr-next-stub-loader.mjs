const stubs = {
  "next/image": new URL("./ssr-next-image-stub.mjs", import.meta.url).href,
  "next/link": new URL("./ssr-next-link-stub.mjs", import.meta.url).href,
};

export function resolve(specifier, context, nextResolve) {
  const stub = stubs[specifier];
  if (stub) {
    return { shortCircuit: true, url: stub };
  }
  return nextResolve(specifier, context);
}
