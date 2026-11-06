interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const ROUTE_METADATA: Record<string, { title: string; description: string; canonical: string }> = {
  "/": {
    title: "Ananya Electrical Solutions",
    description: "Government-licensed Super Grade electrical contractor headquartered in Bengaluru, serving major cities and towns across Karnataka. HT/LT substations, industrial wiring, BESCOM & CEIG approvals, and rooftop solar.",
    canonical: "https://ananyaelectricalsolutions.com/",
  },
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
  "/projects-gallery": {
    title: "Executed Electrical & Solar Projects in Bengaluru & Karnataka | Ananya Electrical Solutions",
    description: "Explore commissioned 33kV/66kV substations, industrial LT/HT panels, cleanroom electrification, and MW-scale rooftop solar EPC projects across Peenya, Bommasandra, Hosakote, and Mysuru.",
    canonical: "https://ananyaelectricalsolutions.com/projects-gallery",
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
  "/3d-2bhk": {
    title: "Residential 2BHK Interior | 3D IS:732 Wiring Simulator Bengaluru | Ananya Electrical Solutions",
    description: "Interactive 3D Residential 2BHK Interior electrical wiring model in Bengaluru. Inspect IS:732 concealed FRLS conduit routing, MCB/RCCB distribution boards, earthing, and custom room dimensions.",
    canonical: "https://ananyaelectricalsolutions.com/3d-2bhk",
  },
  "/3d-transformer": {
    title: "33kV Substation | 3D Power Transformer & VCB Switchyard Model | Ananya Electrical Bengaluru",
    description: "Explore our interactive 33kV Substation 3D engineering model. Inspect ONAN power transformers, outdoor VCB switchgear, lightning arresters, CT/PT metering, and earth-mat protection.",
    canonical: "https://ananyaelectricalsolutions.com/3d-transformer",
  },
  "/3d-residential-solar": {
    title: "Residential Solar Installation | 3D Rooftop Solar & BESCOM Net-Metering Model | Bengaluru",
    description: "Interactive 3D Residential Solar Installation model on a G+1 Indian RCC house. Inspect 3kWp–10kWp rooftop PV arrays, DCDB/ACDB, string inverter, earthing pits, and BESCOM bi-directional net metering.",
    canonical: "https://ananyaelectricalsolutions.com/3d-residential-solar",
  },
  "/3d-layout": {
    title: "Residential Layout & Infrastructure | 3D Underground XLPE Cabling Model | Bengaluru",
    description: "Interactive 3D Residential Layout & Infrastructure electrification planner. Design 11kV DTR poles, underground armored XLPE cable trenches, feeder pillars, street lighting, and BESCOM BOQ estimates.",
    canonical: "https://ananyaelectricalsolutions.com/3d-layout",
  },
  "/3d-smart-home": {
    title: "Smart Home Automation | 3D IoT Smart Panel & Lighting Control Model | Bengaluru",
    description: "Interactive 3D Smart Home Automation model in Bengaluru. Configure IoT lighting scenes, smart relays, energy monitoring, motorized curtain controls, and home automation distribution.",
    canonical: "https://ananyaelectricalsolutions.com/3d-smart-home",
  },
};

function isStaticAsset(pathname: string): boolean {
  return /\.[a-zA-Z0-9]{1,8}$/.test(pathname);
}

function isContentHashedAsset(pathname: string): boolean {
  // Vite build emits assets under /assets/ with 8+ char hashes (e.g., index-Bc2VxBhO.js, index-C1234567.css)
  return pathname.startsWith("/assets/") && /[-.][a-zA-Z0-9_-]{8,}\.(?:js|css|webp|png|jpg|svg|woff2)$/.test(pathname);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    // Handle static assets with optimized Cache-Control headers
    if (isStaticAsset(pathname)) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (!assetResponse.ok) {
        return assetResponse;
      }

      const headers = new Headers(assetResponse.headers);
      if (isContentHashedAsset(pathname)) {
        // Immutable cache for fingerprinted Vite production bundles
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        // Standard caching with revalidation for non-hashed public assets (icons, robots.txt, manifests)
        headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      }
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
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
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-cache, must-revalidate");
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    interface RewriterElement {
      setInnerContent(value: string): void;
      setAttribute(name: string, value: string): void;
    }

    const Rewriter = (globalThis as unknown as {
      HTMLRewriter: new () => {
        on(selector: string, handlers: {
          element(element: RewriterElement): void;
        }): any;
        transform(response: Response): Response;
      };
    }).HTMLRewriter;

    const transformed = new Rewriter()
      .on("title", {
        element(element: RewriterElement) {
          element.setInnerContent(metadata.title);
        },
      })
      .on('meta[name="description"]', {
        element(element: RewriterElement) {
          element.setAttribute("content", metadata.description);
        },
      })
      .on('link[rel="canonical"]', {
        element(element: RewriterElement) {
          element.setAttribute("href", metadata.canonical);
        },
      })
      .on('meta[property="og:title"]', {
        element(element: RewriterElement) {
          element.setAttribute("content", metadata.title);
        },
      })
      .on('meta[property="og:description"]', {
        element(element: RewriterElement) {
          element.setAttribute("content", metadata.description);
        },
      })
      .on('meta[property="og:url"]', {
        element(element: RewriterElement) {
          element.setAttribute("content", metadata.canonical);
        },
      })
      .on('meta[name="twitter:title"]', {
        element(element: RewriterElement) {
          element.setAttribute("content", metadata.title);
        },
      })
      .on('meta[name="twitter:description"]', {
        element(element: RewriterElement) {
          element.setAttribute("content", metadata.description);
        },
      })
      .transform(response);

    // Explicitly declare UTF-8 and no-cache for HTML to avoid stale SPA shell caching
    const headers = new Headers(transformed.headers);
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("Cache-Control", "no-cache, must-revalidate");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(transformed.body, {
      status: transformed.status,
      statusText: transformed.statusText,
      headers,
    });
  },
};
