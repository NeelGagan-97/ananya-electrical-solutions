import React from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck, Home, Lightbulb, Phone, ShieldCheck, Wrench, Zap } from 'lucide-react';
import { openAesEnquiryModal } from '../components/forms';
import { BUSINESS_NAP, trackConversionEvent } from '../utils/seo';

const services = [
  { icon: Zap, title: 'New House Wiring', text: 'Electrical wiring for new homes, apartments and villas.' },
  { icon: Wrench, title: 'Rewiring & Repairs', text: 'Troubleshooting, replacement and repair of existing wiring.' },
  { icon: Lightbulb, title: 'Lighting Installation', text: 'Indoor, outdoor, decorative and functional lighting.' },
  { icon: ShieldCheck, title: 'DB & Protection', text: 'Distribution boards, MCBs, RCCBs and circuit protection.' },
  { icon: CheckCircle2, title: 'Earthing Systems', text: 'Earthing installation, inspection and improvement.' },
  { icon: Home, title: 'Electrical Upgrades', text: 'Switches, sockets, additional points and home upgrades.' },
];

const gallery = [
  { src: '/assets/residential-projects/IMG_20260327_132704.webp', alt: 'Outdoor transformer and electrical installation', title: 'Transformer installation' },
  { src: '/assets/residential-projects/IMG_20260327_133027.webp', alt: 'Electrical LT panel installation', title: 'LT electrical panels' },
  { src: '/assets/residential-projects/IMG_20260327_133033.webp', alt: 'Electrical switchgear control panels', title: 'Switchgear panels' },
  { src: '/assets/residential-projects/IMG_20260508_150605.webp', alt: 'Underground electrical cable trench work', title: 'Underground cable laying' },
  { src: '/assets/residential-projects/IMG_20260508_150635.webp', alt: 'Cable route and site installation work', title: 'Cable route installation' },
  { src: '/assets/residential-projects/IMG_20260630_174256.webp', alt: 'Earthing conduit installation', title: 'Conduit and earthing work' },
  { src: '/assets/residential-projects/IMG20260223151615_BURST000_COVER.webp', alt: 'Electrical distribution board installation', title: 'Distribution board' },
  { src: '/assets/residential-projects/IMG20260327132719_BURST000_COVER.webp', alt: 'Electrical transformer infrastructure', title: 'Electrical infrastructure' },
  { src: '/assets/residential-projects/IMG_20260228_142123.webp', alt: 'Electrical panel installation', title: 'Panel installation' },
  { src: '/assets/residential-projects/IMG_20260327_132446.webp', alt: 'Electrical site installation work', title: 'Site electrical works' },
  { src: '/assets/residential-projects/IMG_20260327_132545.webp', alt: 'Electrical installation project', title: 'Electrical project work' },
];

const process = [
  ['01', 'Submit enquiry', 'Tell us about your property and electrical requirements.'],
  ['02', 'Site visit', 'Our team reviews the site and understands the scope.'],
  ['03', 'Quotation', 'Receive a clear quotation based on the assessed work.'],
  ['04', 'Work execution', 'Work is scheduled and carried out with a focus on safety and quality.'],
];

