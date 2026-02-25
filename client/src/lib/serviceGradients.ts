// Subtle and minimalistic gradient designs for each service card
export const serviceGradients = {
  "Preventive Dentistry": "bg-gradient-to-br from-blue-50 to-sky-100",
  "Cosmetic Dentistry": "bg-gradient-to-br from-slate-50 to-blue-100",
  "Restorative Dentistry": "bg-gradient-to-br from-blue-50 to-blue-100",
  "Pediatric Dentistry": "bg-gradient-to-br from-sky-50 to-blue-100",
  "Orthodontics": "bg-gradient-to-br from-blue-50 to-slate-100",
  "Invisalign Clear Aligners": "bg-gradient-to-br from-sky-50 to-blue-100",
  "Emergency Dental Care": "bg-gradient-to-br from-blue-50 to-slate-100",
  "Dental Implants": "bg-gradient-to-br from-slate-50 to-blue-100",
  "Teeth Whitening": "bg-gradient-to-br from-blue-50 to-sky-100",
  "Root Canal Therapy": "bg-gradient-to-br from-blue-50 to-slate-100"
};

// Fallback gradient for any service not in the map
export const defaultGradient = "bg-gradient-to-br from-blue-50 to-sky-100";

// Get gradient class for a service
export const getServiceGradient = (serviceTitle: string): string => {
  return serviceGradients[serviceTitle as keyof typeof serviceGradients] || defaultGradient;
};
