interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
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
  "/ht-lt-electrical-works": {
    title: "HT/LT Electrical Contractor in Bangalore | 11kV–110kV Substations, VCB & Switchgear Panels",
    description: "Turnkey HT/LT electrical engineering in Bengaluru & Karnataka: 11kV/33kV/66kV/110kV substations, power transformers, VCB/ACB switchgear, busducts, APFC panels, and KPTCL/BESCOM approvals.",
    canonical: "https://ananyaelectricalsolutions.com/ht-lt-electrical-works",
  },
  "/solar-power-solutions": {
    title: "Solar Installation Services in Bengaluru | Commercial & Industrial Rooftop Solar EPC Karnataka",
    description: "Turnkey rooftop and ground-mount solar power installation in Bengaluru & Karnataka. Tier-1 bifacial PV modules, BESCOM/KERC net metering approvals, and high-ROI C&I solar plants.",
    canonical: "https://ananyaelectricalsolutions.com/solar-power-solutions",
  },
  "/about-us": {
    title: "About Ananya Electrical Solutions | Govt. Licensed Super Grade Electrical Contractor Karnataka",
    description: "Learn about Ananya Electrical Solutions, a Government of Karnataka Licensed Super Grade & Class-1 PWD Electrical Contractor headquartered in Sahakarnagar, Bengaluru serving all 31 districts.",
    canonical: "https://ananyaelectricalsolutions.com/about-us",
  },
  "/contact-us": {
    title: "Contact Ananya Electrical Solutions | Sahakarnagar, Bengaluru | Call +91 9632025123",
    description: "Contact Ananya Electrical Solutions at 59, Opp Bank of India, G-Block, Sahakarnagar Main Road, Bengaluru 560092. Call +91 9632025123 or email ananyaelectricalsolutions@gmail.com for quotes & 24/7 support.",
    canonical: "https://ananyaelectricalsolutions.com/contact-us",
  },
};

function isStaticAsset(pathname: string): boolean {
  return /\.[a-zA-Z0-9]{1,8}$/.test(pathname);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    // Keep static files on Cloudflare's asset delivery path.
    if (isStaticAsset(pathname)) {
      return env.ASSETS.fetch(request);
    }

    // Fetch the existing SPA shell; inject route-specific metadata into the
    // initial HTML response so crawlers receive the correct canonical URL.
    const shellUrl = new URL("/index.html", url);
    const shellRequest = new Request(shellUrl.toString(), {
      method: request.method,
      headers: request.headers,
    });
    const response = await env.ASSETS.fetch(shellRequest);

    const metadata = ROUTE_METADATA[pathname];
    if (!response.ok || !metadata || request.method === "HEAD") {
      return response;
    }

    const Rewriter = (globalThis as unknown as {
      HTMLRewriter: new () => {
        on(selector: string, handlers: {
          element(element: {
            setInnerContent(value: string): void;
            setAttribute(name: string, value: string): void;
          }): void;
        }): any;
        transform(response: Response): Response;
      };
    }).HTMLRewriter;

    const transformed = new Rewriter()
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

    // Explicitly declare UTF-8 so non-ASCII metadata (such as curly apostrophes)
    // is decoded correctly by browsers, crawlers, and command-line clients.
    const headers = new Headers(transformed.headers);
    headers.set("Content-Type", "text/html; charset=utf-8");
    return new Response(transformed.body, {
      status: transformed.status,
      statusText: transformed.statusText,
      headers,
    });
  },
};
