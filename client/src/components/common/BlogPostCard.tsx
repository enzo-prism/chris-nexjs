import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BlogPost } from "@shared/schema";
import OptimizedImage from "@/components/seo/OptimizedImage";

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard = ({ post }: BlogPostCardProps) => {
  // Extract category from post if available
  const category = post.category || "Dental Health";
  
  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card 
      className="h-full bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group" 
      id={post.slug}
    >
      {/* Image container with responsive height */}
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent"></div>
        
        {/* Category Badge */}
        <Badge className="absolute top-3 left-3 bg-white/90 text-primary hover:bg-white px-2 py-0.5 text-xs font-medium rounded-full">
          {category}
        </Badge>
      </div>
      
      <CardContent className="p-5 flex-grow">
        {/* Date and reading time with subtle styling */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
          <span>{post.date}</span>
          
          {/* Optional reading time */}
          {post.readTime && (
            <>
              <span className="mx-2 text-gray-300">•</span>
              <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
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
          {truncateContent(post.content)}
        </p>

        {/* Read more link */}
        <Link href={`/blog/${post.slug}`}>
          <div className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer group/link">
            <span>Read article</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/link:translate-x-0.5" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default BlogPostCard;
