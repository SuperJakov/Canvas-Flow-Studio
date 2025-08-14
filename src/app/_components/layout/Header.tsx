"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { ChevronDown } from "lucide-react";
import { navItems } from "~/lib/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MobileNav } from "./MobileNav";
import { AuthButtons } from "./AuthButtons";

const excludedPaths = ["/whiteboard/", "/website"];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Analytics capture function
  const capture = (event: string, props?: Record<string, unknown>) => {
    posthog?.capture(event, { current_path: pathname, ...props });
  };

  // Close dropdowns on scroll
  useEffect(() => {
    const handleScroll = () => setOpenDropdown(null);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generic dropdown handlers
  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(label);
    capture("dropdown opened", { dropdown: label });
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 250);
  };

  // Mobile menu handlers
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Don't render header on specific paths
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <>
      <header
        className="fixed z-50 w-full backdrop-blur-sm"
        style={{
          backgroundColor: `color-mix(in oklch, var(--background) 80%, transparent)`,
        }}
        suppressHydrationWarning
      >
        <div className="mx-0 w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                onClick={() => capture("nav click", { label: "home" })}
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
                  CFS
                </span>
              </Link>

              {/* DESKTOP NAVIGATION */}
              <nav className="hidden items-center space-x-6 md:flex">
                {navItems.map((item) =>
                  item.dropdown ? (
                    <div
                      key={item.label}
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <DropdownMenu
                        open={openDropdown === item.label}
                        onOpenChange={(isOpen) =>
                          setOpenDropdown(isOpen ? item.label : null)
                        }
                        modal={false}
                      >
                        <DropdownMenuTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center space-x-1 transition">
                            <span>{item.label}</span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80 p-0" align="start">
                          {item.dropdown.map((subItem) => (
                            <DropdownMenuItem
                              key={subItem.title}
                              asChild
                              className="cursor-pointer p-4"
                            >
                              <Link
                                href={subItem.href}
                                target={
                                  subItem.isExternal ? "_blank" : undefined
                                }
                                rel={
                                  subItem.isExternal
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                className="flex items-start space-x-4"
                                onClick={() =>
                                  capture("nav click", { label: subItem.title })
                                }
                              >
                                {subItem.icon}
                                <div className="flex-1">
                                  <h3 className="mb-1 font-bold">
                                    {subItem.title}
                                  </h3>
                                  <p className="text-muted-foreground text-sm">
                                    {subItem.description}
                                  </p>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href ?? "#"}
                      className="text-muted-foreground hover:text-foreground transition"
                      onClick={() =>
                        capture("nav click", {
                          label: item.label.toLowerCase(),
                        })
                      }
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
            </div>

            <AuthButtons location="header" />

            {/* HAMBURGER BUTTON */}
            <button
              className="flex cursor-pointer flex-col space-y-1 md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition-all ${isMenuOpen ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition-all ${isMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition-all ${isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <MobileNav items={navItems} onClose={closeMenu} capture={capture} />
      )}
    </>
  );
}
