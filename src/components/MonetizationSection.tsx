import React, { useEffect, useRef, useState } from 'react';

type PublicAd = {
  id: string;
  title: string;
  advertiser: string;
  description: string;
  image_url: string;
  kind: 'affiliate' | 'direct';
};

const ADSENSE_CLIENT = (import.meta as any).env?.VITE_ADSENSE_CLIENT || '';
const ADSENSE_SLOT = (import.meta as any).env?.VITE_ADSENSE_SLOT || '';
const ADSENSE_READY = /^ca-pub-\d+$/.test(ADSENSE_CLIENT) && /^\d+$/.test(ADSENSE_SLOT);

function AdSenseSlot() {
  const slotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ADSENSE_READY || !slotRef.current) return;
    const scriptId = 'aes-google-adsense';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
      document.head.appendChild(script);
    }
    try {
      const adsWindow = window as any;
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
      adsWindow.adsbygoogle.push({});
    } catch (error) {
      console.warn('AdSense slot could not be initialized', error);
    }
  }, []);

  if (!ADSENSE_READY) return null;

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Advertisement</p>
      <div ref={slotRef} className="min-h-[100px]">
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

export const MonetizationSection: React.FC = () => {
  const [ads, setAds] = useState<PublicAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch('/api/ads', { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : [])
      .then((items: PublicAd[]) => { if (alive && Array.isArray(items)) setAds(items); })
      .catch(() => { if (alive) setAds([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ads.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        const id = element.dataset.adId;
        if (!id || element.dataset.impressionSent === 'true') return;
        element.dataset.impressionSent = 'true';
        fetch('/api/ads/' + encodeURIComponent(id) + '/impression', { method: 'POST' }).catch(() => undefined);
        observer.unobserve(element);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll<HTMLElement>('[data-ad-id]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ads]);

  return (
    <section id="trusted-product-partners" className="w-full bg-[#f8f9ff] px-6 py-14 lg:px-12 lg:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <div className="flex flex-col gap-3 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0284C7]">Product partners & promotions</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0B192C] sm:text-3xl">Electrical Products & Trusted Brands</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
            Discover electrical products, tools, lighting and energy solutions from participating brands.
            Paid placements and affiliate links are clearly identified.
          </p>
        </div>

        {ads.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <article
                key={ad.id}
                data-ad-id={ad.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <a
                  href={'/go/' + encodeURIComponent(ad.id)}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  aria-label={'View ' + ad.title + ' from ' + ad.advertiser}
                  className="block"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <img src={ad.image_url} alt={ad.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-[#0B192C]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {ad.kind === 'affiliate' ? 'Affiliate link' : 'Sponsored'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0284C7]">{ad.advertiser}</span>
                    <h3 className="text-lg font-bold text-[#0B192C] group-hover:text-[#0284C7]">{ad.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{ad.description}</p>
                    <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-[#006398]">View offer <span aria-hidden="true">→</span></span>
                  </div>
                </a>
                {ad.kind === 'affiliate' && (
                  <p className="border-t border-slate-100 px-4 py-2 text-[10px] leading-relaxed text-slate-500">
                    Affiliate disclosure: Ananya Electrical Solutions may earn a commission from qualifying purchases, at no extra cost to you.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {!loading && ads.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
            <p className="text-sm font-semibold text-[#0B192C]">Product partner placements are coming soon.</p>
            <p className="mt-1 text-xs text-slate-500">Interested brands can enquire about homepage banner placements.</p>
          </div>
        )}

        <AdSenseSlot />

        <div className="relative overflow-hidden rounded-2xl bg-[#071120] px-6 py-8 text-white shadow-xl sm:px-9">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#0284C7]/25 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F59E0B]">Brand partnerships</span>
              <h3 className="mt-2 text-xl font-extrabold sm:text-2xl">Advertise With Ananya</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Are you an electrical manufacturer, distributor or product brand? Enquire about sponsored banners and relevant product placements on our website.
              </p>
            </div>
            <a
              href="mailto:ananyaelectricalsolutions@gmail.com?subject=Advertising%20Partnership%20Enquiry&body=Company%20name%3A%0AContact%20person%3A%0AProduct%20or%20brand%3A%0ACampaign%20duration%3A%0ABanner%20or%20landing%20page%20URL%3A"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#F59E0B] px-5 py-3 text-sm font-extrabold text-[#2a1700] transition hover:bg-amber-400"
            >
              Enquire for placement
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Advertising and affiliate links do not represent an endorsement of product performance. Please review the seller's terms before purchasing.
          {' '}<a href="/privacy-policy" className="font-semibold text-[#006398] underline">Privacy & advertising policy</a>.
        </p>
      </div>
    </section>
  );
};

export const PrivacyPolicyPage: React.FC = () => (
  <main className="min-h-screen bg-[#f8f9ff] px-6 py-16 text-[#0B192C]">
    <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
      <a href="/" className="text-sm font-bold text-[#0284C7]">← Back to Ananya Electrical Solutions</a>
      <h1 className="mt-6 text-3xl font-extrabold">Privacy & Advertising Policy</h1>
      <p className="mt-2 text-xs text-slate-500">Last updated: 7 November 2026</p>
      <div className="mt-8 space-y-5 text-sm leading-7 text-slate-700">
        <section><h2 className="font-bold text-[#0B192C]">Advertising and affiliate links</h2><p>Our website may display sponsored advertisements, affiliate product links and advertisements delivered by third-party advertising providers such as Google. Sponsored placements are labelled. If you follow an affiliate link and make a qualifying purchase, we may receive a commission at no additional cost to you.</p></section>
        <section><h2 className="font-bold text-[#0B192C]">Cookies and advertising technologies</h2><p>Third-party advertising providers may use cookies or similar technologies to deliver, measure and personalise advertisements, subject to your consent where required by applicable law. You can manage cookies through your browser settings and use Google's advertising settings to manage personalised advertising.</p></section>
        <section><h2 className="font-bold text-[#0B192C]">External websites</h2><p>Product and advertiser links may take you to third-party websites. Those websites operate under their own privacy policies, payment terms and return policies. Ananya Electrical Solutions is not responsible for their content or transactions.</p></section>
        <section><h2 className="font-bold text-[#0B192C]">Information we collect</h2><p>If you contact us through an enquiry form, phone, email or WhatsApp, we may process the details you provide to respond to your request and provide our services. We do not request payment card details through this website.</p></section>
        <section><h2 className="font-bold text-[#0B192C]">Contact</h2><p>For privacy or advertising questions, contact Ananya Electrical Solutions at <a className="font-semibold text-[#006398] underline" href="mailto:ananyaelectricalsolutions@gmail.com">ananyaelectricalsolutions@gmail.com</a>.</p></section>
      </div>
    </article>
  </main>
);
