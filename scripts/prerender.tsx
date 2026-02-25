import fs from "fs";
import path from "path";
import React from "react";
import { renderToString } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { AppShell } from "../client/src/App";
import type { BlogPost } from "../shared/schema";
import {
  buildExcerpt,
  DEFAULT_ROBOTS,
  getSeoForPath,
  seoByPath,
} from "../shared/seo";
import { storage } from "../server/storage";
import { injectMeta, type HtmlMeta } from "../server/vite";

// Ensure classic JSX runtimes used by tsx have React in scope.
(globalThis as any).React = React;

function minifyHtml(html: string): string {
  return html
    .replace(/<!--(?!<!\[endif\]).*?-->/gs, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function routeToFilename(route: string): string {
  if (route === "/") return "index.html";
  return `${route.replace(/^\//, "").replace(/\//g, "_")}.html`;
}

function resolveHtmlMetaForRoute(
  route: string,
  blogPosts: readonly BlogPost[],
): HtmlMeta {
  const defaultSeo = getSeoForPath("/");
  const fallbackOgImage = defaultSeo.ogImage ?? "/images/dr_wong_polaroids.png";

  if (route.startsWith("/blog/") && route !== "/blog") {
    const slug = route.slice("/blog/".length);
    const post = blogPosts.find((candidate) => candidate.slug === slug);

    if (post) {
      return {
        title: `${post.title} | Christopher B. Wong, DDS`,
        description: buildExcerpt(post.content),
        canonicalPath: route,
        ogImage: post.image || fallbackOgImage,
        type: "article",
        robots: DEFAULT_ROBOTS,
      };
    }
  }

  const seo = getSeoForPath(route);
  return {
    title: seo.title,
    description: seo.description,
    canonicalPath: seo.canonicalPath,
    ogImage: seo.ogImage ?? fallbackOgImage,
    type: "website",
    robots: seo.robots,
  };
}

async function main(): Promise<void> {
  const distPublic = path.resolve(process.cwd(), "dist", "public");
  const templatePath = path.join(distPublic, "index.html");
  const prerenderDir = path.join(distPublic, "prerendered");

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Missing build template at ${templatePath}. Run vite build first.`,
    );
  }

  fs.mkdirSync(prerenderDir, { recursive: true });

  const template = await fs.promises.readFile(templatePath, "utf-8");

  const [services, testimonials, blogPosts] = await Promise.all([
    storage.getServices(),
    storage.getTestimonials(),
    storage.getBlogPosts(),
  ]);

  const staticRoutes = Object.values(seoByPath).map(
    (entry) => entry.canonicalPath,
  );

  const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
  const routes = Array.from(new Set([...staticRoutes, ...blogRoutes]));

  for (const route of routes) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          queryFn: async () => null,
          enabled: false,
          retry: false,
          staleTime: Infinity,
          refetchOnWindowFocus: false,
        },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(["/api/services"], services);
    queryClient.setQueryData(["/api/testimonials"], testimonials);
    queryClient.setQueryData(["/api/blog-posts"], blogPosts);

    const helmetContext: any = {};
    const appHtml = renderToString(
      <AppShell
        ssrPath={route}
        queryClientOverride={queryClient}
        helmetContext={helmetContext}
      />,
    );

    let html = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );

    const helmet = helmetContext.helmet;
    if (helmet) {
      const headTags = [
        helmet.title?.toString(),
        helmet.meta?.toString(),
        helmet.link?.toString(),
        helmet.script?.toString(),
        helmet.noscript?.toString(),
        helmet.style?.toString(),
      ]
        .filter(Boolean)
        .join("\n");

      if (headTags) {
        html = html.replace("</head>", `${headTags}\n</head>`);
      }
    }

    const meta = resolveHtmlMetaForRoute(route, blogPosts);
    html = injectMeta(html, meta);
    html = minifyHtml(html);

    const outPath = path.join(prerenderDir, routeToFilename(route));
    await fs.promises.writeFile(outPath, html, "utf-8");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
