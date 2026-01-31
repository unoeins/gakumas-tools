import { setRequestLocale } from "next-intl/server";
import ParameterEstimator from "@/components/ParameterEstimator";
import { generateMetadataForTool } from "@/utils/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return await generateMetadataForTool("estimator", locale);
}

export default async function ParameterEstimatorPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ParameterEstimator />;
}
