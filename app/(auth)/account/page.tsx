import { auth } from '../auth';
import { redirect } from 'next/navigation';
import { AccountForm } from './account-form';
import { Breadcrumb } from '@/components/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getUserStats } from '@/lib/db/queries';

export default async function AccountPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const stats = await getUserStats(session.user.id);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-4">
        <Breadcrumb />
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and view your statistics
        </p>
      </div>

      <div className="grid gap-6">
        <AccountForm user={session.user} />

        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your activity on the platform</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {new Date(stats.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Total Chats</span>
                <span className="font-medium">{stats.totalChats}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Messages Sent</span>
                <span className="font-medium">{stats.totalMessages}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <span className="font-medium capitalize">{session.user.type}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
