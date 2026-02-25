import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Service, BlogPost } from "@shared/schema";

type SearchResult = {
  services: Service[];
  blogPosts: BlogPost[];
};

const SearchForm = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: [searchQuery ? `/api/search?query=${encodeURIComponent(searchQuery)}` : null],
    enabled: searchQuery.length > 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search happens automatically via the query
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="flex w-full">
        <Input
          type="text"
          placeholder="Search services, blog posts, and more..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length > 2) {
              setShowResults(true);
            } else {
              setShowResults(false);
            }
          }}
          className="w-full rounded-r-none"
          onFocus={() => {
            if (searchQuery.length > 2) {
              setShowResults(true);
            }
          }}
        />
        <Button type="submit" className="rounded-l-none bg-primary hover:bg-blue-700">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.length > 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading results...</div>
          ) : (
            <>
              {searchResults && (searchResults.services.length > 0 || searchResults.blogPosts.length > 0) ? (
                <div>
                  {searchResults.services.length > 0 && (
                    <div className="p-2">
                      <h3 className="text-xs uppercase font-semibold text-gray-500 px-2 py-1">Services</h3>
                      <ul>
                        {searchResults.services.map((service) => (
                          <li key={service.id}>
                            <Link href={`/services#${service.slug}`}>
                              <a 
                                className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                onClick={() => setShowResults(false)}
                              >
                                {service.title}
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {searchResults.blogPosts.length > 0 && (
                    <div className="p-2 border-t">
                      <h3 className="text-xs uppercase font-semibold text-gray-500 px-2 py-1">Blog Posts</h3>
                      <ul>
                        {searchResults.blogPosts.map((post) => (
                          <li key={post.id}>
                            <Link href={`/blog/${post.slug}`}>
                              <a 
                                className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                onClick={() => setShowResults(false)}
                              >
                                {post.title}
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
