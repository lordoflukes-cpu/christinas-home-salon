export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'booking' | 'services' | 'safety' | 'payment';
}

export const FAQS: FAQ[] = [
  // General
  {
    id: 'women-only',
    question: 'Why is this a women-only service?',
    answer: 'Christina\'s Care Services is designed to provide a comfortable, safe environment for women who prefer a female service provider. Many clients feel more at ease having another woman in their home, particularly for personal services like hairdressing or when building a companionship relationship. This boundary is fundamental to the service I offer.',
    category: 'general',
  },
  {
    id: 'who-is-christina',
    question: 'Who is Christina?',
    answer: 'I\'m Christina, a qualified hairdresser with over 15 years of experience, and I have a genuine passion for providing care and companionship to women in my community. I\'m fully insured, DBS checked, and trained in safeguarding. I started this business because I saw a need for combined services that treat clients as whole people, not just appointments.',
    category: 'general',
  },
  {
    id: 'service-area',
    question: 'What areas do you cover?',
    answer: 'I cover a 10-mile radius from [Your Town]. This includes [list of areas]. If you\'re unsure whether you\'re in my service area, use the postcode checker on the booking page or contact me directly. Travel fees apply based on distance.',
    category: 'general',
  },

  // Booking
  {
    id: 'how-to-book',
    question: 'How do I book an appointment?',
    answer: 'You can book online through my website using the booking form - it takes less than 30 seconds! Simply choose your service, select a date and time, and provide your details. I\'ll confirm your appointment within 24 hours. You can also call or text me directly if you prefer.',
    category: 'booking',
  },
  {
    id: 'cancellation',
    question: 'What is your cancellation policy?',
    answer: 'I understand plans change. Please give at least 24 hours notice for cancellations. Cancellations with less than 24 hours notice may incur a 50% charge. No-shows will be charged the full appointment fee. I\'ll always try to rearrange if possible.',
    category: 'booking',
  },
  {
    id: 'first-appointment',
    question: 'What happens at the first appointment?',
    answer: 'For first visits, I arrive a few minutes early to introduce myself and have a brief chat about what you\'re looking for. For hairdressing, we\'ll discuss your hair and desired style. For companion visits, we\'ll talk about your interests so I can tailor our time together. There\'s no pressure - it\'s all about making you feel comfortable.',
    category: 'booking',
  },

  // Services
  {
    id: 'what-included-companion',
    question: 'What\'s included in a companion visit?',
    answer: 'Companion visits include friendly conversation, tea and chat, playing games or doing puzzles, reading together, looking through photos, watching TV, or simply having someone there for company. I\'m flexible and happy to do whatever makes you feel comfortable and brightens your day.',
    category: 'services',
  },
  {
    id: 'what-not-included',
    question: 'What services do you NOT provide?',
    answer: 'I do not provide medical care, personal care (bathing, toileting, dressing), house cleaning, childcare, overnight stays, or heavy lifting. My services are companionship, errands, and hairdressing only. For medical or personal care needs, please contact your GP or local social services.',
    category: 'services',
  },
  {
    id: 'errands-shopping',
    question: 'How do errands work? Do I pay for shopping?',
    answer: 'Yes, any items purchased during errand services (groceries, prescriptions, etc.) are paid for separately by you. You can provide cash in advance, or I can pay and you reimburse me on delivery. My fee covers only my time, not the cost of goods.',
    category: 'services',
  },
  {
    id: 'hair-products',
    question: 'Do I need to have hair products at home?',
    answer: 'No, I bring all professional products and equipment with me - shampoo, conditioner, styling products, colour (if booked), and all tools. You just need access to running water, good lighting, and ideally a comfortable chair. I handle everything else!',
    category: 'services',
  },

  // Safety
  {
    id: 'dbs-insurance',
    question: 'Are you DBS checked and insured?',
    answer: 'Yes, absolutely. I hold an enhanced DBS certificate which is updated regularly, and I carry full public liability insurance for mobile hairdressing and companion services. I\'m also trained in safeguarding. Your safety and peace of mind are my priority.',
    category: 'safety',
  },
  {
    id: 'emergency',
    question: 'What if there\'s an emergency during a visit?',
    answer: 'If there\'s a medical emergency, I will call 999 immediately. I\'m first aid trained but I\'m not a medical professional. For any safeguarding concerns, I follow proper procedures and will contact relevant authorities if needed. Your safety always comes first.',
    category: 'safety',
  },
  {
    id: 'family-notification',
    question: 'Can you keep my family informed about visits?',
    answer: 'With your permission, I\'m happy to send a brief message to a family member after visits to let them know how you\'re doing. This is entirely optional and respects your privacy - I\'ll never share information without your explicit consent.',
    category: 'safety',
  },

  // Payment
  {
    id: 'payment-methods',
    question: 'How do I pay?',
    answer: 'I accept cash, bank transfer, and card payments. Payment is due at the end of each appointment. For regular packages, we can arrange monthly invoicing if preferred. I\'ll always provide a receipt.',
    category: 'payment',
  },
  {
    id: 'travel-fees',
    question: 'Are there travel fees?',
    answer: 'A small travel fee applies based on your distance from my base. Within 3 miles: no fee. 3-7 miles: £5. 7-10 miles: £8. These fees help cover fuel and travel time. The exact fee will be shown when you book and added to your total.',
    category: 'payment',
  },
  {
    id: 'minimum-booking',
    question: 'Is there a minimum booking?',
    answer: 'For companion and errand services, the minimum booking is 1 hour. There\'s no minimum for hairdressing services. For locations over 7 miles away, a 2-hour minimum may apply to make the journey worthwhile for both of us.',
    category: 'payment',
  },
];

// Get FAQs by category
export function getFAQsByCategory(category: FAQ['category']): FAQ[] {
  return FAQS.filter((faq) => faq.category === category);
}

// Get all FAQ categories
export function getFAQCategories(): FAQ['category'][] {
  return ['general', 'booking', 'services', 'safety', 'payment'];
}

// Category display names
export const FAQ_CATEGORY_NAMES: Record<FAQ['category'], string> = {
  general: 'General Questions',
  booking: 'Booking & Appointments',
  services: 'Services & What\'s Included',
  safety: 'Safety & Trust',
  payment: 'Payment & Fees',
};
