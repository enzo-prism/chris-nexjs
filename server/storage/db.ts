import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import {
  appointments,
  blogPosts,
  contactMessages,
  newsletterSubscriptions,
  services,
  testimonials,
  type Appointment,
  type BlogPost,
  type ContactMessage,
  type InsertUser,
  type InsertAppointment,
  type InsertBlogPost,
  type InsertContactMessage,
  type InsertNewsletterSubscription,
  type InsertService,
  type InsertTestimonial,
  type NewsletterSubscription,
  type User,
  type Service,
  type Testimonial,
} from "@shared/schema";
import { getSeedData } from "./seed";

import type { IStorage } from "../storage";

type DatabaseClient = ReturnType<typeof drizzle>;

function isDatabaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

async function createClient(): Promise<DatabaseClient | null> {
  if (!isDatabaseEnabled()) return null;

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    return drizzle(pool);
  } catch (error) {
    console.error("[storage] Could not initialize Neon client", error);
    return null;
  }
}

function toList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeServiceSlug(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function withCanonicalSeeding<T>(rows: T[]): T[] {
  return Array.isArray(rows) ? rows : [];
}

class DatabaseStorage implements IStorage {
  private readonly db: DatabaseClient;
  private readonly ready: Promise<void>;

  constructor(db: DatabaseClient) {
    this.db = db;
    this.ready = this.seedData();
  }

  private async seedData(): Promise<void> {
    const seed = await getSeedData();

    const existingServices = withCanonicalSeeding<Service>(
      await this.db.select().from(services),
    );
    if (!existingServices.length) {
      for (const row of seed.services) {
        await this.db
          .insert(services)
          .values({
            ...row,
            featured: row.featured === undefined ? false : row.featured,
          });
      }
    }

    const existingBlogPosts = withCanonicalSeeding<BlogPost>(
      await this.db.select().from(blogPosts),
    );
    if (!existingBlogPosts.length) {
      for (const row of seed.blogPosts) {
        await this.db.insert(blogPosts).values({
          ...row,
          category: row.category ?? null,
          readTime: row.readTime ?? null,
          relatedServices: row.relatedServices ?? [],
        });
      }
    }

    const existingTestimonials = withCanonicalSeeding<Testimonial>(
      await this.db.select().from(testimonials),
    );
    if (!existingTestimonials.length) {
      for (const row of seed.testimonials) {
        await this.db.insert(testimonials).values(row);
      }
    }

    if ((await this.db.select().from(contactMessages)).length === 0) {
      for (const row of seed.contactMessages) {
        await this.db.insert(contactMessages).values({
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          subject: row.subject,
          message: row.message,
        });
      }
    }

    if ((await this.db.select().from(appointments)).length === 0) {
      for (const row of seed.appointments) {
        await this.db.insert(appointments).values({
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          service: row.service,
          date: row.date,
          time: row.time,
          type: row.type,
          notes: row.notes,
        });
      }
    }

    if ((await this.db.select().from(newsletterSubscriptions)).length === 0) {
      for (const row of seed.newsletterSubscriptions) {
        await this.db.insert(newsletterSubscriptions).values({
          email: row.email,
        });
      }
    }
  }

  private async ensureSeeded(): Promise<void> {
    await this.ready;
  }

  async getUser(id: number): Promise<User | undefined> {
    await this.ensureSeeded();
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureSeeded();
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    await this.ensureSeeded();
    throw new Error("Users are not managed in this implementation yet.");
  }

  async getAppointments(): Promise<Appointment[]> {
    await this.ensureSeeded();
    return this.db.select().from(appointments);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return toList<Appointment>(rows)[0];
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    await this.ensureSeeded();
    const [created] = await this.db
      .insert(appointments)
      .values({
        ...appointment,
        notes: appointment.notes ?? null,
      })
      .returning();
    return created as Appointment;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    await this.ensureSeeded();
    return this.db.select().from(contactMessages);
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id));
    return toList<ContactMessage>(rows)[0];
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    await this.ensureSeeded();
    const [created] = await this.db.insert(contactMessages).values(message).returning();
    return created as ContactMessage;
  }

  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    await this.ensureSeeded();
    return this.db.select().from(newsletterSubscriptions);
  }

  async getNewsletterSubscription(id: number): Promise<NewsletterSubscription | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.id, id));
    return toList<NewsletterSubscription>(rows)[0];
  }

  async getNewsletterSubscriptionByEmail(
    email: string,
  ): Promise<NewsletterSubscription | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return toList<NewsletterSubscription>(rows)[0];
  }

  async createNewsletterSubscription(
    subscription: InsertNewsletterSubscription,
  ): Promise<NewsletterSubscription> {
    await this.ensureSeeded();
    const [created] = await this.db
      .insert(newsletterSubscriptions)
      .values({
        email: subscription.email,
      })
      .returning();
    return created as NewsletterSubscription;
  }

  async getServices(): Promise<Service[]> {
    await this.ensureSeeded();
    return this.db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(services)
      .where(eq(services.id, id));
    return toList<Service>(rows)[0];
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(services)
      .where(eq(services.slug, slug));
    return toList<Service>(rows)[0];
  }

  async createService(service: InsertService): Promise<Service> {
    await this.ensureSeeded();
    const [created] = await this.db
      .insert(services)
      .values({
        ...service,
        featured: service.featured ?? false,
      })
      .returning();
    return created as Service;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    await this.ensureSeeded();
    return this.db.select().from(blogPosts);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return toList<BlogPost>(rows)[0];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return toList<BlogPost>(rows)[0];
  }

  async getBlogPostsByServiceSlug(slug: string): Promise<BlogPost[]> {
    await this.ensureSeeded();
    const normalized = normalizeServiceSlug(slug);
    if (!normalized) {
      return [];
    }

    const posts = await this.getBlogPosts();
    return posts.filter((post) =>
      (post.relatedServices ?? []).some(
        (relatedSlug) => normalizeServiceSlug(relatedSlug) === normalized,
      ),
    );
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    await this.ensureSeeded();
    const [created] = await this.db
      .insert(blogPosts)
      .values({
        ...post,
        category: post.category ?? null,
        readTime: post.readTime ?? null,
        relatedServices: post.relatedServices ?? [],
      })
      .returning();
    return created as BlogPost;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    await this.ensureSeeded();
    return this.db.select().from(testimonials);
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id));
    return toList<Testimonial>(rows)[0];
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    await this.ensureSeeded();
    const [created] = await this.db
      .insert(testimonials)
      .values(testimonial)
      .returning();
    return created as Testimonial;
  }

  async search(query: string): Promise<{ services: Service[]; blogPosts: BlogPost[] }> {
    await this.ensureSeeded();

    const lowerQuery = query.toLowerCase();
    const [serviceList, postList] = await Promise.all([
      this.getServices(),
      this.getBlogPosts(),
    ]);

    const servicesResult = toList<Service>(serviceList).filter(
      (service) =>
        service.title.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery),
    );

    const blogPostsResult = toList<BlogPost>(postList).filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery),
    );

    return {
      services: servicesResult,
      blogPosts: blogPostsResult,
    };
  }
}

export async function createDatabaseStorage(): Promise<IStorage | null> {
  const db = await createClient();
  if (!db) return null;
  return new DatabaseStorage(db);
}
