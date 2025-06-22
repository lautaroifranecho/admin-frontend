import { z } from "zod";

export const insertAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userSchema = z.object({
  id: z.number(),
  client_number: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string(),
  alt_number: z.string().nullable(),
  address: z.string(),
  email: z.string().email(),
  status: z.enum(['pending', 'confirmed', 'updated']),
  verification_token: z.string(),
  token_expiry: z.string(),
  last_updated: z.string(),
  created_at: z.string(),
  has_changes: z.boolean(),
  group_template: z.string().nullable().optional(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  status: true,
  last_updated: true,
  created_at: true,
  has_changes: true,
});

export const updateUserSchema = z.object({
  client_number: z.string().min(1, "Client number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  alt_number: z.string().optional(),
  email: z.string().email("Invalid email address"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type Admin = {
  id: number;
  email: string;
  password: string;
  created_at: string;
};

export type User = {
  id: number;
  client_number: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  alt_number: string | null;
  address: string;
  email: string;
  status: 'pending' | 'confirmed' | 'updated';
  verification_token: string;
  token_expiry: string;
  last_updated: string;
  created_at: string;
  has_changes: boolean;
  group_template?: string | null;
};

export type AuditLog = {
  id: number;
  user_id: number;
  action: 'created' | 'confirmed' | 'updated';
  old_data: string | null;
  new_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
};

export type UserSecurity = {
  id: number;
  user_id: string;
  two_factor_secret: string | null;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type InsertUser = Omit<User, 'id' | 'status' | 'last_updated' | 'created_at' | 'has_changes'>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
