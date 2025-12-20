"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  BellIcon,
  Calendar,
  CalendarCheck,
  Users,
  BarChart3,
  SlashIcon,
  LogOut,
  Settings,
  User,
  UserCog,
  Home,
  CreditCard,
  Briefcase,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { GetUserData } from "@/lib/auth";
import NotificationDropdown from "./notification-dropdown";

// ---------------------- Types ----------------------
type UserRole = "customer" | "organizer" | "admin";

// ---------------------- Navigation Config ----------------------
const navigationByRole = {
  customer: [
    { href: "/dashboard", label: "Home", icon: Home },
    {
      href: "/dashboard/user/appointments",
      label: "My Appointments",
      icon: CalendarCheck,
    },
    {
      href: "/dashboard/user/appointments/book",
      label: "Book Appointment",
      icon: Calendar,
    },
  ],
  organizer: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    {
      href: "/dashboard/org/all-appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    { href: "/dashboard/org/services", label: "Services", icon: Briefcase },
    { href: "/dashboard/org/users", label: "Users", icon: UserCog },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/org/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    {
      href: "/dashboard/org/all-appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    { href: "/dashboard/org/services", label: "Services", icon: Briefcase },
    { href: "/dashboard/org/users", label: "Users", icon: UserCog },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/org/settings", label: "Settings", icon: Settings },
  ],
};

// Mobile Navigation structure
const getMobileNav = (role: UserRole) => {
  const items = navigationByRole[role] || navigationByRole.customer;

  if (role === "admin") {
    return [
      {
        name: "Main",
        items: items
          .slice(0, 5)
          .map((item) => ({ label: item.label, href: item.href })),
      },
      {
        name: "Management",
        items: items
          .slice(5)
          .map((item) => ({ label: item.label, href: item.href })),
      },
    ];
  }

  return [
    {
      name: "Main",
      items: items.map((item) => ({ label: item.label, href: item.href })),
    },
  ];
};

// Mobile Nav Component
function MobileNav({
  nav,
}: {
  nav: { name: string; items: { label: string; href: string }[] }[];
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "extend-touch-target block size-8 touch-manipulation items-center justify-start gap-2.5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent md:hidden dark:hover:bg-transparent"
          )}
        >
          <div className="relative flex items-center justify-center">
            <div className="relative size-4">
              <span
                className={cn(
                  "bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100",
                  open ? "top-[0.4rem] -rotate-45" : "top-1"
                )}
              />
              <span
                className={cn(
                  "bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100",
                  open ? "top-[0.4rem] rotate-45" : "top-2.5"
                )}
              />
            </div>
            <span className="sr-only">Toggle Menu</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background/90 no-scrollbar h-(--radix-popover-content-available-height) w-(--radix-popover-content-available-width) overflow-y-auto rounded-none border-none p-0 shadow-none backdrop-blur duration-100"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={4}
      >
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          {nav.map((category, index) => (
            <div className="flex flex-col gap-4" key={index}>
              <p className="text-muted-foreground text-sm font-medium">
                {category.name}
              </p>
              <div className="flex flex-col gap-3">
                {category.items.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className={cn(
                        "text-2xl font-medium",
                        isActive && "text-primary"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------- User Profile Dropdown ----------------------
function UserProfileDropdown({
  align,
  sizeClass,
  userName,
  userEmail,
  userRole,
}: {
  align: "start" | "center" | "end";
  sizeClass: string;
  userName: string;
  userEmail: string;
  userRole: string;
}) {
  const handleLogout = () => {
    console.log("Logging out...");
    alert("Logged out successfully!");
    window.location.href = "/login";
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            sizeClass
          )}
          aria-label="Open user menu"
        >
          <Avatar className={cn("h-full w-full")}>
            <AvatarImage src="/avatar-1.png" alt="User avatar" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
              Role: {userRole}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="flex items-center cursor-pointer"
          >
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="flex items-center cursor-pointer"
          >
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------- Navbar ----------------------
export default function Navbar() {
  const pathname = usePathname();
  const [userData, setUserData] = React.useState<{
    name: string;
    email: string;
    role: UserRole;
  } | null>(null);

  const isLoading = userData === null;
  const userRole = userData?.role || "customer";
  const userName = userData?.name || "";
  const userEmail = userData?.email || "";
  const navigationLinks = userData ? navigationByRole[userData.role] || [] : [];
  const mobileNavStructure = userData
    ? getMobileNav(userData.role)
    : [{ name: "Main", items: [] }];

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Import authStorage for getting user from cookies
        const { authStorage } = await import("@/lib/auth");
        const cookieUser = authStorage.getUser();

        if (cookieUser) {
          const roleLowercase = cookieUser.role.toLowerCase();
          setUserData({
            name: cookieUser.name,
            email: cookieUser.email,
            role: (roleLowercase === "organization"
              ? "organizer"
              : roleLowercase) as UserRole,
          });
        } else {
          // Fallback to GetUserData if no cookie data
          const data = await GetUserData();
          setUserData({
            name: data.name,
            email: data.email,
            role: data.role as UserRole,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Set a default user on error to prevent undefined issues
        setUserData({
          name: "Guest User",
          email: "guest@example.com",
          role: "customer",
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-border w-full flex-col items-center justify-between gap-3 border-b bg-background px-4 xl:px-6">
      <div className="flex w-full items-center justify-between gap-4 h-16">
        <div className="flex flex-1 items-center justify-start gap-2">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "dark:hover:bg-accent text-accent-foreground hidden md:flex h-8 w-8"
            )}
          >
            {/* Logo - Calendar Icon */}
            <Calendar className="h-5 w-5" />
          </Link>

          <SlashIcon className="hidden md:flex h-4 w-4 text-muted-foreground -rotate-[20deg]" />

          <MobileNav nav={mobileNavStructure} />

          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-lg hidden sm:inline-block">
              BookNow
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Separator
            orientation="vertical"
            className="hidden data-[orientation=vertical]:h-5 md:flex"
          />

          <div className="flex items-center gap-1.5">
            <NotificationDropdown />
          </div>

          <Separator
            orientation="vertical"
            className="hidden data-[orientation=vertical]:h-5 sm:flex"
          />

          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <UserProfileDropdown
              align="end"
              sizeClass="h-8 w-8"
              userName={userName}
              userEmail={userEmail}
              userRole={userRole}
            />
          )}
        </div>
      </div>

      <div className="flex w-full items-center justify-start pb-1.5">
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList>
            {isLoading
              ? // Loading skeletons - show 5 as typical count
                Array.from({ length: 5 }).map((_, index) => (
                  <NavigationMenuItem key={index}>
                    <div className="flex items-center gap-2 rounded-md px-3 py-1.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </NavigationMenuItem>
                ))
              : // Actual navigation items
                navigationLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <NavigationMenuItem key={index} asChild>
                      <Link
                        href={link.href}
                        data-active={isActive}
                        className="text-foreground/60 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-normal transition-all outline-none focus-visible:ring-[3px] data-[active=true]:relative"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
