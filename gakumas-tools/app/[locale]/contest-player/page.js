import { setRequestLocale } from "next-intl/server";
import ContestPlayer from "@/components/ContestPlayer";
import { generateMetadataForTool } from "@/utils/metadata";

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const metadata = await generateMetadataForTool("contestPlayer", locale);
  const query = new URLSearchParams(await searchParams).toString();
  metadata.openGraph.images = [`/api/preview/?${query}`];

  return metadata;
}

export default async function ContestPlayerPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContestPlayer />;
}
