import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    sessionId: string;
  }>;
};
export default async function SuccessPage({ params }: Props) {
  const { sessionId } = await params;
  redirect("/pricing");
}
