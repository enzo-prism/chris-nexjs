import { 
  User, InsertUser, users,
  Appointment, InsertAppointment, appointments,
  ContactMessage, InsertContactMessage, contactMessages,
  NewsletterSubscription, InsertNewsletterSubscription, newsletterSubscriptions,
  Service, InsertService, services,
  BlogPost, InsertBlogPost, blogPosts,
  Testimonial, InsertTestimonial, testimonials
} from "@shared/schema";
import { buildInsertTestimonial, testimonialSeedData } from "@shared/testimonialsData";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Appointment methods
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;

  // Contact message methods
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Newsletter subscription methods
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  getNewsletterSubscription(id: number): Promise<NewsletterSubscription | undefined>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;

  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;

  // Blog post methods
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostsByServiceSlug(slug: string): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Testimonial methods
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Search methods
  search(query: string): Promise<{
    services: Service[],
    blogPosts: BlogPost[]
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private appointments: Map<number, Appointment>;
  private contactMessages: Map<number, ContactMessage>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  private services: Map<number, Service>;
  private blogPosts: Map<number, BlogPost>;
  private testimonials: Map<number, Testimonial>;
  
  private userCurrentId: number;
  private appointmentCurrentId: number;
  private contactMessageCurrentId: number;
  private newsletterSubscriptionCurrentId: number;
  private serviceCurrentId: number;
  private blogPostCurrentId: number;
  private testimonialCurrentId: number;

  private normalizeServiceSlug(slug?: string | null): string {
    return slug?.trim().toLowerCase() ?? "";
  }

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.contactMessages = new Map();
    this.newsletterSubscriptions = new Map();
    this.services = new Map();
    this.blogPosts = new Map();
    this.testimonials = new Map();

    this.userCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.contactMessageCurrentId = 1;
    this.newsletterSubscriptionCurrentId = 1;
    this.serviceCurrentId = 1;
    this.blogPostCurrentId = 1;
    this.testimonialCurrentId = 1;

    // Initialize with some sample data
    this.initializeServices();
    this.initializeBlogPosts();
    this.initializeTestimonials();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const appointment: Appointment = { 
      ...appointmentData, 
      id, 
      notes: appointmentData.notes === undefined ? null : appointmentData.notes,
      createdAt: new Date() 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  // Contact message methods
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageCurrentId++;
    const message: ContactMessage = { 
      ...messageData, 
      id, 
      createdAt: new Date() 
    };
    this.contactMessages.set(id, message);
    return message;
  }

  // Newsletter subscription methods
  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return Array.from(this.newsletterSubscriptions.values());
  }

  async getNewsletterSubscription(id: number): Promise<NewsletterSubscription | undefined> {
    return this.newsletterSubscriptions.get(id);
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    return Array.from(this.newsletterSubscriptions.values()).find(
      (sub) => sub.email === email,
    );
  }

  async createNewsletterSubscription(subscriptionData: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check if already exists
    const existing = await this.getNewsletterSubscriptionByEmail(subscriptionData.email);
    if (existing) {
      return existing;
    }

    const id = this.newsletterSubscriptionCurrentId++;
    const subscription: NewsletterSubscription = { 
      ...subscriptionData, 
      id, 
      createdAt: new Date() 
    };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    return Array.from(this.services.values()).find(
      (service) => service.slug === slug,
    );
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const id = this.serviceCurrentId++;
    // Ensure featured field is populated with default if undefined
    const serviceFeatured = serviceData.featured === undefined ? false : serviceData.featured;
    const service: Service = { ...serviceData, id, featured: serviceFeatured };
    this.services.set(id, service);
    return service;
  }

  // Blog post methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (post) => post.slug === slug,
    );
  }
  async getBlogPostsByServiceSlug(slug: string): Promise<BlogPost[]> {
    const normalized = this.normalizeServiceSlug(slug);
    if (!normalized) {
      return [];
    }

    return Array.from(this.blogPosts.values()).filter((post) => {
      if (!post.relatedServices || !post.relatedServices.length) {
        return false;
      }

      return post.relatedServices.some(
        (serviceSlug) => this.normalizeServiceSlug(serviceSlug) === normalized,
      );
    });
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostCurrentId++;
    // Ensure optional fields are populated with defaults if undefined
    const category = postData.category === undefined ? null : postData.category;
    const readTime = postData.readTime === undefined ? null : postData.readTime;
    const relatedServices = Array.isArray(postData.relatedServices)
      ? postData.relatedServices
          .map((slug) => this.normalizeServiceSlug(slug))
          .filter((slug) => slug.length > 0)
      : [];
    const post: BlogPost = {
      ...postData,
      id,
      category,
      readTime,
      relatedServices,
    };
    this.blogPosts.set(id, post);
    return post;
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async createTestimonial(testimonialData: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialCurrentId++;
    const testimonial: Testimonial = { ...testimonialData, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Search methods
  async search(query: string): Promise<{ services: Service[], blogPosts: BlogPost[] }> {
    const lowerQuery = query.toLowerCase();
    
    const filteredServices = Array.from(this.services.values()).filter(
      (service) => 
        service.title.toLowerCase().includes(lowerQuery) || 
        service.description.toLowerCase().includes(lowerQuery)
    );
    
    const filteredBlogPosts = Array.from(this.blogPosts.values()).filter(
      (post) => 
        post.title.toLowerCase().includes(lowerQuery) || 
        post.content.toLowerCase().includes(lowerQuery)
    );
    
    return {
      services: filteredServices,
      blogPosts: filteredBlogPosts
    };
  }

  // Initialize sample data
  private initializeServices() {
    const servicesList: InsertService[] = [
      {
        title: "Preventive Dentistry",
        description: "Regular check-ups, cleanings, and screenings to maintain optimal oral health and prevent issues before they start.",
        image: "https://i.imgur.com/MuWZWEY.jpg",
        slug: "preventive-dentistry",
        featured: true
      },
      {
        title: "Cosmetic Dentistry",
        description: "Teeth whitening, veneers, and other aesthetic procedures to enhance your smile and boost your confidence.",
        image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/67e98b5ee7cebcc5e1b3eae3_mode%3B.png",
        slug: "cosmetic-dentistry",
        featured: true
      },
      {
        title: "Restorative Dentistry",
        description: "Fillings, crowns, bridges, and implants to repair damage and restore full function to your teeth.",
        image: "https://i.imgur.com/HcIu4Tr.jpg",
        slug: "restorative-dentistry",
        featured: false
      },
      {
        title: "Pediatric Dentistry",
        description: "Child-friendly dental care in a comfortable environment to establish good oral health habits early.",
        image: "https://i.imgur.com/3iTw6Dx.jpg",
        slug: "pediatric-dentistry",
        featured: true
      },
      {
        title: "Invisalign Clear Aligners",
        description: "Virtually invisible orthodontic treatment using custom clear aligners to straighten teeth discreetly for teens and adults.",
        image: "https://i.imgur.com/XVLlcob.jpg",
        slug: "invisalign",
        featured: true
      },
      {
        title: "ZOOM! Teeth Whitening",
        description: "In-office ZOOM! whitening that lifts deep stains and brightens your smile in one visit with minimal sensitivity.",
        image: "https://i.imgur.com/qK5nPtS.png",
        slug: "zoom-whitening",
        featured: true
      },
      {
        title: "Emergency Dental Care",
        description: "Same-day emergency dental services for urgent problems including severe toothaches, trauma, broken teeth, and infections.",
        image: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763585455/Gemini_Generated_Image_3fvkl73fvkl73fvk_sbv4kj.webp",
        slug: "emergency-dental",
        featured: true
      }
    ];

    servicesList.forEach(service => {
      this.createService(service);
    });
  }

  private initializeBlogPosts() {
    const blogPostsList: InsertBlogPost[] = [
      {
        title: "Emergency Dentist in Palo Alto: What to Do Now",
        content: `Dental emergencies never happen at a convenient time. If you need an emergency dentist in Palo Alto, issues like a cracked tooth during lunch, a sudden toothache that keeps you up at night, or a knocked-out tooth after a weekend bike ride all require fast, reliable care.

If you are in Palo Alto, Stanford, Menlo Park, or surrounding areas, Dr. Christopher B. Wong offers prompt, compassionate emergency dental treatment to relieve pain and protect your long-term oral health. This guide walks through common dental emergencies, what to do immediately, and when to call our office.

What Counts as a Dental Emergency?

A dental issue becomes an emergency when it involves:

- Severe or persistent pain

- Active infection or swelling

- Excessive bleeding

- Broken or dislodged teeth

- Damage that affects ability to bite, chew, or speak

If you are unsure whether your situation is urgent, call our office. A quick conversation can prevent hours or days of unnecessary discomfort.

Common Dental Emergencies We Treat

1) Toothache or severe pain
Throbbing, sharp, or persistent pain often signals an infection, nerve irritation, or decay that has progressed deeper than the surface. Do not wait; pain rarely goes away on its own.

2) Broken, cracked, or chipped teeth
Sports injuries, accidents, or biting something hard can damage a tooth. Even small cracks can worsen if untreated.

3) Knocked-out tooth
A knocked-out tooth is one of the most time-sensitive dental emergencies. Getting care within 30-60 minutes greatly improves the chance of saving the tooth.

4) Swelling or abscess
A dental abscess is an infection that can spread quickly. Symptoms include swelling, fever, or a bad taste in the mouth. This requires immediate treatment.

5) Lost filling or crown
If something feels suddenly off when you bite, a filling or crown may have fallen out. Exposed tooth structure can cause pain and further damage.

6) Soft-tissue injuries
Bleeding in the lips, gums, cheeks, or tongue may need professional care, especially if it does not stop after 10-15 minutes.

What to Do Before You Arrive

For a knocked-out tooth:

- Pick it up by the crown, not the root.

- Gently rinse without scrubbing.

- Try to place it back in the socket, or keep it in milk or saliva.

- Call us immediately.

If you are experiencing swelling:

- Use a cold compress.

- Avoid heat because it can worsen infection.

If a crown or filling comes out:

- Keep the restoration if possible.

- Avoid chewing on that side.

If you are in pain:

- Over-the-counter pain relievers like ibuprofen can help.

- Avoid aspirin directly on the gums because it can burn the tissue.

Why Choose Dr. Christopher B. Wong for Emergency Dental Care?

- Fast, same-day emergency appointments whenever possible

- Advanced diagnostic technology for precise, efficient treatment

- Comfort-focused approach to ease anxiety and relieve pain quickly

- Solutions for many situations, from conservative repairs to full restorations

- Local expertise trusted by families throughout Palo Alto

Our goal is simple: restore your comfort, protect your health, and get you back to normal quickly.

Emergency Dentistry That Fits Your Life

Life moves fast in the Bay Area. Dental issues should not slow you down. Whether you are a student, working professional, or parent on the go, we provide timely, effective care when you need it most.

When to Call Us Immediately

You should call our office right away if you experience:

- Severe tooth pain

- Swelling in the face or jaw

- A knocked-out or broken tooth

- Bleeding that will not stop

- Signs of infection (fever, redness, throbbing pain)

If you are unsure whether it is an emergency, call us and our team can guide you.

Schedule an Emergency Dental Appointment

If you are dealing with a dental emergency in Palo Alto, do not wait. Prompt treatment can make all the difference in saving a tooth, preventing infections, and relieving pain.

Call our office now: (650) 326-6319

Visit us: 409 Cambridge Ave, Palo Alto, CA 94306

Book online: www.chriswongdds.com/schedule

We are here to help quickly, safely, and with compassion.`,
        image: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763585455/Gemini_Generated_Image_3fvkl73fvkl73fvk_sbv4kj.webp",
        date: "March 5, 2025",
        slug: "emergency-dental-care-palo-alto",
        category: "Emergency Dental",
        readTime: 7,
        relatedServices: ["emergency-dental"],
      },
      {
        title: "Family Dentist Near Menlo Park: Simple Checklist",
        content: `If you’re searching for a “Menlo Park family dentist,” you’re likely trying to solve a practical problem: keep your household on a consistent schedule with a team you trust. This guide shares a straightforward checklist to help you choose the right dental practice near Menlo Park.

Quick checklist:
- Do they see kids, teens, and adults?
- Do they focus on prevention (cleanings, exams, coaching) to avoid bigger problems?
- Are explanations clear and pressure-free?
- Can they help you understand PPO insurance benefits and estimate costs before treatment?
- Is the location convenient from Menlo Park with reasonable parking and arrival tips?
- Can they help with urgent tooth pain or broken teeth when needed?

Questions to ask when you call:
1) Can we coordinate family appointments?
2) What happens at a first visit for a new patient?
3) How do you handle cavities and broken teeth?
4) How often do you recommend cleanings for kids vs adults?
5) What are your options if we need Invisalign or cosmetic care later?

What “family dentist” should feel like
A good family dental office makes it easier to stay consistent: visits that run on time, a calm environment for kids and anxious patients, and recommendations that prioritize long‑term health. The goal is to keep routine care routine—and avoid surprises.

Location: Menlo Park vs nearby Palo Alto
Some families want a Menlo Park address, while others prioritize the right fit even if it’s a short drive to Palo Alto. If the practice is nearby, ask about the best arrival route and where most families park.

How to prepare for your first family visit
- Bring insurance cards (or plan details) and a list of medications
- Share goals up front (cleanings, cavity prevention, smile goals, bite concerns)
- Mention dental anxiety or past experiences so the team can adapt the pace

If you’d like help planning dental care for your family near Menlo Park, start by scheduling a checkup and cleaning. A thorough exam is the fastest way to get clear answers and a realistic plan.`,
        image: "/images/hero-office-960.webp",
        date: "November 20, 2025",
        slug: "choose-family-dentist-near-menlo-park",
        category: "Family Dentistry",
        readTime: 6,
        relatedServices: ["preventive-dentistry", "pediatric-dentistry"],
      },
      {
        title: "First Dental Visit for Kids: Menlo Park Guide",
        content: `A child’s first dental visit sets the tone for years of oral health. Many Menlo Park families look for a calm, friendly experience that builds confidence early. Here’s what to expect and how to prepare.

When should kids start seeing a dentist?
Many families schedule the first visit by age 1, or within six months of the first tooth. Early visits are short, gentle, and focused on prevention.

What happens at a first kids’ appointment?
Most first visits include:
- A gentle exam to check tooth development
- A light cleaning (when age‑appropriate)
- Coaching on brushing and flossing that matches your child’s age
- Guidance on diet, snacking habits, and cavity risk
- A plan for future checkups

How to help your child feel comfortable
Try these simple strategies:
- Use positive words (avoid “shot” or “hurt”)
- Schedule when your child is usually rested (often mornings)
- Bring comfort items if helpful
- Let the team know if your child is anxious so we can slow down

How often do kids need checkups?
Many children do well with visits every six months. If a child is cavity‑prone, your dentist may recommend shorter intervals to keep teeth protected.

What if a child needs a filling?
If decay is found, your dentist will explain options clearly and recommend the most conservative repair that restores the tooth comfortably.

If you’re a Menlo Park parent looking for a family dentist, a first visit is the best way to get a practical prevention plan. Consistent checkups and good habits at home are the simplest way to avoid bigger dental problems later.`,
        image: "/images/dr-wong-waiting-room.png",
        date: "November 5, 2025",
        slug: "first-dental-visit-for-kids-menlo-park",
        category: "Pediatric Dentistry",
        readTime: 5,
        relatedServices: ["pediatric-dentistry", "preventive-dentistry"],
      },
      {
        title: "Invisalign in Palo Alto: Timeline, Attachments, Cost",
        content: `Thinking about Invisalign clear aligners? This guide breaks down how Invisalign works, who it can help, typical timelines, what affects cost, and what to expect when you start treatment with a Palo Alto dentist.

What Is Invisalign and How Does It Work?
Invisalign is an orthodontic system that uses a series of clear, custom-made plastic aligners to gradually move your teeth into better alignment. Instead of brackets and wires, you wear snug-fitting trays over your teeth and change to a new set every 1-2 weeks as your smile improves. Each set of aligners is designed from a digital 3D model of your teeth. Small, tooth-colored attachments (tiny shapes bonded to specific teeth) may be used to give the aligners extra grip, so they can rotate, tilt, or shift teeth more precisely. You will typically wear your aligners 20-22 hours per day, only removing them to eat, drink anything other than water, and brush or floss.

Key Benefits of Invisalign for Palo Alto Patients
For many patients in Palo Alto, Invisalign fits well into busy, professional, and family lives. The aligners are nearly invisible, removable for eating and cleaning, made from comfortable smooth plastic, require fewer in-office visits, and deliver predictable results thanks to digital planning. Modern Invisalign treatment uses advanced 3D software, so your dentist can preview your projected tooth movement before you even start.

Who Is a Good Candidate for Invisalign?
Invisalign can address many common orthodontic issues, including crowded teeth, gaps, mild to moderate bite problems, and relapse after previous braces. Clear aligners work best for mild to moderate concerns, while severe crowding or complex bite issues may still be better treated with traditional braces. The only way to know for sure if Invisalign is right for you is a full exam and digital scan that includes X-rays, photos, and a bite analysis. If your case is too complex for Invisalign alone, your dentist will walk you through alternatives or combined approaches.

What to Expect During Invisalign Treatment
1. Consultation and Digital Scan: Your dentist evaluates your teeth, gums, and bite, takes digital X-rays, and scans your teeth to create a 3D model. This model is used to plan how each tooth should move step by step.
2. Personalized Treatment Plan: Using Invisalign planning software, your dentist designs a custom sequence of aligners. You will see a simulation of your projected final smile and get an estimated treatment time.
3. Attachments and First Aligners: At your delivery appointment, small tooth-colored attachments may be placed on certain teeth to give your aligners extra grip. Then you will receive your first sets of trays and instructions for how long to wear each one.
4. Progress Check-Ups: You will come back periodically to make sure your teeth are tracking as planned. Minor refinements toward the end of treatment are common and help fine-tune the result.
5. Retainers to Protect Your New Smile: Once your teeth are aligned, you will switch to retainers to keep them from shifting back. Wearing retainers nightly, especially in the first year, is essential to protecting your investment long term.

How Long Does Invisalign Take?
For many adults and teens, Invisalign treatment takes about 12-18 months, though simpler cases can be shorter and more complex cases can take longer. Treatment time depends on the amount of crowding or spacing, whether your bite needs correction, and how consistently you wear your aligners (20-22 hours per day is non-negotiable). Invisalign can be faster than braces for mild issues, but braces still tend to be more efficient for very complex tooth movements.

Invisalign Costs in Palo Alto and California
Invisalign pricing is personalized. Your fee depends on how much tooth movement and bite correction you need, how many aligner sets and refinements are recommended, whether attachments or elastics are part of your plan, and any dental work needed before you start. During your Invisalign consultation in Palo Alto, you should receive a written estimate outlining costs, what's included, expected phases, and how insurance benefits or monthly payments may apply.

Health Benefits: Invisalign Does More Than Straighten Teeth
Straighter teeth look better, but there are real oral health advantages as well. Aligned teeth make brushing and flossing easier, promote healthier bite forces that reduce uneven wear, and lower the risk of chips or fractures. Because Invisalign aligners are removable, it is easier to maintain excellent hygiene throughout treatment compared with braces, where cleaning around brackets can be challenging.

Invisalign FAQs for Palo Alto Patients
Do Invisalign aligners hurt? You can expect mild pressure for a few days each time you switch to a new set, and most patients find Invisalign more comfortable overall than braces. How many hours per day do you need to wear them? Aim for 20-22 hours daily for predictable results. Can Invisalign fix every orthodontic problem? No; severe issues may still need braces. Is Invisalign right for teens? Yes, as long as the teen can commit to wearing the aligners. Will insurance cover Invisalign? Many plans that cover orthodontics contribute toward Invisalign, often up to a lifetime maximum.

Ready to Explore Invisalign in Palo Alto, CA?
If you are curious whether Invisalign is right for you, the next step is a personalized consultation with a dentist who provides Invisalign treatment in Palo Alto. During your visit, you can expect a thorough exam, digital imaging, a custom treatment plan with an estimated timeline, and a transparent discussion of costs, insurance, and payment options. Call the office at (650) 326-6319 or request an appointment online to schedule your Invisalign consultation in Palo Alto, CA.`,
        image: "https://i.imgur.com/XVLlcob.jpg",
        date: "January 15, 2025",
        slug: "invisalign-palo-alto",
        category: "Invisalign",
        readTime: 9,
        relatedServices: ["invisalign"],
      },
      {
        title: "Invisalign Attachments & Refinements: Why They Matter",
        content: `If you’re researching Invisalign, you’ll often hear new terms like attachments, elastics, and refinements. These details can sound intimidating at first, but they’re usually simple tools that make clear aligners more precise—and help you end with a better, more stable result.

Quick Answer: What Are Invisalign Attachments?
Attachments are small, tooth‑colored “buttons” bonded to specific teeth. They act like tiny handles so aligners can grip and guide harder movements (like rotations or certain bite changes). Not every Invisalign plan needs attachments, and the number and placement vary from case to case.

Why Invisalign Uses Attachments
Attachments can help aligners:
- Rotate teeth more predictably
- Move teeth that are tilted
- Improve bite relationships
- Reduce the chance that aligners slip or lose tracking

Do Attachments Hurt or Damage Teeth?
Attachments themselves don’t usually hurt. You may feel mild pressure when switching to a new aligner (that’s the teeth moving), and you might notice the attachments when you run your tongue over your teeth for the first few days. At the end of treatment, attachments are removed and the teeth are polished.

What Are Invisalign Refinements?
Refinements are additional aligners created near the end of treatment to fine‑tune details. Teeth don’t always move exactly as predicted—minor refinements are common and help you achieve the best final alignment. If refinements are recommended, your dentist will explain the reason and the expected number of extra trays.

What About Elastics (Rubber Bands)?
Some Invisalign plans use elastics to help correct bite relationships. Elastics are not necessary for every patient, but they can be very effective when bite correction is part of the goal. If you need elastics, we’ll show you exactly where they hook and how to wear them consistently.

Tips to Stay on Track With Attachments
- Wear aligners the recommended 20–22 hours per day
- Switch trays on schedule and keep your old set as a backup
- Brush and floss before reinserting aligners to reduce staining around attachments
- Bring your aligners to checkups so we can confirm fit and tracking

Thinking About Invisalign in Palo Alto?
The best way to understand whether you’ll need attachments, elastics, or refinements is a consultation with an exam and digital scan. If you’re looking for Invisalign in Palo Alto, our team can walk you through your options and what to expect at each step.`,
        image: "/images/invisalign-step-3.png",
        date: "October 20, 2025",
        slug: "invisalign-attachments-and-refinements",
        category: "Invisalign",
        readTime: 6,
        relatedServices: ["invisalign"],
      },
      {
        title: "How Long Does Invisalign Take? Timeline Factors",
        content: `One of the first questions patients ask is: “How long will Invisalign take?” The honest answer is that Invisalign timelines vary. Some plans finish in months, while others take longer depending on your bite and how much tooth movement is needed.

Typical Invisalign Timelines
Many adult Invisalign cases fall somewhere around a year to a year and a half, but your plan may be shorter or longer. The best estimate comes after an exam and a digital scan, when your dentist can map movements and identify bite issues that affect timing.

What Makes Invisalign Take Longer (or Shorter)?
Several factors influence your timeline:
- Complexity: more crowding, spacing, or bite correction often takes longer
- Wear time: consistently wearing aligners 20–22 hours per day is critical
- Tracking: if aligners aren’t fitting closely, adjustments or new scans may be needed
- Refinements: additional aligners are common at the end for fine details
- Missed changes: delaying tray changes or losing aligners can extend treatment

How Often Are Checkups?
Most plans include periodic checkups so your dentist can confirm everything is tracking. Visit frequency depends on your case, your aligner change schedule, and whether you’re using attachments or elastics.

Can Invisalign Be Faster Than Braces?
For some mild to moderate alignment issues, Invisalign can be very efficient—especially when aligners are worn consistently. For complex tooth movements, braces may still be a better fit. Your dentist will help you compare options based on stability and your goals.

How to Keep Your Invisalign Timeline on Schedule
- Wear aligners as directed (don’t “make up time” by skipping)
- Keep aligners clean and seated fully (use chewies if recommended)
- Bring aligners to appointments and let us know if fit changes
- Stay on top of hygiene to avoid cavities or gum inflammation that could slow progress

Looking for Invisalign in Palo Alto?
If you want a personalized timeline estimate, schedule a consultation for an exam and digital scan. We’ll outline realistic timing, expected phases, and what you can do to stay on track.`,
        image: "/images/invisalign-step-5.png",
        date: "October 5, 2025",
        slug: "how-long-does-invisalign-take",
        category: "Invisalign",
        readTime: 7,
        relatedServices: ["invisalign"],
      },
      {
        title: "Retainers After Invisalign: Keep Your Smile Straight",
        content: `Finishing Invisalign is exciting—your teeth look straighter, your bite feels better, and photos get easier. But the job isn’t done the day you finish aligners. Retainers are what protect your result.

Why Teeth Shift After Invisalign
Teeth naturally want to drift over time. The tissues around teeth need time to stabilize after orthodontic movement, and everyday habits (like clenching or uneven bite forces) can contribute to shifting.

How Long Do You Need to Wear Retainers?
Most patients start with a full‑time retainer phase right after Invisalign, then transition to nighttime wear. Your exact schedule depends on your starting alignment, how much movement occurred, and your bite. Consistent retainer wear is especially important in the first year after treatment.

Types of Retainers
Retainers can be:
- Clear retainers made from durable plastic (often similar in look to aligners)
- Fixed retainers bonded behind teeth in select cases
Your dentist will recommend the best option based on where your teeth are most likely to shift.

Retainer Care Tips
- Rinse after removal and clean daily
- Avoid hot water (it can warp plastic)
- Store in a protective case to prevent loss or pet damage
- Bring retainers to checkups so we can confirm fit

When to Replace Retainers
If a retainer cracks, feels loose, or no longer fits snugly, don’t wait—small shifts can happen quickly. Getting a replacement early is usually easier than correcting movement later.

Need Invisalign in Palo Alto?
If you’re considering Invisalign or you’re ready to protect an existing result with new retainers, schedule a visit. We’ll help you plan treatment and long‑term retention so your smile stays stable.`,
        image: "/images/invisalign-step-4.png",
        date: "September 10, 2025",
        slug: "retainers-after-invisalign",
        category: "Invisalign",
        readTime: 5,
        relatedServices: ["invisalign"],
      },
      {
        title: "Dental Veneers in Palo Alto: Natural-Looking Results",
        content: `If you're unhappy with chips, discoloration, uneven edges, or small gaps in your teeth, you don't necessarily need braces or extensive dental work to love your smile again. Dental veneers offer a conservative, highly aesthetic way to reshape and brighten teeth, often in just a few visits.

At Christopher B. Wong, DDS in Palo Alto, Dr. Wong provides customized veneers designed to look like your teeth—just better. This guide walks through how veneers work, who they're for, what to expect, and how to decide whether they're the right choice for you.

Quick Answer: What Are Dental Veneers?
Dental veneers are thin, custom-made shells that bond to the front of your teeth to improve their color, shape, and overall appearance. Most veneers are made from porcelain or composite resin and are carefully designed to blend seamlessly with the rest of your smile.

Veneers can help with:
- Stubborn discoloration that whitening can't fix
- Chips, cracks, or worn edges
- Small gaps between teeth
- Teeth that look short, uneven, or misshapen
- Mild misalignment or crowding (in select cases)

Why Patients in Palo Alto Choose Veneers
People often ask, "Why veneers instead of whitening or bonding?" Here's what sets veneers apart.

1. Big Cosmetic Change With a Conservative Approach
Veneers are a minimally invasive way to change what you see in the mirror. In many cases, only a small amount of enamel is reshaped from the front of the tooth to make room for the veneer. Compared with full crowns, this preserves more of your natural tooth structure.

2. Natural, Long-Lasting Results
High-quality porcelain veneers are translucent, highly stain-resistant, and designed to last many years with good care.

3. Customized to Your Face, Not a "Template Smile"
Dr. Wong carefully considers your face shape, lip line, skin and tooth tone, existing bite, and personal goals. The goal is a smile that looks like you—just more confident and balanced.

Types of Dental Veneers
- Porcelain veneers: thin ceramic shells that deliver the best aesthetics, excellent stain resistance, and durability.
- Composite veneers: tooth-colored resin that can often be done in a single visit and is easier to repair, though it may stain sooner.

During your consultation, Dr. Wong will walk you through which option makes the most sense for your teeth, your goals, and your budget.

Are You a Good Candidate for Veneers?
Veneers work best when teeth and gums are healthy, cosmetic concerns are limited to discoloration, chips, gaps, or uneven edges, and your bite is relatively stable. You may not be a candidate if you have active decay or gum disease, minimal remaining tooth structure, significant crowding that needs orthodontics, or if you're hoping for a reversible treatment.

What to Expect: The Veneer Process With Dr. Wong
1. Consultation and smile planning: exam, photos, and discussion of your goals plus timeline and investment.
2. Tooth preparation and temporaries: a small amount of enamel is reshaped, impressions are taken, and temporary veneers protect your teeth while the lab fabricates the final restorations.
3. Try-in and final bonding: you preview the veneers, adjustments are made, and the custom shells are bonded and polished so you leave with your final smile.

How Long Do Veneers Last?
With good oral hygiene and regular dental visits, porcelain veneers commonly last 10-15 years or more. Composite veneers may have a shorter lifespan and require more frequent touch-ups or replacement. Brushing, flossing, avoiding hard foods, managing grinding, and consistent cleanings all influence longevity.

Caring for Your Veneers: Do's and Don'ts
Do brush twice daily with a soft toothbrush, floss every day, keep dental visits, and wear a nightguard if you clench. Avoid chewing ice or pens, using teeth as tools, and overdoing highly staining foods or drinks without rinsing.

Are Veneers Safe? Understanding Risks and Limitations
Enamel removal is permanent, temporary sensitivity is possible, and veneers can chip or require replacement over time. Dr. Wong's conservative approach ensures you understand when veneers are appropriate versus when whitening, bonding, crowns, or Invisalign would be better for long-term health.

Veneers vs. Other Cosmetic Options
- Whitening: great for color changes but not shape.
- Bonding: useful for small chips or spots, though it can stain faster.
- Orthodontics (like Invisalign): ideal for bite or alignment issues but does not change color or shape.
Often, Dr. Wong combines treatments—such as Invisalign followed by a few veneers—to deliver the best overall result.

FAQs About Dental Veneers
Do veneers damage my teeth?
Veneers require conservative enamel reshaping. When done carefully, they preserve as much healthy tooth structure as possible.

Do veneers look fake?
High-quality veneers are customized for shape, shade, and translucency so they mimic natural teeth.

Are veneers covered by insurance?
Most dental insurance plans consider veneers cosmetic, but patients often rely on FSA or HSA funds. Our team can review benefits and outline expected fees.

Can I get veneers on just one or two teeth?
Yes. Many patients veneer a few "key" teeth to improve symmetry or close gaps while leaving other teeth as they are.

Thinking About Dental Veneers in Palo Alto?
If you're considering veneers—or you're just curious whether they're right for you—the best next step is a personalized consultation.

At Christopher B. Wong, DDS you receive:
- An honest conversation about what you want to change
- A thorough evaluation of your teeth and gums
- Clear explanations of all your options—not just veneers
- A treatment plan that respects both your goals and long-term oral health

Christopher B. Wong, DDS
409 Cambridge Ave
Palo Alto, CA 94306
(650) 326-6319

Ready to explore dental veneers? Visit chriswongdds.com to request an appointment online.`,
        image: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763577353/Gemini_Generated_Image_ta4fp4ta4fp4ta4f_xlkjgw.webp",
        date: "February 10, 2025",
        slug: "dental-veneers-palo-alto",
        category: "Cosmetic Dentistry",
        readTime: 12,
        relatedServices: ["dental-veneers", "cosmetic-dentistry"],
      },
      {
        title: "How Long Does Teeth Whitening Last? Palo Alto Guide",
        content: `Professional teeth whitening can be one of the fastest ways to refresh your smile. A common question we hear from Palo Alto patients is: “How long will my whitening results last?”

Most people enjoy a brighter shade for about 12–24 months. Your timeline depends on your diet, oral hygiene, and whether you choose in‑office whitening, take‑home trays, or a combination.

What affects how long whitening lasts?

Whitening results fade gradually as new stains develop. The biggest factors include:

- Coffee, tea, red wine, and dark sauces
- Tobacco or nicotine use
- How often you brush and floss
- How quickly you build up plaque (which can hold surface stains)
- Your original tooth shade and stain type
- Whether you have a maintenance plan (touch‑ups)

In‑office vs. take‑home trays: which lasts longer?

Both can last a long time when paired with good home care. In‑office whitening can give a faster “jump” in brightness, while trays are great for gradual whitening and convenient touch‑ups. Many patients choose a boost + maintain approach.

Simple ways to maintain your whitening results

- Rinse with water after staining drinks
- Use a straw for iced coffee or tea when possible
- Brush twice daily and floss once daily
- Keep up with cleanings so surface stains don’t build up
- Consider periodic tray touch‑ups if you stain easily

When should you whiten again?

If you notice your shade drifting or you have an upcoming event, we can help you plan a safe touch‑up schedule. If you’re prone to sensitivity, a slower approach may be more comfortable.

If you’re considering teeth whitening in Palo Alto, the best next step is a quick evaluation to confirm whitening is appropriate for your enamel, gums, and any existing restorations.`,
        image: "/images/dr-wong-office-2.png",
        date: "December 1, 2025",
        slug: "how-long-does-teeth-whitening-last",
        category: "Teeth Whitening",
        readTime: 6,
        relatedServices: ["zoom-whitening", "cosmetic-dentistry"],
      },
      {
        title: "Teeth Whitening Sensitivity: What Helps",
        content: `Whitening sensitivity is one of the most common concerns we hear from patients. The good news: for most people, sensitivity is temporary and manageable with the right plan.

Why does whitening cause sensitivity?

Whitening agents move through enamel and dentin to lift stain molecules. During that process, teeth can feel “zingy” or cold‑sensitive for a day or two—especially if you already have recession, enamel wear, or a history of sensitivity.

What helps reduce sensitivity after whitening

- Use a sensitivity toothpaste for 1–2 weeks before and after whitening
- Avoid very cold foods and drinks for 24–48 hours
- Skip acidic foods (like citrus) right after whitening if you’re sensitive
- Take breaks between whitening sessions instead of whitening every day
- Ask about fluoride or desensitizing steps if sensitivity is a concern

What to avoid

- Whitening more often or longer than instructed
- Stacking multiple whitening products at the same time
- Whitening if you have untreated cavities or inflamed gums

When sensitivity could be a warning sign

If you have sharp pain in one specific tooth, lingering pain that lasts more than a few days, or swelling, you should pause whitening and get evaluated. Those symptoms can signal decay, a crack, or gum inflammation that needs treatment.

In our Palo Alto practice, we tailor the strength and timing of whitening based on your comfort and your dental history. If you want brighter teeth but you’re worried about sensitivity, an exam and a personalized plan can make whitening much easier.`,
        image: "/images/dr-wong-office-3.png",
        date: "December 3, 2025",
        slug: "teeth-whitening-sensitivity-what-helps",
        category: "Teeth Whitening",
        readTime: 7,
        relatedServices: ["zoom-whitening", "cosmetic-dentistry"],
      },
      {
        title: "In-Office vs. Take-Home Whitening: Which Is Better?",
        content: `If you’re comparing teeth whitening options, you’ll usually see two dentist‑supervised choices: in‑office whitening and custom take‑home trays. Both can work well, but they’re designed for different timelines and comfort needs.

In‑office whitening: best for speed

In‑office whitening is ideal when you want a noticeable change quickly. The appointment focuses on comfort and control—isolating the gums, selecting a shade goal, and using professional‑grade gel under supervision.

Custom take‑home trays: best for gradual change and touch‑ups

Take‑home trays are made from impressions or scans so they fit precisely. Whitening happens over a series of short sessions at home, which can be a great option if you want a slower change or you’re prone to sensitivity.

Quick comparison

- Timeline: in‑office is fast; trays are gradual
- Sensitivity: trays can be easier to adjust (shorter sessions, lower strength)
- Control: in‑office is fully supervised; trays give flexibility at home
- Maintenance: trays are excellent for periodic touch‑ups

Which option should you choose?

Many Palo Alto patients choose in‑office whitening when they have a deadline (events, photos) and use trays afterward to maintain results. If you’re very sensitive, starting with trays may feel more comfortable.

The best approach starts with an exam so we can confirm whitening is safe for your enamel and gums, and so we can plan around any crowns, veneers, or bonding that won’t change color.`,
        image: "/images/dr-wong-office-1.png",
        date: "December 5, 2025",
        slug: "in-office-whitening-vs-take-home-trays",
        category: "Teeth Whitening",
        readTime: 6,
        relatedServices: ["zoom-whitening", "cosmetic-dentistry"],
      }
    ];

    blogPostsList.forEach(post => {
      this.createBlogPost(post);
    });
  }

  private initializeTestimonials() {
    testimonialSeedData.forEach((seed, index) => {
      void this.createTestimonial(buildInsertTestimonial(seed, index));
    });
  }
}

export const storage = new MemStorage();
