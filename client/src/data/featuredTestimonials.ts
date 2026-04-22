import type { InsertTestimonial } from "@shared/schema";

// Lightweight testimonial subset for service/location pages.
// Full published 5-star review dataset is served through /api/testimonials.
const GOOGLE_REVIEW_LOCATION = "Google Review";
const FIVE_STAR_RATING = 5;
const EMPTY_IMAGE = "";

const testimonialEntries = [
  ["Abdel Fahmy", "Wonderful doctor and staff!"],
  ["Alan Truscott", "Great Dentist, and a great staff. We found Kris on Yelp, and she is perfect for our family. Everyone is easy to work with and the hygienists are awesome. Highly recommend Kris Hamamoto and her Team."],
  ["ally dino", "I get my teeth cleaned by Helen, she is the best! Super friendly and does a great job. They fill any minor cavities day-off, no need to schedule another appointment. Great deals with electric toothbrush sets too!"],
  ["Amy Hamachi", "Dr. Wong was very pleasant and seemed willing to listen to any questions that I had. He was easy to talk to and had a reasonable plan of care of my teeth. I would recommend him."],
  ["Anat Sipres", "I can't say enough good things about Dr. Wong's and the entire team. From the warm welcome at the front desk to the thorough care provided by the hygienist, every visit is a pleasure. Highly recommended!"],
  ["Andrew", "My overall experience here was excellent, they managed to remove three years worth of tea stain from my teeth in about an hour. Both Dr. Hamamoto, and her assistant were gentle yet thorough."],
  ["Anne Starr", "Dr. Hamamoto did great passing her practice to Dr. Wong! He is great! Helen and Angelisa are the best dental hygienists!"],
  ["Arne Mandell", "I trust Dr. Hamamoto and her staff to make careful and considered care recommendations based on the highest-interest in my dental health. Would recommend."],
  ["Ashley Chung", "Been going here for 10+ years since I was a kid. Great establishment and excellent teeth cleaning & guidance!"],
  ["Avinash Shetty", "I have been going to Dr Hamamoto for years. I highly recommend going here The staff is friendly. The advice is great and they do a great job with cleaning and filling which is all I've had done here."],
  ["Barbara Cruz", "Dr. Hamamoto was very thorough for my first visit. Was surprised that she did the cleaning. The staff was welcoming. We agreed to get the dental plan pre-approved by my insurance and then schedule appointments."],
  ["Benjamin Wendorf", "With a lot of family pressure, I was convinced to try out this dentistry. I am go glad I did. Never felt like I am..."],
  ["Bill Quarre", "Kris is the best! I had to have a last minute root canal. She referred me to a awesome endodontist, then she put on a..."],
  ["Briana Rico", "Alex Yen provides exceptional service. The first time I've ever left a dentist feeling confident about my oral health. I absolutely recommend."],
  ["Bruce N", "Dr. Hamamoto is great. I had a loose filling and she was quick to take care of it. She's caring and very nice. Her quality of work is great. I highly recommend her."],
  ["Gordon Hamachi", "Although Dr. Wong has been my dentist for a while, he has yet to perform any involved procedures for me. I take this as..."],
  ["John David Molitoris", "Highly recommended! Dr. Kris and staff are the very best! Great dental work for the whole family. These people really care about you. Been coming these since 1982!"],
  ["Josh Grinberg", "Had a great routine cleaning experience! They were super thorough and answered all my questions."],
  ["Kat Vasilakos", "Best dental in the area! I've been a patient for decades and wouldn't go anywhere else!..."],
  ["Kevin Zhang", "Dr Wong is very with the times, down to earth, and gives practical, but conservative advice and good work on your teeth..."],
  ["Kristi Luchini", "I've been coming here for 30years, best dentist ever"],
  ["Laurie Sefton", "I recently had a tooth break. I was able to quickly get an appointment, a quick diagnosis as to what could be done, have a temporary crown, followed by a permanent crown. Dr Hamamoto is an excellent Dentist!"],
  ["Loretta Guarino Reid", "I have been a satisfied patient at this practice for many decades. I want to make a special call out to Helen, who has taught me how to take better care of my teeth."],
  ["Madison Ho", "Dr. Wong is such a kind and wonderful doctor. I had a dental emergency on a Friday evening, and he graciously took the..."],
  ["Martha Debs", "Outstanding in every way. Dr. Hamamoto and her team are wonderful -- highly skilled, well organized, and truly caring. They make dentist appointments an actual pleasure!"],
  ["Marypat Power", "Dr Kris and Dr Wong are both so personable, professional, and gentle. I highly recommend them!"],
  ["Michael Austin", "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me. Kind and caring, gentle and good, and reasonably priced!"],
  ["mj", "Kris is a great dentist. And Dani is the best at cleaning teeth. She has taken years of stains off my teeth, and whitened them up considerably."],
  ["Paul McBurney", "Dr Hamamoto is a wonderful Dentist. She is a crafts-person: skill-full and artistic. She is making me a new crown and is taking the time to make it correctly. Thanks Dr Kris!"],
  ["Paul Pedersen", "Best dentist in town (Palo Alto). Quick, efficient, accurate, helpful, accommodating. Made time for me twice - both minor emergencies, and once on the 4th of July weekend! Outstanding service."],
  ["Rana Naqvi", "Fantastic staff. Each visit is providing me a great experience. Caring and honest in their profession."],
  ["Sandra Bell", "Excellent dentist and very professional staff. Best dentist, best staff. What more does one need?"],
  ["Sandi Spires", "Just had my 3rd crown installed. Dr. Kris takes great care to make the fit & bite perfect."],
  ["Sarah Chase", "Excellent care, I never worry about if I'm getting the best care or suggestions. I am always confident that the right amount of solutions are recommended. All the newest proven tech and services."],
  ["Steve Collins", "High skill level, modern tools, helpful guidance and a friendly demeanor. An excellent experience for cleanings and fillings. Strong recommend."],
] as const;

export const featuredTestimonials: readonly InsertTestimonial[] =
  testimonialEntries.map(([name, text]) => ({
    name,
    location: GOOGLE_REVIEW_LOCATION,
    rating: FIVE_STAR_RATING,
    text,
    image: EMPTY_IMAGE,
  }));
