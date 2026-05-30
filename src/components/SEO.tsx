import { Helmet } from "react-helmet-async";

const BASE_URL = "https://www.crevia.app";
const DEFAULT_IMAGE = `${BASE_URL}/crevia-logo.png`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

export const SEO = ({
  title = "Crevia - Own Your Story",
  description = "The infrastructure to scale your creative operations. Dira brings the intelligence. Crevia Studio handles the operations.",
  image = DEFAULT_IMAGE,
  url,
  type = "website",
}: SEOProps) => {
  const fullTitle = title === "Crevia - Own Your Story" ? title : `${title} | Crevia`;
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Crevia" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@creviahq" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
