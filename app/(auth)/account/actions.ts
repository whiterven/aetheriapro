'use server';

import { auth } from '../auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { accountFormSchema } from './schema';
import { revalidatePath } from 'next/cache';

export type UpdateProfileResult = {
  success: true;
  data: {
    firstName: string | null;
    lastName: string | null;
  };
} | {
  success: false;
  error: string;
};

export async function updateProfile(
  formData: unknown
): Promise<UpdateProfileResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { 
        success: false, 
        error: 'You must be signed in to update your profile' 
      };
    }

    const validatedFields = accountFormSchema.parse(formData);

    // First verify the user exists and get current data
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!existingUser) {
      return { 
        success: false, 
        error: 'User not found' 
      };
    }

    // Update the user profile
    const [updatedUser] = await db
      .update(user)
      .set({
        firstName: validatedFields.firstName || null,
        lastName: validatedFields.lastName || null,
      })
      .where(eq(user.id, session.user.id))
      .returning({
        firstName: user.firstName,
        lastName: user.lastName,
      });

    if (!updatedUser) {
      return {
        success: false,
        error: 'Failed to update profile',
      };
    }

    revalidatePath('/account');
    
    return { 
      success: true, 
      data: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      }
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile'
    };
  }
}
