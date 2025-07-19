import Link from "next/link";
import { DiscordIcon } from "~/components/icons";
import { Separator } from "~/components/ui/separator";

export default function Footer() {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#";

  return (
    <footer className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between space-y-6 pb-4 md:flex-row md:space-y-0 md:space-x-6">
        <div className="text-center md:text-left">
          <h2 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
            AI Flow Studio
          </h2>
          <p className="mt-1">Build AI-powered workflows visually.</p>
        </div>

        <Link
          href={discordUrl}
          className="text-gray-400 transition hover:text-white"
          aria-label="Discord"
        >
          <DiscordIcon />
        </Link>
      </div>

      <Separator />

      <p className="pt-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AI Flow Studio. All rights reserved.
      </p>
    </footer>
  );
}
