"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { AuthButtons } from "./AuthButtons";
import { type NavItem } from "~/lib/navigation";
import { DiscordIcon } from "~/components/icons";

interface MobileNavProps {
  items: NavItem[];
  onClose: () => void;
  capture: (event: string, props?: Record<string, unknown>) => void;
}

export function MobileNav({ items, onClose, capture }: MobileNavProps) {
  const handleLinkClick = (label: string, isExternal = false) => {
    const event = isExternal ? "external link click" : "nav click";
    capture(event, { label: `${label} (mobile)`, location: "mobile menu" });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 lg:hidden"
      style={{
        backgroundColor: `color-mix(in oklch, var(--background) 90%, transparent)`,
      }}
    >
      <div className="flex h-full flex-col backdrop-blur-md">
        <nav className="flex flex-1 flex-col items-start justify-center space-y-8 pt-20 pl-8">
          {items.map((item) => {
            // If it's a direct link, render it as a standalone link.
            if (item.href) {
              return (
                <Button
                  key={item.label}
                  variant="link"
                  asChild
                  className="h-auto p-0 text-xl"
                >
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground font-medium no-underline transition"
                    onClick={() => handleLinkClick(item.label.toLowerCase())}
                  >
                    {item.label}
                  </Link>
                </Button>
              );
            }

            // If it's a category with a dropdown, render the title and its sub-items.
            return (
              <div key={item.label} className="flex flex-col space-y-4">
                <span className="text-muted-foreground text-lg font-medium">
                  {item.label}
                </span>
                <div className="pl-4">
                  {item.dropdown?.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      target={subItem.isExternal ? "_blank" : undefined}
                      rel={
                        subItem.isExternal ? "noopener noreferrer" : undefined
                      }
                      className="text-muted-foreground hover:text-foreground flex items-center space-x-2 no-underline transition"
                      onClick={() =>
                        handleLinkClick(subItem.title, subItem.isExternal)
                      }
                    >
                      {subItem.title === "Discord" && (
                        <DiscordIcon className="h-4 w-4" />
                      )}
                      <span>{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="flex flex-col items-start space-y-6 px-8 pt-8 pb-20">
          <AuthButtons location="mobile menu" onAuthAction={onClose} />
        </div>
      </div>
    </div>
  );
}
