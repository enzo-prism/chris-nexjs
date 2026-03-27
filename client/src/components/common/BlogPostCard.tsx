import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@shared/schema";
import AbstractBlogArt from "@/components/blog/AbstractBlogArt";
import { buildExcerpt } from "@/lib/metaContent";

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard = ({ post }: BlogPostCardProps) => {
  // Extract category from post if available
  const category = post.category || "Dental Health";

  return (
    <Card 
      className="ui-card-interactive h-full rounded-2xl border border-sky-100/80 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.38)] flex flex-col group backdrop-blur-sm" 
      id={post.slug}
    >
      <div className="relative h-48 overflow-hidden rounded-t-2xl border-b border-sky-100/80 bg-[#f7fbff]">
        <AbstractBlogArt
          slug={post.slug}
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/12 via-transparent to-white/18"></div>
        
        <Badge className="absolute top-3 left-3 rounded-full border border-white/80 bg-white/88 px-2.5 py-0.5 text-xs font-medium text-sky-900 shadow-sm hover:bg-white">
          {category}
        </Badge>
      </div>
      
      <CardContent className="p-5 flex-grow">
        {/* Date and reading time with subtle styling */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Calendar className="h-3 w-3 mr-1.5 text-gray-400" aria-hidden="true" />
          <span>{post.date}</span>
          
          {/* Optional reading time */}
          {post.readTime && (
            <>
              <span className="mx-2 text-gray-300">•</span>
              <Clock className="h-3 w-3 mr-1.5 text-gray-400" aria-hidden="true" />
              <span>{post.readTime} min read</span>
            </>
          )}
        </div>
        
        {/* Title with hover effect */}
        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        {/* Content preview with line clamp */}
        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
          {buildExcerpt(post.content, 120)}
        </p>

        {/* Read more link */}
        <Link
          href={`/blog/${post.slug}`}
          className="ui-link-premium inline-flex items-center text-sm font-medium cursor-pointer group/link"
        >
          <span>Read article</span>
          <ArrowRight
            className="h-3.5 w-3.5 ml-1 transition-transform group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </CardContent>
    </Card>
  );
};

export default BlogPostCard;
