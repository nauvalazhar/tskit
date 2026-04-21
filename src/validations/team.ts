import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase alphanumeric with hyphens',
    ),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  logo: z.string().url().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(['owner', 'admin', 'member']),
});

export const removeMemberSchema = z.object({
  memberIdOrEmail: z.string().min(1),
});

export const revokeInvitationSchema = z.object({
  invitationId: z.string().min(1),
});

export const setActiveTeamSchema = z.object({
  organizationId: z.string().min(1),
});

export const deleteTeamSchema = z.object({
  organizationId: z.string().min(1),
});

// Shared types for components

export interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: string;
  organizationId: string;
  inviterId: string;
  createdAt: string;
}
