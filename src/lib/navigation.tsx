import { DiscordIcon } from "~/components/icons";
import AppLogo from "public/logo.png";
import Image from "next/image";
import { type Route } from "next";

// Define a type for our navigation items for type safety
export interface NavItem {
  label: string;
  href?: Route;
  dropdown?: DropdownItem[];
}

export interface DropdownItem {
  href: Route;
  title: string;
  description: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

export const navItems: NavItem[] = [
  {
    label: "Product",
    dropdown: [
      {
        href: "/whiteboard",
        title: "Canvas Flow Studio",
        description: "Visual canvas for your ideas",
        icon: (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Image
              src={AppLogo}
              alt="Canvas Flow Studio Logo"
              placeholder="blur"
            />
          </div>
        ),
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
  {
    label: "Community",
    dropdown: [
      {
        href: (process.env.NEXT_PUBLIC_DISCORD_INVITE_URL as Route) ?? "#",
        title: "Discord",
        description: "Join our community",
        icon: (
          <div className="flex h-10 w-10 items-center justify-center">
            <DiscordIcon width="28px" height="28px" />
          </div>
        ),
        isExternal: true,
      },
    ],
  },
];
