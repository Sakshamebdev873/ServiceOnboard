import { prisma } from '../lib/prisma.js'; // Assuming your prisma client is here
export const createServiceCenter = async (data) => {
    return await prisma.serviceCenter.create({
        data: {
            ...data,
            country: data.country || 'India',
        },
    });
};
