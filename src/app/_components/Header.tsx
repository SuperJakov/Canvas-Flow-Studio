"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { DiscordIcon } from "~/components/icons";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);

  // Timeout refs for delayed closing
  const productTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const communityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close dropdowns when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsProductDropdownOpen(false);
      setIsCommunityDropdownOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Product dropdown handlers with useCallback to prevent recreation
  const handleProductMouseEnter = useCallback(() => {
    if (productTimeoutRef.current) {
      clearTimeout(productTimeoutRef.current);
      productTimeoutRef.current = null;
    }
    setIsCommunityDropdownOpen(false);
    setIsProductDropdownOpen(true);
  }, []);

  const handleProductMouseLeave = useCallback(() => {
    productTimeoutRef.current = setTimeout(() => {
      setIsProductDropdownOpen(false);
    }, 250);
  }, []);

  // Community dropdown handlers with useCallback to prevent recreation
  const handleCommunityMouseEnter = useCallback(() => {
    if (communityTimeoutRef.current) {
      clearTimeout(communityTimeoutRef.current);
      communityTimeoutRef.current = null;
    }
    setIsProductDropdownOpen(false);
    setIsCommunityDropdownOpen(true);
  }, []);

  const handleCommunityMouseLeave = useCallback(() => {
    communityTimeoutRef.current = setTimeout(() => {
      setIsCommunityDropdownOpen(false);
    }, 250);
  }, []);

  // Don't render the header on the whiteboard page
  if (pathname === "/whiteboard" || pathname.startsWith("/whiteboard/")) {
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side - App name and navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/" onClick={closeMenu}>
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
                  AFS
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden items-center space-x-6 lg:flex">
                {/* Product Dropdown */}
                <div
                  onMouseEnter={handleProductMouseEnter}
                  onMouseLeave={handleProductMouseLeave}
                >
                  <DropdownMenu
                    open={isProductDropdownOpen}
                    onOpenChange={(open) => {
                      // Only allow manual control, prevent automatic closing
                      if (!open && productTimeoutRef.current) {
                        // If there's a timeout running, don't close immediately
                        return;
                      }
                      setIsProductDropdownOpen(open);
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
                        // Allow scrolling by not preventing default
                        const target = e.target as Element;
                        if (
                          !target.closest("[data-radix-dropdown-menu-content]")
                        ) {
                          setIsProductDropdownOpen(false);
                        }
                      }}
                    >
                      <DropdownMenuItem
                        asChild
                        className="text-foreground bg-background cursor-pointer p-4"
                      >
                        <Link href="/whiteboard" className="flex items-start">
                          {/* Left side - Logo placeholder */}
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <span className="text-sm font-bold text-white">
                              AFS
                            </span>
                          </div>
                          {/* Right side - Product info */}
                          <div className="flex-1">
                            <h3 className="mb-1 font-bold">AI Flow Studio</h3>
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
                >
                  Pricing
                </Link>

                <Link
                  href="/blog"
                  className="text-gray-300 transition hover:text-white"
                >
                  Blog
                </Link>

                <Link
                  href="/docs"
                  className="text-gray-300 transition hover:text-white"
                >
                  Docs
                </Link>

                {/* Community Dropdown */}
                <div
                  onMouseEnter={handleCommunityMouseEnter}
                  onMouseLeave={handleCommunityMouseLeave}
                >
                  <DropdownMenu
                    open={isCommunityDropdownOpen}
                    onOpenChange={(open) => {
                      // Only allow manual control, prevent automatic closing
                      if (!open && communityTimeoutRef.current) {
                        // If there's a timeout running, don't close immediately
                        return;
                      }
                      setIsCommunityDropdownOpen(open);
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
                        // Allow scrolling by not preventing default
                        const target = e.target as Element;
                        if (
                          !target.closest("[data-radix-dropdown-menu-content]")
                        ) {
                          setIsCommunityDropdownOpen(false);
                        }
                      }}
                    >
                      <DropdownMenuItem asChild className="cursor-pointer p-4">
                        <a
                          href="https://discord.gg/your-discord-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start space-x-4"
                        >
                          {/* Left side - Discord icon */}
                          <div className="flex h-10 w-10 items-center justify-center">
                            <DiscordIcon width="28px" height="28px" />
                          </div>

                          {/* Right side - Discord info */}
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

            {/* Right side - Auth buttons */}
            <div className="hidden min-h-[40px] min-w-[155px] items-center space-x-4 lg:flex">
              <Unauthenticated>
                <SignInButton mode="modal">
                  <button className="text-gray-300 transition hover:text-white">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl">
                    Sign Up
                  </button>
                </SignUpButton>
              </Unauthenticated>
              <Authenticated>
                <UserButton />
              </Authenticated>
            </div>

            {/* Mobile Hamburger Button */}
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

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            backgroundColor: `color-mix(in oklch, var(--background) 90%, transparent)`,
          }}
        >
          <div className="flex h-full flex-col backdrop-blur-md">
            {/* Navigation Links - Top Section */}
            <nav className="flex flex-1 flex-col items-start justify-center space-y-8 pt-20 pl-8">
              {/* Product Section in Mobile */}
              <div className="flex flex-col space-y-4">
                <span className="text-muted-foreground text-lg font-medium">
                  Product
                </span>
                <div className="pl-4">
                  <Link
                    href="/whiteboard"
                    className="text-muted-foreground hover:text-foreground no-underline transition"
                    onClick={closeMenu}
                  >
                    AI Flow Studio
                  </Link>
                </div>
              </div>

              <Button variant="link" asChild className="h-auto p-0 text-xl">
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground font-medium no-underline transition"
                  onClick={closeMenu}
                >
                  Pricing
                </Link>
              </Button>

              <Button variant="link" asChild className="h-auto p-0 text-xl">
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground font-medium no-underline transition"
                  onClick={closeMenu}
                >
                  Blog
                </Link>
              </Button>

              <Button variant="link" asChild className="h-auto p-0 text-xl">
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground font-medium no-underline transition"
                  onClick={closeMenu}
                >
                  Docs
                </Link>
              </Button>

              {/* Community Section in Mobile */}
              <div className="flex flex-col space-y-4">
                <span className="text-muted-foreground text-lg font-medium">
                  Community
                </span>
                <div className="pl-4">
                  <a
                    href="https://discord.gg/your-discord-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground flex items-center space-x-2 no-underline transition"
                    onClick={closeMenu}
                  >
                    <DiscordIcon className="h-4 w-4" />
                    <span>Discord</span>
                  </a>
                </div>
              </div>
            </nav>

            {/* Auth Section - Bottom */}
            <div className="flex flex-col items-start space-y-6 pb-20 pl-8">
              <Unauthenticated>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-muted-foreground hover:border/80 hover:bg-accent/10 hover:text-foreground h-12 border bg-transparent text-lg font-medium"
                      onClick={closeMenu}
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      size="lg"
                      className="from-primary to-secondary text-primary-foreground h-12 bg-gradient-to-r text-lg font-medium shadow-lg hover:scale-[1.02] hover:shadow-xl"
                      onClick={closeMenu}
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
