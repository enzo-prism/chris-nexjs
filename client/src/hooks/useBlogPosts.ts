import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";

type CategoryMeta = {
  id: string;
  label: string;
  count: number;
};

export function normalizeBlogCategory(category?: string | null): string {
  const label = category?.trim();
  return (label && label.length > 0 ? label : "Dental Health")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function useBlogPosts() {
  const query = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  const posts = query.data ?? [];

  const categories = useMemo<CategoryMeta[]>(() => {
    if (!posts.length) {
      return [];
    }

    const map = new Map<string, CategoryMeta>();

    posts.forEach((post) => {
      const normalizedId = normalizeBlogCategory(post.category);
      const label =
        (post.category && post.category.trim()) || "Dental Health";

      const entry = map.get(normalizedId);
      if (entry) {
        entry.count += 1;
      } else {
        map.set(normalizedId, {
          id: normalizedId,
          label,
          count: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [posts]);

  const featuredPost = useMemo(() => {
    if (!posts.length) {
      return null;
    }

    return posts[0];
  }, [posts]);

  return {
    ...query,
    posts,
    featuredPost,
    categories,
  };
}

export type UseBlogPostsReturn = ReturnType<typeof useBlogPosts>;

export function useRelatedBlogPosts(serviceSlug: string | undefined) {
  const normalizedSlug = useMemo(
    () => serviceSlug?.trim().toLowerCase() ?? "",
    [serviceSlug],
  );

  return useQuery<BlogPost[]>({
    queryKey: [
      normalizedSlug
        ? `/api/blog-posts?service=${encodeURIComponent(normalizedSlug)}`
        : "/api/blog-posts",
    ],
  });
}
