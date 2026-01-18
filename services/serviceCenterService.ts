import { prisma } from '../lib/prisma.js'; // Assuming your prisma client is here

interface CreateServiceCenterData {
  centerName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: string;
  longitude: string;
  categories: string[];
  imagePaths: string[];
}

export const createServiceCenter = async (data: CreateServiceCenterData) => {
  return await prisma.serviceCenter.create({
    data: {
      ...data,
      country: data.country || 'India',
    },
  });
};