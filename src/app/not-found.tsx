"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-8xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="mb-6 text-4xl font-bold text-white">Page Not Found</h2>
          <p className="mb-10 text-xl text-gray-300">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
