export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="absolute h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-blue-400"></div>

        {/* Middle pulsing ring with gradient */}
        <div className="absolute h-24 w-24 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 opacity-85 blur-[3px]"></div>
      </div>

      {/* Loading text */}
      <div className="mt-16">
        <h2 className="animate-pulse bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
          Loading...
        </h2>
      </div>

      {/* Animated dots using Tailwind's animate-bounce */}
      <div className="mt-4 flex space-x-2">
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-purple-500"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-purple-500"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-purple-500"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  );
}
