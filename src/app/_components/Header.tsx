"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't render the header on the whiteboard page
  if (pathname === "/whiteboard" || pathname.startsWith("/whiteboard/")) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
            <div className="flex items-center">
              <Link href="/" onClick={closeMenu}>
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
                  AI Flow Studio
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-8 md:flex">
              <Link
                href="/"
                className="text-gray-300 transition hover:text-white"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-gray-300 transition hover:text-white"
              >
                Pricing
              </Link>
              <Authenticated>
                <Link
                  href="/whiteboards"
                  className="text-gray-300 transition hover:text-white"
                >
                  Whiteboard
                </Link>
              </Authenticated>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden min-h-[40px] min-w-[155px] items-center space-x-4 md:flex">
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
              className="flex cursor-pointer flex-col items-center justify-center space-y-1 md:hidden"
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
        <div className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-md md:hidden">
          <div className="flex h-full flex-col">
            {/* Navigation Links - Top Section */}
            <nav className="flex flex-1 flex-col items-start justify-center space-y-8 pt-20 pl-8">
              <Link
                href="/"
                className="text-2xl font-medium text-gray-300 transition hover:text-white"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-2xl font-medium text-gray-300 transition hover:text-white"
                onClick={closeMenu}
              >
                Pricing
              </Link>
              <Authenticated>
                <Link
                  href="/whiteboards"
                  className="text-2xl font-medium text-gray-300 transition hover:text-white"
                  onClick={closeMenu}
                >
                  Whiteboard
                </Link>
              </Authenticated>
            </nav>

            {/* Auth Section - Bottom */}
            <div className="flex flex-col items-start space-y-6 pb-20 pl-8">
              <Unauthenticated>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <SignInButton mode="modal">
                    <button
                      className="flex h-12 cursor-pointer items-center justify-center rounded-lg border border-gray-600 bg-transparent px-6 text-lg font-medium text-gray-300 transition hover:border-gray-400 hover:text-white"
                      onClick={closeMenu}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 text-lg font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                      onClick={closeMenu}
                    >
                      Sign Up
                    </button>
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
