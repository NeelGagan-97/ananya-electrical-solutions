interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  ZOHO_CLIENT_ID: string;
  ZOHO_CLIENT_SECRET: string;
  ZOHO_TOKEN_STORE: KVNamespace;
}

const ZOHO_REDIRECT_URI = "https://ananyaelectricalsolutions.com/api/zoho/callback";
const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";

function htmlResponse(title: string, message: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font-family:Arial,sans-serif;max-width:640px;margin:12vh auto;padding:24px;color:#0b192c"><h1>${title}</h1><p>${message}</p><p>You can close this window and return to Ananya Electrical Solutions.</p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
  );
}

async function handleZohoAuthorize(env: Env): Promise<Response> {
  const missing: string[] = [];
  if (!env.ZOHO_CLIENT_ID?.trim()) missing.push("ZOHO_CLIENT_ID");
  if (!env.ZOHO_CLIENT_SECRET?.trim()) missing.push("ZOHO_CLIENT_SECRET");
  if (!env.ZOHO_TOKEN_STORE) missing.push("ZOHO_TOKEN_STORE");
  if (missing.length > 0) {
    return htmlResponse(
      "Zoho setup incomplete",
      `The deployed Worker cannot read these Production settings: ${missing.join(", ")}. Check the binding names and the latest deployment. Credential values are not displayed.`,
      500
    );
  }
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const state = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  await env.ZOHO_TOKEN_STORE.put(`oauth_state:${state}`, "pending", { expirationTtl: 600 });
  const authorizeUrl = new URL("/oauth/v2/auth", ZOHO_ACCOUNTS_URL);
  authorizeUrl.search = new URLSearchParams({
    scope: "ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.READ",
    client_id: env.ZOHO_CLIENT_ID,
    response_type: "code",
    access_type: "offline",
    redirect_uri: ZOHO_REDIRECT_URI,
    state,
    prompt: "consent",
  }).toString();
  return Response.redirect(authorizeUrl.toString(), 302);
}

 
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Direct/same-origin
  const allowed = [
    "https://ananyaelectricalsolutions.com",
    "https://www.ananyaelectricalsolutions.com",
  ];
  if (allowed.includes(origin)) return true;
  if (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.endsWith(".run.app") ||
    origin.endsWith(".pages.dev")
  ) {
    return true;
  }
  return false;
}

function jsonResponse(body: unknown, status = 200, origin?: string | null): Response {
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "https://ananyaelectricalsolutions.com";
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": allowOrigin,
      "Vary": "Origin",
    },
  });
}

function cleanText(value: unknown, maxLength = 1000): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim().slice(0, maxLength);
  if (Array.isArray(value)) return value.map((item) => cleanText(item, 200)).filter(Boolean).join(", ").slice(0, maxLength);
  return "";
}

async function handleZohoLead(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");
  const allowed = isAllowedOrigin(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin && allowed ? origin : "https://ananyaelectricalsolutions.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      },
    });
  }

  if (request.method !== "POST") return jsonResponse({ success: false, error: "Method not allowed" }, 405, origin);
  if (!allowed) return jsonResponse({ success: false, error: "Origin not allowed" }, 403, origin);

  const length = Number(request.headers.get("Content-Length") || "0");
  if (length > 48000) return jsonResponse({ success: false, error: "Submission is too large" }, 413, origin);

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON request" }, 400, origin);
  }

  const formId = cleanText(payload.formId, 80);
  const formTitle = cleanText(payload.formTitle, 160);
  const customerName = cleanText(payload.customerName, 160);
  const contactNumber = cleanText(payload.contactNumber, 40);
  const email = cleanText(payload.email, 160);
  const location = cleanText(payload.location, 240);
  const referenceNumber = cleanText(payload.referenceNumber, 80);
  const submittedAt = cleanText(payload.submittedAt, 80);
  const data = payload.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? (payload.data as Record<string, unknown>) : {};

  if (!formId || !formTitle || !customerName || !contactNumber) {
    return jsonResponse({ success: false, error: "Form type, name and contact number are required" }, 400, origin);
  }
  if (payload.website) return jsonResponse({ success: true, referenceNumber, duplicate: false }, 200, origin);

  if (!env.ZOHO_TOKEN_STORE) {
    return jsonResponse({
      success: false,
      error: "Zoho CRM token storage is not configured.",
      diagnostic: { code: "ZOHO_KV_BINDING_MISSING" },
    }, 503, origin);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `lead_rate:${ip}:${Math.floor(Date.now() / 60000)}`;
  const count = Number((await env.ZOHO_TOKEN_STORE.get(rateKey)) || "0");
  if (count >= 8) return jsonResponse({ success: false, error: "Too many submissions. Please try again shortly." }, 429, origin);
  await env.ZOHO_TOKEN_STORE.put(rateKey, String(count + 1), { expirationTtl: 120 });

  const refreshToken = await env.ZOHO_TOKEN_STORE.get("zoho_refresh_token");
  if (!refreshToken) {
    return jsonResponse({
      success: false,
      error: "Zoho CRM is not connected.",
      diagnostic: { code: "ZOHO_REFRESH_TOKEN_MISSING" },
    }, 503, origin);
  }

  const refreshResponse = await fetch("https://accounts.zoho.in/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  const refreshed = (await refreshResponse.json().catch(() => ({}))) as { access_token?: string; api_domain?: string };
  if (!refreshResponse.ok || !refreshed.access_token) {
    return jsonResponse({ success: false, error: "Zoho authentication failed. Reconnect the CRM integration." }, 502, origin);
  }

  const nameParts = customerName.split(/\s+/).filter(Boolean);
  const lastName = nameParts.length > 1 ? nameParts.pop()! : nameParts[0];
  const firstName = nameParts.join(" ");
  const company = cleanText(data.companyName || data.organizationName || data.companyOrCustomerName || data.nameOrOrg || data.fullNameOrOrg, 160) || "Individual Customer";
  const description = [
    `Website form: ${formTitle} (${formId})`,
    `Website reference: ${referenceNumber || "Not supplied"}`,
    `Submitted at: ${submittedAt || new Date().toISOString()}`,
    location ? `Location: ${location}` : "",
    "Submitted details:",
    ...Object.entries(data).map(([k, v]) => `${cleanText(k, 100)}: ${cleanText(v, 1000)}`),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 32000);

  const apiBase = (refreshed.api_domain || "https://www.zohoapis.in").replace(/\/$/, "");
  const createResponse = await fetch(`${apiBase}/crm/v2/Leads`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${refreshed.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [
        {
          First_Name: firstName || undefined,
          Last_Name: lastName || customerName,
          Company: company,
          Phone: contactNumber,
          Email: email || undefined,
          Lead_Source: "Website",
          Description: description,
        },
      ],
    }),
  });

  const created = (await createResponse.json().catch(() => ({}))) as {
    data?: Array<{ status?: string; code?: string; message?: string; details?: { id?: string; api_name?: string } }>;
    message?: string;
    code?: string;
  };
  const result = created.data?.[0];
  if (!createResponse.ok || result?.status !== "success") {
    // Return only Zoho's validation code/message and field API name; never return tokens or submitted values.
    const diagnostic = {
      zohoCode: result?.code || created.code || "ZOHO_API_ERROR",
      zohoMessage: (result?.message || created.message || "Zoho rejected the Lead").slice(0, 240),
      field: result?.details?.api_name || undefined,
    };
    return jsonResponse({ success: false, error: "Zoho could not create the Lead.", diagnostic }, 502, origin);
  }

  return jsonResponse({ success: true, referenceNumber, zohoLeadId: result.details?.id }, 200, origin);
}

