import { officeInfo, holidayHours } from "@shared/officeInfo";
import { drWongImages } from "@/lib/imageUrls";

export { officeInfo, holidayHours };

export const doctorInfo = {
  name: "Dr. Christopher B. Wong",
  title: "DDS",
  alternateNames: [
    "Dr Christopher Wong",
    "Dr. Christopher Wong",
    "Christopher B. Wong, DDS",
    "Dr. Wong",
    "Wong dentist in Palo Alto",
    "Dr. Wong, DDS",
  ],
  profileUrl: "/about",
  image: drWongImages.drWongPortrait1,
  sameAs: ["https://linkedin.com/in/drchristopherwong"],
  credentials: [
    "University of the Pacific Arthur A. Dugoni School of Dentistry Graduate",
    "American Dental Association",
    "California Dental Association",
    "Santa Clara County Dental Society",
  ],
  experience: "Since 2018",
  specialties: [
    "Conservative Dentistry",
    "Invisalign®",
    "Implant Restoration",
    "Restorative Care",
  ],
  bio: "Dr. Christopher B. Wong was born and raised in Sacramento and earned his bachelor's degree in Biology from the University of California, Davis. He graduated from the prestigious University of the Pacific Arthur A. Dugoni School of Dentistry in San Francisco in 2018. Dr. Wong is passionate about delivering high-quality, conservative dentistry to help patients achieve healthy, functional, and brilliant smiles. He specializes in Invisalign®, implant restoration, and restorative care while practicing ethical and non-invasive dentistry. Dr. Wong stays current with the latest advancements in dentistry and is an active member of the American Dental Association (ADA), California Dental Association (CDA), and Santa Clara County Dental Society (SCCDS). Outside the office, he enjoys staying active through working out, running, hiking, golfing, and basketball. He also loves traveling, experiencing new cultures, cooking international cuisines, and is an avid car enthusiast.",
};

export const teamMembers = [
  {
    name: "Dr. Hamamoto",
    role: "Dentist",
    image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/6654ce1938d7ef27a6854612_Screenshot%202024-05-27%20at%2011.16.44%20AM-p-800.png", // External headshot image
    bio: "Dr. Kris Hamamoto, a UCSF School of Dentistry graduate, served in the U.S. Navy before establishing her practice. She is dedicated to continuing education and enjoys outdoor activities, including marathons."
  },
  {
    name: "Dr. Pearl Tran",
    role: "Periodontist",
    image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/6654ce3ca8d5b7e52b0ba9a2_Screenshot%202024-05-27%20at%2011.17.22%20AM-p-800.png", // Updated headshot image
    bio: "Dr. Tran, a DMD graduate, served in the Navy and specializes in periodontics and orofacial pain. She is a Diplomate of the American Board of Periodontology and loves re-establishing her practice in the Bay Area."
  },
  {
    name: "Kaye",
    role: "Registered Dental Hygienist",
    image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/6682f3e9ef1db58aafe7165c_palo%20alto%20dentist-p-800.jpeg", // Updated headshot image
    bio: "Kaye became part of our team in 2024 as a registered dental hygienist. She graduated with honors in Dental Hygiene from Carrington College in San Jose, California and is also a licensed Doctor of Dental Medicine in the Philippines."
  },
  {
    name: "Helen",
    role: "Registered Dental Hygienist",
    image: "/images/helen_headshot.png", // Updated headshot image
    bio: "Helen, a UCSD graduate, has over 15 years of experience in dental hygiene. She has practiced in Japan and San Diego and has three grown children."
  },
  {
    name: "Rachel",
    role: "Insurance Coordinator",
    image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/6682f353af25e00b2a11953d_chris%20wong%20dental%20practice%20team%20in%20palo%20alot-p-800.jpeg", // Updated headshot image
    bio: "After graduating from San Jose State University, Rachel Hamamoto started working at the office in 2019. She currently works as Dr. Wong's insurance coordinator and front desk. She likes to do arts and crafts, watch Asian dramas and spend time with family and friends."
  },
  {
    name: "Kelty",
    role: "Scheduling Coordinator",
    image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/6688562093f736a3acf5cc97_2DF3B8DB-4D59-40C2-A5CD-12511AC46FD5-p-800.jpeg", // Updated headshot image
    bio: "Kelty is a native San Franciscan who graduated from Loyola Marymount University with a bachelor's degree in health and human sciences and a minor in psychology. She was first introduced into the dental field by her mother, a retired dentist and dental professor at the University of the Pacific."
  },
  {
    name: "Angelisa",
    role: "Registered Dental Hygienist",
    image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/67193243ca1a4de1d9de30fc_Facetune_18-10-2024-15-56-06-p-800.png", // Updated headshot image
    bio: "Angelisa has been a dedicated dental hygienist in our office since 2008. A proud mother of three boys, aged 21, 16, and 7, she loves spending quality time with her family and is committed to helping patients feel at ease while providing exceptional care."
  },
  {
    name: "Jamal",
    role: "Registered Dental Assistant",
    image: "https://cdn.prod.website-files.com/6647633c9b317c62a46de335/675657f005f625f86a662b85_image2-p-800.jpeg", // Updated headshot image
    bio: "Jamal is our skilled Registered Dental Assistant who provides excellent chairside support to our dentists and ensures patients are comfortable during procedures."
  }
];

