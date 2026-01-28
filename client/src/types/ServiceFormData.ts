export interface ServiceCenter {
  id: number;
  centerName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: string; // Stored as string in Prisma
  longitude: string; // Stored as string in Prisma
  categories: string[];
  imagePaths: string[];
  createdAt: string; // JSON dates come back as strings
}
export interface FormErrors {
  centerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location?: string;
  categories?: string;
  images?: string;
}
export const CATEGORY_OPTIONS = ["Mechanic", "AC", "Electrician"];