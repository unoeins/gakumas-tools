import { setRequestLocale } from "next-intl/server";
import ContestPlayer from "@/components/ContestPlayer";
import { generateMetadataForTool } from "@/utils/metadata";
import { OG_SIZE } from "@/utils/og";

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const metadata = await generateMetadataForTool("contestPlayer", locale, "/contest-player");
  const query = new URLSearchParams(await searchParams).toString();
  metadata.openGraph.images = [{ url: `/api/preview?${query}`, ...OG_SIZE }];

  return metadata;
}

export default async function ContestPlayerPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContestPlayer />;
}
