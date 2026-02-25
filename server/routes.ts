import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertContactMessageSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { buildExcerpt, getSitemapEntries, seoByPath } from "@shared/seo";
import { getLegacyRedirectPath } from "@shared/redirects";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fs from "fs";
import path from "path";

const SERVER_START_LASTMOD = new Date().toISOString().split("T")[0] ?? "";
const PRERENDERED_DIR = path.resolve(process.cwd(), "dist", "public", "prerendered");

function routeToPrerenderedFilename(route: string): string {
  if (route === "/") return "index.html";
  return `${route.replace(/^\//, "").replace(/\//g, "_")}.html`;
}

function formatLastmod(date: Date): string {
  const iso = date.toISOString();
  return iso.split("T")[0] ?? SERVER_START_LASTMOD;
}

function safeLastmodFromDateString(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return formatLastmod(new Date(parsed));
}

function lastmodFromPrerendered(route: string): string | null {
  try {
    const filePath = path.join(PRERENDERED_DIR, routeToPrerenderedFilename(route));
    if (!fs.existsSync(filePath)) return null;
    const stats = fs.statSync(filePath);
    return stats.mtime ? formatLastmod(stats.mtime) : null;
  } catch {
    return null;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Robots.txt route
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.header("Content-Type", "text/plain");
    res.header(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    res.send(`User-agent: *
Allow: /
Crawl-delay: 1

Sitemap: https://www.chriswongdds.com/sitemap.xml
Host: www.chriswongdds.com

Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /analytics
Disallow: /ga-test
Disallow: /thank-you
Disallow: /zoom-whitening/schedule

User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

# Block problematic bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /
`);
  });

  // Sitemap route
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      // Get dynamic content for the sitemap
      const blogPosts = await storage.getBlogPosts();
      
      // Set the content type
      res.header('Content-Type', 'application/xml');
      
      // Get the base URL - always use canonical https://www for production
      const host = req.get('host') || 'www.chriswongdds.com';
      const canonicalBase = 'https://www.chriswongdds.com';
      const baseUrl =
        host && host.includes('chriswongdds.com')
          ? canonicalBase
          : (process.env.BASE_URL || `${req.protocol}://${host}`);
      
      // Build the XML content
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      const noindexPaths = new Set<string>(
        Object.values(seoByPath)
          .filter((entry) => !entry.indexable)
          .map((entry) => entry.canonicalPath),
      );

      const included = new Set<string>();
      const addUrl = (
        urlPath: string,
        priority: string,
        changefreq: string,
        lastmod: string,
      ) => {
        if (!urlPath.startsWith("/")) {
          urlPath = `/${urlPath}`;
        }
        if (noindexPaths.has(urlPath) || included.has(urlPath)) return;
        included.add(urlPath);
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${urlPath}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
      };

      const resolveSitemapPath = (urlPath: string): string => {
        const redirected = getLegacyRedirectPath(urlPath);
        const resolved = redirected ?? urlPath;
        return resolved.split("#")[0] ?? resolved;
      };

      const staticEntries = getSitemapEntries()
        .map((entry) => {
          const resolvedPath = resolveSitemapPath(entry.canonicalPath);
          return {
            ...entry,
            canonicalPath: resolvedPath,
          };
        })
        .filter(
          (entry) => entry.canonicalPath && !noindexPaths.has(entry.canonicalPath),
        );

      staticEntries.forEach((entry) => {
        const lastmod =
          entry.lastmod ??
          lastmodFromPrerendered(entry.canonicalPath) ??
          SERVER_START_LASTMOD;
        addUrl(
          entry.canonicalPath,
          entry.priority.toFixed(1),
          entry.changefreq,
          lastmod,
        );
      });
      
      // Add blog post pages as canonical routes
      blogPosts.forEach((post) => {
        const route = `/blog/${post.slug}`;
        const lastmod =
          safeLastmodFromDateString(post.date) ??
          lastmodFromPrerendered(route) ??
          SERVER_START_LASTMOD;
        addUrl(route, "0.6", "monthly", lastmod);
      });
      
      // Close the XML
      xml += '</urlset>';
      
      // Send the response
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // RSS feed route
  app.get("/rss.xml", async (_req: Request, res: Response) => {
    try {
      const canonicalBase = "https://www.chriswongdds.com";
      const blogSeo = seoByPath["/blog"];

      const posts = (await storage.getBlogPosts()).slice();
      posts.sort((a, b) => {
        const aTime = Date.parse(a.date);
        const bTime = Date.parse(b.date);
        if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
        if (Number.isNaN(aTime)) return 1;
        if (Number.isNaN(bTime)) return -1;
        return bTime - aTime;
      });

      const channelTitle = blogSeo?.title ?? "Dental Health Blog";
      const channelDescription = blogSeo?.description ?? "";
      const channelLink = `${canonicalBase}/blog`;

      const itemsXml = posts
        .map((post) => {
          const link = `${canonicalBase}/blog/${post.slug}`;
          const parsedDate = Date.parse(post.date);
          const pubDateXml = Number.isNaN(parsedDate)
            ? ""
            : `\n      <pubDate>${new Date(parsedDate).toUTCString()}</pubDate>`;
          const description = buildExcerpt(post.content);

          return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>${pubDateXml}
      <description>${escapeXml(description)}</description>
    </item>`;
        })
        .join("\n");

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(channelDescription)}</description>
${itemsXml ? `${itemsXml}\n` : ""}  </channel>
</rss>`;

      res.header("Content-Type", "application/rss+xml; charset=utf-8");
      res.header(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0",
      );
      res.header("Pragma", "no-cache");
      res.header("Expires", "0");
      res.send(rss);
    } catch (error) {
      console.error("Error generating rss feed:", error);
      res.status(500).send("Error generating rss feed");
    }
  });

  // API routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.status(200).json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const service = await storage.getServiceBySlug(slug);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.status(200).json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.get("/api/blog-posts", async (req: Request, res: Response) => {
    try {
      const serviceFilter =
        typeof req.query.service === "string" ? req.query.service : undefined;
      const blogPosts = serviceFilter
        ? await storage.getBlogPostsByServiceSlug(serviceFilter)
        : await storage.getBlogPosts();
      res.status(200).json(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const blogPost = await storage.getBlogPostBySlug(slug);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.status(200).json(blogPost);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.get("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.status(200).json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation error:", error);
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation error:", error);
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to create contact message" });
    }
  });

  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscription = await storage.getNewsletterSubscriptionByEmail(subscriptionData.email);
      
      if (existingSubscription) {
        return res.status(200).json({ 
          message: "Email already subscribed", 
          subscription: existingSubscription 
        });
      }
      
      const subscription = await storage.createNewsletterSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation error:", error);
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating newsletter subscription:", error);
      res.status(500).json({ message: "Failed to create newsletter subscription" });
    }
  });

  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const searchResults = await storage.search(query);
      res.status(200).json(searchResults);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  // Analytics API routes - Get all appointments
  app.get("/api/appointments", async (_req: Request, res: Response) => {
    try {
      const appointments = await storage.getAppointments();
      res.status(200).json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Analytics API routes - Get all contact messages
  app.get("/api/contact", async (_req: Request, res: Response) => {
    try {
      const contacts = await storage.getContactMessages();
      res.status(200).json(contacts);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
