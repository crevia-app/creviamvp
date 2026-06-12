import { Helmet } from "react-helmet-async";

const BASE_URL      = "https://www.crevia.app";
const DEFAULT_IMAGE = `${BASE_URL}/crevia-logo.png`;

const DEFAULT_TITLE       = "Crevia — The infrastructure to scale your business operations.";
const DEFAULT_DESCRIPTION = "Create premium invoices, chat with teams and clients, share links-in-bio, and unlock Dira AI intelligence.";
const DEFAULT_KEYWORDS    = "invoicing software, invoice generator, business management, AI business assistant, Dira AI, link in bio, client workspace, team collaboration, creative business tools, Crevia";

interface SEOProps {
  title?:       string;
  description?: string;
  keywords?:    string;
  image?:       string;
  imageWidth?:  number;
  imageHeight?: number;
  url?:         string;
  type?:        "website" | "article";
  jsonLd?:      object | object[];
  noIndex?:     boolean;
}

export const SEO = ({
  title       = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords    = DEFAULT_KEYWORDS,
  image       = DEFAULT_IMAGE,
  imageWidth  = 192,
  imageHeight = 192,
  url,
  type        = "website",
  jsonLd,
  noIndex     = false,
}: SEOProps) => {
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | Crevia`;
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords"    content={keywords} />
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      }
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:image"        content={image} />
      <meta property="og:image:width"  content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:alt"    content={`${fullTitle} — Crevia`} />
      <meta property="og:url"          content={canonical} />
      <meta property="og:type"         content={type} />
      <meta property="og:site_name"    content="Crevia" />
      <meta property="og:locale"       content="en_US" />

      {/* Twitter / X */}
      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:site"        content="@creviahq" />
      <meta name="twitter:creator"     content="@creviahq" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />
      <meta name="twitter:image:alt"   content={`${fullTitle} — Crevia`} />

      {/* Page-specific JSON-LD structured data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
};
