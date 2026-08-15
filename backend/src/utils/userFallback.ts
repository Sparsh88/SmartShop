import * as bcrypt from 'bcryptjs';

export interface FallbackUser {
  id: string;
  name: string;
  email: string;
  password: string; // bcrypt hash
  role: 'CUSTOMER' | 'ADMIN';
  isVerified: boolean;
  avatar?: string | null;
  createdAt: Date;
}

// In-memory fallback user store with exclusive administrator
const adminPasswordHash = bcrypt.hashSync('Sp@080806', 10);

export const fallbackUsers: FallbackUser[] = [
  {
    id: 'usr-admin-sparsh',
    name: 'Sparsh Chauhan',
    email: 'sparshchauhan050@gmail.com',
    password: adminPasswordHash,
    role: 'ADMIN',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-01'),
  },
];

export const findFallbackUserByEmail = (email: string): FallbackUser | undefined => {
  const normalized = email.trim().toLowerCase();
  return fallbackUsers.find((u) => u.email.toLowerCase() === normalized);
};

export const findFallbackUserById = (id: string): FallbackUser | undefined => {
  return fallbackUsers.find((u) => u.id === id);
};

export const createFallbackUser = (user: Omit<FallbackUser, 'id' | 'createdAt'>): FallbackUser => {
  const newUser: FallbackUser = {
    ...user,
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date(),
  };
  fallbackUsers.push(newUser);
  return newUser;
};

export const updateFallbackUser = (id: string, updates: Partial<FallbackUser>): FallbackUser | undefined => {
  const user = findFallbackUserById(id);
  if (user) {
    Object.assign(user, updates);
  }
  return user;
};
