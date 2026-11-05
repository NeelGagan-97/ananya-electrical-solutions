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