export const ResidentialElectricalServicesLanding: React.FC = () => {
  const requestVisit = () => openAesEnquiryModal('residential-service');
  const whatsappUrl = `https://wa.me/${BUSINESS_NAP.whatsappNumber}?text=${encodeURIComponent('Hello Ananya Electrical Solutions, I would like to enquire about residential electrical services in Bengaluru.')}`;

  return (
    <div className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-[#071120] text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, transparent 35%, #38bdf8 100%)' }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.15fr_.85fr] md:items-center lg:px-12 lg:py-28">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-[#F59E0B]">Ananya Electrical Solutions · Bengaluru</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">Reliable Residential Electrical Services in Bengaluru</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">From complete home wiring and electrical repairs to lighting, distribution boards and earthing systems, we help keep your home safe and powered.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={requestVisit} className="inline-flex items-center gap-2 rounded-lg bg-[#F59E0B] px-6 py-3.5 font-bold text-slate-950 transition hover:bg-amber-300">Request a Site Visit <ArrowRight size={18} /></button>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackConversionEvent('whatsapp_click', 'Residential landing hero', 'Residential Electrical Landing')} className="rounded-lg border border-white/30 px-6 py-3.5 font-bold text-white hover:bg-white/10">WhatsApp Us</a>
            </div>
            <p className="mt-6 text-sm text-slate-400">Call <a className="font-semibold text-white hover:underline" href={`tel:${BUSINESS_NAP.primaryPhoneTel}`} onClick={() => trackConversionEvent('phone_click', BUSINESS_NAP.primaryPhone, 'Residential landing hero')}>{BUSINESS_NAP.primaryPhone}</a></p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-7 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-300">Home electrical solutions</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {['New wiring', 'Rewiring', 'Lighting', 'DB installation', 'Earthing', 'Repairs'].map((item) => <div key={item} className="rounded-lg bg-white/10 p-4 text-sm font-semibold">{item}</div>)}
            </div>
            <p className="mt-6 text-sm leading-6 text-slate-300">Residential electrical work for houses, apartments and villas across Bengaluru.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">What we do</p><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Residential electrical services</h2><p className="mt-4 leading-7 text-slate-600">Practical electrical solutions for new installations, upgrades and day-to-day requirements.</p></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"><div className="mb-5 inline-flex rounded-lg bg-sky-50 p-3 text-sky-700"><Icon size={23} /></div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </div>
      </section>

      <section className="bg-slate-50 py-16"><div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:px-12"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">Why choose us</p><h2 className="mt-3 text-3xl font-extrabold">Safety-minded work. Clear communication.</h2><p className="mt-4 leading-7 text-slate-600">We focus on understanding the requirement, assessing the site and recommending work suited to the property.</p></div><div className="grid gap-4 sm:grid-cols-2">{[['Quality-focused execution','Attention to workmanship and installation details.'],['Safety-first approach','Protection, earthing and safe installation practices.'],['Clear quotations','Scope and pricing discussed before execution.'],['Residential experience','Solutions for independent homes, apartments and villas.']].map(([title,desc])=><div key={title} className="rounded-xl bg-white p-5 shadow-sm"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">Project gallery</p><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">A look at our electrical work</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Selected site and installation photographs shared by Ananya Electrical Solutions.</p></div><span className="text-sm text-slate-500">11 project photos</span></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{gallery.map((item) => <figure key={item.src} className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><img src={item.src} alt={item.alt} loading="lazy" className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" /><figcaption className="bg-white px-4 py-3 text-sm font-semibold">{item.title}</figcaption></figure>)}</div></section>

      <section className="bg-[#071120] py-16 text-white"><div className="mx-auto max-w-7xl px-6 lg:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#F59E0B]">How it works</p><h2 className="mt-3 text-3xl font-extrabold md:text-4xl">A straightforward service process</h2><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{process.map(([number,title,desc])=><div key={number} className="rounded-xl border border-white/15 p-5"><span className="text-3xl font-black text-sky-300">{number}</span><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{desc}</p></div>)}</div></div></section>

      <section id="residential-enquiry" className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-12 lg:py-20"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-700">Get started</p><h2 className="mt-3 text-3xl font-extrabold">Request a residential site visit</h2><p className="mt-4 leading-7 text-slate-600">Share your requirement with our team. The enquiry form will collect your residential project details.</p><div className="mt-6 space-y-3 text-sm text-slate-700"><p><strong>Phone:</strong> {BUSINESS_NAP.primaryPhone}</p><p><strong>Email:</strong> {BUSINESS_NAP.email}</p><p><strong>Service area:</strong> Bengaluru, Karnataka</p></div></div><div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg"><ClipboardCheck className="text-sky-700" size={30}/><h3 className="mt-4 text-xl font-bold">Residential Electrical Service Request</h3><p className="mt-2 text-sm leading-6 text-slate-600">Full name, contact number, site location, property type and electrical service requirements.</p><button onClick={requestVisit} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#071120] px-6 py-4 font-bold text-white hover:bg-sky-900">Open Enquiry Form <ArrowRight size={18}/></button><p className="mt-3 text-xs text-slate-500">Your enquiry is submitted through the existing Residential Service form and Zoho CRM workflow.</p></div></section>

      <section className="bg-[#F59E0B] px-6 py-10 text-center"><h2 className="text-2xl font-extrabold text-slate-950">Need an electrician for your home?</h2><p className="mt-2 text-slate-800">Speak with Ananya Electrical Solutions in Bengaluru.</p><div className="mt-5 flex justify-center gap-3"><a href={`tel:${BUSINESS_NAP.primaryPhoneTel}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 font-bold text-white"><Phone size={17}/> Call Now</a><a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-950 px-5 py-3 font-bold text-slate-950">WhatsApp</a></div></section>
    </div>
  );
};
