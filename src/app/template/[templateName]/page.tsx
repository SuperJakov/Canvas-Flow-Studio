import ConstructionPage from "~/app/_components/ConstructionPage";

type Props = {
  params: Promise<{
    templateName: string;
  }>;
};

export default async function TemplatePage({ params }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { templateName } = await params;

  return <ConstructionPage />;
}