export const insuranceProviders = [
  "Delta Dental",
  "Cigna",
  "Aetna",
  "MetLife",
  "Guardian",
  "United Healthcare",
  "Blue Cross Blue Shield",
  "Humana",
  "Principal",
  "Lincoln Financial"
];

export const faqItems = [
  {
    question: "What should I expect during my first visit?",
    answer: "During your first visit, Dr. Wong will perform a comprehensive examination including digital X-rays, oral cancer screening, and gum disease evaluation. You'll discuss your dental history, concerns, and goals. We'll create a personalized treatment plan and schedule any necessary follow-up appointments."
  },
  {
    question: "How often should I have a dental checkup?",
    answer: "Most patients benefit from professional cleanings and checkups every six months. However, Dr. Wong may recommend more frequent visits if you have specific oral health concerns like gum disease, a history of cavities, or certain medical conditions."
  },
  {
    question: "What payment options do you offer?",
    answer: "We accept most major PPO insurance plans and offer various payment options including Visa, MasterCard, flexible spending accounts, and an in-office dental plan. Our team will help you understand your coverage and maximize your benefits. Please contact our office for specific details about your insurance plan."
  },
  {
    question: "Do you offer emergency dental services?",
    answer: "Yes, we provide emergency dental care. If you're experiencing severe pain, swelling, bleeding, or have a knocked-out tooth, please call our office immediately. We reserve time in our schedule for emergency appointments and will do our best to see you the same day."
  },
  {
    question: "What COVID-19 safety measures are in place?",
    answer: "We follow all CDC, ADA, and local health department guidelines to ensure your safety. Our measures include enhanced sterilization procedures, personal protective equipment for staff, pre-screening questions, temperature checks, and social distancing in waiting areas. We've also installed medical-grade air purifiers throughout the office."
  },
  {
    question: "Do you offer virtual consultations?",
    answer: "Yes, we offer virtual consultations for certain types of appointments. This service allows you to discuss your concerns with Dr. Wong from the comfort of your home before coming into the office for treatment."
  }
];

export const patientResources = {
  forms: [
    {
      name: "New Patient Registration",
      type: "PDF",
      url: "https://drive.google.com/file/d/13T6fZKNgGt9xbs3yD22I07r4frlUBy6j/view",
    }
  ],
  prepareForVisit: [
    "Complete your forms before your appointment",
    "Bring your dental insurance card and ID",
    "Arrive 15 minutes before your scheduled time",
    "Bring a list of current medications",
    "Be prepared to discuss your medical history"
  ]
};
