export interface Property {
  id: string;
  _id?: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  images: string[];
  sizeValue: number;
  sizeUnit: string;
  description: string;
  amenities: string[];
  landlord: {
    name: string;
    phone: string;
    avatar: string;
  };
  postedAt: string;
  isFeatured?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  property?: Property;
  listings?: Property[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "message" | "property" | "system";
  read: boolean;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "renter" | "landlord" | "admin";
  avatar?: string;
  contactNo?: string;
  favorites?: string[];
}

export interface Filter {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
}

export interface StylePreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
}
