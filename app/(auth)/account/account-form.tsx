'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfile } from './actions';
import { toast } from '@/components/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import type { User } from 'next-auth';
import { accountFormSchema, type AccountFormValues } from './schema';

export function AccountForm({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    },
  });

  async function onSubmit(data: AccountFormValues) {
    if (!data.firstName && !data.lastName) {
      toast({
        type: 'error',
        description: 'At least one name field must be filled.',
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateProfile(data);
      
      if (result.success) {
        // Update the form with the returned data
        form.reset({
          ...data,
          firstName: result.data.firstName || '',
          lastName: result.data.lastName || '',
        });          toast({
            type: 'success',
            description: 'Profile updated successfully.',
          });
      } else {          toast({
            type: 'error',
            description: result.error || 'Failed to update profile. Please try again.',
          });
      }
    } catch (error) {
      console.error('Form submission error:', error);        toast({
          type: 'error',
          description: 'An unexpected error occurred. Please try again.',
        });
    } finally {
      setIsLoading(false);
    }
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={user.email ? `https://avatar.vercel.sh/${user.email}` : undefined}
              alt={displayName || 'User'} 
            />
            <AvatarFallback className="text-lg">
              {displayName?.slice(0, 2)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...form.register('firstName')}
              disabled={isLoading}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...form.register('lastName')}
              disabled={isLoading}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                disabled={true}
              />
              {!user.email?.includes('guest-') && (
                <BadgeCheck className="h-5 w-5 text-primary" />
              )}
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
