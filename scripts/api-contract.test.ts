import assert from "node:assert/strict";

import { NextRequest } from "next/server";
import { GET as getServices } from "../app/api/services/route";
import { GET as getServiceBySlug } from "../app/api/services/[slug]/route";
import { GET as getBlogPosts } from "../app/api/blog-posts/route";
import { GET as getBlogPostBySlug } from "../app/api/blog-posts/[slug]/route";
import { GET as getTestimonials } from "../app/api/testimonials/route";
import { GET as getAppointments, POST as postAppointment } from "../app/api/appointments/route";
import { GET as getContacts, POST as postContact } from "../app/api/contact/route";
import { POST as postNewsletter } from "../app/api/newsletter/route";
import { GET as search } from "../app/api/search/route";

function jsonFromResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

function requestWithBody(path: string, payload: unknown): NextRequest {
  return new NextRequest(`https://www.chriswongdds.com${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function queryRequest(path: string): NextRequest {
  return new NextRequest(`https://www.chriswongdds.com${path}`);
}

async function ensureServiceFound() {
  const servicesResponse = await getServices();
  assert.equal(servicesResponse.status, 200);

  const services = await jsonFromResponse<Array<{ slug: string }>>(
    servicesResponse,
  );
  assert.ok(Array.isArray(services), "services response should be an array");
  assert.ok(services.length > 0, "expected seeded services to exist");
  return services[0].slug;
}

async function ensureBlogSlug(): Promise<string> {
  const blogResponse = await getBlogPosts(queryRequest("/api/blog-posts"));
  assert.equal(blogResponse.status, 200);

  const posts = await jsonFromResponse<Array<{ slug: string }>>(blogResponse);
  assert.ok(Array.isArray(posts), "blog posts response should be an array");
  assert.ok(posts.length > 0, "expected seeded blog posts to exist");
  return posts[0].slug;
}

async function testServicesApi() {
  const servicesResponse = await getServices();
  assert.equal(servicesResponse.status, 200);

  const services = await jsonFromResponse<Array<{ slug: string }>>(
    servicesResponse,
  );
  assert.ok(services.length > 0, "expected service list to be non-empty");

  const slug = await ensureServiceFound();
  const serviceResponse = await getServiceBySlug(queryRequest("/api/services/does-not-exist"), {
    params: { slug: "does-not-exist" },
  });
  assert.equal(serviceResponse.status, 404);
  assert.deepEqual(await jsonFromResponse<{ message: string }>(serviceResponse), {
    message: "Service not found",
  });

  const serviceFoundResponse = await getServiceBySlug(queryRequest(`/api/services/${slug}`), {
    params: { slug },
  });
  assert.equal(serviceFoundResponse.status, 200);
  const serviceFound = await jsonFromResponse<{ slug: string }>(serviceFoundResponse);
  assert.equal(serviceFound.slug, slug);
}

async function testBlogApi() {
  const blogSlug = await ensureBlogSlug();

  const postsResponse = await getBlogPosts(queryRequest("/api/blog-posts"));
  assert.equal(postsResponse.status, 200);

  const filteredResponse = await getBlogPosts(
    queryRequest("/api/blog-posts?service=emergency-dental"),
  );
  assert.equal(filteredResponse.status, 200);
  const filteredPayload = await jsonFromResponse<Array<unknown>>(filteredResponse);
  assert.ok(Array.isArray(filteredPayload), "blog post filtered response should be an array");

  const missingSlug = await getBlogPostBySlug(queryRequest("/api/blog-posts/does-not-exist"), {
    params: { slug: "does-not-exist" },
  });
  assert.equal(missingSlug.status, 404);

  const existingPost = await getBlogPostBySlug(queryRequest(`/api/blog-posts/${blogSlug}`), {
    params: { slug: blogSlug },
  });
  assert.equal(existingPost.status, 200);

  const existingPayload = await jsonFromResponse<{ slug: string }>(existingPost);
  assert.equal(existingPayload.slug, blogSlug);
}

async function testTestimonialsApi() {
  const testimonials = await getTestimonials();
  assert.equal(testimonials.status, 200);
  assert.ok(Array.isArray(await jsonFromResponse<Array<unknown>>(testimonials)));
}

async function testAppointmentsApi() {
  const listResponse = await getAppointments();
  assert.equal(listResponse.status, 200);
  assert.ok(Array.isArray(await jsonFromResponse<Array<unknown>>(listResponse)));

  const payload = {
    fullName: "API Tester",
    email: "api-tester@example.com",
    phone: "555-1212",
    service: "General Consultation",
    date: "2026-03-01",
    time: "10:00 AM",
    type: "in-person",
    notes: "Automated test booking",
  };
  const createResponse = await postAppointment(
    requestWithBody("/api/appointments", payload),
  );
  assert.equal(createResponse.status, 201);

  const invalidResponse = await postAppointment(
    requestWithBody("/api/appointments", {
      ...payload,
      email: undefined,
    }),
  );
  assert.equal(invalidResponse.status, 400);
}

async function testContactApi() {
  const listResponse = await getContacts();
  assert.equal(listResponse.status, 200);
  assert.ok(Array.isArray(await jsonFromResponse<Array<unknown>>(listResponse)));

  const payload = {
    fullName: "Contact Tester",
    email: "contact-tester@example.com",
    phone: "555-1213",
    subject: "General Inquiry",
    message: "Automated test contact message",
  };
  const createResponse = await postContact(
    requestWithBody("/api/contact", payload),
  );
  assert.equal(createResponse.status, 201);

  const invalidResponse = await postContact(
    requestWithBody("/api/contact", {
      ...payload,
      subject: "",
    }),
  );
  assert.equal(invalidResponse.status, 400);
}

async function testNewsletterApi() {
  const firstPayload = { email: "newsletter-tester@example.com" };
  const first = await postNewsletter(
    requestWithBody("/api/newsletter", firstPayload),
  );
  assert.equal(first.status, 201);

  const second = await postNewsletter(
    requestWithBody("/api/newsletter", firstPayload),
  );
  assert.equal(second.status, 200);
  const secondPayload = await jsonFromResponse<{ message: string }>(second);
  assert.equal(secondPayload.message, "Email already subscribed");

  const third = await postNewsletter(requestWithBody("/api/newsletter", {}));
  assert.equal(third.status, 400);
}

async function testSearchApi() {
  const response = await search(
    queryRequest("/api/search?query=emergency"),
  );
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(
    Object.prototype.hasOwnProperty.call(payload, "services") &&
      Object.prototype.hasOwnProperty.call(payload, "blogPosts"),
    "search response should include services and blogPosts",
  );

  const empty = await search(queryRequest("/api/search"));
  assert.equal(empty.status, 400);
}

(async function run() {
  await testServicesApi();
  await testBlogApi();
  await testTestimonialsApi();
  await testAppointmentsApi();
  await testContactApi();
  await testNewsletterApi();
  await testSearchApi();

  console.log("All API contract checks passed.");
})().catch((error: unknown) => {
  console.error("API contract check failed:", error);
  process.exit(1);
});
