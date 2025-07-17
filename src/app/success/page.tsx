import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    sessionId: string;
  }>;
};
export default async function SuccessPage({ params }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sessionId } = await params;
  redirect("/pricing");
}
