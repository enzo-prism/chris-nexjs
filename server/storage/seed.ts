import { MemStorage } from "../storage";

export async function getSeedData() {
  const seededStorage = new MemStorage();
  const [services, blogPosts, testimonials] = await Promise.all([
    seededStorage.getServices(),
    seededStorage.getBlogPosts(),
    seededStorage.getTestimonials(),
  ]);
  const appointments = await seededStorage.getAppointments();
  const contactMessages = await seededStorage.getContactMessages();
  const newsletterSubscriptions = await seededStorage.getNewsletterSubscriptions();

  return {
    services,
    blogPosts,
    testimonials,
    appointments,
    contactMessages,
    newsletterSubscriptions,
  };
}
