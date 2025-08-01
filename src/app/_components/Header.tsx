"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DiscordIcon } from "~/components/icons";
import AppLogo from "public/logo.png";
import Image from "next/image";
import posthog from "posthog-js";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);

  const productTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const communityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#";

  const capture = (event: string, props?: Record<string, unknown>) =>
    posthog?.capture(event, {
      current_path: pathname,
      ...props,
    });

  const toggleMenu = () => {
    setIsMenuOpen((open) => {
      capture("mobile_menu toggled", { state: !open ? "opened" : "closed" });
      return !open;
    });
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    capture("mobile_menu toggled", { state: "closed" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsProductDropdownOpen(false);
      setIsCommunityDropdownOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProductMouseEnter = () => {
    if (productTimeoutRef.current) clearTimeout(productTimeoutRef.current);
    setIsCommunityDropdownOpen(false);
    setIsProductDropdownOpen(true);
    capture("dropdown opened", { dropdown: "product" });
  };

  const handleProductMouseLeave = () => {
    productTimeoutRef.current = setTimeout(() => {
      setIsProductDropdownOpen(false);
      capture("dropdown closed", { dropdown: "product" });
    }, 250);
  };

  const handleCommunityMouseEnter = () => {
    if (communityTimeoutRef.current) clearTimeout(communityTimeoutRef.current);
    setIsProductDropdownOpen(false);
    setIsCommunityDropdownOpen(true);
    capture("dropdown opened", { dropdown: "community" });
  };

  const handleCommunityMouseLeave = () => {
    communityTimeoutRef.current = setTimeout(() => {
      setIsCommunityDropdownOpen(false);
      capture("dropdown closed", { dropdown: "community" });
    }, 250);
  };

  if (pathname === "/whiteboard" || pathname.startsWith("/whiteboard/")) {
    return null;
  }

  const navClick = (label: string) => () => capture("nav click", { label });

  return (
    <>
      <header
        className="fixed z-50 w-full backdrop-blur-sm"
        style={{
          backgroundColor: `color-mix(in oklch, var(--background) 80%, transparent)`,
        }}
        suppressHydrationWarning
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              <Link href="/" onClick={navClick("home")}>
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
                  CFS
                </span>
              </Link>

              <nav className="hidden items-center space-x-6 lg:flex">
                <div
                  onMouseEnter={handleProductMouseEnter}
                  onMouseLeave={handleProductMouseLeave}
                >
                  <DropdownMenu
                    open={isProductDropdownOpen}
                    onOpenChange={(open) => {
                      if (!open && productTimeoutRef.current) return;
                      setIsProductDropdownOpen(open);
                      capture(open ? "dropdown opened" : "dropdown closed", {
                        dropdown: "product",
                        triggered_by: "manual",
                      });
                    }}
                    modal={false}
                  >
                    <DropdownMenuTrigger asChild>
                      <div className="flex cursor-pointer items-center space-x-1 text-gray-300 transition hover:text-white">
                        <span>Product</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-80 p-0"
                      align="start"
                      onPointerDownOutside={(e) => {
                        const target = e.target as Element;
                        if (
                          !target.closest("[data-radix-dropdown-menu-content]")
                        ) {
                          setIsProductDropdownOpen(false);
                          capture("dropdown closed", { dropdown: "product" });
                        }
                      }}
                    >
                      <DropdownMenuItem
                        asChild
                        className="text-foreground bg-background cursor-pointer p-4"
                        onSelect={() =>
                          capture("nav click", { label: "whiteboard" })
                        }
                      >
                        <Link href="/whiteboard" className="flex items-start">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <Image
                              src={AppLogo}
                              alt="Canvas Flow Studio Logo"
                              placeholder="blur"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1 font-bold">
                              Canvas Flow Studio
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Visual canvas
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link
                  href="/pricing"
                  className="text-gray-300 transition hover:text-white"
                  prefetch={true}
                  onClick={navClick("pricing")}
                >
                  Pricing
                </Link>

                <Link
                  href="/blog"
                  className="text-gray-300 transition hover:text-white"
                  onClick={navClick("blog")}
                >
                  Blog
                </Link>

                <Link
                  href="/docs"
                  className="text-gray-300 transition hover:text-white"
                  onClick={navClick("docs")}
                >
                  Docs
                </Link>

                <div
                  onMouseEnter={handleCommunityMouseEnter}
                  onMouseLeave={handleCommunityMouseLeave}
                >
                  <DropdownMenu
                    open={isCommunityDropdownOpen}
                    onOpenChange={(open) => {
                      if (!open && communityTimeoutRef.current) return;
                      setIsCommunityDropdownOpen(open);
                      capture(open ? "dropdown opened" : "dropdown closed", {
                        dropdown: "community",
                        triggered_by: "manual",
                      });
                    }}
                    modal={false}
                  >
                    <DropdownMenuTrigger asChild>
                      <div className="flex cursor-pointer items-center space-x-1 text-gray-300 transition hover:text-white">
                        <span>Community</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-80 p-0"
                      align="start"
                      onPointerDownOutside={(e) => {
                        const target = e.target as Element;
                        if (
                          !target.closest("[data-radix-dropdown-menu-content]")
                        ) {
                          setIsCommunityDropdownOpen(false);
                          capture("dropdown closed", { dropdown: "community" });
                        }
                      }}
                    >
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer p-4"
                        onSelect={() =>
                          capture("external link click", {
                            label: "discord",
                            location: "desktop nav",
                          })
                        }
                      >
                        <a
                          href={discordUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start space-x-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center">
                            <DiscordIcon width="28px" height="28px" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1 font-bold">Discord</h3>
                            <p className="text-muted-foreground text-sm">
                              Join our community
                            </p>
                          </div>
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </nav>
            </div>

            <div className="hidden min-h-[40px] min-w-[155px] items-center space-x-4 lg:flex">
              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    onClick={() => capture("auth click", { action: "sign_in" })}
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    onClick={() => capture("auth click", { action: "sign_up" })}
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </Unauthenticated>
              <Authenticated>
                <UserButton />
              </Authenticated>
            </div>

            <button
              className="flex cursor-pointer flex-col items-center justify-center space-y-1 lg:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition-all duration-300 ${
                  isMenuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-300 transition-all duration-300 ${
                  isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            backgroundColor: `color-mix(in oklch, var(--background) 90%, transparent)`,
          }}
        >
          <div className="flex h-full flex-col backdrop-blur-md">
            <nav className="flex flex-1 flex-col items-start justify-center space-y-8 pt-20 pl-8">
              <div className="flex flex-col space-y-4">
                <span className="text-muted-foreground text-lg font-medium">
                  Product
                </span>
                <div className="pl-4">
                  <Link
                    href="/whiteboard"
                    className="text-muted-foreground hover:text-foreground no-underline transition"
                    onClick={() => {
                      closeMenu();
                      capture("nav click", {
                        label: "whiteboard (mobile)",
                        location: "mobile menu",
                      });
                    }}
                  >
                    Canvas Flow Studio
                  </Link>
                </div>
              </div>

              <Button variant="link" asChild className="h-auto p-0 text-xl">
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground font-medium no-underline transition"
                  onClick={() => {
                    closeMenu();
                    capture("nav click", {
                      label: "pricing (mobile)",
                      location: "mobile menu",
                    });
                  }}
                >
                  Pricing
                </Link>
              </Button>

              <Button variant="link" asChild className="h-auto p-0 text-xl">
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground font-medium no-underline transition"
                  onClick={() => {
                    closeMenu();
                    capture("nav click", {
                      label: "blog (mobile)",
                      location: "mobile menu",
                    });
                  }}
                >
                  Blog
                </Link>
              </Button>

              <Button variant="link" asChild className="h-auto p-0 text-xl">
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground font-medium no-underline transition"
                  onClick={() => {
                    closeMenu();
                    capture("nav click", {
                      label: "docs (mobile)",
                      location: "mobile menu",
                    });
                  }}
                >
                  Docs
                </Link>
              </Button>

              <div className="flex flex-col space-y-4">
                <span className="text-muted-foreground text-lg font-medium">
                  Community
                </span>
                <div className="pl-4">
                  <a
                    href={discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground flex items-center space-x-2 no-underline transition"
                    onClick={() =>
                      capture("external link click", {
                        label: "discord (mobile)",
                        location: "mobile menu",
                      })
                    }
                  >
                    <DiscordIcon className="h-4 w-4" />
                    <span>Discord</span>
                  </a>
                </div>
              </div>
            </nav>

            <div className="flex flex-col items-start space-y-6 px-8 pt-8 pb-20">
              <Unauthenticated>
                <div className="flex w-full flex-col gap-4 lg:flex-row">
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-muted-foreground hover:border/80 hover:bg-accent/10 hover:text-foreground h-12 w-full border bg-transparent text-lg font-medium"
                      onClick={() => {
                        closeMenu();
                        capture("auth click", {
                          action: "sign_in",
                          location: "mobile menu",
                        });
                      }}
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      size="lg"
                      className="h-12 w-full text-lg font-medium"
                      onClick={() => {
                        closeMenu();
                        capture("auth click", {
                          action: "sign_up",
                          location: "mobile menu",
                        });
                      }}
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              </Unauthenticated>
              <Authenticated>
                <div className="scale-125">
                  <UserButton />
                </div>
              </Authenticated>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
