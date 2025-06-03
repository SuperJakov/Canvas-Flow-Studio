"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

export function Header() {
  const pathname = usePathname();

  // Don't render the header on the whiteboard page
  if (pathname === "/whiteboard" || pathname.startsWith("/whiteboard/")) {
    return null;
  }

  return (
    <header
      className="fixed z-50 w-full bg-gray-900/80 backdrop-blur-sm"
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
                AI Flow Studio
              </span>
            </Link>
          </div>

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

          <div className="flex min-h-[40px] min-w-[155px] items-center space-x-4">
            <Unauthenticated>
              <div className="hidden md:block">
                <SignInButton mode="modal">
                  <button className="text-gray-300 transition hover:text-white">
                    Sign In
                  </button>
                </SignInButton>
              </div>
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
        </div>
      </div>
    </header>
  );
}
