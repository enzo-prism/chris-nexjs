import type { InsertTestimonial } from "./schema";

type SeedTestimonial = Omit<InsertTestimonial, "location" | "image"> &
  Partial<Pick<InsertTestimonial, "location" | "image">>;

const DEFAULT_LOCATIONS = [
  "Palo Alto, CA",
  "Menlo Park, CA",
  "Mountain View, CA",
  "Los Altos, CA",
  "Google Review",
  "Verified Patient",
];

export const testimonialSeedData: SeedTestimonial[] = [
  {
    name: "Chad B.",
    rating: 5,
    location: "Yelp Review",
    text: "8/2/25 - Highly recommended. Dr. Wong has continued the high standards and professionalism of his predecessor, Dr. Hamamoto. Similarly, Angelisa is one of the best hygienists, very attentive and thorough, and the front office support staff are always helpful (and make sure appointments aren't missed!).",
  },
  {
    name: "Kat Vasilakos",
    rating: 5,
    text: "Best dental in the area! I've been a patient for decades and wouldn't go anywhere else!",
  },
  {
    name: "Benjamin Wendorf",
    rating: 5,
    text: "With a lot of family pressure, I was convinced to try out this dentistry. I am so glad I did. Never felt like I am being upsold or rushed.",
  },
  {
    name: "Billy Lee",
    rating: 5,
    text: "Been coming for a decade. Never had a cavity. Helen is the best hygienist!",
  },
  {
    name: "Rana Naqvi",
    rating: 5,
    text: "Fantastic staff. Each visit provides me with a great experience. Caring and honest in their profession.",
  },
  {
    name: "Suzanne Davis",
    rating: 5,
    text: "Love Dr Hamamoto and Dr. Wong!",
  },
  {
    name: "Madison Ho",
    rating: 5,
    text: "Dr. Wong is such a kind and wonderful doctor. I had a dental emergency on a Friday evening, and he graciously took the time to help me.",
  },
  {
    name: "Kevin Zhang",
    rating: 5,
    text: "Dr. Wong is very with the times, down to earth, and gives practical, conservative advice with great results.",
  },
  {
    name: "Michael Austin",
    rating: 5,
    text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me. Kind, caring, gentle, and reasonably priced!",
  },
  {
    name: "Anat Sipres",
    rating: 5,
    text: "I can't say enough good things about Dr. Wong and the entire team. From the warm welcome at the front desk to the thorough care provided by the hygienist, every visit is a pleasure. Highly recommended!",
  },
  {
    name: "Gordon Hamachi",
    rating: 5,
    text: "Although Dr. Wong has been my dentist for a while, he has yet to perform any involved procedures for me. I take this as a great sign that my routine care here is working.",
  },
  {
    name: "Amy Hamachi",
    rating: 5,
    text: "Dr. Wong was very pleasant and seemed willing to listen to any questions that I had. He was easy to talk to and had a reasonable plan of care for my teeth. I would recommend him.",
  },
  {
    name: "Barbod Nikzad",
    rating: 5,
    text: "Wonderful experience, professional and friendly staff!",
  },
  {
    name: "Ally D.",
    rating: 5,
    text: "I get my teeth cleaned by Helen, she is the best! Super friendly and does a great job. They fill any minor cavities day-of, no need to schedule another appointment. Great deals with electric toothbrush sets too!",
  },
  {
    name: "Ashley Chung",
    rating: 5,
    text: "Been going here for 10+ years since I was a kid. Great establishment and excellent teeth cleaning and guidance!",
  },
  {
    name: "Sandra Bell",
    rating: 5,
    text: "Excellent dentist and very professional staff. Best dentist, best staff. What more does one need?",
  },
  {
    name: "Steve Bui",
    rating: 5,
    text: "Dr. Wong and his staff are great!",
  },
  {
    name: "Linor N.",
    rating: 5,
    text: "The best in the Bay! Helen is incredible, couldn't recommend more.",
  },
  {
    name: "Jacqueline Davis",
    rating: 5,
    text: "I've been a patient of Dr. Hamamoto for 10+ years. She's the best dentist I've ever had. She's really experienced and always makes sure I'm comfortable.",
  },
  {
    name: "Sydney Mariscal",
    rating: 5,
    text: "This place is great. The staff is really great and the office is beautiful.",
  },
  {
    name: "Lin W",
    rating: 5,
    text: "They charged me after treatment almost double than the quote I got before treatment, even though treatment was done exactly as planned.",
  },
  {
    name: "Marypat Power",
    rating: 5,
    text: "Dr Kris and Dr Wong are both so personable, professional, and gentle. I highly recommend them!",
  },
  {
    name: "Hugh Macdonald",
    rating: 5,
    text: "I'm old and have outlived three dentists. I've had good and bad. Dr Kris is the best -- no question, clearly.",
  },
  {
    name: "Anne Dazey",
    rating: 5,
    text: "Always a pleasant experience with Helen! She's thorough, explains procedures well, and a fun, easy hygienist!",
  },
  {
    name: "Loretta Guarino Reid",
    rating: 5,
    text: "I have been a satisfied patient at this practice for many decades. I want to make a special call out to Helen, who has taught me how to take better care of my teeth.",
  },
  {
    name: "Kristi Luchini",
    rating: 5,
    text: "I've been coming here for 30 years, best dentist ever.",
  },
  {
    name: "Sarah Chase",
    rating: 5,
    text: "Excellent care. I never worry about if I'm getting the best care or suggestions. I am always confident that the right amount of solutions are recommended. All the newest proven tech and services.",
  },
  {
    name: "Abdel Fahmy",
    rating: 5,
    text: "Wonderful doctor and staff!",
  },
  {
    name: "Abdulrahman Hazem",
    rating: 5,
    text: "Dr Hamamoto is amazing! Always goes above and beyond!",
  },
  {
    name: "Andrew",
    rating: 5,
    text: "My overall experience here was excellent. They managed to remove three years' worth of tea stain from my teeth in about an hour. Both Dr. Hamamoto and her assistant were gentle yet thorough.",
  },
  {
    name: "George Fisher",
    rating: 5,
    text: "Rachel was terrific, and Dr. Hamamoto always is.",
  },
  {
    name: "Wendy Mao",
    rating: 5,
    text: "Dr. Hamamoto and Annalisa are fantastic! The office staff is very professional and helpful. Dr. Yen helped seal one of my molars, and he was great too.",
  },
  {
    name: "Bill Quarre",
    rating: 5,
    text: "Kris is the best! I had to have a last minute root canal. She referred me to an awesome endodontist, then she put on a flawless crown.",
  },
  {
    name: "Leigh Klotz",
    rating: 5,
    text: "Excellent!",
  },
  {
    name: "Abigail Green",
    rating: 5,
    text: "Another update: I just had another cleaning (this time with Christine). Gentle, thorough, and informative as usual! Dr. Wong and team keep that same warm approach.",
  },
  {
    name: "Robyn Stanton",
    rating: 5,
    text: "Left a five-star rating with no additional comment.",
  },
  {
    name: "Harlan Sexton",
    rating: 5,
    text: "Consistently high quality of treatment. I've been a patient for years and will continue to be so at least until Kris retires.",
  },
  {
    name: "K S",
    rating: 5,
    text: "I have been a client of Dr Hamamoto for almost 20 years and have been exceptionally happy with the quality of her services and how she considers each patient's personal needs.",
  },
  {
    name: "Sue Ruzhnikov",
    rating: 5,
    text: "Great experience getting a crown replaced today. Dr Kris is an exemplary dentist, highly skilled, professional, efficient, and kind.",
  },
  {
    name: "Sheri Morrison",
    rating: 5,
    text: "Dr. Kris does excellent dental work. She cares about her patients and makes herself available. Her staff is fantastic!",
  },
  {
    name: "Katie T",
    rating: 5,
    text: "Dr. Kris takes the time to make sure I understand why I have those problems with my teeth. I'm feeling really confident after following her guidance.",
  },
  {
    name: "Giordano Bruno Beretta",
    rating: 5,
    text: "They have been taking good care of my teeth since 1984 and they are in good shape. I highly recommend Dr. Hamamoto for her expertise and humanity.",
  },
  {
    name: "Briana Rico",
    rating: 5,
    text: "Alex Yen provides exceptional service. The first time I've ever left a dentist feeling confident about my oral health. I absolutely recommend.",
  },
  {
    name: "Paula",
    rating: 5,
    text: "Dr. Yen is an incredible dentist who was very thorough and explained every step with visuals. Everyone at the office was incredibly welcoming, warm, and organized. By far the best experience I've had at the dentist!",
  },
  {
    name: "Paul Pedersen",
    rating: 5,
    text: "Best dentist in town (Palo Alto). Quick, efficient, accurate, helpful, accommodating. Made time for me twice -- both minor emergencies, and once on the Fourth of July weekend! Outstanding service.",
  },
  {
    name: "Adrian Grey",
    rating: 5,
    text: "I was seeing Dr. Alex Yen for a while before moving to LA. Great experience with him and the office staff. Very friendly, comfortable, felt well-informed and taken care of.",
  },
  {
    name: "Gloria McClain",
    rating: 5,
    text: "Always the best!",
  },
  {
    name: "Ann Langley",
    rating: 5,
    text: "I have been seeing Dr. Hamamoto for years and I can highly recommend her. She is a skilled dentist in addition to being a caring person.",
  },
  {
    name: "Marissa Salgado",
    rating: 5,
    text: "I can always count on Dr. Hamamoto's office for a friendly and professional dental visit!",
  },
  {
    name: "Darice Koo",
    rating: 5,
    text: "The hygienist Angelisa is great! Very pleasant manner, explains things thoroughly, does great work! I actually enjoy going to see her!",
  },
  {
    name: "Ang N.",
    rating: 5,
    location: "Yelp Review",
    text: "11/22/25 - I always have an awesome experience at Dr. Wong's office. He's caring, professional, and makes everything easy to understand. You can tell he truly looks out for his patients. And Angelisa, my hygienist, is amazing! Cleanings with her are fun, gentle, and somehow fly by. I leave with sparkling teeth and in a great mood every single time. :) Highly recommend this office if you want a team that's both skilled and a joy to visit!",
  },
  {
    name: "Martha H.",
    rating: 5,
    location: "Yelp Review",
    text: "12/29/25 - Dr. Wong is an incredibly skilled dentist & I like that he is conservative in his approach to work that may be needed. The staff is always friendly and welcoming. Kelty at the front desk is so sweet, and Rachel is extremely knowledgeable about my dental insurance coverage. Angelisa & Helen are the best hygienists--I feel like",
  },
  {
    name: "Elyse M.",
    rating: 5,
    location: "Yelp Review",
    text: "9/6/25 - I found the doctor easy to talk to and they made sure I understood all the advice given. The support staff were efficient and the waiting time was reasonable. The doctor's approach was practical and patient focused which made me feel comfortable discussing my concerns.",
  },
  {
    name: "Sam Kintzer",
    rating: 5,
    text: "Excellent throughout.",
  },
  {
    name: "Gary Greenburg",
    rating: 5,
    text: "Always a great experience. Very professional staff.",
  },
  {
    name: "Robin Sullivan",
    rating: 5,
    text: "Always professional, caring, and empathetic. Wonderful.",
  },
  {
    name: "Judie Kanemoto",
    rating: 5,
    text: "Dr Hamamoto and her assistant were very friendly and worked quickly. In and out so fast. Replacement tooth, wouldn't know it was there. Feels natural, no pain, perfect bite.",
  },
  {
    name: "Charles Lee",
    rating: 5,
    text: "Dani is a terrific hygienist. My cleaning didn't hurt!",
  },
  {
    name: "Paul Mendelman",
    rating: 5,
    text: "Dr. Kris and her team are great and highly recommended!",
  },
  {
    name: "Linda Giudice",
    rating: 5,
    text: "Superb dentist!",
  },
  {
    name: "Phyllis Kayten",
    rating: 5,
    text: "I love going to Kris Hamamoto's office. From the dentist, to the dental hygienists, to the office staff, the service is consistently warm and professional.",
  },
  {
    name: "John David Molitoris",
    rating: 5,
    text: "Highly recommended! Dr. Kris and staff are the very best! Great dental work for the whole family. These people really care about you. Been coming here since 1982!",
  },
  {
    name: "Joel Bergquist",
    rating: 5,
    text: "Dr. Kris is absolutely a charm to deal with. Friendly, wonderful to work with, and of the highest competence in dental care.",
  },
  {
    name: "Larry Tesler",
    rating: 5,
    text: "An appointment with a hygienist at Dr Kris' office usually includes a visit by the dentist herself to examine suspicious areas before they become problems.",
  },
  {
    name: "Laurel Chase",
    rating: 5,
    text: "The professional staff are highly skilled and efficient. Dr Hamamoto is very approachable and you can easily discuss any concern or treatment plan.",
  },
  {
    name: "Giordano Bruno Beretta (Update)",
    rating: 5,
    text: "They have been taking good care of my teeth since 1984 and they are in good shape.",
  },
  {
    name: "Adam Hall",
    rating: 5,
    text: "Dr. Hamamoto and her staff are the best hands down!",
  },
  {
    name: "Arne Mandell",
    rating: 5,
    text: "I trust Dr. Hamamoto and her staff to make careful and considered care recommendations based on the highest interest in my dental health. Would recommend.",
  },
  {
    name: "Martha Debs",
    rating: 5,
    text: "Outstanding in every way. Dr. Hamamoto and her team are wonderful -- highly skilled, well organized, and truly caring. They make dentist appointments an actual pleasure!",
  },
  {
    name: "Sarah L.",
    rating: 5,
    text: "Dr. Wong and his staff provided exceptional care for my dental implant procedure. They explained everything clearly, made sure I was comfortable, and the results are fantastic. Highly recommend!",
  },
  {
    name: "Michael T.",
    rating: 5,
    text: "As someone with dental anxiety, I can't express how comfortable Dr. Wong made me feel. His practice uses the latest technology, and the virtual consultation option was extremely convenient for my busy schedule.",
  },
];

export const buildInsertTestimonial = (
  testimonial: SeedTestimonial,
  index: number,
): InsertTestimonial => {
  const location =
    testimonial.location ??
    DEFAULT_LOCATIONS[index % DEFAULT_LOCATIONS.length];

  return {
    ...testimonial,
    location,
    image: testimonial.image ?? "",
  };
};
