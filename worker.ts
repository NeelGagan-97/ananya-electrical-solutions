interface AdsStatement {
  bind(...values: unknown[]): AdsStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface AdsDatabase {
  prepare(query: string): AdsStatement;
}

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  DB?: AdsDatabase;
  ADMIN_TOKEN?: string;
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


function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isValidHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function adminAuthorized(request: Request, env: Env): boolean {
  if (!env.ADMIN_TOKEN) return false;
  const supplied = request.headers.get("Authorization") || "";
  const expected = "Bearer " + env.ADMIN_TOKEN;
  if (supplied.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

async function handleAdsRequest(request: Request, env: Env, pathname: string): Promise<Response | null> {
  const method = request.method.toUpperCase();

  if (pathname === "/api/ads" && method === "GET") {
    if (!env.DB) return jsonResponse([]);
    const result = await env.DB.prepare(
      "SELECT id, title, advertiser, description, image_url, kind FROM ads WHERE status = 'active' AND (starts_at IS NULL OR julianday(starts_at) <= julianday('now')) AND (ends_at IS NULL OR julianday(ends_at) >= julianday('now')) ORDER BY created_at DESC LIMIT 12"
    ).all();
    return jsonResponse(result.results || []);
  }

  if (pathname === "/api/admin/ads" || pathname.startsWith("/api/admin/ads/")) {
    if (!adminAuthorized(request, env)) {
      return jsonResponse({ error: env.ADMIN_TOKEN ? "Invalid admin token." : "Admin token is not configured on this Worker." }, 401);
    }
    if (!env.DB) return jsonResponse({ error: "The advertisements database is not connected yet. Create the D1 database and add the DB binding to wrangler.jsonc." }, 503);

    if (pathname === "/api/admin/ads" && method === "GET") {
      const result = await env.DB.prepare("SELECT * FROM ads ORDER BY created_at DESC").all();
      return jsonResponse({ ads: result.results || [] });
    }

    if (pathname === "/api/admin/ads" && method === "POST") {
      const body = await request.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return jsonResponse({ error: "A valid JSON request body is required." }, 400);
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const advertiser = typeof body.advertiser === "string" ? body.advertiser.trim() : "";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const imageUrl = body.image_url;
      const destinationUrl = body.destination_url;
      const kind = body.kind;
      const status = body.status;
      const startsAt = body.starts_at;
      const endsAt = body.ends_at;
      if (!title || title.length > 120 || !advertiser || advertiser.length > 100 || !description || description.length > 300) {
        return jsonResponse({ error: "Title, advertiser and description are required and must be within their length limits." }, 400);
      }
      if (!isValidHttpsUrl(imageUrl) || !isValidHttpsUrl(destinationUrl)) {
        return jsonResponse({ error: "Banner and destination URLs must be valid HTTPS URLs." }, 400);
      }
      if (kind !== "affiliate" && kind !== "direct") return jsonResponse({ error: "Invalid revenue type." }, 400);
      if (status !== "active" && status !== "paused") return jsonResponse({ error: "Invalid campaign status." }, 400);
      const dateIsValid = (value: unknown) => value === null || value === undefined || (typeof value === "string" && !Number.isNaN(Date.parse(value)));
      if (!dateIsValid(startsAt) || !dateIsValid(endsAt)) return jsonResponse({ error: "Invalid campaign date." }, 400);
      if (startsAt && endsAt && Date.parse(String(endsAt)) <= Date.parse(String(startsAt))) return jsonResponse({ error: "End date must be later than start date." }, 400);
      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO ads (id, title, advertiser, description, image_url, destination_url, kind, status, starts_at, ends_at, impressions, clicks, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)"
      ).bind(id, title, advertiser, description, imageUrl, destinationUrl, kind, status, startsAt || null, endsAt || null, new Date().toISOString()).run();
      return jsonResponse({ id }, 201);
    }

    const id = decodeURIComponent(pathname.slice("/api/admin/ads/".length));
    if (!id || id.length > 80) return jsonResponse({ error: "Invalid campaign ID." }, 400);
    if (method === "DELETE") {
      await env.DB.prepare("DELETE FROM ads WHERE id = ?").bind(id).run();
      return jsonResponse({ success: true });
    }
    if (method === "PUT") {
      const body = await request.json().catch(() => null) as Record<string, unknown> | null;
      if (!body) return jsonResponse({ error: "A valid JSON request body is required." }, 400);
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const advertiser = typeof body.advertiser === "string" ? body.advertiser.trim() : "";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const imageUrl = body.image_url;
      const destinationUrl = body.destination_url;
      const kind = body.kind;
      const status = body.status;
      const startsAt = body.starts_at ?? null;
      const endsAt = body.ends_at ?? null;
      if (!title || title.length > 120 || !advertiser || advertiser.length > 100 || !description || description.length > 300) return jsonResponse({ error: "Required fields are missing or exceed their length limits." }, 400);
      if (!isValidHttpsUrl(imageUrl) || !isValidHttpsUrl(destinationUrl)) return jsonResponse({ error: "Banner and destination URLs must be valid HTTPS URLs." }, 400);
      if (kind !== "affiliate" && kind !== "direct") return jsonResponse({ error: "Invalid revenue type." }, 400);
      if (status !== "active" && status !== "paused") return jsonResponse({ error: "Invalid campaign status." }, 400);
      const dateIsValid = (value: unknown) => value === null || value === undefined || (typeof value === "string" && !Number.isNaN(Date.parse(value)));
      if (!dateIsValid(startsAt) || !dateIsValid(endsAt)) return jsonResponse({ error: "Invalid campaign date." }, 400);
      if (startsAt && endsAt && Date.parse(String(endsAt)) <= Date.parse(String(startsAt))) return jsonResponse({ error: "End date must be later than start date." }, 400);
      await env.DB.prepare(
        "UPDATE ads SET title = ?, advertiser = ?, description = ?, image_url = ?, destination_url = ?, kind = ?, status = ?, starts_at = ?, ends_at = ? WHERE id = ?"
      ).bind(title, advertiser, description, imageUrl, destinationUrl, kind, status, startsAt, endsAt, id).run();
      return jsonResponse({ success: true });
    }
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const impressionMatch = pathname.match(/^\/api\/ads\/([a-f0-9-]{36})\/impression$/i);
  if (impressionMatch && method === "POST") {
    if (env.DB) {
      await env.DB.prepare(
        "UPDATE ads SET impressions = impressions + 1 WHERE id = ? AND status = 'active' AND (starts_at IS NULL OR julianday(starts_at) <= julianday('now')) AND (ends_at IS NULL OR julianday(ends_at) >= julianday('now'))"
      ).bind(impressionMatch[1]).run();
    }
    return jsonResponse({ success: true });
  }

  const clickMatch = pathname.match(/^\/go\/([a-f0-9-]{36})$/i);
  if (clickMatch && method === "GET") {
    if (!env.DB) return new Response("Advertisement not available", { status: 404 });
    const ad = await env.DB.prepare(
      "SELECT destination_url FROM ads WHERE id = ? AND status = 'active' AND (starts_at IS NULL OR julianday(starts_at) <= julianday('now')) AND (ends_at IS NULL OR julianday(ends_at) >= julianday('now'))"
    ).bind(clickMatch[1]).first<{ destination_url: string }>();
    if (!ad || !isValidHttpsUrl(ad.destination_url)) return new Response("Advertisement not available", { status: 404 });
    await env.DB.prepare("UPDATE ads SET clicks = clicks + 1 WHERE id = ?").bind(clickMatch[1]).run();
    return new Response(null, { status: 302, headers: { Location: ad.destination_url, "Cache-Control": "no-store" } });
  }

  return null;
}

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

    const adsResponse = await handleAdsRequest(request, env, pathname);
    if (adsResponse) return adsResponse;

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
