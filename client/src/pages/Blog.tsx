"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Tag, Clock, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import BlogPostCard from "@/components/common/BlogPostCard";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { normalizeBlogCategory, useBlogPosts } from "@/hooks/useBlogPosts";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import { buildBreadcrumbSchema } from "@/lib/structuredData";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const categoryFromQuery = useMemo(() => {
    const search = location.split("?")[1] ?? "";
    const params = new URLSearchParams(search);
    const categoryParam = params.get("category");
    if (!categoryParam) return "all";
    return normalizeBlogCategory(categoryParam);
  }, [location]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromQuery);

  const { posts, featuredPost, categories, isLoading, isError, error } = useBlogPosts();

  const normalizedSearch = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (categoryFromQuery !== selectedCategory) {
      setSelectedCategory(categoryFromQuery);
    }
  }, [categoryFromQuery, selectedCategory]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        normalizedSearch === "" ||
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.content.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "all" ||
        normalizeBlogCategory(post.category) === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [normalizedSearch, posts, selectedCategory]);

  const popularPosts = filteredPosts.slice(0, 4);

  const featuredDescription = useMemo(() => {
    if (!featuredPost) {
      return "";
    }

    const text = featuredPost.content.trim();
    const limit = 360;
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  }, [featuredPost]);

  const categoryFilters = useMemo(() => {
    const base = [{ id: "all", name: "All Posts", count: posts.length }];

    if (!categories.length) {
      return base;
    }

    return [
      ...base,
      ...categories.map((category) => ({
        id: category.id,
        name: category.label,
        count: category.count,
      })),
    ];
  }, [categories, posts.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const hasError = isError && !isLoading;
  const errorMessage =
    error instanceof Error
      ? error.message
      : "We couldn’t load the articles. Please try again.";

  const renderError = (
    <div className="text-center py-12 bg-white rounded-lg shadow-md">
      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold font-heading text-[#333333] mb-2">
        Unable to load articles
      </h3>
      <p className="text-[#333333]">{errorMessage}</p>
    </div>
  );

  const renderEmpty = (
    <div className="text-center py-12 bg-white rounded-lg shadow-md">
      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold font-heading text-[#333333] mb-2">
        No Articles Found
      </h3>
      <p className="text-[#333333]">Try adjusting your search or category selection.</p>
    </div>
  );

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      <MetaTags 
        title={pageTitles.blog}
        description={pageDescriptions.blog}
      />
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      <PageBreadcrumbs items={breadcrumbItems} />
      {/* Hero Section */}
      <section className="bg-[#F5F9FC] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">Dental Health Blog</h1>
            <p className="text-xl text-[#333333] max-w-3xl mx-auto">Stay informed with the latest in dental health news, tips, and advances in dental technology.</p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {!isLoading && !hasError && featuredPost && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-4">Featured Article</h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <OptimizedImage
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{featuredPost.date}</span>
                    <span className="mx-2">•</span>
                    <Tag className="h-4 w-4 mr-2" />
                    <span>{featuredPost.category || "Dental Health"}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold font-heading text-[#333333] mb-4">{featuredPost.title}</h3>
                  <p className="text-[#333333] mb-6">{featuredDescription}</p>
                  <div className="mt-auto">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button className="bg-primary text-white font-semibold hover:bg-blue-700 inline-flex items-center">
                        Read Full Article
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts List */}
      <section className="py-16 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-start md:space-x-8">
            {/* Sidebar - Categories and Search */}
            <div className="md:w-1/4 mb-8 md:mb-0">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold font-heading text-[#333333] mb-4">Search Articles</h3>
                <form onSubmit={handleSearch} className="flex">
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none bg-primary hover:bg-blue-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold font-heading text-[#333333] mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categoryFilters.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center w-full min-w-0 text-left py-2 px-3 rounded-md hover:bg-[#F5F9FC] transition-colors ${
                          selectedCategory === category.id 
                            ? 'bg-primary text-white hover:bg-primary' 
                            : 'text-[#333333]'
                        }`}
                      >
                        <ArrowRight className={`h-4 w-4 mr-2 ${
                          selectedCategory === category.id ? 'text-white' : 'text-primary'
                        }`} />
                        <span className="flex-1 min-w-0 break-words">{category.name}</span>
                        <span className={`text-xs ${
                          selectedCategory === category.id ? 'text-white/80' : 'text-gray-400'
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              

            </div>
            
            {/* Main Content - Blog Posts */}
            <div className="md:w-3/4">
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="recent">Recent Posts</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent">
                  {hasError ? (
                    renderError
                  ) : isLoading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                          <div className="w-full h-48 bg-gray-200"></div>
                          <div className="p-6">
                            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredPosts.length ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      {filteredPosts.map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    renderEmpty
                  )}
                </TabsContent>
                
                <TabsContent value="popular">
                  {hasError ? (
                    renderError
                  ) : isLoading ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                          <div className="w-full h-48 bg-gray-200"></div>
                          <div className="p-6">
                            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : popularPosts.length ? (
                    <div className="grid md:grid-cols-2 gap-8">
                      {popularPosts.map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    renderEmpty
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>


    </>
  );
};

export default Blog;
