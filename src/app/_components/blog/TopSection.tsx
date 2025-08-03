import Image from "next/image";
import AppLogo from "public/logo.png";

export default function TopSection() {
  return (
    <div className="bg-background px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-4 md:gap-6">
          <Image
            src={AppLogo}
            alt="App Logo"
            width={80}
            height={80}
            className="h-16 w-16 object-contain md:h-20 md:w-20"
            placeholder="blur"
          />
          <h1 className="text-primary text-5xl font-bold md:text-6xl lg:text-7xl">
            Blog
          </h1>
        </div>
        <p className="text-xl font-light text-gray-600 md:text-2xl dark:text-gray-400">
          Thoughts Worth Sharing.
        </p>
      </div>
    </div>
  );
}
