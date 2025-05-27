'use client';

import {
  BadgeCheck,
  Bell,
  ChevronUp,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserCircle
} from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

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
import { LoaderIcon } from './icons';
import { toast } from './toast';
import { guestRegex } from '@/lib/constants';

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, theme } = useTheme();
  const { isMobile } = useSidebar();

  // For non-authenticated users, show the original simple design
  if (!data?.user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton 
                className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10 justify-between"
              >
                <div className="flex flex-row gap-2">
                  <UserCircle className="size-6" />
                  <span>Sign In</span>
                </div>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              data-testid="user-nav-menu"
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem
                data-testid="user-nav-item-theme"
                className="cursor-pointer"
                onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="user-nav-item-auth"
                className="cursor-pointer"
                onClick={() => router.push('/login')}
              >
                Login to your account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // For authenticated users, show the enhanced shadcn design
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>          <DropdownMenuTrigger asChild>
            {status !== "authenticated" ? (
              <SidebarMenuButton 
                size="lg"
                className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground justify-between"
              >
                <div className="flex flex-row gap-2">
                  <div className="size-8 bg-zinc-500/30 rounded-lg animate-pulse" />
                  <div className="grid flex-1 gap-1">                    <div className="h-4 w-24 bg-zinc-500/30 rounded animate-pulse" />
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
              >                <Avatar className="size-8 rounded-lg bg-muted">
                  <AvatarImage 
                    src={`https://avatar.vercel.sh/${user.email}`}
                    alt={user.email ?? 'User Avatar'}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-semibold" data-testid="user-email">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email?.split('@')[0]}
                    </span>                    <BadgeCheck className="size-4 text-primary" />
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
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
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">                <Avatar className="size-8 rounded-lg">
                  <AvatarImage 
                    src={`https://avatar.vercel.sh/${user.email}`}
                    alt={user.email ?? 'User Avatar'}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar><div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email?.split('@')[0]}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2" onClick={() => router.push('/upgrade')}>
                <Sparkles className="size-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="gap-2" 
                onClick={() => router.push('/account')}
              >
                <BadgeCheck className="size-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => router.push('/billing')}
              >
                <CreditCard className="size-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => router.push('/notifications')}
              >
                <Bell className="size-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="user-nav-item-theme"
              className="gap-2"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'light' ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
              <span>{`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="user-nav-item-auth"
              className="gap-2"              onClick={async () => {
                // NextAuth status can be "authenticated" | "loading" | "unauthenticated"
                if ((status as any) === "loading") {
                  toast({
                    type: 'error',
                    description: 'Checking authentication status, please try again!',
                  });
                  return;
                }
                
                if (status === "authenticated") {
                  await signOut({
                    redirectTo: '/',
                  });
                } else {
                  router.push('/login');
                }
              }}
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