async function handleZohoCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.searchParams.has("error")) {
    return htmlResponse("Zoho authorization not completed", "Zoho returned an authorization error. No token was saved.", 400);
  }
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return htmlResponse("Invalid Zoho callback", "The authorization response is missing its code or state. Please restart the connection.", 400);
  }
  const stateKey = `oauth_state:${state}`;
  const storedState = await env.ZOHO_TOKEN_STORE.get(stateKey);
  if (storedState !== "pending") {
    return htmlResponse("Zoho authorization expired", "This authorization session is invalid or expired. Please start the connection again.", 400);
  }
  await env.ZOHO_TOKEN_STORE.put(stateKey, "used", { expirationTtl: 60 });

  const tokenResponse = await fetch("https://accounts.zoho.in/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      redirect_uri: ZOHO_REDIRECT_URI,
      code,
    }),
  });
  const tokenPayload = await tokenResponse.json() as { refresh_token?: string };
  if (!tokenResponse.ok || !tokenPayload.refresh_token) {
    return htmlResponse("Zoho token exchange failed", "Zoho did not return a refresh token. Check the application credentials and redirect URI, then retry authorization.", 502);
  }
  await env.ZOHO_TOKEN_STORE.put("zoho_refresh_token", tokenPayload.refresh_token);
  return htmlResponse("Zoho connected successfully", "Your Zoho CRM authorization was saved securely in Cloudflare KV. You can close this window.");
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

function isFingerprintedViteAsset(pathname: string): boolean {
  // Vite build emits hashed assets under /assets/ with 8+ char hashes (e.g., index-Bc2VxBhO.js, index-BdQj3jCh.css)
  return pathname.startsWith("/assets/") && /[-.][a-zA-Z0-9_-]{8,}\.(?:js|css|webp|png|jpg|jpeg|svg|woff2|avif)$/.test(pathname);
}

function isStaticMediaAsset(pathname: string): boolean {
  // Production media assets (videos, hero images, diagrams, fonts, icons) under /assets/ or /assets/aistudio/
  return /\.(?:webm|mp4|webp|avif|jpg|jpeg|png|svg|woff2|woff|ttf|gif|ico)$/i.test(pathname);
}

function isVersionedMediaAsset(pathname: string): boolean {
  // Media with version timestamps or content hash suffixes (e.g., _922ef111, _cc86adb8, _20261023131504)
  return /[-_][a-zA-Z0-9]{8,}\.(?:webm|mp4|webp|avif|jpg|jpeg|png|svg)$/i.test(pathname);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && pathname === "/api/zoho/authorize") {
      return handleZohoAuthorize(env);
    }
    if (request.method === "GET" && pathname === "/api/zoho/callback") {
      return handleZohoCallback(request, env);
    }
    if (pathname === "/api/zoho/leads") return handleZohoLead(request, env);

    // Handle static assets with optimized Cache-Control headers
    if (isStaticAsset(pathname)) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (!assetResponse.ok) {
        return assetResponse;
      }

      const headers = new Headers(assetResponse.headers);
      if (isFingerprintedViteAsset(pathname) || isVersionedMediaAsset(pathname)) {
        // Immutable cache for fingerprinted Vite production bundles and versioned media
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
      } else if (isStaticMediaAsset(pathname)) {
        // Long-lived cache for production media (videos, hero images, webp, woff2) with stale-while-revalidate
        // Eliminates Lighthouse "Serve static assets with an efficient cache policy" warning while allowing safe revalidation
        headers.set("Cache-Control", "public, max-age=31536000, stale-while-revalidate=604800");
      } else {
        // Standard caching with revalidation for mutable root public assets (robots.txt, manifests, json)
        headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
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
