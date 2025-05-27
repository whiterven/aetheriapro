'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, MessageSquare, Star, DollarSign, History, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { UserType } from '@/app/(auth)/auth';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const [dailyMessagesUsed, setDailyMessagesUsed] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsageData() {
      if (session?.user?.id) {
        try {
          // Fetch message count for the last 24 hours
          const dailyRes = await fetch(`/api/stats/messages?userId=${session.user.id}&hours=24`);
          const dailyData = await dailyRes.json();
          setDailyMessagesUsed(dailyData.count);

          // Fetch total stats
          const statsRes = await fetch(`/api/stats/user?userId=${session.user.id}`);
          const statsData = await statsRes.json();
          setTotalMessages(statsData.totalMessages);
        } catch (error) {
          console.error('Error fetching usage data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchUsageData();
  }, [session?.user?.id]);

  // Redirect unauthenticated users (or handle loading state appropriately)
  if (status === 'loading' || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>; // Or a loading spinner component
  }

  if (!session) {
    redirect('/login'); // Redirect to login if not authenticated
    return null; // Should not reach here due to redirect
  }

  // Compute daily message limit based on user type
  const userPlanType = (session?.user?.type || 'regular') as UserType;
  const dailyMessageLimit = entitlementsByUserType[userPlanType].maxMessagesPerDay;

  // Mock billing data (in a real app, this would come from your billing system)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  const plans = [
    {
      name: 'Free Plan (Regular)',
      type: 'regular',
      price: '$0/month',
      features: [
        { text: `${entitlementsByUserType.regular.maxMessagesPerDay} messages/day`, icon: 'MessageSquare' },
        { text: 'Basic AI models access', icon: 'Star' },
        { text: 'Basic features', icon: 'CheckCircle' },
      ],
    },
    {
      name: 'Pro Plan',
      type: 'pro',
      price: '$20/month',
      features: [
        { text: `${entitlementsByUserType.pro.maxMessagesPerDay} messages/day`, icon: 'MessageSquare' },
        { text: 'Priority support', icon: 'Star' },
        { text: 'All AI models access', icon: 'Star' },
        { text: 'Larger file uploads', icon: 'CheckCircle' },
        { text: 'Usage analytics', icon: 'BarChart2' },
      ],
    },
    {
      name: 'Expert Plan',
      type: 'expert',
      price: '$50/month',
      features: [
        { text: `${entitlementsByUserType.expert.maxMessagesPerDay} messages/day`, icon: 'MessageSquare' },
        { text: 'Highest Priority support', icon: 'Star' },
        { text: 'Early access to new models', icon: 'Star' },
        { text: 'Unlimited file uploads', icon: 'CheckCircle' },
        { text: 'Advanced analytics', icon: 'BarChart2' },
      ],
    },
  ];

  // Function to render icon based on name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare size={16} className="text-muted-foreground"/>;
      case 'Star': return <Star size={16} className="text-muted-foreground"/>;
      case 'CheckCircle': return <CheckCircle size={16} className="text-green-500"/>; 
      case 'DollarSign': return <DollarSign size={16} className="text-muted-foreground"/>;
      case 'History': return <History size={16} className="text-muted-foreground"/>;
      case 'BarChart2': return <BarChart2 size={16} className="text-muted-foreground"/>;
      default: return null;
    }
  };

  // Calculate progress percentage
  const usageProgress = Math.min((dailyMessagesUsed / dailyMessageLimit) * 100, 100);

  return (
    <div className="container mx-auto py-10">
      {/* Add back button */}
      <Link href="/">
        <button
          type="button"
          className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          ← Back
        </button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Billing & Plans</h1>

      {/* Current Plan Display */}
      <Card className={cn('mb-8', userPlanType !== 'regular' && 'border-primary ring-2 ring-primary')}>
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={userPlanType !== 'regular' ? 'default' : 'secondary'}>
              {userPlanType.charAt(0).toUpperCase() + userPlanType.slice(1)} Plan
            </Badge>
            {userPlanType !== 'regular' && (
              <span className="text-sm text-muted-foreground">
                Next billing: {nextBillingDate.toLocaleDateString()} (Monthly)
              </span>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Daily Message Usage</h3>
            <p className="text-muted-foreground">
              {dailyMessagesUsed} out of {dailyMessageLimit} messages used today
            </p>
            <Progress value={usageProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {totalMessages.toLocaleString()} messages sent in total
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Comparison */}
      <h2 className="text-2xl font-bold mb-6">Compare Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.type} 
            className={cn(
              userPlanType === plan.type && 'border-primary ring-2 ring-primary'
            )}
          >
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-2xl font-semibold mb-4">{plan.price}</p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    {renderIcon(feature.icon)}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              {userPlanType !== plan.type && (
                <Button 
                  className="mt-6 w-full" 
                  variant={plan.type !== 'regular' ? 'default' : 'outline'}
                  onClick={() => {
                    // TODO: Implement upgrade/change plan logic
                    console.log('Change plan to:', plan.type);
                  }}
                >
                  {userPlanType === 'regular' ? 'Upgrade' : 'Change Plan'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pro/Expert Features */}
      {(userPlanType === 'pro' || userPlanType === 'expert') && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Pro Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History size={20} />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span>May 2024</span>
                    <span className="font-medium">${userPlanType === 'pro' ? '20.00' : '50.00'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>April 2024</span>
                    <span className="font-medium">${userPlanType === 'pro' ? '20.00' : '50.00'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>March 2024</span>
                    <span className="font-medium">${userPlanType === 'pro' ? '20.00' : '50.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 size={20} />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Messages Today</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{dailyMessagesUsed}</span>
                      <span className="text-sm text-muted-foreground">/ {dailyMessageLimit}</span>
                    </div>
                    <Progress value={usageProgress} className="mt-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Messages</p>
                    <p className="text-2xl font-bold">{totalMessages.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}