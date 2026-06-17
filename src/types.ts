export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Venue {
  id: number; // Support standard numbers or strings
  name: string;
  price: number;
  size: '5-aside' | '7-aside' | '11-aside';
  location: string;
  nextSlot: string;
  image: string;
  rating: number;
  reviewsCount: number;
  reviewsList?: Review[];
  amenities?: string[];
  contactPhone?: string;
  description?: string;
}

export interface Booking {
  id: string;
  venueId: number;
  venueName: string;
  venueLocation: string;
  venueSize: string;
  venueImage: string;
  date: string;
  slot: string;
  playerName: string;
  playerPhone: string;
  extras: {
    bibs: boolean;
    ballHire: boolean;
    referee: boolean;
  };
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
}

export interface MatchPost {
  id: string;
  title: string;
  venueName: string;
  venueLocation: string;
  date: string;
  timeSlot: string;
  creatorName: string;
  creatorPhone: string;
  spotsNeeded: number;
  spotsFilled: number;
  playersList: string[]; // Names of players who joined
}

export interface SearchFilters {
  searchTerm: string;
  location: string;
  size: string;
  maxPrice: number;
  minRating: number;
}
