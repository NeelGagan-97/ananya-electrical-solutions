interface Env {
  ASSETS: Fetcher;
}

const ROUTE_METADATA: Record<string, { title: string; description: string; canonical: string }> = {
  "/services": {
    title: "Electrical Contracting Services Across Karnataka | HT/LT, Panels & Solar",
    description: "Explore Ananya Electrical Solutions’ electrical engineering services across Karnataka, headquartered in Bengaluru. HT/LT substations, PCC/MCC panels, industrial cabling, testing, earthing, statutory coordination and solar EPC.",
    canonical: "https://ananyaelectricalsolutions.com/services",
  },
  "/electrical-services": {
    title: "Electrical Contracting Services Across Karnataka | HT/LT, Panels & Solar",
    description: "Explore Ananya Electrical Solutions’ electrical engineering services across Karnataka, headquartered in Bengaluru. HT/LT substations, PCC/MCC panels, industrial cabling, testing, earthing, statutory coordination and solar EPC.",
    canonical: "https://ananyaelectricalsolutions.com/services",
  },
};

function isStaticAsset(pathname: string): boolean {
  return /\.[a-zA-Z0-9]{1,8}$/.test(pathname);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Let static files (JS, CSS, images, fonts, sitemap, robots, icons) use
    // Cloudflare's asset delivery path without HTML transformation.
    if (isStaticAsset(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    // Preserve the existing React SPA fallback while selecting the correct
    // route metadata before the HTML reaches crawlers and social previews.
    const shellUrl = new URL("/index.html", url);
    const shellRequest = new Request(shellUrl.toString(), request);
    const response = await env.ASSETS.fetch(shellRequest);

    if (!response.ok || !ROUTE_METADATA[url.pathname]) {
      return response;
    }

    const metadata = ROUTE_METADATA[url.pathname];
    return new HTMLRewriter()
      .on("title", {
        element(element) {
          element.setInnerContent(metadata.title);
        },
      })
      .on('meta[name="description"]', {
        element(element) {
          element.setAttribute("content", metadata.description);
        },
      })
      .on('link[rel="canonical"]', {
        element(element) {
          element.setAttribute("href", metadata.canonical);
        },
      })
      .on('meta[property="og:title"]', {
        element(element) {
          element.setAttribute("content", metadata.title);
        },
      })
      .on('meta[property="og:description"]', {
        element(element) {
          element.setAttribute("content", metadata.description);
        },
      })
      .on('meta[property="og:url"]', {
        element(element) {
          element.setAttribute("content", metadata.canonical);
        },
      })
      .on('meta[name="twitter:title"]', {
        element(element) {
          element.setAttribute("content", metadata.title);
        },
      })
      .on('meta[name="twitter:description"]', {
        element(element) {
          element.setAttribute("content", metadata.description);
        },
      })
      .transform(response);
  },
} satisfies ExportedHandler<Env>;
