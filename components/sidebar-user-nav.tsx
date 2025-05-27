'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserCircle
} from 'lucide-react';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { LoaderIcon } from './icons';
import { guestRegex } from '@/lib/constants';

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, theme } = useTheme();
  const { isMobile } = useSidebar();

  const isGuest = guestRegex.test(data?.user?.email ?? '');
  const displayName = isGuest ? 'Guest' : user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {status === 'loading' ? (
              <SidebarMenuButton 
                size="lg"
                className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground justify-between"
              >
                <div className="flex flex-row gap-2">
                  <div className="size-8 bg-zinc-500/30 rounded-lg animate-pulse" />
                  <div className="grid flex-1 gap-1">
                    <div className="h-4 w-24 bg-zinc-500/30 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-zinc-500/30 rounded animate-pulse" />
                  </div>
                </div>
                <div className="animate-spin text-zinc-500">
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                data-testid="user-nav-button"
                size="lg" 
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage 
                    src={user?.email ? `https://avatar.vercel.sh/${user.email}` : undefined} 
                    alt={displayName || 'User'} 
                  />
                  <AvatarFallback className="rounded-lg">
                    {displayName?.slice(0, 2)?.toUpperCase() || 'CN'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold" data-testid="user-email">{displayName || 'User'}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {!isGuest && user?.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="user-nav-menu"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">  
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage 
                    src={user?.email ? `https://avatar.vercel.sh/${user.email}` : undefined}
                    alt={displayName || 'User'} 
                  />
                  <AvatarFallback className="rounded-lg">
                    {displayName?.slice(0, 2)?.toUpperCase() || 'CN'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName || 'User'}</span>
                  <span className="truncate text-xs">{!isGuest && user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isGuest && (
              <DropdownMenuGroup>
                <DropdownMenuItem className="gap-2" onClick={() => router.push('/upgrade')}>
                  <Sparkles className="size-4" />
                  <span>Upgrade to Pro</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2" 
                  onClick={() => router.push('/account')}
                >
                  <UserCircle className="size-4" />
                  <div className="grid flex-1">
                    <span className="font-medium">Manage Account</span>
                    <span className="text-xs text-muted-foreground">Profile settings and preferences</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-row gap-2 px-2 py-1.5"
                  onClick={() => router.push('/billing')}
                >
                  <CreditCard className="size-4" />
                  <div className="grid flex-1">
                    <span className="font-medium">Billing</span>
                    <span className="text-xs text-muted-foreground">Manage your subscription plan</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-row gap-2 px-2 py-1.5"
                  onClick={() => router.push('/notifications')}
                >
                  <Bell className="size-4" />
                  <div className="grid flex-1">
                    <span className="font-medium">Notifications</span>
                    <span className="text-xs text-muted-foreground">Configure notification settings</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            <DropdownMenuItem
              data-testid="user-nav-item-theme"
              className="flex flex-row gap-2 px-2 py-1.5 cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'light' ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
              <div className="grid flex-1">
                <span className="font-medium">{`${theme === 'light' ? 'Dark' : 'Light'} mode`}</span>
                <span className="text-xs text-muted-foreground">Change the app appearance</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="user-nav-item-auth"
              className="flex flex-row gap-2 px-2 py-1.5 cursor-pointer"
              onClick={() => {
                if (status === 'loading') {
                  toast({
                    type: 'error',
                    description: 'Checking authentication status, please try again!',
                  });
                  return;
                }

                if (isGuest) {
                  router.push('/login');
                } else {
                  signOut({
                    redirectTo: '/',
                  });
                }
              }}
            >
              <LogOut className="size-4" />
              <div className="grid flex-1">
                <span className="font-medium">{isGuest ? 'Login' : 'Sign out'}</span>
                <span className="text-xs text-muted-foreground">
                  {isGuest ? 'Sign in to your account' : 'End your current session'}
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
