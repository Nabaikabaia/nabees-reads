import { Helmet } from "react-helmet-async";

const SITE_NAME = "Nabees Novel Zone";
const SITE_URL = "https://nabeesnovelzone.app";
const DEFAULT_IMAGE =
  "https://aqrmhkzrrmpljrtknrpi.supabase.co/storage/v1/object/public/uploads/2FJA2C.jpg";

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "website" | "article" | "book";
  jsonLd?: Record<string, any>;
}

export default function Seo({
  title,
  description = "Discover and read thousands of novels across every genre on Nabees Novel Zone.",
  image = DEFAULT_IMAGE,
  path = "",
  type = "website",
  jsonLd,
}: SeoProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const trimmedDesc = description.length > 160 ? description.slice(0, 157) + "…" : description;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={trimmedDesc} />
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={trimmedDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={trimmedDesc} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
