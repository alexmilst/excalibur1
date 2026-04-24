import React, { useState, useEffect, useRef, useCallback } from "react";

const STRIPE = "https://buy.stripe.com/placeholder";
const LOGO_URL = "https://i.ibb.co/rKSp526b/upsclae-logo.png";
const LOGO = LOGO_URL;
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'DM Sans', sans-serif";
const gold = "#C7AB75";

// ── RESPONSIVE HOOK ──
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}


function useInView(th = 0.07) {
  const r = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = r.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: th });
    o.observe(el); return () => o.disconnect();
  }, []);
  return [r, v];
}
function Fade({ children, d = 0, style = {} }) {
  const [r, v] = useInView();
  return (
    <div ref={r} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.85s cubic-bezier(.22,1,.36,1) ${d}s, transform 0.85s cubic-bezier(.22,1,.36,1) ${d}s` }}>
      {children}
    </div>
  );
}


// ── ANIMATED COUNTER (stats bar) ──
function useCountUp(target, inView, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const num = parseInt(target.replace(/\D/g, "")) || 0;
    const suffix = target.replace(/[\d]/g, "");
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(ease * num) + suffix);
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return val || "0";
}

// ── STAT COUNTER COMPONENT (proper component so hook is valid) ──
function StatCounter({ num, suf, label, inView }) {
  const counted = useCountUp(num, inView);
  return (
    <div style={{ background: "#080808", padding: "28px 16px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 600, color: "#C7AB75", lineHeight: 1 }}>{counted}{suf}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#C8C0B8", fontSize: 11, marginTop: 7, fontWeight: 300 }}>{label}</div>
    </div>
  );
}


function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const top = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setPct(height > 0 ? (top / height) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 9999, background: "rgba(199,171,117,.1)" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, rgba(199,171,117,.6), #C7AB75)", transition: "width .1s linear" }} />
    </div>
  );
}

// ── COUNTDOWN TIMER ──
function CountdownTimer({ targetDate }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTime({ d: 0, h: 0, m: 0, s: 0 });
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ d, h, m, s });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
      {[["DAYS", time.d], ["HRS", time.h], ["MIN", time.m], ["SEC", time.s]].map(([label, val]) => (
        <div key={label} style={{ textAlign: "center", background: "rgba(199,171,117,.06)", border: "1px solid rgba(199,171,117,.15)", padding: "14px 18px", minWidth: 68 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 600, color: "#C7AB75", lineHeight: 1 }}>{String(val).padStart(2, "0")}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#908880", letterSpacing: "0.2em", marginTop: 4 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── SHIMMER KEYFRAME INJECTION ──
function ShimmerStyle() {
  useEffect(() => {
    const id = "excalibur-shimmer-style";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes shimmer { 0%,100%{box-shadow:0 0 0 0 rgba(199,171,117,0)} 50%{box-shadow:0 0 18px 2px rgba(199,171,117,.18)} }
      @keyframes modFade { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
      .mod-content { animation: modFade .35s cubic-bezier(.22,1,.36,1) both; }
      .soiree-card { animation: shimmer 3.5s ease-in-out infinite; }
    `;
    document.head.appendChild(s);
  }, []);
  return null;
}


function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ borderBottom: "1px solid #1a1a1a", padding: "26px 0", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: serif, color: "#E0D8D0", fontSize: 19, fontWeight: 600, paddingRight: 24, lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: gold, fontSize: 18, flexShrink: 0, marginTop: 3, transform: open ? "rotate(45deg)" : "none", transition: "transform .4s", display: "inline-block" }}>+</span>
      </div>
      <div style={{ maxHeight: open ? 600 : 0, overflow: "hidden", transition: "max-height .6s cubic-bezier(.22,1,.36,1)" }}>
        <p style={{ fontFamily: sans, color: "#C8C0B8", fontSize: 15, lineHeight: 1.9, marginTop: 16, fontWeight: 300, maxWidth: 680 }}>{a}</p>
      </div>
    </div>
  );
}

// ── DATA ──
const currMods = [
  { slug: "public-speaking", title: "The Art of Public Speaking", months: "", tagline: "Command and own the room.", summary: "A rigorous, progressive training in persuasion, presence, and command — from foundational mechanics to the architecture of influence and rhetorical mastery.", why: "Research consistently shows the ability to communicate persuasively is the single skill most correlated with career success across every field — more than technical expertise or academic achievement. Yet it is almost never taught deliberately in secondary education.", body: "Every consequential career begins the moment a young person stands before others and realises they have something worth saying — and the authority to say it. This discipline is not about presentation tricks or eliminating filler words. It is a serious, progressive training in persuasion, presence, and command.\n\nStudents are trained from the foundations upward: voice control, posture, breath, eye contact, and composure under scrutiny. From there, they advance into the architecture of influence — narrative design, rhetorical strategy, audience psychology, and the ability to hold a room without volume, spectacle, or force.\n\nGrounded in Aristotle's three modes of persuasion — ethos, pathos, and logos — students learn not only what to say, but when, how, and why to say it. By the end of the programme, public speaking becomes second nature: not performance, but authority made visible.", whatYouLearn: ["Voice mechanics — projection, pacing, tone variation, and the power of silence", "Physical presence — posture, eye contact, and gesture that conveys authority rather than anxiety", "Aristotle's three modes: ethos (credibility), pathos (emotion), logos (logic)", "Narrative architecture — how to build tension, deliver clarity, and leave one unforgettable idea", "The five-minute pitch — developed, rehearsed, delivered to progressively demanding audiences", "Impromptu speaking — responding to unexpected questions without losing composure", "Advanced rhetoric — anaphora, antithesis, the rule of three", "The psychology of audience management — reading a room and recovering from mistakes in real time"], outcomes: ["Delivers a structured, compelling pitch to a live audience with composure", "Handles hostile questions without losing their thread", "Has been recorded, reviewed, and coached through multiple live presentations"], quote: "The human voice is the most powerful instrument in the world. The tragedy is that most people never learn to play it." },
  { slug: "financial-literacy", title: "Financial Literacy & Business Acumen", months: "", tagline: "Read money. Build wealth. Think like an owner.", summary: "Far beyond basic budgeting or abstract formulas, this module trains students to read businesses the way founders, executives, and investors do — and to think in terms of ownership rather than employment.", why: "Financial illiteracy is epidemic — not among people who lack intelligence, but among people who were simply never taught. Young people who learn this language early gain a compounding advantage in every financial decision that follows.", body: "Most adults pass through life without ever learning how money actually works. This discipline ensures our students do not. Far beyond basic budgeting or abstract formulas, this module trains students to read businesses the way founders, executives, and investors do.\n\nStudents learn to interpret profit-and-loss statements, understand cash flow, distinguish revenue from profit, and analyse unit economics, pricing power, and incentives. They examine real businesses — what scales, what breaks, and why — and confront the essential question behind every venture: does this business truly work?\n\nAlong the way, students gain fluency in compound growth, equity structures, and risk, developing the judgement required to allocate capital, assess opportunity, and think in terms of ownership rather than employment. By the end of the module, money is no longer mysterious — it is a language they can read, interrogate, and use with confidence.", whatYouLearn: ["Revenue vs. profit — and why the difference matters more than most people understand", "How to read a profit-and-loss statement, balance sheet, and cash flow statement", "Unit economics — customer acquisition cost, lifetime value, contribution margin", "Pricing strategy — cost-plus, value-based, competitive, and dynamic pricing", "Compound interest and the mathematics of long-term wealth building", "Equity structures — how ownership in a company is divided, diluted, and valued", "How investors evaluate businesses — multiples, EBITDA, comparable transactions", "Live financial analysis of real local businesses, presented to guest practitioners"], outcomes: ["Reads and interprets a P&L statement without assistance", "Can explain the unit economics of any business they encounter", "Has presented a financial analysis of a real business to a professional audience"], quote: "Financial literacy is not about being good with numbers. It is about being good with reality." },
  { slug: "ai-technology", title: "AI, Technology & Innovation", months: "", tagline: "Wield the tools reshaping everything.", summary: "Artificial intelligence is not a subject at Excalibur — it is an instrument. Students learn to use AI the way entrepreneurs do: for market research, financial modeling, and competitive analysis.", why: "Students who understand AI as a tool will have a structural advantage over every peer who doesn't — not because AI does their thinking, but because they move faster, think bigger, and execute more precisely than anyone operating without it.", body: "At Excalibur, artificial intelligence is not treated as a standalone subject — it is an instrument. From the first week onward, AI is integrated across disciplines, used the way entrepreneurs, executives, and strategists use it: to compress time, sharpen judgement, and extend human capability.\n\nStudents learn to deploy AI for rapid market research, real-time competitive analysis, and on-demand financial modelling — tasks that once required teams of analysts and weeks of work. They are trained not merely to use tools, but to ask better questions of them.\n\nThe dedicated technology month goes deeper. Students explore how AI functions beneath the surface, build operational tools using no-code and low-code platforms, and learn to distinguish between automation and intelligence. Just as critically, they examine where AI excels — and where human judgement is irreplaceable.\n\nThe result is not technical dependency, but technological command: students who can harness powerful systems without surrendering agency, discernment, or responsibility.", whatYouLearn: ["How large language models actually work — training data, parameters, inference, and limitations", "AI as a business tool — market research, competitive analysis, financial modeling", "Prompt engineering — how to instruct AI to produce reliable, high-quality outputs", "No-code platform development — building functional tools and automations without code", "AI in each industry sector — how technology is disrupting every major field", "Critical evaluation of AI output — when to trust it, when to verify, when to override", "The ethics of AI — bias, IP, job displacement, and builder responsibility", "Building an AI-powered business concept from research through pitch"], outcomes: ["Uses AI tools for research and strategy as a natural workflow, not a novelty", "Has built at least one functional no-code tool or automation", "Can articulate how AI works beneath the interface to someone unfamiliar with it"], quote: "The question is not whether AI will change your industry. It already has. The question is whether you will be the one who changes it further." },
  { slug: "art-of-selling", title: "The Art of Selling", months: "", tagline: "Influence with integrity. Persuade with purpose.", summary: "From social media marketing to nine-figure M&A deals, every outcome in business comes down to selling. This module treats it as a core life skill — training students in real-world selling as it actually happens: rough, unscripted, high-stakes, and consequential.", why: "Everything in life involves selling — an idea, a vision, yourself, your value. The people who do it well are not more manipulative. They are more honest. They understand what the person in front of them needs, and they know how to make the case that what they offer genuinely provides it.", body: "From social media marketing to exclusive offerings, million-dollar real estate listings to nine-figure M&A deals, every outcome in business comes down to selling. This module treats selling as a core life skill, strategy, and a tactic.\n\nStudents are trained in real-world selling as it actually happens: rough, unscripted, high-stakes, and consequential. They learn consultative selling — how to ask the right questions, listen with intent, diagnose real problems, and position solutions with clarity and conviction.\n\nThey study the psychology of persuasion — reciprocity, social proof, scarcity, authority — and analyze how modern masters of marketing and sales deploy these forces across industries.", whatYouLearn: ["Consultative selling — the discipline of asking, listening, and diagnosing before proposing", "Cialdini's six principles of influence: reciprocity, commitment, social proof, authority, liking, scarcity", "The five most common sales objections and the honest, effective response to each", "Needs analysis — identifying what someone actually wants versus what they say they want", "The anatomy of a sales conversation — opening, discovery, presentation, close", "Cold outreach, warm introduction, and referral mechanics", "The ethics of persuasion — where influence ends and manipulation begins", "Live roleplay with recorded feedback from coaches"], outcomes: ["Conducts a complete consultative sales conversation with genuine listening", "Handles objections without defensiveness or pressure", "Can articulate the ethical framework separating trusted advisors from manipulators"], quote: "The best salespeople I have ever met were not great talkers. They were extraordinary listeners who asked better questions than anyone else in the room." },
  { slug: "leadership", title: "Leadership, Ownership & Influence", months: "", tagline: "Lead with earned authority, not borrowed title.", summary: "Leadership is not a personality trait. It is a discipline — and it can be taught. This module examines why people follow, how trust is built, and how real authority is earned.", why: "Leadership is the most misrepresented subject in education. It is taught as a personality trait — something you either have or don't. It is not. It is a set of learnable disciplines: building trust, communicating under pressure, making decisions with incomplete information.", body: "Leadership is not a personality trait. It is a discipline — and it can be taught. This module examines why people follow: the five forms of power, the difference between authority and influence, and why the only form of leadership that endures is the kind people choose freely. Students explore emotional intelligence, conflict resolution, team dynamics, and the invisible work of preparation that separates genuine leaders from those who merely hold titles.", whatYouLearn: ["The five forms of power — legitimate, reward, coercive, expert, referent — and which create lasting authority", "Emotional intelligence — self-awareness, self-regulation, empathy, motivation, and social skill", "Decision-making under uncertainty — frameworks for consequential choices with incomplete information", "Conflict resolution — how to navigate disagreement and maintain relationships across rupture", "Team dynamics — stages of team development and roles within high-performing teams", "The invisible work of leadership — preparation, follow-through, and trust-building habits", "Crisis communication — how to lead when things are going wrong and everyone is watching", "CEO crisis simulation — a live exercise running a fictional company through a real-time emergency"], outcomes: ["Can identify the five forms of power and explain which create lasting influence", "Has led a team through a live crisis simulation", "Can articulate a personal leadership framework as a set of practices, not a personality description"], quote: "The most important single ingredient in the formula of success is knowing how to get along with people. — Theodore Roosevelt" },
  { slug: "business-models", title: "Business Model Analysis", months: "", tagline: "Dissect any business. Understand any market.", summary: "This discipline trains students to see through businesses the way founders, executives, and investors do — at the structural level where money is made, lost, or defended.", why: "Business model literacy is one of the most powerful intellectual skills available — and almost no one teaches it. An Excalibur graduate who can walk into any company and explain its model within five minutes has analytical capability that most MBA graduates can't demonstrate.", body: "This discipline trains students to see through businesses the way founders, executives, and investors do. Not at the surface level of branding or hype — but at the structural level where money is made, lost, or defended.\n\nStudents learn to break down any company — from a neighbourhood café to a global technology firm — and explain, with clarity and precision, how it generates revenue, where costs concentrate, what advantage protects it, and what single failure point could bring it down.\n\nThey learn to ask the questions that actually matter: What drives demand? What scales? What breaks? What kills this business if it goes wrong?\n\nThe result is not theory — but fluency. Students graduate able to analyse, challenge, and understand any business put in front of them.", whatYouLearn: ["The eight business models: subscription, marketplace, DTC, advertising, franchise, freemium, professional services, hardware-plus-consumable", "How to identify a company's core value proposition and revenue capture mechanism", "Competitive advantage analysis — cost leadership, differentiation, focus, network effects", "Vulnerability mapping — identifying the greatest strategic risk in any business model", "Investor Briefing format — how analysts present company analysis to investment committees", "Case studies: Netflix, Apple, Amazon, Airbnb, Costco — iconic business model evolution", "Business model disruption — how it happens and why incumbents fail to respond", "Live deconstruction of local businesses: model, strengths, blind spots"], outcomes: ["Identifies the business model of any company within minutes of exposure", "Delivers a five-minute Investor Briefing on a real public company to a professional audience", "Completes four quarterly business model analyses, progressively more sophisticated"], quote: "A brilliant product in the wrong business model is just an expensive lesson." },
  { slug: "intellectual-depth", title: "Intellectual Depth & The Art of Class", months: "", tagline: "Think deeply. Move effortlessly among ideas.", summary: "True influence is rarely earned through numbers alone. This discipline ensures Excalibur students are not only capable — but distinguished. Formed to converse with ease across philosophy, history, psychology, and the arts.", why: "The difference between a technically skilled professional and a truly exceptional one is almost always intellectual range and social intelligence. These qualities are not decorative — they are the foundation of the presence that makes people trust you, remember you, and choose to work with you.", body: "True influence is rarely earned through numbers alone. In the rooms where real decisions are made — private dinners, boardrooms, salons, galleries, and negotiations — people are assessed for their class, judgement, manners, and intellectual depth. This discipline exists to ensure Excalibur students are not only capable, but distinguished.\n\nStudents are formed to converse with ease across philosophy, history, psychology, and the arts — the shared language of educated societies. They engage with the foundations of aristocratic education: Homer on honour and leadership; Plato and Aristotle on virtue, reason, and rhetoric; Seneca and Marcus Aurelius on self-command and duty; Machiavelli on power, perception, and statecraft.\n\nThis is not academic display. It is social fluency. An Excalibur graduate can enter any room and make an impression through depth: thoughtful questions, cultural awareness, composed manners, and the ability to connect ideas effortlessly. This is the quiet authority that marks true class — the kind that opens doors, builds alliances, and endures long after the meeting ends.", whatYouLearn: ["Stoic philosophy as a practical framework — Marcus Aurelius, Seneca, Epictetus applied to modern business", "The art of patronage — what the Medici teach about investing in human potential and building influence", "Literary analysis for leaders — The Great Gatsby, The Alchemist examined through ambition and meaning", "Historical leadership case studies — Lincoln, Churchill, Mandela, Jobs", "The social arts — formal dining protocol, professional conversation, how to work a room without working it", "How to be remembered — substance, specificity, and genuine curiosity about others", "Writing with precision — expressing a complex idea in one clear, specific sentence", "The intellectual habits of the most accomplished people — how they read, think, and synthesize"], outcomes: ["References classical philosophy and history naturally in professional conversations", "Navigates a formal dinner or professional networking event with ease", "Has developed a personal reading practice and can discuss ideas from at least five significant books"], quote: "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch" },
  { slug: "industry-sectors", title: "Industry Sectors Rotation", months: "One new sector each month", tagline: "Know every industry. Own any room.", summary: "Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. Over ten months, students explore every major sector of modern commerce.", why: "Most people leave education with deep familiarity of one or two sectors and almost no working knowledge of everything else. An Excalibur graduate who can speak with informed intelligence across ten industries has social and professional range that almost no peer can match.", body: "Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. Over ten months, students explore technology, food and hospitality, finance, real estate, e-commerce, healthcare, media, legal services, manufacturing, energy, sports and fitness, and luxury brands. By graduation, every student holds a Sector Journal analyzing all ten industries.", whatYouLearn: ["Technology & AI — platform economics, software margins, how the most valuable companies were built", "Finance & Venture Capital — equity, debt, cap tables, term sheets, how investors decide", "Real Estate — development economics, cap rates, wealth-building mechanics", "Food & Hospitality — unit economics, brand-building in a commoditized market", "E-Commerce & Retail — customer acquisition, lifetime value, supply chains, DTC brands", "Healthcare & Biotech — FDA pathways, healthcare economics, why it requires unusual patience", "Media & Entertainment — attention economics, the creator economy, IP valuation", "Legal & Professional Services — contracts, IP, equity agreements every entrepreneur needs to understand", "Manufacturing & Supply Chain — how physical things are made, moved, and sold at scale", "Energy & Sustainability — renewable economics, carbon markets, the greatest entrepreneurial opportunity ahead", "Sports, Fitness & Wellness — athlete branding, sponsorship, franchise valuation", "Luxury & Premium Brands — psychology of desire, scarcity, heritage, and premium pricing"], outcomes: ["Holds a Sector Journal with twelve completed industry analyses", "Can speak knowledgeably about any of the twelve sectors to a professional in that field", "Has met and engaged with twelve guest speakers from twelve different industries"], quote: "The more industries you understand, the more you realize how similar the underlying principles are — and how different the specifics are. Both things matter." },
];

const sectors = [
  { name: "Technology & AI", n: "01", desc: "Platform economics, software margins, and how the most valuable companies in history were built on code." },
  { name: "Finance & Venture Capital", n: "02", desc: "How money moves, compounds, and builds empires. Equity, debt, cap tables, and investor decision logic." },
  { name: "Real Estate", n: "03", desc: "The oldest wealth-building vehicle in history. Development economics, cap rates, cash flow vs. appreciation." },
  { name: "Food & Hospitality", n: "04", desc: "Unit economics of a restaurant, the hospitality mindset, and how operators like Danny Meyer redefined service." },
  { name: "E-Commerce & Retail", n: "05", desc: "Customer acquisition costs, lifetime value, supply chains, and how the best DTC brands build communities." },
  { name: "Healthcare & Biotech", n: "06", desc: "FDA pathways, healthcare economics, and why healthcare entrepreneurship requires unusual patience and conviction." },
  { name: "Media & Entertainment", n: "07", desc: "How attention is monetized, the creator economy, and the economics of culture." },
  { name: "Legal & Professional Services", n: "08", desc: "The infrastructure of commerce — contracts, IP, and what every entrepreneur interacts with but few understand." },
  { name: "Manufacturing & Supply Chain", n: "09", desc: "How physical things are made, moved, and sold at scale. Sourcing, quality control, inventory economics." },
  { name: "Energy & Sustainability", n: "10", desc: "Renewable energy economics, carbon markets, and the greatest entrepreneurial opportunity of the next generation." },
  { name: "Sports, Fitness & Wellness", n: "11", desc: "Athlete branding, sponsorship economics, franchise valuation, and wellness as a $5 trillion consumer category." },
  { name: "Luxury & Premium Brands", n: "12", desc: "The psychology and economics of desire. How LVMH and Ferrari charge ten times the rational price — and have waitlists." },
];

const speakers = [
  { name: "Sara Blakely", role: "Founder, Spanx · Billionaire Entrepreneur", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face", bio: "Built Spanx from $5,000 to a billion-dollar empire without a single investor. One of the most honest voices in entrepreneurship on the fear and resilience behind building something real." },
  { name: "Gary Vaynerchuk", role: "CEO, VaynerMedia · Serial Entrepreneur", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face", bio: "Turned a $3M liquor store into an $800M media empire. The practitioner's practitioner on brand, hustle, and building in public — with no filter and no patience for excuses." },
  { name: "Daymond John", role: "Founder, FUBU · Shark Tank Investor", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face", bio: "Built FUBU to $6 billion in sales starting with $40 in fabric. Now deploys millions as a Shark Tank investor. His session on the power of broke is legendary." },
  { name: "Kat Cole", role: "Former President, Focus Brands · Operator", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face", bio: "Rose from Hooters waitress to COO of a billion-dollar restaurant group before 35. Her frameworks on operational leadership are unlike anything taught in business school." },
  { name: "Alex Hormozi", role: "Founder, Acquisition.com · Author", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face", bio: "Built and sold multiple businesses, now runs a portfolio doing $200M+ annually. No-nonsense frameworks on offer creation, sales, and building businesses that run without you." },
  { name: "Leila Hormozi", role: "CEO, Acquisition.com · Operator", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=face", bio: "The operational mind behind one of the most admired business portfolios in the world. Unmatched clarity on team-building, culture, and scaling without chaos." },
  { name: "Ryan Serhant", role: "Founder, SERHANT. · Real Estate", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face", bio: "From broke actor to the fastest-growing real estate brokerage in New York history. His teaching on sales psychology and personal brand is both entertaining and deeply actionable." },
  { name: "Lewis Howes", role: "Host, School of Greatness · Author", img: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=300&h=300&fit=crop&crop=face", bio: "Built one of the world's most downloaded podcasts from a sleeping bag on his sister's couch. His work on identity and purpose resonates uniquely with young audiences." },
];

const coaches = [
  {
    name: "Alexander Milstein",
    role: "Founder & CEO",
    img: "https://i.imgur.com/F23ULHv.jpeg",
    isLogo: false,
    shortBio: "Founder & CEO of Excalibur Academy. Designed the full architecture of the academy — curriculum structure, faculty model, real-world engagement programmes, competitions and international pipeline. Built Excalibur on a single conviction: the most consequential thing a young person can develop is an identity forged through real pressure and real achievement.",
    tags: ["Academy Founder", "Program Architect", "Entrepreneurship", "Vision & Strategy"],
    bio: "Alexander founded Excalibur Academy on a single conviction: the most consequential thing a young person can develop is not a skill set — it is an identity. The bone-deep knowledge, earned through real pressure and real achievement, that they are capable of more than the world expects of them. As Founder and CEO, he designed the full architecture of the academy — its curriculum structure, faculty model, real-world engagement programs, competition pipeline, and standard of instruction. He built Excalibur not as a course or a workshop, but as a complete formation experience: a place where young people are taken seriously, held to real standards, and given the kind of experiences that most adults never receive. Every element of the program — from the three-block session format to the Junior Consultant Program to the international distinctions — reflects his conviction that what separates those who lead from those who follow is almost always the quality of their early experiences, and that the right environment, provided early enough, changes everything."
  },
  {
    name: "Bill Morris",
    role: "Academy Director & Senior Instructor",
    img: "https://i.imgur.com/GDkTAdw.jpeg",
    isLogo: false,
    shortBio: "Program Director. Lead Faculty. Became a Wall Street executive at age 30, heading International Finance and Operations for investment bank Kidder Peabody in London, Paris, Geneva, Zurich, Hong Kong and Tokyo. Former Executive Vice President and Chief Financial Officer of Media Arts Group (NYSE Company). Former Citigroup Managing Director with over 100 M&A transactions and 600+ CEO advisory engagements, EVP/CFO of two NYSE-listed companies, TEDx speaker, and published author. Adjunct professor at Georgetown University and UC Irvine's Paul Merage School of Business. Sits on three corporate boards. Has spoken at institutions from West Point to Stanford.",
    tags: ["M&A Strategy", "Finance", "Leadership", "TEDx Speaker", "Author", "Georgetown MBA Professor"],
    bio: "William Morris is a transformational finance and strategy executive with over 30 years of experience at the highest levels of Wall Street, corporate leadership, and executive education. He began his career at Exxon Corporation, earning four promotions in five years, before heading international finance and operations for Kidder Peabody across London, Paris, Geneva, Zurich, Hong Kong, and Tokyo. As Senior Vice President and Managing Director at Geneva Capital Markets — then a division of Citigroup — he completed over 100 closed middle-market M&A transactions and advised more than 600 private-company CEOs on valuation, exits, and strategy. He later served as Executive Vice President and Chief Financial Officer of Media Arts Group, a NYSE-listed company, overseeing financial operations, investor relations, and the company's $450M brand portfolio. A sought-after educator and speaker, Bill is currently an Adjunct Professor at Georgetown University's McDonough School of Business, where he teaches advanced MBA courses on strategic behavior and competitive dynamics. He is the author of The Formula for Success, a TEDx speaker, and the holder of a Guinness World Record — 20,100 consecutive sit-ups in 11 hours and 32 minutes — achieved while raising over $150,000 for the Make-A-Wish Foundation. At Excalibur Academy, Bill serves as Academy Director, overseeing curriculum strategy, faculty coordination, guest speaker programming, and academic standards across all programs."
  },
  {
    name: "Chip Pankow",
    role: "Lead Program Director",
    img: "https://i.imgur.com/Ckny7HG.png",
    isLogo: false,
    shortBio: "Program Director. Lead Faculty. Former CEO who created the world's first autonomous racing series, co-founded a global motorsport franchise broadcast on ESPN and NBC, directed Formula 1 BMW's global program, which developed multiple Formula 1 World Champions including Sebastian Vettel and Nico Rosberg. Secured over $100M in institutional funding. Oversaw a $13 billion NASDAQ listing, establishing a key innovation hub for next-generation electric vehicle platforms. As CEO of Roborace, transformed a conceptual initiative into the world's first autonomous racing competition, achieving a Guinness World Record for autonomous performance. Professional Auto & Rally Racer.",
    tags: ["Entrepreneurship", "Autonomous Systems", "EV Technology", "Global Motorsport", "Startup Scaling", "Institutional Funding"],
    bio: "Chip Pankow is an entrepreneur and chief executive known for building and scaling ventures across technology, mobility, and global sports. Guided by a passion for the projects he pursues, he has consistently translated bold ideas into high-impact platforms through a combination of technical fluency, operational discipline, and decisive execution. In the technology sector, Pankow has led complex, multidisciplinary teams working at the forefront of innovation. As CEO of Roborace, he transformed a conceptual initiative into the world's first autonomous racing competition, delivering industry-first advancements in AI vehicle control, race logic, and real-time digital twin environments. The program achieved a Guinness World Record for autonomous performance and a record-setting run at the Goodwood Festival of Speed. He later led U.S. operations for Arrival, overseeing engineering, software, and simulation teams and contributing to the company's NASDAQ listing, establishing a key innovation hub for next-generation electric vehicle platforms. Pankow's entrepreneurial foundation was built through the creation of globally recognized sports properties. As Founder and CEO of Global Rallycross, he introduced modern rallycross to the United States at X-Games and scaled it into a premier motorsport with drivers including Ken Block, Travis Pastrana and Tanner Foust, featuring broadcast distribution in over 130 countries and partnerships with leading media organizations. Earlier, as Series Director of Formula BMW, he built a leading international driver development platform that became the proven pathway to Formula 1 before its successful transition to new ownership. He also founded Emotive, an experiential marketing company that became a trusted partner to global automotive brands including Ferrari, BMW, Audi, Michelin, and General Motors. Currently, as Chief Executive Officer of SparrowBid, Pankow is leading the development of a next-generation travel marketplace designed to redefine how consumers access and price hotel inventory in this highly competitive $400 billion industry. His success is rooted in his ability to identify opportunity, align stakeholders, and execute at speed — consistently turning passion-driven ideas into scalable, enduring platforms."
  },
  {
    name: "Erik Dostal",
    role: "Senior Program Director",
    img: "https://i.imgur.com/vAvvZud.jpeg",
    isLogo: false,
    shortBio: "Program Director. MBA professor. Founder and CEO of international educational institute serving over 6,000 students across 25 franchises worldwide with campuses in Huntington Beach and Czech Republic, former advisor to a national Ministry of Education of Czech Republic, played for the U.S. Youth National Soccer team, published textbook author, and international academic accreditor.",
    tags: ["Education Systems", "Curriculum Design", "International Accreditation", "Franchise Development", "Entrepreneurship"],
    bio: "Erik Dostal is the founder and president of CA Institute, a comprehensive educational institution he built from the ground up into a leading international provider of English language, business, and professional education — serving over 6,000 students across 25 international franchise locations. Over nearly three decades, Erik has demonstrated what it means to build an educational institution that operates at genuine scale: generating $4.8M in annual revenues, sustaining 20% year-over-year growth, and closing franchise deals spanning multiple continents. He holds an MA in TESOL from the University of Chichester and NILE, an MBA from IDRAC Business School, and a BA in Cultural Anthropology from Chapman University, where he was also a collegiate athlete. A former U.S. Youth National Team soccer player, Erik has channeled his competitive background into youth development, coaching, and the design of high-performance learning environments. He has authored multiple textbooks and publications on teaching methodology, language acquisition, and business education, and has organized international language symposiums attracting thousands of delegates from around the world. A former advisor to the Czech Ministry of Education and a certified international academic accreditor, his work has received recognition including European Small Business Awards recognition across multiple years. At Excalibur Academy, Erik brings the rare combination of deep pedagogical expertise, proven franchise and systems-building experience, and a practitioner's understanding of what it takes to build educational institutions that last."
  },
  {
    name: "Christopher Sanders",
    role: "Public Speaking Senior Instructor",
    img: "https://i.imgur.com/EELzLmn.jpeg",
    isLogo: false,
    shortBio: "Servant Leader, Keynote Speaker, Doctoral Candidate. Public safety professional and leadership-focused educator currently serving as a Deputy Sheriff with the Orange County Sheriff's Department. Alongside his law enforcement role, he teaches criminal justice as an instructor and adjunct professor, and is a doctoral candidate with an MBA background. A keynote speaker and mindset coach, focused on discipline, self-mastery, and personal transformation — bridging real-world public service experience with leadership development and community impact.",
    tags: ["Public Speaking", "Leadership Development", "Mindset Coaching", "Criminal Justice", "MBA", "Doctoral Candidate"],
    bio: "Christopher Sanders is a servant leader, keynote speaker, and doctoral candidate whose career spans law enforcement, higher education, and transformational personal development. A Deputy Sheriff II with the Orange County Sheriff's Department, he brings to every session the clarity, composure, and command presence that comes from operating under genuine high-stakes pressure. He holds an MBA in Strategic Management from Davenport University — graduating with a 3.95 GPA — and is completing a Doctorate in Public Administration at the University of La Verne. He has served as an Adjunct Professor at Rancho Santiago Community College District and at Davenport University, where he taught across multiple disciplines for nearly four years. Beyond the classroom, Christopher runs his own leadership and mindset development seminars — most recently his Living Life Unchained series in Irvine, California — focused on breaking limiting beliefs, building discipline-based systems, and creating lasting behavioral change in adults and young professionals. His StrengthsFinder profile reflects the qualities that define his teaching: Achiever, Futuristic, Focus, Strategic, and Positivity. At Excalibur Academy, Christopher owns the public speaking block that runs through every single session — developing voice mechanics, physical presence, impromptu delivery, advanced rhetoric, and the kind of composure under pressure that most teenagers have never been asked to find."
  },
  {
    name: "Amina Abdulaeva",
    role: "Operations Director",
    img: "https://i.imgur.com/SeOkgm8.jpeg",
    isLogo: false,
    tags: ["Project Coordination", "Operations Management", "Program Launch", "Multilingual", "Stakeholder Management"],
    bio: "Amina Abdulaeva is a multilingual project coordinator and operations professional with over five years of experience delivering complex programs across tourism, entertainment, hospitality, and healthcare. She holds a Master's degree in Labor Economics from Saint Petersburg State University of Economics, a Bachelor's in International and Strategic Management from Saint Petersburg State University, and completed an exchange semester at the Norwegian School of Economics. Her career spans roles of increasing responsibility across sectors — from coordinating end-to-end international tourism programs and managing the full operational launch of a luxury hotel, to leading the business development and execution of a regional tourist entertainment program that achieved 90% B2B market awareness at launch and secured national television coverage. Most recently, she served as Operations and Product Launch Coordinator at a medical private practice, where she designed and launched a new service package that increased the average client transaction by 80%. Fluent in English and Spanish, and a native Russian speaker, Amina brings rare cross-cultural depth and operational precision to every environment she enters. At Excalibur Academy, she oversees all operational and administrative infrastructure — faculty scheduling, venue coordination, student communications, event production, and the logistical execution of every session, competition, and milestone event the academy runs."
  },
  {
    name: "Lead Business Instructor",
    role: "Role to be confirmed",
    img: LOGO,
    isLogo: true,
    tags: ["Business Strategy", "Entrepreneurship", "Leadership"],
    bio: "We are in the final stages of confirming our Lead Business Instructor. This role will be announced shortly. The individual joining in this capacity will bring practitioner-level expertise in business strategy, entrepreneurship, and real-world decision-making — consistent with the standard of every Excalibur faculty member."
  },
  {
    name: "Financial Literacy Instructor",
    role: "Role to be confirmed",
    img: LOGO,
    isLogo: true,
    tags: ["Finance", "Venture Capital", "Business Acumen"],
    bio: "We are in the final stages of confirming our Financial Literacy Instructor. This role will be announced shortly. The individual joining in this capacity will bring direct, practitioner-level experience in finance, investment, or business operations — not academic theory, but the real-world financial fluency we build into every Excalibur student."
  },
];

const handson = [
  { title: "The Junior Consultant Program", tag: "Teams of 4 · Real Business · 3 Weeks", desc: "Student teams are paired with a real local business facing a real challenge. Over three weeks, each team conducts a structured professional engagement: on-site observation, customer interviews, competitive analysis, SWOT assessment, and financial diagnostics. The program culminates in a Boardroom Finale — a formal fifteen-minute presentation to the business owner, with parents and mentors in attendance.", outcome: "A full consulting report, a live presentation to a real client, and the experience of being taken seriously by an adult who had every reason to dismiss them." },
  { title: "The Apprentice Externship", tag: "Individual · Real Company · 4–6 Weeks", desc: "After eight months of formation, each Full Program student is placed inside a real local business in the industry of their choosing. Students attend real meetings, contribute to active projects, and produce three formal deliverables: a Business Map, a reflective journal, and a Recommendation Memo identifying one strategic opportunity the business is currently missing.", outcome: "Three professional-grade deliverables, direct experience inside a working business, and a reference from an employer who has seen them operate under real conditions." },
  { title: "Micro-Business Launch", tag: "Teams · Fully Funded · Real Revenue", desc: "In the program's penultimate month, student teams build actual businesses — real ventures, real customers, real revenue. Every micro-business is funded by a partner from the Excalibur network: a local business owner, alumni parent, guest speaker, or program mentor who provides seed capital, weekly mentorship, and genuine accountability. Students are not playing a simulation.", outcome: "A funded, operating business built with a mentor who has real skin in the outcome — and the irreversible knowledge that you can build something from nothing." },
  { title: "Demo Day & Graduation", tag: "Public · Investors · Press · Parents", desc: "The culminating event. Each team delivers a ten-minute pitch of their micro-business to an audience of parents, mentors, investors, and press. Five judges evaluate on viability, pitch quality, execution evidence, and composure under questioning. Every graduate receives a bound portfolio of their year's work.", outcome: "A public performance before a live investor audience, a bound graduation portfolio, and Alumni status in the Excalibur network." },
];

const distinctions = [
  { tier: "National Champions", label: "Top performers at the Annual National Championship", awards: [
    { title: "European Leadership Immersion", sub: "Crans-Montana, Switzerland", desc: "A fully-funded two-week program at one of Switzerland's most prestigious international schools near Geneva. Students engage with young entrepreneurs from across Europe, attend structured leadership workshops, and participate in cross-cultural business seminars. Flights, accommodation, meals, and tuition fully covered." },
    { title: "Seed Funding Award", sub: "$5,000 in venture capital", desc: "Five thousand dollars in real seed funding, disbursed to the winning team to continue building their business concept. Supported by the Excalibur investor network." },
    { title: "Alps Winter Expedition", sub: "French Alps · Snowboard & Leadership", desc: "A curated five-day mountain expedition in the French Alps — elite snowboard instruction combined with evening leadership sessions. The best thinking happens outside a room." },
  ]},
  { tier: "City Champions", label: "Winners at the biannual City Championship", awards: [
    { title: "Silicon Valley Expedition", sub: "3 days · Fully Organized", desc: "Company headquarters, Stanford campus, a Bay Area co-working workshop, and a curated dinner with a venture capital partner. Students deliver their own pitches on the final day." },
    { title: "New York City Experience", sub: "4 days · Finance & Media Immersion", desc: "NYSE floor, Manhattan co-working workshop, media executive meeting, networking dinner, and a Broadway performance. All-inclusive." },
    { title: "Cash Prize", sub: "$1,000 – $2,500 per category", desc: "Cash awards ranging from one thousand to twenty-five hundred dollars, presented at the live awards ceremony." },
  ]},
  { tier: "Monthly Honors", label: "Top performers at monthly Pitch Nights & events", awards: [
    { title: "Latest Technology Award", sub: "MacBook Pro or equivalent", desc: "The highest-performing student at Monthly Pitch Night receives the latest MacBook Pro or equivalent premium laptop." },
    { title: "The Business Gear Pack", sub: "Premium professional equipment", desc: "Curated gear: premium notebooks, leather portfolio, wireless presentation tools, and Excalibur branded kit valued over $400." },
    { title: "PlayStation & Experience Awards", sub: "Gaming + lifestyle prizes", desc: "Monthly honorees receive PlayStation consoles, concert tickets, fitness memberships, and curated local experiences." },
  ]},
];

const waves = [
  { name: "Wave 1", season: "Spring", dates: "Apr 5 – May 10", deadline: "Mar 20", status: "open", wd: { days: "Tue & Thu", time: "4–7 PM", left: 6 }, we: { days: "Saturday", time: "9 AM–3 PM", left: 4 } },
  { name: "Wave 2", season: "Summer", dates: "Jun 14 – Jul 19", deadline: "May 30", status: "open", wd: { days: "Mon & Wed", time: "10 AM–1 PM", left: 14 }, we: { days: "Saturday", time: "9 AM–3 PM", left: 18 } },
  { name: "Wave 3", season: "Fall", dates: "Sep 13 – Oct 18", deadline: "Aug 28", status: "soon", wd: { days: "Tue & Thu", time: "4–7 PM", left: 25 }, we: { days: "Saturday", time: "9 AM–3 PM", left: 25 } },
  { name: "Wave 4", season: "Winter", dates: "Nov 8 – Dec 13", deadline: "Oct 23", status: "future", wd: { days: "Tue & Thu", time: "4–7 PM", left: 25 }, we: { days: "Saturday", time: "9 AM–3 PM", left: 25 } },
];

// ── SHARED UI ──
const sc = (s) => ({ open: "#5DB075", soon: gold, future: "#444" }[s]);
const sl = (s) => ({ open: "Enrolling Now", soon: "Opening Soon", future: "Future Wave" }[s]);

function SBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ fontFamily: sans, padding: "9px 22px", background: active ? "rgba(199,171,117,.08)" : "transparent", border: `1px solid ${active ? "rgba(199,171,117,.3)" : "#1a1a1a"}`, color: active ? gold : "#555", fontSize: 13, cursor: "pointer", transition: "all .25s", fontWeight: 500 }}>{children}</button>
  );
}
function Eyebrow({ children }) {
  return <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: 5, color: gold, fontWeight: 500, marginBottom: 14 }}>{children}</p>;
}
function SectionTitle({ children, center = false }) {
  return <h2 style={{ fontFamily: serif, fontSize: "clamp(26px,4vw,52px)", fontWeight: 600, color: "#E8E0D8", lineHeight: 1.05, textAlign: center ? "center" : "left" }}>{children}</h2>;
}
function Sub({ children, center = false }) {
  return <p style={{ fontFamily: serif, fontSize: "clamp(15px,2vw,18px)", color: "#C8C0B8", fontStyle: "italic", lineHeight: 1.7, textAlign: center ? "center" : "left", maxWidth: center ? 580 : "100%", margin: center ? "12px auto 0" : "12px 0 0" }}>{children}</p>;
}
function Dot({ solid = false }) {
  return <div style={{ width: 4, height: 4, borderRadius: "50%", background: gold, opacity: solid ? 1 : .4, marginTop: 8, flexShrink: 0 }} />;
}
function Li({ children, solid = false }) {
  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 13, alignItems: "flex-start" }}>
      <Dot solid={solid} />
      <span style={{ fontFamily: sans, fontSize: 14, color: solid ? "#AAA" : "#888", fontWeight: 300, lineHeight: 1.6 }}>{children}</span>
    </div>
  );
}
function Hr() { return <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #1a1a1a 20%, #1a1a1a 80%, transparent)" }} />; }
function GoldBar() { return <div style={{ height: 2, background: gold }} />; }
function DimBar() { return <div style={{ height: 2, background: "rgba(199,171,117,.18)" }} />; }

// ── NAV ──
function NavLink({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <span onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ fontFamily: sans, fontWeight: 500, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: active ? gold : hov ? "#D8D0C8" : "#888", cursor: "pointer", transition: "color .2s", paddingBottom: 3, borderBottom: active ? `1px solid ${gold}` : "1px solid transparent" }}
    >{label}</span>
  );
}
function Nav({ page, setPage }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["PROGRAMS", "programs"], ["CURRICULUM", "curriculum"], ["FACULTY", "faculty"], ["BEYOND", "beyond"], ["ADMISSIONS", "apply"]];
  const go = (p) => { setPage(p); setMenuOpen(false); };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>

        {/* BRAND — name + motto */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, cursor: "pointer" }} onClick={() => go("home")}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "'Forum', 'Copperplate', Georgia, serif", fontWeight: 400, fontSize: isMobile ? 13 : 15, letterSpacing: "0.22em", color: "#E8E0D8", textTransform: "uppercase" }}>Excalibur Academy</span>
            {!isMobile && <span style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.2em", color: gold, textTransform: "uppercase", marginTop: 2, opacity: 0.8 }}>Forging the leaders of tomorrow</span>}
          </div>
        </div>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
            {links.map(([l, p]) => <NavLink key={p} label={l} active={page === p} onClick={() => go(p)} />)}
          </div>
        )}

        {/* Desktop CTA / Mobile hamburger */}
        {!isMobile ? (
          <button onClick={() => go("apply")}
            onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = gold; }}
            onMouseLeave={e => { e.currentTarget.style.background = gold; e.currentTarget.style.color = "#000"; }}
            style={{ fontFamily: sans, background: gold, color: "#000", padding: "0 24px", height: 38, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: `1px solid ${gold}`, cursor: "pointer", transition: "all .25s" }}>
            APPLY NOW
          </button>
        ) : (
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ display: "block", width: 24, height: 1.5, background: menuOpen ? gold : "#E8E0D8", transition: "all .3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ display: "block", width: 24, height: 1.5, background: menuOpen ? gold : "#E8E0D8", transition: "all .3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 24, height: 1.5, background: menuOpen ? gold : "#E8E0D8", transition: "all .3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div style={{ maxHeight: menuOpen ? 400 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.22,1,.36,1)", background: "#080808", borderTop: menuOpen ? "1px solid rgba(199,171,117,.1)" : "none" }}>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
            {links.map(([l, p]) => (
              <div key={p} onClick={() => go(p)} style={{ padding: "16px 0", borderBottom: "1px solid #111", fontFamily: sans, fontSize: 13, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: page === p ? gold : "#D8D0C8", cursor: "pointer" }}>{l}</div>
            ))}
            <button onClick={() => go("apply")} style={{ marginTop: 20, padding: "14px 0", background: gold, color: "#000", border: "none", fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── FOOTER ──
function Footer({ setPage }) {
  const isMobile = useIsMobile();
  return (
    <footer style={{ borderTop: "1px solid #111", padding: isMobile ? "36px 20px" : "44px 40px", background: "#000" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div>
            <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 11, letterSpacing: 3, color: "#C8C0B8" }}>EXCALIBUR ACADEMY</div>
            <div style={{ fontFamily: serif, fontSize: 12, color: "#C0B8B0", marginTop: 2, fontStyle: "italic" }}>Forging the leaders of tomorrow.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[["PROGRAMS", "programs"], ["CURRICULUM", "curriculum"], ["APPLY", "apply"]].map(([l, p]) => (
            <span key={p} onClick={() => setPage(p)} style={{ fontFamily: sans, color: "#C0B8B0", fontSize: 10, cursor: "pointer", transition: "color .2s", letterSpacing: "0.2em", fontWeight: 600, textTransform: "uppercase" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#555"}>{l}</span>
          ))}
        </div>
        <div style={{ width: "100%", borderTop: "1px solid rgba(199,171,117,.08)", marginTop: 24, paddingTop: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: serif, fontSize: 13, color: "#C8C0B8", letterSpacing: "0.08em" }}>apply@excaliburacademy.org</span>
            <span style={{ fontFamily: sans, fontSize: 11, color: "rgba(199,171,117,.4)", margin: "0 12px" }}>·</span>
            <span style={{ fontFamily: serif, fontSize: 13, color: "#C8C0B8", letterSpacing: "0.08em" }}>support@excaliburacademy.org</span>
          </div>
          <div style={{ textAlign: "center", fontFamily: sans, color: "#706860", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            © 2026 Excalibur Academy LLC &nbsp;·&nbsp; 23 Corporate Plaza Dr, Newport Beach, CA &nbsp;·&nbsp; Orange County, California
          </div>
        </div>
      </div>
    </footer>
  );
}


// ─────────────────────────────────────────────
// INTERACTIVE DAILY SCHEDULE
// ─────────────────────────────────────────────
const summerSchedule = [
  { time: "9:30 AM", dur: "45 min", block: "Public Speaking & Rhetoric", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Every morning opens with Christopher Sanders. Warm-up drills, impromptu pitch exercises, voice mechanics, and rhetoric training. By the end of the summer, students will have completed 45+ individual speaking reps. This block sets the energy and standard for everything that follows.", color: "#C7AB75" },
  { time: "10:15 AM", dur: "90 min", block: "Specialist Deep Session", instructor: "Rotating Specialist", role: "Industry Expert · Executive", img: null, desc: "A rotating specialist from business, finance, AI, or their sector delivers deep-content instruction. One discipline per week — financial literacy, business models, AI & technology, sales & marketing. Real case studies, applied exercises, and live Q&A with someone who has operated at the highest level of their field.", color: "#A89060" },
  { time: "11:45 AM", dur: "30 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured break. Students debrief with each other and instructors on what they just covered. Often where the most honest conversations happen.", color: "#555" },
  { time: "12:15 PM", dur: "60 min", block: "Distinguished Guest Speaker", instructor: "Guest Expert", role: "Entrepreneur · Executive · Investor", img: null, desc: "A different industry professional every single day. Entrepreneurs, investors, executives, and innovators who share their story, answer real questions, and give students direct access to the kind of perspective most adults never get. Students submit questions in advance. Every speaker is vetted by the Lead Faculty.", color: "#C7AB75" },
  { time: "1:15 PM", dur: "30 min", block: "Lunch", instructor: null, role: null, img: null, desc: "Catered lunch. Informal networking with guest speakers and faculty. Students practice the social skills they are learning in a real setting.", color: "#555" },
  { time: "1:45 PM", dur: "60 min", block: "The War Room — Real World Block", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Chip leads the session's culminating block. Rotating formats: 'What Would You Have Done?' (real crisis scenarios — students decide, then Chip reveals what actually happened), 'Your Move' (startup rescue simulations with real constraints), and 'Apply It Now' (immediate application of the specialist's content under pressure).", color: "#C7AB75" },
  { time: "2:45 PM", dur: "15 min", block: "Debrief & Preview", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Each day closes with a structured debrief. What was learned. What surprised you. What you will do differently. A preview of tomorrow. Students leave with one specific thing to think about overnight.", color: "#A89060" },
];

const flagshipWeekdaySchedule = [
  { time: "4:00 PM", dur: "40 min", block: "Public Speaking & Rhetoric", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Every session opens with Christopher. Speaking warm-up, impromptu drills, pitch practice, debate exercises, rhetoric training. Students stand up and speak before any other content is delivered — every single session, for ten months. By graduation: 120+ individual speaking reps.", color: "#C7AB75" },
  { time: "4:40 PM", dur: "40 min", block: "The War Room — Real World Block", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Rotates weekly: current events and business news analysis, weekly case study deconstruction (30–40 companies across 10 months), industry guest speaker (one week per month), or an applied workshop where students immediately deploy the specialist's content under real-world pressure.", color: "#C7AB75" },
  { time: "5:20 PM", dur: "40 min", block: "Monthly Specialist", instructor: "Rotating Specialist", role: "Domain Expert · Practitioner", img: null, desc: "The month's specialist delivers their core module content: Finance, AI, Sales, Leadership, Business Models, Intellectual Depth, Consulting, or an Industry Sector. Each specialist is a practitioner with deep real-world experience in their discipline — not a lecturer, but someone who has done the work.", color: "#A89060" },
];

const flagshipSaturdaySchedule = [
  { time: "10:30 AM", dur: "40 min", block: "Public Speaking & Rhetoric — Opening", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Saturday opens identically to weekday sessions: Christopher Sanders leads the speaking warm-up and drills. The standard does not change based on the day.", color: "#C7AB75" },
  { time: "11:10 AM", dur: "50 min", block: "The War Room — Real World Block", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Chip leads the War Room block immediately following the opening. No wait time. No gaps. The session builds momentum consecutively.", color: "#C7AB75" },
  { time: "12:00 PM", dur: "30 min", block: "Lunch Break", instructor: null, role: null, img: null, desc: "Structured lunch. Informal conversation between students and faculty. A deliberate part of the Excalibur experience — social intelligence is not separate from the curriculum.", color: "#555" },
  { time: "12:30 PM", dur: "60 min", block: "Monthly Specialist — Deep Session", instructor: "Rotating Specialist", role: "Domain Expert · Practitioner", img: null, desc: "Saturday's specialist session is longer than weekday sessions — 60 minutes of deep-content instruction. Students have more time to go further into the material, work through case studies, and engage directly with the specialist.", color: "#A89060" },
  { time: "1:30 PM", dur: "60 min", block: "Public Speaking — Advanced Session", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Saturday's second speaking block. Advanced rhetoric, formal pitch structure, debate formats, and persuasive communication. Christopher returns to take students deeper — from mechanics to mastery. The Saturday session is the program's most intensive speaking training of the week.", color: "#C7AB75" },
];

const sixWeekSchedule = [
  { time: "4:00 PM", dur: "40 min", block: "Public Speaking & Rhetoric", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Every session opens with Christopher. Six weeks, twelve sessions — every single one begins with speaking. Warm-up, impromptu drills, pitch coaching, and rhetoric training. Students enter intimidated. They leave fluent.", color: "#C7AB75" },
  { time: "4:40 PM", dur: "40 min", block: "The War Room — Real World Block", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Current events analysis, case study deconstruction, or applied workshops. One industry guest speaker takes this slot once per wave. Students learn to read situations the way senior operators do — quickly, without perfect information.", color: "#C7AB75" },
  { time: "5:20 PM", dur: "55 min", block: "Specialist Deep Session", instructor: "Rotating Specialist", role: "Domain Expert", img: null, desc: "One discipline per week across six weeks. Financial literacy, business models, AI & technology, sales & marketing, leadership, and the social arts. Compressed but complete — the Excalibur curriculum in a high-impact sprint.", color: "#A89060" },
  { time: "6:15 PM", dur: "45 min", block: "Applied Workshop", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Chip closes every session with an applied workshop — students immediately use what the specialist just taught, under real-world constraints. No passive learning. The six-week program ends with a judged Shark Tank Finale.", color: "#C7AB75" },
];

const fieldTrips = [
  { title: "Daytona & Motorsport Racing", tag: "Speed. Strategy. Pressure.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", desc: "A professional racing experience at a premier circuit. Students drive, study race strategy, and debrief with Chip on decision-making under extreme pressure. The lessons apply directly to business: reading conditions in real-time, committing under uncertainty, and leading when the stakes are real.", type: "Weekend" },
  { title: "Silicon Valley — Incubators & Accelerators", tag: "Where the next economy is built.", img: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&q=80", desc: "Behind-the-scenes visits to leading venture capital firms, startup incubators, and accelerators across the Bay Area. Students walk through the environments where the world's most consequential companies began. A curated dinner with a VC partner closes the day.", type: "2-Day" },
  { title: "NYSE — New York Stock Exchange Floor", tag: "The center of global capital.", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", desc: "Access to the NYSE trading floor — one of the most exclusive rooms in American finance. Students meet with market professionals, observe live trading operations, and receive a briefing on how capital markets actually function. Followed by an executive dinner in Manhattan.", type: "3-Day NYC" },
  { title: "Anthropic AI Headquarters", tag: "The frontier of artificial intelligence.", img: "https://images.unsplash.com/photo-1677442135968-6db3b0025e95?w=800&q=80", desc: "A rare visit to one of the world's leading AI safety and research organizations. Students engage with researchers and engineers at the forefront of large language model development — the technology reshaping every industry they will enter.", type: "Day Trip" },
  { title: "SpaceX — Launch & Engineering", tag: "The ambition that changes the species.", img: "https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&q=80", desc: "Behind-the-scenes access to SpaceX's engineering and manufacturing operations. Students see how the world's most ambitious engineering programme is organized, staffed, and executed. A reminder that the biggest ideas in history are built by small teams who refused to accept limits.", type: "Day Trip" },
  { title: "Newport Beach — Ocean & Wellness", tag: "Recovery is part of performance.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", desc: "A structured outdoor day along the Orange County coastline. Water sports, recovery sessions, and an evening debrief at a private venue in Laguna Beach. A deliberate reminder that the best performers are also intentional about recovery, renewal, and the quality of their lives outside work.", type: "Weekend" },
];

// ─────────────────────────────────────────────
// INTERACTIVE DAILY SCHEDULE COMPONENT
// ─────────────────────────────────────────────
function DailyScheduleBlock({ schedule, title, subtitle }) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const block = schedule[active];
  const isBreak = !block.instructor;

  return (
    <div style={{ background: "#07060A", border: "1px solid rgba(199,171,117,.1)" }}>
      {/* Title */}
      <div style={{ padding: isMobile ? "24px 20px 16px" : "28px 36px 20px", borderBottom: "1px solid rgba(199,171,117,.07)" }}>
        <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{title}</p>
        <p style={{ fontFamily: serif, fontSize: isMobile ? 13 : 15, color: "#B0A8A0", fontStyle: "italic" }}>{subtitle}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr" }}>
        {/* Timeline list */}
        <div style={{ borderRight: isMobile ? "none" : "1px solid rgba(199,171,117,.08)", borderBottom: isMobile ? "1px solid rgba(199,171,117,.08)" : "none" }}>
          {schedule.map((s, i) => (
            <div key={i} onClick={() => setActive(i)} style={{ padding: isMobile ? "12px 20px" : "14px 24px", cursor: "pointer", borderLeft: `3px solid ${active === i ? gold : "transparent"}`, background: active === i ? "rgba(199,171,117,.04)" : "transparent", borderBottom: "1px solid rgba(199,171,117,.05)", transition: "all .2s", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                <div style={{ fontFamily: sans, fontSize: 10, color: active === i ? gold : "#706860", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{s.time}</div>
                <div style={{ fontFamily: sans, fontSize: 9, color: "#504840", marginTop: 2 }}>{s.dur}</div>
              </div>
              <div>
                <div style={{ fontFamily: serif, fontSize: isMobile ? 13 : 14, color: active === i ? gold : "#C8C0B8", fontWeight: active === i ? 600 : 400, lineHeight: 1.3 }}>{s.block}</div>
                {s.instructor && <div style={{ fontFamily: sans, fontSize: 9, color: active === i ? "rgba(199,171,117,.6)" : "#605850", marginTop: 2, letterSpacing: "0.06em" }}>{s.instructor}</div>}
              </div>
            </div>
          ))}
        </div>
        {/* Detail panel */}
        <div key={active} className="mod-content" style={{ padding: isMobile ? "24px 20px" : "36px 40px", minHeight: isMobile ? "auto" : 280 }}>
          {isBreak ? (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, color: "#D8D0C8", marginBottom: 12 }}>{block.block}</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: "#B0A8A0", fontWeight: 300, lineHeight: 1.8 }}>{block.desc}</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
                {block.img && (
                  <div style={{ width: 52, height: 52, flexShrink: 0, overflow: "hidden", border: "1px solid rgba(199,171,117,.2)", borderRadius: "50%" }}>
                    <img src={block.img} alt={block.instructor} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={e => e.target.style.display = "none"} />
                  </div>
                )}
                {!block.img && (
                  <div style={{ width: 52, height: 52, flexShrink: 0, border: "1px solid rgba(199,171,117,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: serif, fontSize: 18, color: "rgba(199,171,117,.3)" }}>✦</span>
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 19, color: "#E8E0D8", fontWeight: 600, marginBottom: 3 }}>{block.instructor}</p>
                  <p style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>{block.role}</p>
                </div>
              </div>
              <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 16 }} />
              <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 19, color: gold, fontStyle: "italic", marginBottom: 14 }}>{block.block}</p>
              <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 14, lineHeight: 1.85, color: "#C0B8B0", fontWeight: 300 }}>{block.desc}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
function ModulePage({ slug, setPage }) {
  const isMobile = useIsMobile();
  const mod = currMods.find(m => m.slug === slug);
  if (!mod) return null;
  return (
    <div style={{ background: "#000", paddingTop: 80 }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px 0" : "32px 40px 0" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[["Home", "home"], ["Curriculum", "curriculum"]].map(([l, p]) => (
            <span key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span onClick={() => setPage(p)} style={{ fontFamily: sans, fontSize: 11, color: "#C0B8B0", cursor: "pointer", letterSpacing: 1 }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#555"}>{l}</span>
              <span style={{ color: "#222" }}>/</span>
            </span>
          ))}
          <span style={{ fontFamily: sans, fontSize: 11, color: gold, letterSpacing: 1 }}>{mod.title}</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 40px 60px" }}>
        <Fade>
          <Eyebrow>{mod.months.toUpperCase()}</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(38px,5vw,68px)", fontWeight: 600, color: "#E8E0D8", lineHeight: 1.05, marginBottom: 16, maxWidth: 800 }}>{mod.title}</h1>
          <p style={{ fontFamily: serif, fontSize: 22, color: "#C8C0B8", fontStyle: "italic", lineHeight: 1.6, maxWidth: 680 }}>{mod.tagline}</p>
        </Fade>
      </div>
      <Hr />

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap: isMobile ? 40 : 72, alignItems: "start" }}>
          <div>
            <Fade>
              <Eyebrow>ABOUT THIS MODULE</Eyebrow>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.95, color: "#C8C0B8", fontWeight: 300, marginBottom: 44 }}>{mod.body}</p>
            </Fade>
            <Fade d={.08}>
              <div style={{ background: "#080808", border: "1px solid #151515", borderLeft: `3px solid ${gold}`, padding: "32px 32px", marginBottom: 44 }}>
                <p style={{ fontFamily: serif, fontSize: 21, fontStyle: "italic", color: "#C0B8B0", lineHeight: 1.6 }}>"{mod.quote}"</p>
              </div>
            </Fade>
            <Fade d={.12}>
              <Eyebrow>WHY THIS MATTERS</Eyebrow>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#C8C0B8", fontWeight: 300, marginBottom: 48 }}>{mod.why}</p>
            </Fade>
            <Fade d={.16}>
              <Eyebrow>WHAT YOU WILL LEARN</Eyebrow>
              <div style={{ border: "1px solid #151515" }}>
                {mod.whatYouLearn.map((item, i) => (
                  <div key={i} style={{ padding: "16px 22px", borderBottom: i < mod.whatYouLearn.length - 1 ? "1px solid #0E0E0E" : "none", display: "flex", gap: 16, alignItems: "flex-start", background: i % 2 === 0 ? "#080808" : "#060606" }}>
                    <span style={{ fontFamily: sans, fontSize: 10, color: gold, opacity: .5, letterSpacing: 1, marginTop: 3, flexShrink: 0, fontWeight: 500 }}>0{i + 1}</span>
                    <span style={{ fontFamily: sans, fontSize: 14, color: "#C8C0B8", lineHeight: 1.65, fontWeight: 300 }}>{item}</span>
                  </div>
                ))}
              </div>
            </Fade>
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 90 }}>
            <Fade d={.04}>
              <div style={{ background: "#080808", border: "1px solid #151515", borderTop: `2px solid ${gold}`, padding: "32px 28px", marginBottom: 2 }}>
                <Eyebrow>OUTCOMES</Eyebrow>
                <p style={{ fontFamily: serif, fontSize: 15, color: "#C8C0B8", fontStyle: "italic", marginBottom: 16, lineHeight: 1.5 }}>By the end of this module, every student will:</p>
                {mod.outcomes.map((o, i) => <Li key={i} solid>{o}</Li>)}
              </div>
              <div style={{ background: "#060606", border: "1px solid #151515", borderTop: "none", padding: "22px 28px", marginBottom: 14 }}>
                {[["Schedule", mod.months], ["Program", "Intensive & Full"], ["Location", "Orange County, CA"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", letterSpacing: 1 }}>{k}</span>
                    <span style={{ fontFamily: serif, fontSize: 13, color: "#C8C0B8" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "13px 0", background: gold, color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: 2, border: "none", cursor: "pointer" }}>APPLY NOW →</button>
            </Fade>
            <Fade d={.1}>
              <div style={{ marginTop: 24 }}>
                <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: 3, color: "#C0B8B0", marginBottom: 10, fontWeight: 500 }}>OTHER MODULES</p>
                {currMods.filter(m => m.slug !== slug).slice(0, 5).map((m, i) => (
                  <div key={i} onClick={() => setPage(`module:${m.slug}`)} style={{ padding: "11px 0", borderBottom: "1px solid #0E0E0E", cursor: "pointer" }}>
                    <span style={{ fontFamily: serif, fontSize: 14, color: "#C8C0B8", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#666"}>{m.title} →</span>
                  </div>
                ))}
              </div>
            </Fade>
          </div>
        </div>
      </div>
      <Hr />
      <div style={{ padding: isMobile ? "48px 16px" : "72px 40px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontFamily: serif, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 600, color: "#E8E0D8", marginBottom: 12 }}>This module is part of the complete curriculum.</p>
          <Sub center>Every discipline connects. The full ten months is where the formation becomes complete.</Sub>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            <button onClick={() => setPage("full-program")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "12px 32px", fontSize: 12, fontWeight: 700, letterSpacing: 2, border: "none", cursor: "pointer" }}>VIEW FULL PROGRAM</button>
            <button onClick={() => setPage("curriculum")} style={{ fontFamily: sans, border: `1px solid rgba(199,171,117,.3)`, color: gold, padding: "12px 28px", fontSize: 12, fontWeight: 500, letterSpacing: 1.5, background: "transparent", cursor: "pointer" }}>ALL MODULES</button>
          </div>
        </Fade>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: CURRICULUM INDEX
// ─────────────────────────────────────────────
function CurriculumPage({ setPage }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: "#000", paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "60px 16px 40px" : "80px 40px 60px", textAlign: "center" }}>
        <Fade><Eyebrow>THE CURRICULUM</Eyebrow></Fade>
        <Fade d={.06}><SectionTitle center>Eight Disciplines. One Formation.</SectionTitle><Sub center>Delivered exclusively by those who have built, led, and created in the real world. No career academics. No textbook theory divorced from practice.</Sub></Fade>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 16px 60px" : "0 40px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
          {currMods.map((m, i) => (
            <Fade key={i} d={i * .04}>
              <div onClick={() => setPage(`module:${m.slug}`)} style={{ background: "#080808", padding: "40px 36px", cursor: "pointer", borderTop: "2px solid transparent", transition: "all .3s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0D0D0B"; e.currentTarget.style.borderTopColor = gold; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#080808"; e.currentTarget.style.borderTopColor = "transparent"; }}>
                <Eyebrow>{m.months.toUpperCase()}</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#E8E0D8", lineHeight: 1.2, marginBottom: 8 }}>{m.title}</h3>
                <p style={{ fontFamily: serif, fontSize: 16, fontStyle: "italic", color: "#C8C0B8", marginBottom: 12 }}>{m.tagline}</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.7, color: "#C8C0B8", fontWeight: 300, marginBottom: 16 }}>{m.summary}</p>
                <span style={{ fontFamily: sans, fontSize: 11, color: gold, letterSpacing: 2, fontWeight: 500 }}>Explore module →</span>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: FULL PROGRAM
// ─────────────────────────────────────────────
function FullProgramPage({ setPage }) {
  const isMobile = useIsMobile();
  const [activeMod, setActiveMod] = useState(0);
  return (
    <div style={{ background: "#000", paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "60px 16px 40px" : "80px 40px 56px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(199,171,117,.04) 0%, transparent 70%)" }} />
        <Fade style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow>THE FLAGSHIP PROGRAM</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(40px,5.5vw,70px)", fontWeight: 600, color: "#E8E0D8", lineHeight: 1.05, marginBottom: 16 }}>The Ten-Month Formation</h1>
          <p style={{ fontFamily: serif, fontSize: 20, color: "#C8C0B8", fontStyle: "italic", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>Not a course. Not a workshop. A complete transformation across ten months of deliberate formation.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 40px", fontSize: 12, fontWeight: 700, letterSpacing: 2, border: "none", cursor: "pointer" }}>Apply for Full Program</button>
            <button onClick={() => setPage("intensive")} style={{ fontFamily: sans, border: `1px solid rgba(199,171,117,.3)`, color: gold, padding: "13px 28px", fontSize: 12, fontWeight: 500, letterSpacing: 1.5, background: "transparent", cursor: "pointer" }}>View 6-Week Intensive</button>
          </div>
        </Fade>
      </div>
      <Hr />

      {/* Stats */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "36px 16px" : "56px 40px" }}>
        <Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111" }}>
            {[["10 Months", "of deliberate formation"], ["8 Modules", "full curriculum depth"], ["12 Sectors", "one industry per month"], ["3 Engagements", "real-world experiences"]].map(([v, l], i) => (
              <div key={i} style={{ background: "#080808", padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: gold, lineHeight: 1 }}>{v}</div>
                <div style={{ fontFamily: sans, fontSize: 11, color: "#C0B8B0", marginTop: 6, fontWeight: 300 }}>{l}</div>
              </div>
            ))}
          </div>
        </Fade>
      </div>
      <Hr />

      {/* What & Who */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 60 }}>
            <div>
              <Eyebrow>WHAT THIS IS</Eyebrow>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#C8C0B8", fontWeight: 300, marginBottom: 18 }}>The Full Program is the complete Excalibur formation — ten months of deliberate development across every discipline that defines a consequential career. It is not a series of workshops. It is a year-long transformation built around a cohort of 25 students who challenge each other and graduate with documented, professional-grade experience.</p>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#C8C0B8", fontWeight: 300 }}>Available as Weekday Track (Tue & Thu, 4–7pm) or Weekend Track (every Saturday, 9am–3pm). Both tracks are identical in curriculum and depth. Both share the same milestone events: Monthly Pitch Nights, the consulting project, the externship, the micro-business launch, and Demo Day.</p>
            </div>
            <div>
              <Eyebrow>WHO IT'S FOR</Eyebrow>
              {["Students ages 13–17 who are ready to be challenged — genuinely, not gently", "The teenager who is already curious about business, money, and how the world works", "The student who has never found a program that takes them seriously enough", "The young person whose ambition exceeds what school is prepared to give them", "Students who completed the Intensive and are ready for the complete formation"].map((t, i) => <Li key={i} solid>{t}</Li>)}
            </div>
          </div>
        </Fade>
      </div>
      <Hr />

      {/* 12-Month Arc */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade><Eyebrow>THE TWELVE-MONTH ARC</Eyebrow><SectionTitle>What a Year Looks Like</SectionTitle></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111", marginTop: 36 }}>
            {[
              { m: "Month 1–2", t: "Foundation", items: ["Public Speaking I & II", "Mindset & identity", "First pitch night", "Business model primer"] },
              { m: "Month 3", t: "Financial Literacy", items: ["Reading a P&L", "Unit economics", "Pricing strategy", "Guest: Finance pro"] },
              { m: "Month 4", t: "The Art of Selling", items: ["Consultative selling", "Psychology of persuasion", "Objection handling", "Live roleplay"] },
              { m: "Month 5", t: "AI & Technology", items: ["How AI works", "No-code tools", "AI-powered research", "Build a tool"] },
              { m: "Month 6", t: "Speaking III + Finance II", items: ["Advanced rhetoric", "Investor Briefing I", "Mid-year competition", "Sector: Finance"] },
              { m: "Month 7–8", t: "Junior Consultant", items: ["Assigned to real business", "On-site observation", "Customer research", "Boardroom Finale"] },
              { m: "Month 9", t: "Public Speaking IV", items: ["Advanced narrative", "Sector speaker series", "Externship begins", "City Champ prep"] },
              { m: "Month 10", t: "Leadership", items: ["Five forms of power", "Emotional intelligence", "CEO crisis simulation", "Conflict resolution"] },
              { m: "Month 11", t: "Micro-Business Launch", items: ["Assigned mentor & funding", "Build real venture", "Weekly check-ins", "Revenue target"] },
              { m: "Month 12", t: "Graduation", items: ["Financial Literacy III", "Investor Briefing II", "Demo Day prep", "Portfolio & ceremony"] },
              { m: "Throughout", t: "Sector Rotation", items: ["10 industries, 12 speakers", "Sector Journal", "One case study/month", "Real practitioner every time"] },
              { m: "Throughout", t: "Intellectual Depth", items: ["Stoic philosophy", "Literary analysis", "Social arts", "Writing with precision"] },
            ].map((row, i) => (
              <div key={i} style={{ background: "#080808", padding: "24px 20px", borderTop: i < 4 ? `2px solid rgba(199,171,117,.15)` : "none" }}>
                <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 2, color: gold, marginBottom: 5, fontWeight: 500 }}>{row.m}</p>
                <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#D0C8C0", marginBottom: 10, lineHeight: 1.2 }}>{row.t}</h4>
                {row.items.map((item, j) => <div key={j} style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginBottom: 3, fontWeight: 300 }}>— {item}</div>)}
              </div>
            ))}
          </div>
        </Fade>
      </div>

      {/* Curriculum Explorer */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>EXPLORE THE CURRICULUM</Eyebrow><SectionTitle>Eight Modules in Depth</SectionTitle><Sub>Click any module to read the full description, learning outcomes, and why it matters.</Sub></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px 1fr", border: "1px solid #151515", overflow: "hidden", marginTop: 36 }}>
            <div style={{ background: "#060606", borderRight: "1px solid #151515" }}>
              {currMods.map((m, i) => (
                <div key={i} onClick={() => setActiveMod(i)} style={{ padding: "17px 24px", cursor: "pointer", borderBottom: "1px solid #0E0E0E", borderLeft: `2px solid ${activeMod === i ? gold : "transparent"}`, background: activeMod === i ? "rgba(199,171,117,.03)" : "transparent", transition: "all .25s" }}>
                  <div style={{ fontFamily: serif, fontSize: 19, fontWeight: activeMod === i ? 600 : 400, color: activeMod === i ? gold : "#D8D0C8", lineHeight: 1.3 }}>{m.title}</div>
                  <div style={{ fontFamily: sans, fontSize: 10, color: "#C0B8B0", marginTop: 2 }}>{m.months}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#080808", padding: "40px 40px" }}>
              <Eyebrow>{currMods[activeMod].months.toUpperCase()}</Eyebrow>
              <h3 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#E8E0D8", marginBottom: 6, lineHeight: 1.2 }}>{currMods[activeMod].title}</h3>
              <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic", marginBottom: 18 }}>{currMods[activeMod].tagline}</p>
              <div style={{ marginBottom: 24 }}>{currMods[activeMod].summary.split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.9, color: "#C8C0B8", fontWeight: 300, marginBottom: 16 }}>{para}</p>))}</div>
              <button onClick={() => setPage(`module:${currMods[activeMod].slug}`)} style={{ fontFamily: sans, fontSize: 11, color: gold, letterSpacing: 2, fontWeight: 600, border: `1px solid rgba(199,171,117,.25)`, padding: "9px 18px", background: "transparent", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.target.style.background = "rgba(199,171,117,.06)"} onMouseLeave={e => e.target.style.background = "transparent"}>READ FULL MODULE →</button>
            </div>
          </div>
        </Fade>
      </div>
      <Hr />

      {/* Sectors */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade><Eyebrow>TWELVE INDUSTRIES</Eyebrow><SectionTitle>The Sector Rotation</SectionTitle></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 2, background: "#111", marginTop: 36 }}>
            {sectors.map((s, i) => (
              <div key={i} style={{ background: "#080808", padding: "24px 22px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: sans, fontSize: 10, letterSpacing: 1.5, color: gold, opacity: .5, fontWeight: 500 }}>{s.n}</span>
                  <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#D0C8C0" }}>{s.name}</h4>
                </div>
                <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.65, color: "#C8C0B8", fontWeight: 300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      {/* Tracks */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>SCHEDULE OPTIONS</Eyebrow><SectionTitle>Weekday or Weekend Track</SectionTitle></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111", marginTop: 36 }}>
            {[
              { label: "WEEKDAY TRACK", schedule: "Tuesday & Thursday · 4:00–7:00 PM", details: ["3-hour sessions after school, 6 days per week", "~96 sessions over 10 months · 18 hrs/month", "Guest speakers every Thursday", "Shared events: competitions, Demo Day, externship"] },
              { label: "WEEKEND TRACK", schedule: "Every Saturday · 9:00 AM–3:00 PM", details: ["Full-day immersion — deeper workshop time", "~48 Saturdays over 10 months · 6 hrs each", "Guest speakers attend in-person all morning", "Shared events: competitions, Demo Day, externship"] },
            ].map((t, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 32px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.2)"}` }}>
                <Eyebrow>{t.label}</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 22, color: "#E8E0D8", fontWeight: 600, marginBottom: 20 }}>{t.schedule}</h3>
                {t.details.map((d, j) => <Li key={j}>{d}</Li>)}
              </div>
            ))}
          </div>
        </Fade>
      </div>
      <Hr />

      {/* Tuition */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><div style={{ textAlign: "center", marginBottom: 40 }}><Eyebrow>TUITION</Eyebrow><SectionTitle center>Two Membership Tiers</SectionTitle></div></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
            {[
              { tier: "MONTHLY", price: "$1,990", period: "/month", limit: "", features: ["Full 10-month curriculum", "Weekday or Weekend Track", "All guest speakers & sector rotation", "Junior Consultant engagement", "Apprentice Externship placement", "Micro-Business Launch", "Monthly Pitch Night eligibility", "Bound graduation portfolio", "Alumni network access"], accent: false },
              { tier: "ANNUAL", price: "$1,490", period: "/month", limit: "FOUNDING RATE", features: ["Full 10-month curriculum — identical access", "Reserved seat for the full academic year", "Preferred scheduling and priority placement", "Junior Consultant & Externship access", "Micro-Business Launch with dedicated mentor", "Bound graduation portfolio", "Alumni network access"], accent: true },
            ].map((t, i) => (
              <div key={i} style={{ background: "#080808", padding: "40px 32px", position: "relative", borderTop: `2px solid ${t.accent ? gold : "rgba(199,171,117,.15)"}` }}>
                {t.limit && <span style={{ position: "absolute", top: 16, right: 20, fontFamily: sans, background: "rgba(199,171,117,.1)", color: gold, padding: "3px 10px", fontSize: 9, fontWeight: 600, letterSpacing: 1.5 }}>{t.limit}</span>}
                <Eyebrow>{t.tier}</Eyebrow>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontFamily: serif, fontSize: 44, fontWeight: 600, color: "#E8E0D8" }}>{t.price}</span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0" }}>{t.period}</span>
                </div>
                {t.features.map((f, j) => <Li key={j} solid={t.accent}>{f}</Li>)}
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", marginTop: 24, padding: "12px 0", background: t.accent ? gold : "transparent", border: t.accent ? "none" : `1px solid rgba(199,171,117,.25)`, color: t.accent ? "#000" : gold, fontSize: 11, fontWeight: t.accent ? 700 : 600, letterSpacing: 2, cursor: "pointer" }}>{t.accent ? "APPLY — ELITE" : "APPLY — CORE"}</button>
              </div>
            ))}
          </div>
        </Fade>
        <Fade d={.12}><p style={{ textAlign: "center", fontFamily: sans, color: "#C0B8B0", fontSize: 12, marginTop: 18 }}>Annual prepayment at 10% reduction. Sibling discount: 15%. Need-based scholarships available.</p></Fade>
      </div>

      <div style={{ padding: isMobile ? "48px 16px" : "72px 40px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(30px,4vw,52px)", fontWeight: 600, color: "#E8E0D8", marginBottom: 12, lineHeight: 1.1 }}>The Founding Class<br /><span style={{ color: gold }}>is forming now.</span></h2>
          <Sub center>Twenty-five places. One year. The beginning of something that lasts a lifetime.</Sub>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 44px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, border: "none", cursor: "pointer", marginTop: 32 }}>APPLY FOR THE FULL PROGRAM</button>
        </Fade>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: 6-WEEK INTENSIVE
// ─────────────────────────────────────────────
function IntensivePage({ setPage }) {
  const isMobile = useIsMobile();
  const [activeWave, setActiveWave] = useState(0);
  return (
    <div style={{ background: "#000", paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "60px 16px 40px" : "80px 40px 56px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(199,171,117,.03) 0%, transparent 70%)" }} />
        <Fade style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow>SIX-WEEK INTENSIVE</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 600, color: "#E8E0D8", lineHeight: 1.05, marginBottom: 16 }}>The Ignition.</h1>
          <p style={{ fontFamily: serif, fontSize: 20, color: "#C8C0B8", fontStyle: "italic", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 36px" }}>Six weeks of concentrated formation — the full Excalibur curriculum, compressed into a single intensive sprint. The best entry point into the academy and a powerful standalone experience.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 40px", fontSize: 12, fontWeight: 700, letterSpacing: 2, border: "none", cursor: "pointer" }}>Apply for Intensive</button>
            <button onClick={() => setPage("full-program")} style={{ fontFamily: sans, border: `1px solid rgba(199,171,117,.3)`, color: gold, padding: "13px 28px", fontSize: 12, fontWeight: 500, letterSpacing: 1.5, background: "transparent", cursor: "pointer" }}>View Full Program</button>
          </div>
        </Fade>
      </div>
      <Hr />

      {/* Stats */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "36px 16px" : "56px 40px" }}>
        <Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111" }}>
            {[["6 Weeks", "intensive program"], ["2 Tracks", "weekday & weekend"], ["25 Seats", "per cohort"], ["4 Waves", "launching in 2026"]].map(([v, l], i) => (
              <div key={i} style={{ background: "#080808", padding: "24px 18px", textAlign: "center" }}>
                <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: gold }}>{v}</div>
                <div style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginTop: 5, fontWeight: 300 }}>{l}</div>
              </div>
            ))}
          </div>
        </Fade>
      </div>
      <Hr />

      {/* Tracks */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>TWO TRACKS PER WAVE</Eyebrow><SectionTitle>Choose Your Schedule</SectionTitle><Sub>Same curriculum. Same caliber. Different days.</Sub></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111", marginTop: 36 }}>
            {[
              { label: "WEEKDAY TRACK", schedule: "Tuesday & Thursday · 4–7 PM", detail: "3-hour sessions · 18 total hours · 6 sessions", items: ["Fits any weekend schedule", "Guest speakers on Thursdays", "Shared Demo Day — final Saturday"] },
              { label: "WEEKEND TRACK", schedule: "Every Saturday · 9 AM–3 PM", detail: "6-hour sessions · 36 total hours · 6 Saturdays", items: ["Full-day immersion — deeper workshops", "Guest speakers in-person all morning", "Shared Demo Day — 6th Saturday"] },
            ].map((t, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 32px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.2)"}` }}>
                <Eyebrow>{t.label}</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 24, color: "#E8E0D8", fontWeight: 600, marginBottom: 6 }}>{t.schedule}</h3>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#C0B8B0", marginBottom: 20 }}>{t.detail}</p>
                {t.items.map((d, j) => <Li key={j}>{d}</Li>)}
              </div>
            ))}
          </div>
        </Fade>
      </div>
      <Hr />

      {/* 6-week arc */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade><Eyebrow>THE SIX-WEEK ARC</Eyebrow><SectionTitle>What Six Weeks Looks Like</SectionTitle></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "repeat(6, 1fr)", gap: 2, background: "#111", marginTop: 36 }}>
            {[
              { w: "Week 1", t: "Foundation", items: ["Mindset & identity", "What leaders share", "60-sec pitch"], hi: false },
              { w: "Week 2", t: "Business Models", items: ["8 model archetypes", "Real case study", "Unit economics"], hi: true },
              { w: "Week 3", t: "Money & Sales", items: ["Reading a P&L", "Consultative selling", "Objection handling"], hi: false },
              { w: "Week 4", t: "AI & Strategy", items: ["AI as biz tool", "Market research", "Competitive analysis"], hi: true },
              { w: "Week 5", t: "Leadership", items: ["Five forms of power", "Crisis simulation", "Team dynamics"], hi: false },
              { w: "Week 6", t: "Demo Day", items: ["Live investor pitch", "Graduation ceremony", "Portfolio awarded"], hi: true },
            ].map((row, i) => (
              <div key={i} style={{ background: row.hi ? "#0A0A08" : "#080808", padding: "24px 16px", borderTop: `2px solid ${row.hi ? gold : "transparent"}` }}>
                <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 2, color: gold, marginBottom: 6, fontWeight: 500 }}>{row.w}</p>
                <h4 style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#D0C8C0", marginBottom: 10, lineHeight: 1.2 }}>{row.t}</h4>
                {row.items.map((item, j) => <div key={j} style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginBottom: 3, fontWeight: 300 }}>— {item}</div>)}
              </div>
            ))}
          </div>
        </Fade>
      </div>

      {/* Wave Calendar */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>2026 WAVE CALENDAR</Eyebrow><SectionTitle>Four Waves. Eight Cohorts.</SectionTitle></Fade>
        <Fade d={.08}>
          <div style={{ display: "flex", gap: 8, marginTop: 32, marginBottom: 28, flexWrap: "wrap" }}>
            {waves.map((w, i) => <SBtn key={i} active={activeWave === i} onClick={() => setActiveWave(i)}>{w.name} · {w.season}</SBtn>)}
          </div>
          <div style={{ border: "1px solid #151515" }}>
            <div style={{ background: "#060606", padding: "22px 32px", borderBottom: "1px solid #151515", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#E8E0D8", marginBottom: 3 }}>{waves[activeWave].name} — {waves[activeWave].season} 2026</h3>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#C8C0B8", fontWeight: 300 }}>{waves[activeWave].dates} · Applications close {waves[activeWave].deadline}</p>
              </div>
              <span style={{ fontFamily: sans, fontSize: 10, letterSpacing: 2, padding: "5px 12px", border: `1px solid ${sc(waves[activeWave].status)}`, color: sc(waves[activeWave].status) }}>{sl(waves[activeWave].status)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
              {[{ label: "WEEKDAY TRACK A", t: waves[activeWave].wd }, { label: "WEEKEND TRACK B", t: waves[activeWave].we }].map(({ label, t }, i) => {
                const filled = 25 - t.left;
                return (
                  <div key={i} style={{ background: "#080808", padding: "28px 28px" }}>
                    <Eyebrow>{label}</Eyebrow>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      {[["Days", t.days], ["Time", t.time], ["Duration", "6 Weeks"], ["Location", "Orange County"]].map(([k, v]) => (
                        <div key={k}><div style={{ fontFamily: sans, fontSize: 9, letterSpacing: 1.5, color: "#C0B8B0", marginBottom: 3 }}>{k}</div><div style={{ fontFamily: serif, fontSize: 14, color: "#A8A0A0" }}>{v}</div></div>
                      ))}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 11, color: "#C0B8B0", marginBottom: 5, display: "flex", justifyContent: "space-between" }}>
                      <span>{filled} enrolled</span>
                      <span style={{ color: t.left < 8 ? gold : "#555" }}>{t.left} remaining</span>
                    </div>
                    <div style={{ height: 2, background: "#151515" }}><div style={{ height: "100%", width: `${(filled / 25) * 100}%`, background: "#4DB87A" }} /></div>
                    {waves[activeWave].status === "open" && <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", marginTop: 16, padding: "9px 0", border: "1px solid rgba(199,171,117,.18)", color: gold, fontSize: 10, fontWeight: 600, letterSpacing: 2, background: "transparent", cursor: "pointer" }}>APPLY FOR THIS TRACK →</button>}
                  </div>
                );
              })}
            </div>
          </div>
        </Fade>
      </div>
      <Hr />

      {/* Tuition */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>TUITION</Eyebrow>
          <div style={{ background: "#080808", border: "1px solid #151515", borderTop: `2px solid ${gold}`, padding: "44px 36px" }}>
            <div style={{ fontFamily: serif, fontSize: 48, fontWeight: 600, color: "#E8E0D8", lineHeight: 1 }}>$2,500</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", marginBottom: 24 }}>per wave · all-inclusive</div>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#C8C0B8", lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>Includes all six sessions, guest speaker access, materials, and bound graduation portfolio. Lunch included on Weekend Track Demo Day.</p>
            <p style={{ fontFamily: sans, fontSize: 12, color: "#C8C0B8", marginBottom: 28 }}>Intensive graduates who enroll in the Full Program receive a $500 credit toward their first month's tuition.</p>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 44px", fontSize: 12, fontWeight: 700, letterSpacing: 2, border: "none", cursor: "pointer" }}>APPLY FOR THE INTENSIVE</button>
          </div>
        </Fade>
      </div>
    </div>
  );
}

// ── Day Schedule Tab + Content — stateful at module level ──
const daySchedState = { active: "summer-sched" };
function DaySchedBtn({ id, label }) {
  const [, forceUpdate] = useState(0);
  const isActive = daySchedState.active === id;
  return (
    <button onClick={() => { daySchedState.active = id; forceUpdate(n => n + 1); document.querySelectorAll("[data-daysched]").forEach(el => el.dispatchEvent(new Event("daysched"))); }} style={{ fontFamily: sans, padding: "9px 18px", background: isActive ? "rgba(199,171,117,.08)" : "transparent", border: `1px solid ${isActive ? "rgba(199,171,117,.4)" : "rgba(199,171,117,.12)"}`, color: isActive ? gold : "#C8C0B8", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: isActive ? 600 : 400, transition: "all .2s" }}>{label}</button>
  );
}
function DaySchedContent() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState("summer-sched");
  useEffect(() => {
    const el = document.querySelector("[data-daysched]");
    if (!el) return;
    const h = () => setActive(daySchedState.active);
    el.addEventListener("daysched", h);
    return () => el.removeEventListener("daysched", h);
  }, []);
  const map = {
    "summer-sched": { sched: summerSchedule, title: "Summer Intensive", subtitle: "Monday – Friday · 9:30 AM – 3:00 PM · July 6–17 & August 3–14, 2026" },
    "flagship-wd": { sched: flagshipWeekdaySchedule, title: "Ten-Month Flagship — Weekday Track", subtitle: "Tuesday & Thursday · 4:00–6:15 PM · September 2026 – June 2027" },
    "flagship-sat": { sched: flagshipSaturdaySchedule, title: "Ten-Month Flagship — Saturday Track", subtitle: "Every Saturday · 10:30 AM–3:00 PM · September 2026 – June 2027" },
    "six-week": { sched: sixWeekSchedule, title: "Six-Week Intensive", subtitle: "Monday & Wednesday · 4:00–7:00 PM · Four waves per year" },
  };
  const entry = map[active] || map["summer-sched"];
  return <div data-daysched="1"><DailyScheduleBlock schedule={entry.sched} title={entry.title} subtitle={entry.subtitle} /></div>;
}

// ─────────────────────────────────────────────
// PAGE: PROGRAMS OVERVIEW
// ─────────────────────────────────────────────
function ProgramsPage({ setPage }) {
  const isMobile = useIsMobile();
  const [activeWave, setActiveWave] = useState(0);

  const programs = [
    {
      tag: "SUMMER INTENSIVE", id: "summer", flagship: false, status: "● ENROLLING NOW", statusColor: "#4DB87A",
      title: "Summer Intensive", tagline: "Two weeks. Full days. Real stakes.",
      price: "$4,500+ / wave", priceNote: "Includes lunch, field trip, guest speakers & Shark Tank Finale",
      desc: "A two-week, full-day immersive program running Monday through Friday across two waves — July and August. Students rotate through all core disciplines with guest speakers every single day, a field trip to a real business, and a formal Shark Tank Finale where they pitch business concepts to real judges for cash prizes.",
      schedule: "Monday – Friday · 9:30 AM – 3:00 PM · Two waves: July & August",
      students: "20 students per wave",
      features: ["All eight curriculum disciplines across two weeks", "Guest speaker every single day — real entrepreneurs and executives", "Full-day interactive sessions: pitching, debate, case studies, workshops", "Shark Tank Finale: teams pitch live to real judges for cash prizes — $2,000 Best Concept, $1,000 Best Pitch, $500 Most Innovative", "Field trip to a real business — behind-the-scenes tour and owner conversation", "Bound portfolio awarded at Shark Tank Finale", "Alumni network access upon completion"],
    },
    {
      tag: "SIX-WEEK INTENSIVE", id: "intensive", flagship: false, status: "ENROLLING SOON", statusColor: gold,
      title: "Six-Week Intensive", tagline: "The compressed formation.",
      price: "$3,900 / wave", priceNote: "Four waves per year · Spring, Summer, Fall, Winter",
      desc: "A compressed version of the flagship curriculum. One discipline per week, building toward a Shark Tank Finale. Two tracks — Monday & Wednesday evenings or Saturday mornings. Twelve total sessions, structured as 12 sessions of three hours each.",
      schedule: "Mon & Wed · 4:00–7:00 PM · or · Saturday mornings",
      students: "20 students per wave",
      features: ["Full curriculum across six weeks — one module per week", "Weekday evening or Saturday morning track", "Guest speaker every week from a different industry", "Week 1: Speaking Coach leads the full session", "12 sessions × 3 hours = 36 hours of instruction", "Shark Tank Finale closes each wave with live judging", "$500 credit toward Full Program enrollment for graduates"],
    },
    {
      tag: "TEN-MONTH FLAGSHIP", id: "full-program", flagship: true, status: "● ENROLLING NOW", statusColor: "#4DB87A",
      title: "Ten-Month Program", tagline: "The complete formation.",
      price: "$1,990 / month", priceNote: "September 2026 – June 2027 · Founding Class",
      desc: "The complete Excalibur formation — ten months across all eight disciplines, all twelve industry sectors, and three real-world engagements. Two parallel tracks give families scheduling flexibility. The same curriculum, the same faculty, the same standard.",
      schedule: "Weekday: Tue & Thu · 4:00–6:00 PM · or · Saturday: 10:30 AM–3:00 PM",
      students: "15–25 per track · 30–50 total",
      features: ["All 8 modules at full depth across a structured 4-phase arc", "10 industry sector rotations — one guest professional per month", "Three-block session model: Speaking Coach + Lead Instructor + Specialist", "Junior Consultant Program — 3-week real business engagement", "Apprentice Externship — 4–6 weeks inside a real company", "Funded Micro-Business Launch with a dedicated mentor", "Monthly Pitch Night before live judges and parents", "City Championship (biannual) and National Championship pipeline", "Bound graduation portfolio + faculty letters of recommendation", "College admissions counseling and portfolio review"],
    },
    {
      tag: "LAUNCHPAD DAY", id: "launchpad", flagship: false, status: "● ENROLLING NOW", statusColor: "#4DB87A",
      title: "Launchpad Day", tagline: "The tasting menu.",
      price: "$349", priceNote: "Single Saturday · 10:30 AM – 2:30 PM · ~6–8 events per year",
      desc: "A single Saturday that reveals what your teenager is capable of when given a serious challenge and a serious audience. The Speaking Coach runs a 45-minute warm-up. The Lead Instructor runs a 90-minute interactive workshop — business model deconstruction or a mini Shark Tank. A guest entrepreneur tells their story. Students leave different from how they arrived.",
      schedule: "Saturday · 10:30 AM – 2:30 PM",
      students: "15 students per event",
      features: ["45-minute Speaking Coach warm-up — impromptu pitching, partner drills", "90-minute Lead Instructor workshop — business deconstruction or mini Shark Tank", "Guest entrepreneur: real story, real questions, real conversation", "Closing debrief: what you learned, what surprised you, what's next", "$500 credit toward Six-Week Intensive, $350 credit toward Full Program", "The fastest way to know if Excalibur is right for your student"],
    },
  ];

  return (
    <div style={{ background: "#000", paddingTop: 80 }}>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "60px 16px 40px" : "80px 40px 56px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>PROGRAMS · FOUNDING CLASS 2026</Eyebrow>
          <SectionTitle center>Four programs. One standard.</SectionTitle>
          <Sub center>Every program is built around the same faculty, the same session model, and the same conviction: that teenagers are capable of far more than most programs dare to ask of them.</Sub>
        </Fade>
      </div>

      <Hr />

      {/* PROGRAM CARDS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {programs.map((p, idx) => (
            <Fade key={idx} d={idx * .04}>
              <div style={{ background: "#080808", borderTop: `2px solid ${p.flagship ? gold : "rgba(199,171,117,.12)"}`, position: "relative" }}>
                {p.flagship && <div style={{ position: "absolute", top: 16, right: 20, fontFamily: sans, background: "rgba(199,171,117,.1)", color: gold, padding: "3px 10px", fontSize: 9, fontWeight: 600, letterSpacing: 1.5 }}>FLAGSHIP</div>}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>
                  {/* Left: overview */}
                  <div style={{ padding: isMobile ? "36px 24px" : "48px 44px", borderRight: isMobile ? "none" : "1px solid #111" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                      <Eyebrow>{p.tag}</Eyebrow>
                      <span style={{ fontFamily: sans, fontSize: 9, color: p.statusColor, border: `1px solid ${p.statusColor}`, padding: "2px 8px", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 14 }}>{p.status}</span>
                    </div>
                    <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 36, fontWeight: 600, color: "#E8E0D8", lineHeight: 1, marginBottom: 6 }}>{p.title}</h2>
                    <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic", marginBottom: 20 }}>{p.tagline}</p>
                    <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300, marginBottom: 24 }}>{p.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 0", borderTop: "1px solid #111", borderBottom: "1px solid #111", marginBottom: 24 }}>
                      {[["Schedule", p.schedule], ["Class Size", p.students], ["Tuition", p.price]].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", gap: 12 }}>
                          <span style={{ fontFamily: sans, fontSize: 10, color: "#908880", letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 64, paddingTop: 1 }}>{k}</span>
                          <span style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontFamily: sans, fontSize: 11, color: "#908880", marginBottom: 20 }}>{p.priceNote}</p>
                    <button onClick={() => setPage(p.id === "launchpad" || p.id === "summer" ? "apply" : p.id)} style={{ fontFamily: sans, padding: "11px 28px", background: p.flagship ? gold : "transparent", border: p.flagship ? "none" : `1px solid rgba(199,171,117,.3)`, color: p.flagship ? "#000" : gold, fontSize: 11, fontWeight: p.flagship ? 700 : 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>{p.flagship ? "EXPLORE FULL PROGRAM →" : p.id === "launchpad" ? "APPLY NOW →" : `EXPLORE ${p.tag} →`}</button>
                  </div>
                  {/* Right: features */}
                  <div style={{ padding: isMobile ? "0 24px 36px" : "48px 44px", background: "#060606" }}>
                    <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.25em", color: "#C8C0B8", textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>What's included</p>
                    {p.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 14, marginBottom: 13, alignItems: "flex-start" }}>
                        <div style={{ width: 16, height: 1.5, background: p.flagship ? gold : "rgba(199,171,117,.4)", marginTop: 8, flexShrink: 0 }} />
                        <span style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>

      <Hr />

      {/* THREE-BLOCK SESSION MODEL */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade>
          <Eyebrow>THE SESSION MODEL</Eyebrow>
          <SectionTitle>Every session. Every program.</SectionTitle>
          <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300, marginTop: 12, marginBottom: 36, maxWidth: 680 }}>Every session at Excalibur follows the same three-block structure, regardless of the program or the week. This is not incidental — it is the architecture. Students practice public speaking before any other content is delivered, every single time.</p>
        </Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
            {[
              { n: "Block 1", star: true, title: "Public Speaking Coach", sub: "Opens every session", desc: "Speaking warm-up, impromptu drills, pitch practice, debate exercises, rhetoric training. The Speaking Coach sets the energy for the entire session. By graduation, students will have completed 120+ individual speaking reps across structured and unstructured exercises.", color: gold },
              { n: "Block 2", star: false, title: "Lead Instructor — The War Room", sub: "The real world, every week", desc: "Rotates weekly between: (1) current events and business news analysis, (2) weekly case study deconstruction — approximately 30–40 companies by graduation, (3) guest industry speaker once per month, and (4) applied workshop where students immediately apply the specialist's content.", color: gold },
              { n: "Block 3", star: false, title: "Specialist Instructor", sub: "The month's module", desc: "The monthly specialist delivers their core module content — Finance, AI, Sales, Leadership, Intellectual Depth, Business Models, or Industry Sectors. Each specialist is a practitioner with real-world experience in the discipline they teach.", color: gold },
            ].map((b, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 30px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.15)"}` }}>
                <div style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.2em", color: b.star ? gold : "#AAA", marginBottom: 8, fontWeight: 600 }}>{b.star ? "★ " : ""}{b.n}</div>
                <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#E8E0D8", marginBottom: 4, lineHeight: 1.2 }}>{b.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.1em", marginBottom: 16 }}>{b.sub}</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#C8C0B8", fontWeight: 300 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <Hr />

      {/* INTERACTIVE DAILY SCHEDULE */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Eyebrow>A DAY AT EXCALIBUR</Eyebrow>
            <SectionTitle center>What a real session looks like.</SectionTitle>
            <Sub center>Click each block to meet the instructor, read the session description, and understand exactly what your student will experience.</Sub>
          </div>
        </Fade>
        <Fade d={.06}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {[["SUMMER INTENSIVE", "summer-sched"], ["FLAGSHIP — WEEKDAY", "flagship-wd"], ["FLAGSHIP — SATURDAY", "flagship-sat"], ["SIX-WEEK INTENSIVE", "six-week"]].map(([label, id]) => (
              <DaySchedBtn key={id} id={id} label={label} />
            ))}
          </div>
          <DaySchedContent />
        </Fade>
      </div>

      <Hr />

      {/* SCHEDULE */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>2026–2027 SCHEDULE</Eyebrow><SectionTitle>Enrollment & Tracks.</SectionTitle></Fade>
        <div style={{ marginTop: 36 }}>
          <ScheduleTabs setPage={setPage} isMobile={isMobile} waves={waves} gold={gold} />
        </div>
      </div>

      <Hr />

      {/* LAUNCHPAD */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>NOT SURE WHERE TO START?</Eyebrow>
          <SectionTitle center>Try the Launchpad Day first.</SectionTitle>
          <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300, marginTop: 12, marginBottom: 28, maxWidth: 600, margin: "12px auto 28px" }}>One Saturday. 15 students. Four hours of real Excalibur — speaking drills, a business challenge, a guest entrepreneur, and a debrief that leaves every student with something to think about. The family who attends usually enrols. The student who attends always remembers it.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>RESERVE A LAUNCHPAD SPOT — $349</button>
          </div>
        </Fade>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: APPLY
// ─────────────────────────────────────────────
function ApplyPage({ setPage }) {
  const isMobile = useIsMobile();
  const [prog, setProg] = useState(null);
  const [track, setTrack] = useState(null);
  const [wave, setWave] = useState(null);

  const ready = prog === "launchpad" || (prog && track && wave);

  return (
    <div style={{ background: "#000", paddingTop: 80 }}>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "60px 16px 40px" : "80px 40px 56px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>ADMISSIONS · FOUNDING CLASS 2026</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(38px,5vw,64px)", fontWeight: 600, color: "#E8E0D8", lineHeight: 1.05, marginBottom: 16 }}>An invitation worth earning.</h1>
          <p style={{ fontFamily: serif, fontSize: 20, color: "#C8C0B8", fontStyle: "italic", lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>Excalibur is selective because it has to be. Twenty-five students per cohort. One founding class. The process is designed not to intimidate — but to ensure every student who joins is ready to make the most of what we offer.</p>
        </Fade>
      </div>

      <Hr />

      {/* ADMISSIONS PHILOSOPHY */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 72 }}>
          <Fade>
            <Eyebrow>WHO WE ARE LOOKING FOR</Eyebrow>
            <SectionTitle>Readiness. Not résumés.</SectionTitle>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#C8C0B8", fontWeight: 300, marginTop: 18, marginBottom: 16 }}>We are not looking for the most polished teenager or the one with the longest list of activities. We are looking for the student who is genuinely curious — about business, about leadership, about how the world actually works — and who is ready to be challenged in a way most programs would never dare to attempt.</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#C8C0B8", fontWeight: 300 }}>Excalibur admits students based on intellectual engagement, genuine motivation, and — most importantly — the sense that this particular program will change something real for them. We do not require prior business experience. We require genuine readiness to grow.</p>
          </Fade>
          <Fade d={.08}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { n: "25", label: "Students per cohort", sub: "Every student is known by name. Every student is held to account." },
                { n: "2", label: "Tracks per program", sub: "Weekday and Weekend — same faculty, same standard, same depth." },
                { n: "5", label: "Days to a decision", sub: "We review every application carefully and respond within five business days." },
                { n: "72h", label: "Enrollment hold", sub: "Upon acceptance, your seat is held for 72 hours while you confirm." },
              ].map((s, i) => (
                <div key={i} style={{ background: "#080808", padding: "22px 28px", borderLeft: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.12)"}`, display: "flex", gap: 24, alignItems: "center" }}>
                  <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: gold, flexShrink: 0, minWidth: 56 }}>{s.n}</div>
                  <div>
                    <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: "#E0D8D0", marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.5 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      <Hr />

      {/* ADMISSIONS PROCESS */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>THE PROCESS</Eyebrow><SectionTitle center>Four steps. Straightforward.</SectionTitle><Sub center>The process is designed to be efficient and respectful of your time. We know families are busy. This is not a gauntlet — it is a conversation.</Sub></div></Fade>
          <Fade d={.06}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: 2, background: "#111", marginBottom: 2 }}>
              {[
                { n: "01", title: "Submit Your Application", time: "10–15 minutes", desc: "A short online form covering your background, interests, and what draws you to Excalibur. No essays. No transcripts. Just an honest picture of who your student is." },
                { n: "02", title: "Admissions Committee Review", time: "Within 3 days", desc: "Every application is reviewed by the Excalibur admissions committee — not an algorithm. We read each one carefully, looking for the qualities that define a student who will thrive here." },
                { n: "03", title: "Admissions Interview", time: "15–20 minutes", desc: "Shortlisted students are invited to a brief, relaxed conversation with a member of our admissions team. This is not a test. It is a chance for us to understand your student — and for them to understand us." },
                { n: "04", title: "Decision & Enrollment", time: "Within 5 days total", desc: "Decisions are delivered promptly. Upon acceptance, your seat is held for 72 hours. Enrollment is confirmed with a deposit, and you become part of the founding class." },
              ].map((s, i) => (
                <div key={i} style={{ background: "#080808", padding: "32px 26px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}` }}>
                  <div style={{ fontFamily: serif, fontSize: 38, fontWeight: 600, color: gold, opacity: .4, lineHeight: 1, marginBottom: 16 }}>{s.n}</div>
                  <h4 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: "#E8E0D8", marginBottom: 6, lineHeight: 1.2 }}>{s.title}</h4>
                  <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.1em", marginBottom: 14 }}>{s.time}</p>
                  <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.75, color: "#C8C0B8", fontWeight: 300 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </Fade>

          {/* Interview note */}
          <Fade d={.1}>
            <div style={{ background: "#080808", border: "1px solid #151515", borderLeft: `3px solid ${gold}`, padding: "28px 36px", marginTop: 2 }}>
              <p style={{ fontFamily: serif, fontSize: 17, color: "#E8E0D8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>"The interview is the part of our process we value most — not because we are testing students, but because it is the only way to genuinely understand who they are."</p>
              <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.15em" }}>EXCALIBUR ADMISSIONS COMMITTEE</p>
            </div>
          </Fade>
        </div>
      </section>

      <Hr />

      {/* WHAT WE LOOK FOR */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><Eyebrow>WHAT THE COMMITTEE CONSIDERS</Eyebrow><SectionTitle>What matters. What doesn't.</SectionTitle></Fade>
          <Fade d={.08}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111", marginTop: 36 }}>
              <div style={{ background: "#080808", padding: "36px 36px", borderTop: `2px solid ${gold}` }}>
                <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.25em", color: gold, textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>What we look for</p>
                {[
                  "Genuine curiosity about business, leadership, or how the world works",
                  "A willingness to be challenged — and to challenge themselves",
                  "The self-awareness to know what they want to improve",
                  "Honesty in how they describe themselves and their ambitions",
                  "A sense that Excalibur is specifically right for them — not just any program",
                  "Readiness to contribute to a cohort, not just receive from one",
                ].map((f, i) => <Li key={i} solid>{f}</Li>)}
              </div>
              <div style={{ background: "#060606", padding: "36px 36px", borderTop: "2px solid rgba(199,171,117,.1)" }}>
                <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.25em", color: "#C8C0B8", textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>What we don't require</p>
                {[
                  "Prior business experience or entrepreneurship background",
                  "Perfect grades or a strong academic transcript",
                  "A long list of extracurricular activities",
                  "Polished answers or rehearsed responses in the interview",
                  "A clear business idea or entrepreneurial plan",
                  "Formal recommendations or teacher letters at this stage",
                ].map((f, i) => <Li key={i}>{f}</Li>)}
              </div>
            </div>
          </Fade>
        </div>
      </section>

      <Hr />

      {/* APPLICATION SELECTOR */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <Fade><div style={{ textAlign: "center", marginBottom: 48 }}><Eyebrow>BEGIN YOUR APPLICATION</Eyebrow><SectionTitle center>Choose your program.</SectionTitle></div></Fade>

        {/* Step 1 */}
        <Fade>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 30, height: 30, background: prog ? gold : "#111", border: `1px solid ${prog ? gold : "#555"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: prog ? "#000" : "#555", transition: "all .3s" }}>1</div>
              <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#E8E0D8" }}>Choose Your Program</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 2, background: "#111" }}>
              {[
                { id: "launchpad", label: "LAUNCHPAD", title: "Launchpad Intensive", price: "$349", desc: "One Saturday. Four hours. The first taste of what Excalibur is." },
                { id: "intensive", label: "INTENSIVE", title: "Six-Week Intensive", price: "$2,500 / wave", desc: "Six weeks. Full curriculum. Demo Day before live investors." },
                { id: "full", label: "FULL PROGRAM", title: "Ten-Month Program", price: "$1,990 / month", desc: "Ten months. Complete formation. The flagship." },
              ].map((p) => (
                <div key={p.id} onClick={() => { setProg(p.id); setTrack(null); setWave(null); }} style={{ background: prog === p.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${prog === p.id ? gold : "transparent"}`, transition: "all .25s" }}>
                  <Eyebrow>{p.label}</Eyebrow>
                  <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#E8E0D8", marginBottom: 6, lineHeight: 1.2 }}>{p.title}</h3>
                  <p style={{ fontFamily: serif, fontSize: 15, color: gold, marginBottom: 10 }}>{p.price}</p>
                  <p style={{ fontFamily: sans, fontSize: 12, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.6 }}>{p.desc}</p>
                  {prog === p.id && <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: 2, marginTop: 12 }}>✓ SELECTED</p>}
                </div>
              ))}
            </div>
          </div>
        </Fade>

        {/* Step 2 — Track */}
        {prog && prog !== "launchpad" && (
          <Fade>
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 30, height: 30, background: track ? gold : "#111", border: `1px solid ${track ? gold : "#555"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: track ? "#000" : "#555", transition: "all .3s" }}>2</div>
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#E8E0D8" }}>Choose Your Track</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
                {[
                  { id: "weekday", label: "WEEKDAY TRACK", title: "Tuesday & Thursday", sub: "4:00–7:00 PM", detail: "3 hours per session after school. Fits any weekend schedule." },
                  { id: "weekend", label: "WEEKEND TRACK", title: "Every Saturday", sub: "9:00 AM–3:00 PM", detail: "Full-day immersion. More time with speakers and deeper workshops." },
                ].map((t) => (
                  <div key={t.id} onClick={() => { setTrack(t.id); setWave(null); }} style={{ background: track === t.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${track === t.id ? gold : "transparent"}`, transition: "all .25s" }}>
                    <Eyebrow>{t.label}</Eyebrow>
                    <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#E8E0D8", marginBottom: 4 }}>{t.title}</h3>
                    <p style={{ fontFamily: serif, fontSize: 17, color: gold, marginBottom: 10 }}>{t.sub}</p>
                    <p style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8", fontWeight: 300 }}>{t.detail}</p>
                    {track === t.id && <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: 2, marginTop: 12 }}>✓ SELECTED</p>}
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        )}

        {/* Step 3 — Wave */}
        {prog === "intensive" && track && (
          <Fade>
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 30, height: 30, background: wave ? gold : "#111", border: `1px solid ${wave ? gold : "#555"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: wave ? "#000" : "#555", transition: "all .3s" }}>3</div>
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#E8E0D8" }}>Choose Your Wave</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111" }}>
                {waves.map((w) => {
                  const t = track === "weekday" ? w.wd : w.we;
                  const filled = 25 - t.left;
                  return (
                    <div key={w.name} onClick={() => { if (w.status !== "future") setWave(w.name); }} style={{ background: wave === w.name ? "#0C0C0A" : "#080808", padding: "24px 18px", cursor: w.status === "future" ? "not-allowed" : "pointer", opacity: w.status === "future" ? .35 : 1, borderTop: `2px solid ${wave === w.name ? gold : "transparent"}`, transition: "all .25s" }}>
                      <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 2, color: sc(w.status), fontWeight: 500, marginBottom: 6 }}>{w.season.toUpperCase()}</p>
                      <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#E8E0D8", marginBottom: 3 }}>{w.name}</h4>
                      <p style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginBottom: 12 }}>{w.dates}</p>
                      <p style={{ fontFamily: sans, fontSize: 11, color: t.left < 8 ? gold : "#777", marginBottom: 5 }}>{t.left} seats left</p>
                      <div style={{ height: 2, background: "#151515" }}><div style={{ height: "100%", width: `${(filled / 25) * 100}%`, background: "#4DB87A" }} /></div>
                      {wave === w.name && <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: 2, marginTop: 10 }}>✓ SELECTED</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </Fade>
        )}

        {/* Step 3 — Tier */}
        {prog === "full" && track && (
          <Fade>
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 30, height: 30, background: wave ? gold : "#111", border: `1px solid ${wave ? gold : "#555"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: wave ? "#000" : "#555", transition: "all .3s" }}>3</div>
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#E8E0D8" }}>Confirm Your Enrollment</h2>
              </div>
              <div style={{ background: "#080808", padding: "36px 32px", borderTop: `2px solid ${gold}` }}>
                <Eyebrow>TEN-MONTH FLAGSHIP</Eyebrow>
                <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: "#E8E0D8", marginBottom: 6 }}>$1,990 <span style={{ fontFamily: sans, fontSize: 14, color: "#C8C0B8", fontWeight: 300 }}>/ month</span></div>
                <p style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>Full 10-month program. All modules, all speakers, all real-world engagements. Bound portfolio and alumni network included.</p>
                <div style={{ display: "flex", gap: 8, cursor: "pointer" }} onClick={() => setWave("monthly")}>
                  <div style={{ width: 16, height: 16, border: `1px solid ${wave === "monthly" ? gold : "#333"}`, background: wave === "monthly" ? gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    {wave === "monthly" && <span style={{ color: "#000", fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <p style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", fontWeight: 300 }}>I confirm my enrollment in the Ten-Month Flagship Program at $1,990/month.</p>
                </div>
              </div>
            </div>
          </Fade>
        )}

        {/* Final CTA */}
        {ready && (
          <Fade>
            <div style={{ background: "#080808", border: "1px solid #151515", borderTop: `2px solid ${gold}`, padding: "40px 36px", textAlign: "center" }}>
              <Eyebrow>YOUR APPLICATION IS READY</Eyebrow>
              <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: "#E8E0D8", marginBottom: 10 }}>Your place is waiting.</h3>
              <p style={{ fontFamily: sans, fontSize: 14, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 28px" }}>The application takes 10–15 minutes. Shortlisted students are invited to a brief, friendly admissions interview within 3 days. Final decisions within 5 business days. Your seat is held for 72 hours upon acceptance.</p>
              <a href={STRIPE} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 48px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, textDecoration: "none", display: "inline-block", boxShadow: "0 4px 32px rgba(199,171,117,.15)" }}>COMPLETE APPLICATION →</a>
              <p style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginTop: 16 }}>apply@excaliburacademy.org · We reply within one business day.</p>
            </div>
          </Fade>
        )}
      </div>
    </div>
  );
}

// ── SCHEDULE TABS ──
function ScheduleTabs({ setPage, isMobile, waves, gold }) {
  const [activeProgram, setActiveProgram] = useState("summer");
  const [activeWave, setActiveWave] = useState(0);
  const green = "#4DB87A";

  const programs = [
    { id: "summer", label: "Summer Intensive", status: "● ENROLLING NOW", statusColor: green },
    { id: "flagship", label: "Ten-Month Flagship", status: "● ENROLLING NOW", statusColor: green },
    { id: "intensive", label: "Six-Week Intensive", status: "ENROLLING SOON", statusColor: gold },
  ];

  // Summer: 8 enrolled out of 25 each wave (illustrative)
  const summerLeft = [10, 18];

  // Flagship: 7 enrolled out of 25 each track
  const flagshipLeft = [8, 14];

  return (
    <div>
      {isMobile ? (
        /* MOBILE: accordion — each program expands inline */
        <div style={{ border: "1px solid #151515", marginBottom: 2 }}>
          {programs.map((p) => (
            <div key={p.id} style={{ borderBottom: "1px solid #111" }}>
              <button onClick={() => setActiveProgram(activeProgram === p.id ? "" : p.id)} style={{ width: "100%", fontFamily: sans, padding: "20px 20px", background: activeProgram === p.id ? "#080808" : "#060606", border: "none", borderLeft: `3px solid ${activeProgram === p.id ? gold : "transparent"}`, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s" }}>
                <div>
                  <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: "#E8E0D8", lineHeight: 1.2 }}>{p.label}</div>
                  <div style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.15em", color: p.statusColor, fontWeight: 600, marginTop: 4 }}>{p.status}</div>
                </div>
                <span style={{ color: gold, fontSize: 18, transform: activeProgram === p.id ? "rotate(45deg)" : "none", transition: "transform .25s", display: "inline-block" }}>+</span>
              </button>
              {activeProgram === p.id && (
                <div style={{ background: "#080808" }}>
                  {p.id === "summer" && <SummerContent setPage={setPage} isMobile={true} summerLeft={summerLeft} gold={gold} />}
                  {p.id === "flagship" && <FlagshipContent setPage={setPage} isMobile={true} flagshipLeft={flagshipLeft} gold={gold} />}
                  {p.id === "intensive" && <IntensiveContent setPage={setPage} isMobile={true} waves={waves} gold={gold} activeWave={activeWave} setActiveWave={setActiveWave} />}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* DESKTOP: original tab buttons */
        <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, background: "#111", marginBottom: 2 }}>
          {programs.map((p) => (
            <button key={p.id} onClick={() => setActiveProgram(p.id)} style={{ fontFamily: sans, padding: "20px 24px", background: "#080808", border: "none", borderTop: `2px solid ${activeProgram === p.id ? gold : "#1a1a1a"}`, cursor: "pointer", textAlign: "left", transition: "all .2s", opacity: activeProgram === p.id ? 1 : 0.55 }}>
              <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: "#E8E0D8", marginBottom: 6, lineHeight: 1.2 }}>{p.label}</div>
              <div style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.15em", color: p.statusColor, fontWeight: 600 }}>{p.status}</div>
            </button>
          ))}
        </div>

      {/* SUMMER content */}
      {activeProgram === "summer" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
          {[
            { label: "WAVE 1 — JULY", dates: "July 6 – July 18, 2026", left: summerLeft[0], items: [["Schedule", "Mon–Fri · 9:30 AM – 3:00 PM"], ["Duration", "9 days + Field Trip"], ["Guest Speakers", "Daily · every session"], ["Finale", "Shark Tank · July 18"]] },
            { label: "WAVE 2 — AUGUST", dates: "Aug 3 – Aug 15, 2026", left: summerLeft[1], items: [["Schedule", "Mon–Fri · 9:30 AM – 3:00 PM"], ["Duration", "9 days + Field Trip"], ["Guest Speakers", "Daily · every session"], ["Finale", "Shark Tank · Aug 15"]] },
          ].map((t, i) => {
            const filled = 25 - t.left;
            return (
              <div key={i} style={{ background: "#080808", padding: "28px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Eyebrow>{t.label}</Eyebrow>
                  <span style={{ fontFamily: sans, fontSize: 9, color: "#4DB87A", letterSpacing: "0.1em", fontWeight: 600, border: "1px solid #4DB87A", padding: "2px 8px" }}>ENROLLING NOW</span>
                </div>
                <p style={{ fontFamily: serif, fontSize: 16, color: "#C8C0B8", marginBottom: 20 }}>{t.dates}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  {t.items.map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontFamily: sans, fontSize: 9, color: "#A8A098", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>{filled} enrolled</span>
                  <span style={{ color: t.left < 8 ? gold : "#AAA", fontWeight: t.left < 8 ? 600 : 300 }}>{t.left} remaining</span>
                </div>
                <div style={{ height: 2, background: "#1a1a1a", marginBottom: 18 }}>
                  <div style={{ height: "100%", width: `${(filled / 25) * 100}%`, background: "#4DB87A" }} />
                </div>
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", border: `1px solid rgba(199,171,117,.25)`, color: gold, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", background: "transparent", cursor: "pointer" }}>APPLY NOW →</button>
              </div>
            );
          })}
        </div>
      )}

      {/* FLAGSHIP content */}
      {activeProgram === "flagship" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
          {[
            { label: "WEEKDAY TRACK", schedule: "Tuesday & Thursday · 4:00–6:15 PM", left: flagshipLeft[0], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Tue & Thu evenings"], ["Ends", "June 2027 · Demo Day"], ["Price", "$1,990 / month"], ["Seats", "25 per cohort"]] },
            { label: "SATURDAY TRACK", schedule: "Every Saturday · 10:30 AM–3:00 PM", left: flagshipLeft[1], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Full-day Saturdays"], ["Ends", "June 2027 · Demo Day"], ["Price", "$1,990 / month"], ["Seats", "25 per cohort"]] },
          ].map((t, i) => {
            const filled = 25 - t.left;
            return (
              <div key={i} style={{ background: "#080808", padding: "28px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Eyebrow>{t.label}</Eyebrow>
                  <span style={{ fontFamily: sans, fontSize: 9, color: "#4DB87A", letterSpacing: "0.1em", fontWeight: 600, border: "1px solid #4DB87A", padding: "2px 8px" }}>ENROLLING NOW</span>
                </div>
                <p style={{ fontFamily: serif, fontSize: 16, color: "#C8C0B8", marginBottom: 20 }}>{t.schedule}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  {t.items.map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontFamily: sans, fontSize: 9, color: "#A8A098", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>{filled} enrolled</span>
                  <span style={{ color: t.left < 8 ? gold : "#AAA", fontWeight: t.left < 8 ? 600 : 300 }}>{t.left} remaining</span>
                </div>
                <div style={{ height: 2, background: "#1a1a1a", marginBottom: 18 }}>
                  <div style={{ height: "100%", width: `${(filled / 25) * 100}%`, background: "#4DB87A" }} />
                </div>
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", background: gold, color: "#000", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", border: "none", cursor: "pointer" }}>APPLY FOR FLAGSHIP →</button>
              </div>
            );
          })}
        </div>
      )}

      {/* SIX-WEEK — wave sub-tabs */}
      {activeProgram === "intensive" && (
        <div>
          <div style={{ display: "flex", gap: 8, padding: "14px 20px", background: "#060606", borderBottom: "1px solid #111", flexWrap: "wrap" }}>
            {waves.map((w, i) => <SBtn key={i} active={activeWave === i} onClick={() => setActiveWave(i)}>{w.name} · {w.season}</SBtn>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
            {[{ label: "WEEKDAY TRACK A", t: waves[activeWave].wd }, { label: "WEEKEND TRACK B", t: waves[activeWave].we }].map(({ label, t }, i) => {
              const filled = 25 - t.left;
              const isOpen = waves[activeWave].status === "open";
              return (
                <div key={i} style={{ background: "#080808", padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Eyebrow>{label}</Eyebrow>
                    {isOpen && <span style={{ fontFamily: sans, fontSize: 9, color: "#4DB87A", letterSpacing: "0.1em", fontWeight: 600, border: "1px solid #4DB87A", padding: "2px 8px" }}>ENROLLING NOW</span>}
                    {waves[activeWave].status === "soon" && <span style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.1em", fontWeight: 600 }}>OPENING SOON</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                    {[["Days", t.days], ["Time", t.time], ["Dates", waves[activeWave].dates], ["Location", "Orange County"]].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontFamily: sans, fontSize: 9, color: "#A8A098", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                    <span>{filled} enrolled</span>
                    <span style={{ color: t.left < 8 ? gold : "#AAA", fontWeight: t.left < 8 ? 600 : 300 }}>{t.left} remaining</span>
                  </div>
                  <div style={{ height: 2, background: "#1a1a1a", marginBottom: 18 }}>
                    <div style={{ height: "100%", width: `${(filled / 25) * 100}%`, background: "#4DB87A" }} />
                  </div>
                  {isOpen && <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", border: `1px solid rgba(199,171,117,.25)`, color: gold, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", background: "transparent", cursor: "pointer" }}>APPLY FOR THIS TRACK →</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
function CoachCard({ c, i, setPage }) {
  const hasFacultyPage = ["Chip Pankow", "Bill Morris", "Erik Dostal", "Christopher Sanders"].includes(c.name);

  return (
    <div style={{ background: "#080808", borderTop: i === 0 ? `2px solid ${gold}` : "2px solid rgba(199,171,117,.1)", overflow: "hidden" }}>
      {/* Photo */}
      <div style={{ height: 0, paddingBottom: "100%", overflow: "hidden", position: "relative", background: "#0D0D0B" }}>
        {c.isLogo ? (
          <>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={LOGO_URL} alt="Excalibur Academy" style={{ width: 80, height: 80, objectFit: "contain", opacity: 0.35 }} onError={e => e.target.style.display = "none"} />
            </div>
            {c.role === "Role to be confirmed" && (
              <div style={{ position: "absolute", bottom: 16, left: 24, fontFamily: sans, fontSize: 9, color: "#C8C0B8", letterSpacing: "0.15em", textTransform: "uppercase" }}>Role to be announced</div>
            )}
          </>
        ) : (
          <img src={c.img} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(15%)" }} onError={e => e.target.style.display = "none"} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,.9) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px" }}>
          <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#E8E0D8", lineHeight: 1.2 }}>{c.name}</div>
          <div style={{ fontFamily: sans, fontSize: 10, color: gold, marginTop: 3, letterSpacing: "0.08em" }}>{c.role}</div>
        </div>
      </div>

      {/* Tags + shortBio */}
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {c.tags && c.tags.map((t, j) => <span key={j} style={{ fontFamily: sans, fontSize: 9, color: "#C8C0B8", border: "1px solid #1a1a1a", padding: "2px 7px" }}>{t}</span>)}
        </div>
        <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300, marginBottom: hasFacultyPage ? 14 : 0 }}>
          {c.shortBio || c.bio}
        </p>
        {hasFacultyPage && (
          <button
            onClick={() => setPage(`faculty:${c.name.toLowerCase().replace(/ /g, "-")}`)}
            style={{ fontFamily: sans, fontSize: 11, color: gold, background: "transparent", border: "none", cursor: "pointer", padding: 0, letterSpacing: "0.08em", fontWeight: 600 }}
          >
            Read Full Profile →
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: HOME
// ─────────────────────────────────────────────
function HomePage({ setPage }) {
  const [activeMod, setActiveMod] = useState(0);
  const [activeCat, setActiveCat] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeTier, setActiveTier] = useState(0);
  const [speakerIdx, setSpeakerIdx] = useState(0);
  const [activeWave, setActiveWave] = useState(0);
  const isMobile = useIsMobile();
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef(null);
  useEffect(() => {
    const el = statsRef.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsInView(true); o.disconnect(); } }, { threshold: 0.3 });
    o.observe(el); return () => o.disconnect();
  }, []);
  const visibleSpeakers = () => isMobile ? [speakers[speakerIdx]] : [0, 1, 2].map(offset => speakers[(speakerIdx + offset) % speakers.length]);

  return (
    <div style={{ background: "#000" }}>
      {/* FOUNDING BANNER */}
      <div style={{ background: gold, padding: isMobile ? "10px 16px" : "10px 40px", textAlign: "center" }}>
        <p style={{ fontFamily: sans, fontSize: isMobile ? 9 : 11, letterSpacing: isMobile ? "0.1em" : "0.22em", color: "#000", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.5 }}>
          {isMobile ? <>EXCALIBUR ACADEMY · FOUNDING CLASS 2026 · <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setPage("apply")}>Apply Now →</span></> : <>✦ &nbsp; Excalibur Academy &nbsp;·&nbsp; Founding Class 2026 &nbsp;·&nbsp; Orange County, California &nbsp;·&nbsp; Now Accepting Applications &nbsp;·&nbsp;<span style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, marginLeft: 8 }} onClick={() => setPage("apply")}>Secure Your Place →</span>&nbsp; ✦</>}
        </p>
      </div>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: isMobile ? "60px 24px 40px" : "40px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://res.cloudinary.com/dzy2nwt7a/image/upload/v1773790972/dana-point-in-california_epyjh4.webp)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.13 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.45) 0%, rgba(0,0,0,.72) 55%, #000 100%)" }} />

        <Fade style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", borderBottom: `1px solid rgba(199,171,117,.35)`, paddingBottom: 6, display: "inline-block", marginBottom: 28 }}>
            Founding Class &nbsp;·&nbsp; Orange County &nbsp;·&nbsp; 2026
          </p>
        </Fade>

        <Fade d={.1} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontFamily: "'Forum', 'Copperplate', Georgia, serif", fontWeight: 400, fontSize: "clamp(33px,3.6vw,54px)", letterSpacing: "0.28em", color: "#E8E0D8", textTransform: "uppercase", marginBottom: 8, textShadow: "0 2px 40px rgba(199,171,117,.12)" }}>
            Excalibur Academy
          </p>
          <p style={{ fontFamily: sans, fontSize: "clamp(15px,1.35vw,19px)", letterSpacing: "0.22em", color: gold, textTransform: "uppercase", marginBottom: 20, opacity: 0.85 }}>
            Forging the leaders of tomorrow
          </p>
          <img
            src="https://i.ibb.co/rKSp526b/upsclae-logo.png"
            alt="Excalibur Academy"
            style={{ width: isMobile ? 240 : 360, height: "auto", objectFit: "contain", marginBottom: 24, filter: "drop-shadow(0 0 40px rgba(199,171,117,.15))" }}
            onError={e => e.target.style.display = "none"}
          />
        </Fade>

        <Fade d={.18} style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(18px,1.8vw,28px)", fontWeight: 500, lineHeight: 1.25, color: "#C8C0B4", maxWidth: 700, marginBottom: 6, fontStyle: "italic" }}>
            School teaches how to take tests.
          </h1>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(18px,1.8vw,28px)", fontWeight: 600, lineHeight: 1.25, color: gold, maxWidth: 700, marginBottom: 24 }}>
            We teach how to take lead.
          </h1>
        </Fade>

        <Fade d={.3} style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: serif, fontSize: "clamp(22px,2vw,30px)", lineHeight: 1.7, color: "#C8C0B4", maxWidth: 640, marginBottom: 28, fontWeight: 300 }}>A premier institute where real entrepreneurs, investors, top CEOs and distinguished professionals teach your teenager to lead the world — not follow it.</p>
        </Fade>

        <Fade d={.4} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row", alignItems: "center", marginBottom: 24 }}>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer", boxShadow: "0 4px 40px rgba(199,171,117,.2)" }}>Join the Founding Class</button>
            <button onClick={() => setPage("programs")} style={{ fontFamily: sans, border: `1px solid rgba(199,171,117,.35)`, color: gold, padding: "13px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", background: "transparent", cursor: "pointer" }}>Explore Programs</button>
          </div>
          <p style={{ color: "#C0B8B0", fontSize: 11, letterSpacing: "0.12em", fontFamily: sans, textTransform: "uppercase", marginBottom: 8 }}>Ages 16–17 (Junior & Senior) &nbsp;·&nbsp; 25 students per cohort &nbsp;·&nbsp; Orange County, CA</p>
          <p style={{ color: "#D8D0C4", fontSize: "clamp(13px,1.2vw,16px)", letterSpacing: "0.04em", fontFamily: serif, fontStyle: "italic", marginBottom: 0, lineHeight: 1.6 }}>Classes hosted in South Orange County's historic villas and venues,<br />inspired by the traditions of European elite education.</p>
        </Fade>
      </section>


      {/* LEAD FACULTY — postcard after hero */}
      <section style={{ background: "#07060A", borderBottom: `1px solid rgba(199,171,117,.1)`, padding: isMobile ? "40px 24px" : "52px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ background: "#08080A", border: `1px solid rgba(199,171,117,.14)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
            <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: "#C0B8B0", fontWeight: 600, textTransform: "uppercase", padding: "20px 28px 0" }}>Lead Faculty</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", padding: isMobile ? "16px 24px 24px" : "20px 40px 28px", gap: isMobile ? 20 : 0 }}>
              <div style={{ padding: isMobile ? "0" : "0 36px 0 0" }}>
                <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
                <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.8, color: "#C0B8B0", fontWeight: 300 }}>A CEO who built the world's first autonomous racing series, directed the Formula BMW programme — developing multiple Formula 1 World Champions — and oversaw a $13 billion NASDAQ listing. Secured over $100M in institutional funding. Guinness World Record holder. Professional Auto & Rally Racer.</p>
              </div>
              {!isMobile && <div style={{ background: "rgba(199,171,117,.12)" }} />}
              <div style={{ padding: isMobile ? "0" : "0 0 0 36px" }}>
                <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
                <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.8, color: "#C0B8B0", fontWeight: 300 }}>A former Citigroup Managing Director with 100+ M&A transactions and 600+ CEO advisory engagements. EVP and CFO of two NYSE-listed companies. Georgetown MBA Professor and TEDx speaker. Has spoken at institutions from West Point to Stanford.</p>
              </div>
            </div>
            <div style={{ textAlign: "center", paddingBottom: 16 }}>
              <span style={{ fontFamily: serif, fontSize: 16, color: "rgba(199,171,117,.25)", letterSpacing: "0.3em" }}>✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMER ENROLLMENT BANNER */}
      <section style={{ background: "linear-gradient(135deg, #080808 0%, #0D0B07 100%)", borderBottom: `1px solid rgba(199,171,117,.15)`, padding: isMobile ? "48px 24px" : "64px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 80, alignItems: "center" }}>
          <Fade>
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>⚡ Waitlist Now Open</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(28px,5vw,36px)" : "clamp(32px,3.5vw,48px)", fontWeight: 600, color: "#E8E0D8", lineHeight: 1.1, marginBottom: 8 }}>
              Summer Intensive 2026
            </h2>
            <p style={{ fontFamily: sans, fontSize: 12, color: gold, letterSpacing: "0.1em", marginBottom: 20 }}>Enrollment Begins May 15, 2026</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C0B8B0", fontWeight: 300, marginBottom: 24 }}>
              Offered in two waves — July and August — this full-day, Monday-through-Friday intensive is led by senior faculty, former Fortune 500 executives, accomplished leaders, top industry specialists, and distinguished guest speakers. The program emphasizes business and leadership curriculum, public speaking mentorship and art of networking, real-world case studies, immersive startup simulations, and live pitch development, culminating in a Shark Tank-style finale. Enrollment is limited to a select cohort of 25 students per wave.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {[
                "Daily Sessions: 9:30 AM – 3:00 PM, Monday through Friday",
                "Wave 1: July 6 – 17, 2026  ·  Wave 2: August 3 – 14, 2026",
                "Distinguished Guest Speaker rotating daily",
                "Program Finale: Shark Tank-style event with real investors",
                "Eligibility: Ages 16–17 (high school juniors and seniors)",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 14, height: 1.5, background: gold, marginTop: 8, flexShrink: 0 }} />
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8", fontWeight: 300 }}>{f}</span>
                </div>
              ))}
            </div>
          </Fade>
          <Fade d={.1}>
            <div style={{ background: "#050505", border: `1px solid rgba(199,171,117,.55)`, padding: isMobile ? "32px 28px" : "40px 36px", position: "relative" }} className="soiree-card">
              <div style={{ position: "absolute", top: 10, left: 10, width: 14, height: 14, borderTop: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", top: 10, right: 10, width: 14, height: 14, borderTop: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", bottom: 10, left: 10, width: 14, height: 14, borderBottom: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", bottom: 10, right: 10, width: 14, height: 14, borderBottom: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
              <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>May 23 · Saturday 5:00 PM – 7:00 PM</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 21, color: "#E8E0D8", lineHeight: 1.35, marginBottom: 14 }}>An Invitation to Our Parent Information Soirée</p>
              <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 16 }} />
              <p style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", fontWeight: 300, lineHeight: 1.8, marginBottom: 16 }}>
                Join us for an intimate, invitation-only evening organized for families to learn more about the Academy and our full year and short intensive programs. Hosted in a historic 1910s Mediterranean villa overlooking the Pacific in San Clemente, the gathering will feature cocktails and curated charcuterie in an elegant coastal setting.
              </p>
              <p style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", fontWeight: 300, lineHeight: 1.8, marginBottom: 16 }}>
                Guests will have the opportunity to meet the founder and the leadership team, explore the venue where courses will be held, and hear directly from the Lead Faculty about the curriculum, our extracurricular events, and each of our programs in detail.
              </p>
              <p style={{ fontFamily: serif, fontSize: 12, color: gold, letterSpacing: "0.12em", marginBottom: 20 }}>Attendance is by invitation only.</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", fontWeight: 300, marginBottom: 18 }}>To receive your exclusive invitation, please leave your email below. Prospective students will be asked to reflect on one simple question: <span style={{ color: gold, fontStyle: "italic" }}>"What is your dream?"</span></p>
              <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row" }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{ flex: 1, padding: "11px 16px", background: "#000", border: "1px solid rgba(199,171,117,.25)", color: "#E8E0D8", fontFamily: sans, fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = gold}
                  onBlur={e => e.target.style.borderColor = "rgba(199,171,117,.25)"}
                />
                <button style={{ fontFamily: sans, background: gold, color: "#000", padding: "11px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", flexShrink: 0 }}>Join the Invitation List</button>
              </div>
              <p style={{ fontFamily: sans, fontSize: 10, color: "#908880", marginTop: 12, letterSpacing: "0.06em" }}>We will contact you with event details and exclusive invitation.</p>
            </div>
          </Fade>
        </div>
      </section>


      {/* FOUNDER QUOTE */}
      <section style={{ background: "#080808", borderTop: "1px solid rgba(199,171,117,.07)", borderBottom: "1px solid rgba(199,171,117,.07)", padding: isMobile ? "60px 24px" : "80px 40px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Fade>
            <div style={{ display: "flex", gap: isMobile ? 24 : 48, alignItems: "flex-start", flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: isMobile ? 72 : 96, height: isMobile ? 72 : 96, borderRadius: "50%", overflow: "hidden", border: `1px solid rgba(199,171,117,.3)` }}>
                  <img src="https://i.imgur.com/F23ULHv.jpeg" alt="Alexander Milstein" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                </div>
              </div>
              <div style={{ borderLeft: `2px solid ${gold}`, paddingLeft: isMobile ? 24 : 40, flex: 1 }}>
                <p style={{ fontFamily: serif, fontSize: "clamp(18px,2.4vw,26px)", lineHeight: 1.7, color: "#D8D0C4", fontWeight: 400, fontStyle: "italic", marginBottom: 28 }}>
                  "There are people who walk the path — and people who cut it. At Excalibur Academy, we forge the second kind. The leaders. The innovators. The architects. The warriors. The dreamers. The ones who defy gravity. We are not preparing students to follow the future. We are preparing them to lead it. What sets them apart will not be what they are taught — but what they come to believe about themselves. That is where everything begins."
                </p>
                <p style={{ fontFamily: sans, fontSize: 11, color: gold, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500 }}>
                  Alexander Milstein &nbsp;·&nbsp; Founder, Excalibur Academy
                </p>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ACADEMY ABOUT — luxury editorial layout */}
      <section style={{ background: "#000", padding: isMobile ? "60px 0" : "0" }}>
        <Fade>
        {/* Full-width photo strip with text overlay */}
        <div style={{ position: "relative", height: isMobile ? 260 : 440, overflow: "hidden" }}>
          <img src="https://i.imgur.com/y5bXKH5.jpeg" alt="Orange County estate" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,.75) 0%, rgba(0,0,0,.2) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", bottom: isMobile ? 28 : 52, left: isMobile ? 28 : 72, maxWidth: 540 }}>
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>About the Academy</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(28px,6vw,38px)" : "clamp(36px,4vw,54px)", fontWeight: 600, color: "#F0E8E0", lineHeight: 1.1, marginBottom: 14 }}>The Academy</h2>
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)` }} />
          </div>

        </div>

        {/* Main content — asymmetric grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", background: "#07060A" }}>

          {/* Left panel — founding statement + session model */}
          <div style={{ padding: isMobile ? "48px 28px" : "64px 72px" }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 17 : 19, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 400, marginBottom: 28, fontStyle: "italic", borderLeft: `2px solid rgba(199,171,117,.3)`, paddingLeft: 20 }}>
              Excalibur Leadership Academy is a premier institute for entrepreneurship, business, and leadership for ambitious teenagers aged 16–17 in Orange County, California. We are building the institution we wish had existed when we were young — one where students are mentored by accomplished adults who have built companies, led teams, and operated under real stakes.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#B8B0A8", fontWeight: 300, marginBottom: 20 }}>
              Our sessions take place in historic estates and private venues across Newport Beach, Laguna Beach, and San Clemente, inspired by the traditions of European elite education.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#B8B0A8", fontWeight: 300, marginBottom: 32 }}>
              Every session follows a rigorous three-block format: rhetoric and public speaking with a speaking coach, real-world business analysis and applied workshops led by senior faculty, and deep domain instruction from a rotating specialist for every industry. No filler. No theory divorced from practice — only formation that builds confidence, judgment, and presence.
            </p>
            {/* Three pillars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { n: "01", t: "Speaking & Rhetoric", d: "Every session opens with the Speaking Coach." },
                { n: "02", t: "Real-World Analysis", d: "Lead Instructor — applied workshops and case studies." },
                { n: "03", t: "Domain Mastery", d: "Monthly specialist with deep practitioner experience." },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: "1px solid rgba(199,171,117,.07)", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: "rgba(199,171,117,.45)", minWidth: 24, marginTop: 2 }}>{p.n}</span>
                  <div>
                    <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: gold, letterSpacing: "0.08em", marginBottom: 3 }}>{p.t}</p>
                    <p style={{ fontFamily: sans, fontSize: 12, color: "#908880", fontWeight: 300 }}>{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          {!isMobile && <div style={{ background: "rgba(199,171,117,.08)" }} />}

          {/* Right panel — outcomes + Why This Matters */}
          <div style={{ padding: isMobile ? "0 28px 48px" : "64px 72px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#B8B0A8", fontWeight: 300, marginBottom: 24 }}>
              Our faculty are not career academics. They are entrepreneurs, executives, investors, and professionals who teach from lived experience. Students learn public speaking, financial reasoning, business strategy, sales and marketing, leadership, technology and AI, and the social arts through live case studies, startup simulations, consulting projects, and competitive pitch forums.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#B8B0A8", fontWeight: 300, marginBottom: 40 }}>
              By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, worked in teams under pressure, and competed in Shark Tank-style finals. In our flagship program, students launch revenue-generating micro-ventures and graduate with a bound portfolio of work that sets them apart for university admissions — and beyond.
            </p>

            {/* WHY THIS MATTERS NOW — gold heading block */}
            <div style={{ borderTop: `1px solid rgba(199,171,117,.15)`, paddingTop: 32, marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 28, height: 1, background: gold, flexShrink: 0 }} />
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 20 : 24, fontWeight: 600, color: "#E8E0D8", letterSpacing: "0.02em" }}>Why This Matters Now</h3>
              </div>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#B8B0A8", fontWeight: 300, marginBottom: 16 }}>
                The skills that determine success — public speaking, strategic thinking, financial judgment, leadership, and the ability to persuade — are largely absent from traditional education. At the same time, AI is rapidly reshaping industries and dissolving career paths once considered secure.
              </p>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#B8B0A8", fontWeight: 300 }}>
                What cannot be replaced are human capacities: confidence under pressure, ownership of outcomes, the ability to lead, to sell an idea, to recover from failure, and to act when the path is uncertain. Entrepreneurs have powered business revolutions, built modern industry, and are now shaping the age of AI. We exist to prepare the young people who will lead what comes next.
              </p>
            </div>

            <div style={{ marginTop: "auto" }}>
              <button onClick={() => setPage("programs")} style={{ fontFamily: sans, background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, padding: "11px 26px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Explore Programs →</button>
            </div>
          </div>
        </div>

        {/* Bottom photo strip — students */}
        <div style={{ position: "relative", height: isMobile ? 200 : 280, overflow: "hidden" }}>
          <img src="https://i.imgur.com/ryGpllP.jpeg" alt="Students collaborating" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "brightness(0.45)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,6,10,1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,.9) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 22, color: "#E0D8D0", fontStyle: "italic", textAlign: "center", maxWidth: 560, lineHeight: 1.6, padding: "0 24px" }}>
              "By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, worked in teams under pressure, and competed in Shark Tank-style finals."
            </p>
          </div>
        </div>
        </Fade>
      </section>

      {/* STATS — animated counter */}
      <section style={{ padding: isMobile ? "40px 16px" : "56px 40px" }}>
        <div ref={statsRef} style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: 2, background: "#111" }}>
          {[["10", " Months", "academic year program"], ["6", " Weeks", "intensive track"], ["10", "", "industry sectors"], ["25", "", "students per cohort"], ["8", "", "curriculum modules"]].map(([num, suf, l], i) => (
            <StatCounter key={i} num={num} suf={suf} label={l} inView={statsInView} />
          ))}
        </div>
      </section>

      {/* THREE PROGRAMS */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>THREE PATHS INTO EXCALIBUR</Eyebrow><SectionTitle center>Choose Your Entry Point</SectionTitle><Sub center>Each path is rigorous. Each is selective. One is an immersion. One is an ignition. One is a complete formation.</Sub></div></Fade>

          {/* SUMMER — full width on top */}
          <Fade d={.06}>
            <div style={{ background: "#080808", borderTop: `2px solid rgba(199,171,117,.35)`, marginBottom: 2, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr 1px 1fr", overflow: "hidden" }}>
              {/* Left: identity */}
              <div style={{ padding: isMobile ? "40px 28px" : "52px 52px" }}>
                <Eyebrow>Summer Programme · 2026</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 34 : 42, fontWeight: 600, color: "#E8E0D8", lineHeight: 1, marginBottom: 8 }}>Summer Intensive</h3>
                <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic", marginBottom: 20 }}>The immersion.</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#C0B8B0", fontWeight: 300 }}>Two waves — July 6–17 and August 3–14. Full days, Monday through Friday, led by senior faculty, Fortune 500 executives, and distinguished guest speakers. Every session culminates in a Shark Tank-style finale before real investors.</p>
              </div>
              {!isMobile && <div style={{ background: "rgba(199,171,117,.08)" }} />}
              {/* Middle: details */}
              <div style={{ padding: isMobile ? "0 28px 28px" : "52px 44px", display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  ["Sessions", "9:30 AM – 3:00 PM · Mon–Fri"],
                  ["Wave 1", "July 6 – 17, 2026"],
                  ["Wave 2", "August 3 – 14, 2026"],
                  ["Guest Speakers", "Distinguished speaker rotating daily"],
                  ["Finale", "Shark Tank with real investors"],
                  ["Eligibility", "Ages 16–17 · 25 students per wave"],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
                    <span style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.08em", minWidth: 90, paddingTop: 1, fontWeight: 500 }}>{k}</span>
                    <span style={{ fontFamily: sans, fontSize: 12, color: "#C0B8B0", fontWeight: 300 }}>{v}</span>
                  </div>
                ))}
              </div>
              {!isMobile && <div style={{ background: "rgba(199,171,117,.08)" }} />}
              {/* Right: price + CTA */}
              <div style={{ padding: isMobile ? "0 28px 40px" : "52px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.3em", color: "#4DB87A", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>● Accepting Applications</p>
                  <div style={{ fontFamily: serif, fontSize: 38, color: "#E8E0D8", fontWeight: 600, lineHeight: 1, marginBottom: 4 }}>$4,500</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: "#C0B8B0", fontWeight: 300, marginBottom: 28 }}>per wave · includes lunch, field trip, Shark Tank Finale</div>
                </div>
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, padding: "13px 28px", background: "transparent", border: `1px solid rgba(199,171,117,.4)`, color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", alignSelf: "flex-start" }}>APPLY NOW →</button>
              </div>
            </div>
          </Fade>

          {/* INTENSIVE + FLAGSHIP — side by side below */}
          <Fade d={.1}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>

              {/* INTENSIVE */}
              <div style={{ background: "#080808", padding: isMobile ? "40px 28px" : "52px 48px", borderTop: "2px solid rgba(199,171,117,.2)" }}>
                <Eyebrow>Entry Track</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: "#E8E0D8", lineHeight: 1, marginBottom: 6 }}>Six-Week Intensive</h3>
                <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 20 }}>The ignition.</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#C0B8B0", fontWeight: 300, marginBottom: 24 }}>Offered in four waves annually, the Six-Week Intensive distils the complete Excalibur curriculum into a high-impact sprint designed to introduce students to our standards, pace, and expectations. Students choose weekday evenings or Sunday half-day. Concludes with a live judged Demo Day.</p>
                <div style={{ height: 1, background: "rgba(199,171,117,.08)", marginBottom: 20 }} />
                {["Full eight-module curriculum across all disciplines", "Weekday evening or Sunday half-day track", "Weekly guest speaker from business and investment world", "Team-based micro-business project and live pitch", "Judged Demo Day before a live investor audience", "Alumni network access · Priority for Full Formation"].map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 12, marginBottom: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 14, height: 1, background: "rgba(199,171,117,.4)", marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 32, display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontFamily: serif, fontSize: 32, color: "#E8E0D8", fontWeight: 600 }}>$3,500</span>
                  <span style={{ fontFamily: sans, fontSize: 12, color: "#C0B8B0", fontWeight: 300 }}>/ wave</span>
                </div>
                <button onClick={() => setPage("intensive")} style={{ fontFamily: sans, padding: "11px 26px", background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>EXPLORE INTENSIVE →</button>
              </div>

              {/* FULL PROGRAM */}
              <div style={{ background: "#090907", padding: isMobile ? "40px 28px" : "52px 48px", borderTop: `2px solid ${gold}`, position: "relative" }}>
                <div style={{ position: "absolute", top: 18, right: 20, fontFamily: sans, background: "rgba(199,171,117,.08)", color: gold, padding: "3px 10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid rgba(199,171,117,.2)" }}>FLAGSHIP</div>
                <Eyebrow>Full Formation</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: "#E8E0D8", lineHeight: 1, marginBottom: 6 }}>Ten-Month Program</h3>
                <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 20 }}>The complete formation.</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#C0B8B0", fontWeight: 300, marginBottom: 24 }}>The Full Formation is Excalibur's ten-month flagship — a deep, immersive course of study for students ready for complete entrepreneurial, intellectual, and personal formation across all eight modules, ten industry sectors, and three real-world engagements.</p>
                <div style={{ height: 1, background: "rgba(199,171,117,.12)", marginBottom: 20 }} />
                {["Full ten-month curriculum across all eight core modules", "All ten industry sectors with guest leaders", "Junior Consultant Program — real local business engagement", "Apprentice Externship — 4–6 weeks inside a real company", "Funded micro-business launch with a dedicated mentor", "Monthly Pitch Night and competition pathway to nationals", "Bound graduation portfolio of all academic and professional work", "Eligibility for London and Geneva international programmes"].map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 12, marginBottom: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 14, height: 1, background: gold, marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 32, display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontFamily: serif, fontSize: 32, color: "#E8E0D8", fontWeight: 600 }}>$1,990</span>
                  <span style={{ fontFamily: sans, fontSize: 12, color: "#C0B8B0", fontWeight: 300 }}>/ month</span>
                </div>
                <button onClick={() => setPage("full-program")} style={{ fontFamily: sans, padding: "11px 26px", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>EXPLORE FULL PROGRAM →</button>
              </div>

            </div>
          </Fade>
        </div>
      </section>

      {/* CURRICULUM */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>THE CURRICULUM</Eyebrow><SectionTitle center>Inside the Classroom</SectionTitle><Sub center>Eight disciplines — taught by executive business leaders, distinguished keynote speakers, and professors from leading universities.</Sub></div></Fade>
          <Fade d={.08}>
            {isMobile ? (
              /* MOBILE: accordion — each module expands inline */
              <div style={{ border: "1px solid #151515" }}>
                {currMods.map((m, i) => (
                  <div key={i} style={{ borderBottom: "1px solid #0E0E0E" }}>
                    <div onClick={() => setActiveMod(activeMod === i ? -1 : i)} style={{ padding: "18px 20px", cursor: "pointer", borderLeft: `3px solid ${activeMod === i ? gold : "transparent"}`, background: activeMod === i ? "rgba(199,171,117,.04)" : "#060606", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s" }}>
                      <div style={{ fontFamily: serif, fontSize: 19, fontWeight: activeMod === i ? 600 : 400, color: activeMod === i ? gold : "#D8D0C8", lineHeight: 1.3 }}>{m.title}</div>
                      <div style={{ fontFamily: sans, fontSize: 16, color: activeMod === i ? gold : "#555", transition: "transform .25s", transform: activeMod === i ? "rotate(45deg)" : "none", lineHeight: 1 }}>+</div>
                    </div>
                    {activeMod === i && (
                      <div style={{ background: "#080808", padding: "24px 20px 28px" }}>
                        <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 14 }}>{m.tagline}</p>
                        <div style={{ marginBottom: 18 }}>{m.body.split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#C8C0B8", fontWeight: 300, marginBottom: 14 }}>{para}</p>))}</div>
                        <button onClick={() => setPage(`module:${m.slug}`)} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.15em", fontWeight: 700, border: `1px solid rgba(199,171,117,.3)`, padding: "9px 16px", background: "transparent", cursor: "pointer", textTransform: "uppercase" }}>Explore Module →</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* DESKTOP: sidebar + right panel */
              <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", border: "1px solid #151515", overflow: "hidden" }}>
                <div style={{ background: "#060606", borderRight: "1px solid #151515" }}>
                  {currMods.map((m, i) => (
                    <div key={i} onClick={() => setActiveMod(i)} style={{ padding: "20px 28px", cursor: "pointer", borderBottom: "1px solid #0E0E0E", borderLeft: `3px solid ${activeMod === i ? gold : "transparent"}`, background: activeMod === i ? "rgba(199,171,117,.05)" : "transparent", transition: "all .25s" }}>
                      <div style={{ fontFamily: serif, fontSize: activeMod === i ? 21 : 19, fontWeight: activeMod === i ? 600 : 400, color: activeMod === i ? gold : "#D8D0C8", lineHeight: 1.3 }}>{m.title}</div>
                      <div style={{ fontFamily: sans, fontSize: 10, color: activeMod === i ? "rgba(199,171,117,.5)" : "#706860", marginTop: 3, letterSpacing: 1 }}>{m.months}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#080808" }}>
                  <div key={activeMod} className="mod-content" style={{ padding: "36px 44px 44px" }}>
                    <p style={{ fontFamily: sans, color: gold, fontSize: 10, letterSpacing: "0.3em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>{currMods[activeMod].months}</p>
                    <h3 style={{ fontFamily: serif, fontSize: "clamp(26px,3vw,36px)", fontWeight: 600, color: "#E8E0D8", marginBottom: 8, lineHeight: 1.15 }}>{currMods[activeMod].title}</h3>
                    <p style={{ fontFamily: serif, fontSize: 19, color: gold, fontStyle: "italic", marginBottom: 20 }}>{currMods[activeMod].tagline}</p>
                    <div style={{ marginBottom: 24 }}>{currMods[activeMod].body.split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#C8C0B8", fontWeight: 300, marginBottom: 18 }}>{para}</p>))}</div>
                    <button onClick={() => setPage(`module:${currMods[activeMod].slug}`)} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.2em", fontWeight: 700, border: `1px solid rgba(199,171,117,.3)`, padding: "9px 18px", background: "transparent", cursor: "pointer", textTransform: "uppercase" }}>Explore This Module →</button>
                  </div>
                </div>
              </div>
            )}
          </Fade>
          <Fade d={.12}>
            <div style={{ marginTop: 2, background: "#060606", border: "1px solid #111", borderTop: "none", padding: "17px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: sans, fontSize: 12, color: "#C8C0B8", fontWeight: 300 }}>All eight modules covered in both the Intensive and the Full Program.</span>
              <button onClick={() => setPage("curriculum")} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: 2, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>VIEW ALL MODULES →</button>
            </div>
          </Fade>
        </div>
      </section>

      {/* 12 SECTORS */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 48 }}><Eyebrow>INDUSTRY SECTORS ROTATION</Eyebrow><SectionTitle center>Ten Industries. Ten Months.</SectionTitle></div></Fade>
          <Fade d={.08}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111" }}>
              {sectors.map((s, i) => (
                <div key={i} style={{ background: "#080808", padding: "22px 18px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
                    <span style={{ fontFamily: sans, fontSize: 9, color: gold, opacity: .5, letterSpacing: 1.5 }}>{s.n}</span>
                    <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#C8C0B8" }}>{s.name}</span>
                  </div>
                  <p style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", lineHeight: 1.6, fontWeight: 300 }}>{s.desc.split(".")[0]}.</p>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* HANDS-ON */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>REAL-WORLD ENGAGEMENT</Eyebrow><SectionTitle center>Where Theory Meets Reality</SectionTitle><Sub center>The curriculum is the foundation. These four engagements are what make an Excalibur education unlike anything else available to a young person.</Sub></div></Fade>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {handson.map((p, i) => (
              <Fade key={i} d={i * .05}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : i % 2 === 0 ? "3fr 2fr" : "2fr 3fr", background: "#111", minHeight: isMobile ? "auto" : 220 }}>
                  {/* Reverse order for alternating layout */}
                  {i % 2 !== 0 && !isMobile && (
                    <div style={{ background: "#050504", padding: "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", borderTop: `2px solid rgba(199,171,117,.06)` }}>
                      <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, rgba(199,171,117,.4), transparent)`, marginBottom: 18 }} />
                      <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Outcome</p>
                      <p style={{ fontFamily: serif, fontSize: 20, lineHeight: 1.65, color: "#D0C8C0", fontStyle: "italic" }}>{p.outcome}</p>
                      <div style={{ position: "absolute", top: 20, right: 20, fontFamily: serif, fontSize: 52, color: "rgba(199,171,117,.04)", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                    </div>
                  )}
                  <div style={{ background: "#09090B", padding: isMobile ? "40px 24px" : "52px 56px", borderTop: `2px solid ${i < 2 ? gold : "rgba(199,171,117,.18)"}`, position: "relative" }}>
                    <div style={{ position: "absolute", top: 20, right: 20, fontFamily: serif, fontSize: isMobile ? 32 : 52, color: "rgba(199,171,117,.05)", lineHeight: 1, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</div>
                    <Eyebrow>{p.tag}</Eyebrow>
                    <h3 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 34, fontWeight: 600, color: "#E8E0D8", lineHeight: 1.1, marginBottom: 16, marginTop: 8 }}>{p.title}</h3>
                    <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 18 }} />
                    <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#C0B8B0", fontWeight: 300 }}>{p.desc}</p>
                  </div>
                  {(i % 2 === 0 || isMobile) && (
                    <div style={{ background: "#050504", padding: isMobile ? "28px 24px" : "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", borderTop: `2px solid rgba(199,171,117,.06)` }}>
                      <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, rgba(199,171,117,.4), transparent)`, marginBottom: 18 }} />
                      <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Outcome</p>
                      <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 20, lineHeight: 1.65, color: "#D0C8C0", fontStyle: "italic" }}>{p.outcome}</p>
                    </div>
                  )}
                </div>
              </Fade>
            ))}
          </div>

          {/* COLLEGE ADMISSIONS BLOCK */}
          <Fade d={.1}>
            <div style={{ background: "#09090B", borderTop: `2px solid ${gold}`, marginTop: 2, padding: isMobile ? "44px 28px" : "60px 64px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 36 : 80 }}>
                <div>
                  <Eyebrow>College Admissions Advisor</Eyebrow>
                  <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#E8E0D8", lineHeight: 1.1, marginBottom: 10, marginTop: 8 }}>A college portfolio that speaks for itself.</h2>
                  <p style={{ fontFamily: serif, fontSize: 17, color: gold, fontStyle: "italic", marginBottom: 22, lineHeight: 1.4 }}>Why Excalibur Students Stand Apart</p>
                  <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, rgba(199,171,117,.6), transparent)`, marginBottom: 22 }} />
                  <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#C0B8B0", fontWeight: 300, marginBottom: 16 }}>An Excalibur graduate approaches college admission with proof of applied real-world leadership and work experience. A consulting report. An externship record. A micro-business launch. Competition results. A graduation portfolio. Faculty recommendations written by top executives and professionals who watched them operate, lead, and execute.</p>
                  <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#C0B8B0", fontWeight: 300 }}>College admissions counselors who work with our students help set up this portfolio, craft the narrative that connects it to each application, and prepare students for admissions interviews grounded in real, specific experience. The Excalibur graduate portfolio operates on an entirely different level than the conventional application.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 24 }}>What This Means in Practice</p>
                  {[
                    "Admissions counselors review and help build the Excalibur portfolio specifically for university applications",
                    "Faculty letters of recommendation grounded in ten months of direct observation from top executives and professionals — not form letters",
                    "Verified competition results, externship documentation, and consulting deliverables in the application file",
                    "Interview preparation built around real, specific experience rather than scripted responses",
                    "A level of application narrative unavailable to most students due to lack of comparable experience",
                  ].map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 16, height: 1.5, background: gold, marginTop: 9, flexShrink: 0 }} />
                      <span style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", fontWeight: 300, lineHeight: 1.7 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </section>
      {/* FIELD TRIPS — Outside the Classroom */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <Eyebrow>OUTSIDE THE CLASSROOM</Eyebrow>
              <SectionTitle center>Field Trips & Expeditions</SectionTitle>
              <Sub center>Real places. Real companies. Real people who built something significant. Students visit the environments where consequential things actually happen.</Sub>
            </div>
          </Fade>
          <Fade d={.08}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
              {fieldTrips.map((f, i) => (
                <div key={i} style={{ background: "#080808", overflow: "hidden", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}` }}>
                  <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
                    <img src={f.img} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) grayscale(20%)", transition: "transform .5s ease" }} onError={e => e.target.style.display = "none"} onMouseEnter={e => e.target.style.transform = "scale(1.06)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 55%)" }} />
                    <div style={{ position: "absolute", top: 8, right: 8, fontFamily: sans, fontSize: 9, color: gold, border: "1px solid rgba(199,171,117,.4)", padding: "2px 7px", letterSpacing: "0.1em", background: "rgba(0,0,0,.6)", textTransform: "uppercase", fontWeight: 600 }}>{f.type}</div>
                  </div>
                  <div style={{ padding: "18px 20px 22px" }}>
                    <p style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>{f.tag}</p>
                    <h4 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: "#E8E0D8", marginBottom: 10, lineHeight: 1.2 }}>{f.title}</h4>
                    <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.75, color: "#C0B8B0", fontWeight: 300 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Fade>
          <Fade d={.12}>
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button onClick={() => setPage("beyond")} style={{ fontFamily: sans, background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, padding: "11px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>VIEW ALL EXPEDITIONS →</button>
            </div>
          </Fade>
        </div>
      </section>

      {/* COACHES */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 48 }}><Eyebrow>THE TEAM</Eyebrow><SectionTitle center>Faculty & Leadership</SectionTitle><Sub center>Practitioners, executives, and educators — every one of them has done the thing they teach.</Sub></div></Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
            {coaches.map((c, i) => (
              <Fade key={i} d={i * .04}>
                <CoachCard c={c} i={i} setPage={setPage} />
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ALL PROGRAMS SCHEDULE */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 48 }}><Eyebrow>2026–2027 SCHEDULE</Eyebrow><SectionTitle center>All Programs. All Tracks.</SectionTitle><Sub center>Select a program below to view enrollment details and available tracks.</Sub></div></Fade>

          <ScheduleTabs setPage={setPage} isMobile={isMobile} waves={waves} gold={gold} />
        </div>
      </section>

      {/* ADMISSIONS — BOTH PROGRAMS */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>ADMISSIONS</Eyebrow><SectionTitle center>How to Join</SectionTitle><Sub center>Applications reviewed on a rolling basis. They close when each cohort fills — and they do.</Sub></div></Fade>
          <Fade d={.08}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111", marginBottom: 2 }}>
              {[
                { n: "01", t: "Apply Online", s: "15 minutes", color: gold },
                { n: "02", t: "Short Interview", s: "15–20 min", color: gold },
                { n: "03", t: "Decision", s: "Within 5 days", color: gold },
                { n: "04", t: "Enrollment", s: "72-hour hold", color: "#5DB075" }
              ].map((s, i) => (
                <div key={i} style={{ background: "#080808", padding: "26px 22px" }}>
                  <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: 10, opacity: .9 }}>{s.n}</div>
                  <h4 style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: "#D8D0C8", marginBottom: 3 }}>{s.t}</h4>
                  <p style={{ fontFamily: sans, fontSize: 10, color: s.color, letterSpacing: 1.5, fontWeight: 500, textTransform: "uppercase" }}>{s.s}</p>
                </div>
              ))}
            </div>
          </Fade>

        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 44 }}><Eyebrow>COMMON QUESTIONS</Eyebrow><SectionTitle center>Common Questions</SectionTitle></div></Fade>
          <Fade d={.06}>
            <FAQ q="Who actually teaches at Excalibur Academy?" a="Every session is led by a practitioner — an entrepreneur who has built and scaled a company, an investor who has allocated real capital, a public speaking coach who has trained executives, or a financial professional who has managed real portfolios. Our full-time coaches are present at every session; guest speakers rotate in weekly. The criterion for every person in the room is identical: they must have done the thing they are teaching." />
            <FAQ q="What is the difference between the Intensive and the Full Program?" a="The Six-Week Intensive is a compressed sprint across all eight curriculum modules — ideal as an entry point or focused development experience. The Full Program is the complete formation: ten months, all ten industry sectors, a real consulting engagement with a live business client, an externship inside a real company, and a funded micro-business launch. Most families begin with an Intensive and enroll in the Full Program for the following year." />
            <FAQ q="My teenager is naturally reserved. Will they struggle?" a="They will thrive. Confidence is not a prerequisite — it is the outcome. We begin with partner exercises, not public performances. The students who arrive quietly are, by the program's midpoint, consistently among the most compelling voices in the room." />
            <FAQ q="Will this help with college admissions?" a="Materially. A student who can document a consulting engagement with a real business, an externship in their chosen field, participation in judged pitch competitions, and a bound portfolio of analytical work has an application narrative that admissions officers remember." />
            <FAQ q="What is the refund policy?" a="Full refund if cancelled more than two weeks before a wave begins. Within two weeks: credit toward a future wave. Once a wave has started, credits remain available for medical or family emergencies at our discretion." />
          </Fade>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: isMobile ? "70px 16px" : "120px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(199,171,117,.04) 0%, transparent 70%)" }} />
        <Fade style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20, display: "inline-block" }}>LIMITED ENROLLMENT</p>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,52px)", fontWeight: 600, lineHeight: 1.1, marginBottom: 20, color: "#E8E0D8" }}>Waitlist for Summer Waves<br /><span style={{ color: gold }}>Now Open.</span></h2>
          <p style={{ fontFamily: sans, fontSize: 12, color: "#C0B8B0", letterSpacing: "0.08em", marginBottom: 20 }}>Wave 1 opens July 6, 2026</p>
          <CountdownTimer targetDate="2026-07-06T09:30:00" />
          <div style={{ maxWidth: 640, margin: "0 auto 36px", background: "rgba(199,171,117,.05)", border: "1px solid rgba(199,171,117,.15)", padding: isMobile ? "24px 20px" : "28px 36px" }}>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300, marginBottom: 16 }}>Enrollment is limited to small cohorts to preserve instructional depth and personal attention. Due to high demand, placement is managed through a waitlist. Waitlisted families receive direct communication through a personal enrollment coordinator and early access to Academy events, including the May 23 private family information soirée.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["Waitlist for Summer Intensive 2026 — Wave 1 (July) and Wave 2 (August)", "Direct access to personal enrollment coordinator", "Priority invitation to May 23 private family soirée at the Mediterranean Estate"].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 14, height: 1, background: gold, marginTop: 9, flexShrink: 0 }} />
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#C0B8B0", fontWeight: 300 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "15px 48px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, border: "none", cursor: "pointer", boxShadow: "0 4px 40px rgba(199,171,117,.18)" }}>JOIN THE WAITLIST</button>
          <p style={{ fontFamily: sans, color: "#C0B8B0", fontSize: 11, marginTop: 24, letterSpacing: 1 }}>apply@excaliburacademy.org · support@excaliburacademy.org · Orange County, California</p>
        </Fade>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: BEYOND THE ACADEMY
// ─────────────────────────────────────────────
function BeyondPage({ setPage }) {
  const isMobile = useIsMobile();
  const [activeTier, setActiveTier] = useState(0);

  return (
    <div style={{ background: "#000", paddingTop: 80 }}>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "60px 16px 40px" : "80px 40px 56px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>BEYOND THE ACADEMY</Eyebrow>
          <SectionTitle center>The real world. In real time.</SectionTitle>
          <Sub center>The curriculum builds the foundation. What happens outside the classroom builds the person. These are not simulations. They produce tangible outcomes — documents, deliverables, revenue, references, and the irreversible experience of performing under genuine pressure.</Sub>
        </Fade>
      </div>

      <Hr />

      {/* REAL-WORLD ENGAGEMENTS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>REAL-WORLD ENGAGEMENTS</Eyebrow><SectionTitle>Where theory meets reality.</SectionTitle></Fade>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 36 }}>
          {handson.map((p, i) => (
            <Fade key={i} d={i * .04}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", background: "#111" }}>
                <div style={{ background: "#080808", padding: "44px 40px", borderTop: i === 0 ? `2px solid ${gold}` : "2px solid rgba(199,171,117,.1)" }}>
                  <Eyebrow>{p.tag}</Eyebrow>
                  <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: "#E8E0D8", lineHeight: 1.1, marginBottom: 18 }}>{p.title}</h3>
                  <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300 }}>{p.desc}</p>
                </div>
                <div style={{ background: "#060606", padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.04)" }}>
                  <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 3, color: "#C8C0B8", fontWeight: 500, marginBottom: 14 }}>THE OUTCOME</p>
                  <p style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.65, color: "#B8B0A8", fontStyle: "italic" }}>{p.outcome}</p>
                </div>
              </div>
            </Fade>
          ))}

          {/* College admissions block */}
          <Fade d={.16}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", background: "#111" }}>
              <div style={{ background: "#080808", padding: "44px 40px", borderTop: `2px solid ${gold}` }}>
                <Eyebrow>COLLEGE ADMISSIONS ADVANTAGE</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: "#E8E0D8", lineHeight: 1.1, marginBottom: 18 }}>A portfolio that speaks for itself.</h3>
                <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300, marginBottom: 14 }}>An Excalibur graduate arrives at their college application with something that cannot be manufactured: documented evidence of real-world performance across ten months. A consulting report. An externship record. A funded business. Competition results. A graduation portfolio. Faculty recommendations written by practitioners who watched them operate under genuine pressure, over an extended period, and have something specific to say.</p>
                <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300 }}>Admissions counselors who work with our students help build this portfolio, shape the narrative that connects it to each application, and prepare students for admissions interviews grounded in real, specific experience — not rehearsed answers about hypothetical situations. The experience itself is exceptional. Part of our role is ensuring the story is told as well as it was lived.</p>
              </div>
              <div style={{ background: "#060606", padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.04)" }}>
                <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 3, color: "#C8C0B8", fontWeight: 500, marginBottom: 20 }}>WHAT THIS MEANS IN PRACTICE</p>
                {[
                  "Bound graduation portfolio: consulting reports, externship deliverables, pitch recordings, business analyses, Sector Journal, and personal leadership framework",
                  "Faculty letters of recommendation written by practitioners who observed the student across ten months under real conditions — specific, credible, and impossible to confuse with a form letter",
                  "Verified competition record: Monthly Pitch Night results, City Championship standing, National Championship performance",
                  "Admissions counselor reviews and shapes the portfolio narrative for each university application",
                  "Interview preparation grounded in real experience — not scripted answers, but genuine stories from things that actually happened",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 16, height: 1.5, background: gold, marginTop: 9, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </div>

      <Hr />

      {/* COMPETITIONS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade><Eyebrow>COMPETITIONS</Eyebrow><SectionTitle>Performance under genuine pressure.</SectionTitle><p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C8C0B8", fontWeight: 300, marginTop: 12, maxWidth: 680 }}>Every competition at Excalibur is evaluated by real professionals — entrepreneurs, investors, and executives who have no obligation to be generous. Students know this. That is precisely the point.</p></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 2, background: "#111", marginTop: 36 }}>
            {[
              { title: "Monthly Pitch Night", tag: "12× per year · All programs", desc: "Students deliver pitches to a panel of guest judges — local entrepreneurs, investors, and professionals. Judges score on clarity, viability, delivery quality, and composure under live questioning. Parents attend. Students receive specific, actionable feedback after every performance. Over ten months, the progression is dramatic: a student who could barely make eye contact in September is fielding tough investor questions with composure by March." },
              { title: "Shark Tank Finale", tag: "Summer & Six-Week programs", desc: "The closing event for summer and six-week programs. Teams develop a complete business concept throughout the program and pitch it to a panel of real entrepreneurs and investors. Judges ask tough questions. Parents are in the audience. Cash prizes are awarded: Best Business Concept ($2,000), Best Pitch ($1,000), Most Innovative ($500). This is not a gentle end-of-program showcase. It is a real evaluation by real professionals, and the students know it." },
              { title: "City Championship", tag: "Biannual · Flagship students", desc: "A biannual formal competition held at a premium venue with community judges. The City Championship is the academy's signature competitive event for flagship students. Students compete individually and in teams across multiple categories. Awards and recognition are presented in a formal ceremony. Top performers advance to the National Championship pipeline." },
              { title: "Demo Day & Graduation", tag: "Annual · Flagship capstone", desc: "The culminating event. Each team delivers a ten-minute pitch of their operating micro-business to an audience of parents, mentors, investors, and press. Five judges evaluate on viability, pitch quality, execution evidence, and composure under questioning. Every graduate receives a professionally bound portfolio. Alumni status activates. They are not the same person who walked in ten months ago — and everyone in the room can see it." },
            ].map((c, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 32px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}` }}>
                <Eyebrow>{c.tag.toUpperCase()}</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#E8E0D8", marginBottom: 16, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#C8C0B8", fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <Hr />

      {/* DISTINCTIONS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>DISTINCTIONS & HONORS</Eyebrow><SectionTitle center>What Excellence Earns</SectionTitle><Sub center>Exceptional performance deserves recognition proportionate to its rarity. These are not participation awards.</Sub></div></Fade>
        <Fade d={.08}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
            {distinctions.map((d, i) => <SBtn key={i} active={activeTier === i} onClick={() => setActiveTier(i)}>{d.tier}</SBtn>)}
          </div>
        </Fade>
        <Fade d={.12}>
          <p style={{ fontFamily: sans, fontSize: 10, color: "#C8C0B8", letterSpacing: 2, textAlign: "center", marginBottom: 18 }}>{distinctions[activeTier].label.toUpperCase()}</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 2, background: "#111" }}>
            {distinctions[activeTier].awards.map((a, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 28px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.15)"}` }}>
                <Eyebrow>{a.sub.toUpperCase()}</Eyebrow>
                <h4 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#E8E0D8", marginBottom: 14, lineHeight: 1.2 }}>{a.title}</h4>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.75, color: "#C8C0B8", fontWeight: 300 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <Hr />

      {/* FIELD TRIPS & EXPEDITIONS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade>
          <Eyebrow>FIELD TRIPS & EXPEDITIONS</Eyebrow>
          <SectionTitle>The classroom extends beyond the room.</SectionTitle>
          <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#C0B8B0", fontWeight: 300, marginTop: 12, marginBottom: 36, maxWidth: 680 }}>Real places. Real companies. Real people who built something significant. Students visit the environments where consequential things actually happen — and hear from the people who made them happen.</p>
        </Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
            {fieldTrips.map((f, i) => (
              <div key={i} style={{ background: "#080808", overflow: "hidden", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}` }}>
                <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                  <img src={f.img} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) grayscale(20%)", transition: "transform .5s ease" }} onError={e => e.target.style.display = "none"} onMouseEnter={e => e.target.style.transform = "scale(1.04)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.8) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", top: 10, right: 10, fontFamily: sans, fontSize: 9, color: gold, border: "1px solid rgba(199,171,117,.4)", padding: "3px 8px", letterSpacing: "0.1em", background: "rgba(0,0,0,.5)", textTransform: "uppercase", fontWeight: 600 }}>{f.type}</div>
                </div>
                <div style={{ padding: "22px 22px 26px" }}>
                  <p style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>{f.tag}</p>
                  <h4 style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, color: "#E8E0D8", marginBottom: 12, lineHeight: 1.2 }}>{f.title}</h4>
                  <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.75, color: "#C0B8B0", fontWeight: 300 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <Hr />

      {/* CTA */}
      <div style={{ padding: isMobile ? "60px 16px" : "80px 40px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>JOIN THE FOUNDING CLASS</Eyebrow>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,48px)", fontWeight: 600, color: "#E8E0D8", marginBottom: 12, lineHeight: 1.1 }}>The experience begins<br /><span style={{ color: gold }}>the moment you apply.</span></h2>
          <Sub center>Twenty-five students per cohort. One founding class. Applications are open now.</Sub>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 44px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, border: "none", cursor: "pointer", marginTop: 32 }}>APPLY NOW</button>
        </Fade>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: INDIVIDUAL FACULTY PROFILE
// ─────────────────────────────────────────────
const facultyProfiles = {
  "chip-pankow": {
    name: "Chip Pankow",
    role: "Lead Program Director",
    img: "https://i.imgur.com/Ckny7HG.png",
    tags: ["Entrepreneurship", "Autonomous Systems", "EV Technology", "Global Motorsport", "Startup Scaling", "Institutional Funding"],
    headline: "The operator who builds what others only imagine.",
    paras: [
      "Chip Pankow is an entrepreneur and chief executive known for building and scaling ventures across technology, mobility, and global sports. Guided by a passion for the projects he pursues, he has consistently translated bold ideas into high-impact platforms through a combination of technical fluency, operational discipline, and decisive execution.",
      "As CEO of Roborace, he transformed a conceptual initiative into the world's first autonomous racing competition — delivering industry-first advancements in AI vehicle control, race logic, and real-time digital twin environments. The program achieved a Guinness World Record for autonomous performance and a record-setting run at the Goodwood Festival of Speed.",
      "He later led U.S. operations for Arrival, overseeing engineering, software, and simulation teams and contributing to the company's $13 billion NASDAQ listing, establishing a key innovation hub for next-generation electric vehicle platforms.",
      "Pankow's entrepreneurial foundation was built through the creation of globally recognized sports properties. As Founder and CEO of Global Rallycross, he introduced modern rallycross to the United States at X-Games and scaled it into a premier motorsport with drivers including Ken Block, Travis Pastrana and Tanner Foust, broadcast in over 130 countries. Earlier, as Series Director of Formula BMW, he built a leading international driver development platform whose graduates include Formula 1 World Champions Sebastian Vettel and Nico Rosberg.",
      "He also founded Emotive, an experiential marketing company that became a trusted partner to global automotive brands including Ferrari, BMW, Audi, Michelin, and General Motors. Across multiple ventures, he has secured over $100M in institutional funding.",
      "Currently, as Chief Executive Officer of SparrowBid, Pankow is leading the development of a next-generation travel marketplace designed to redefine how consumers access and price hotel inventory in the highly competitive $400 billion industry. A professional Auto & Rally Racer, his success is rooted in his ability to identify opportunity, align stakeholders, and execute at speed.",
    ],
    credentials: [
      "CEO of Roborace — world's first autonomous racing series · Guinness World Record holder",
      "Led Arrival USA through $13B NASDAQ listing",
      "Founder & CEO of Global Rallycross — ESPN & NBC · 130+ countries",
      "Series Director Formula BMW — developed Sebastian Vettel & Nico Rosberg",
      "$100M+ in institutional funding secured across multiple ventures",
      "Professional Auto & Rally Racer",
    ],
  },
  "bill-morris": {
    name: "Bill Morris",
    role: "Academy Director & Senior Instructor",
    img: "https://i.imgur.com/GDkTAdw.jpeg",
    tags: ["M&A Strategy", "Finance", "Leadership", "TEDx Speaker", "Author", "Georgetown MBA Professor"],
    headline: "Wall Street veteran. Boardroom strategist. The rarest kind of educator.",
    paras: [
      "William Morris is a transformational finance and strategy executive with over 30 years of experience at the highest levels of Wall Street, corporate leadership, and executive education. He began his career at Exxon Corporation, earning four promotions in five years, before heading international finance and operations for Kidder Peabody across London, Paris, Geneva, Zurich, Hong Kong, and Tokyo.",
      "Becoming a Wall Street executive at age 30, Bill led international operations across five continents, navigating complex cross-border transactions and managing institutional relationships that span decades. His international experience gave him a rare command of how capital, culture, and leadership intersect in the real world.",
      "As Senior Vice President and Managing Director at Geneva Capital Markets — then a division of Citigroup — he completed over 100 closed middle-market M&A transactions and advised more than 600 private-company CEOs on valuation, exits, and strategy. He later served as Executive Vice President and Chief Financial Officer of Media Arts Group, a NYSE-listed company, overseeing financial operations, investor relations, and the company's $450M brand portfolio.",
      "A sought-after educator and speaker, Bill is currently an Adjunct Professor at Georgetown University's McDonough School of Business, where he teaches advanced MBA courses on strategic behavior and competitive dynamics. He is also a professor at UC Irvine's Paul Merage School of Business.",
      "Bill is the author of The Formula for Success, a TEDx speaker, sits on three corporate boards, and has spoken at institutions from West Point to Stanford. He holds a Guinness World Record — 20,100 consecutive sit-ups in 11 hours and 32 minutes — achieved while raising over $150,000 for the Make-A-Wish Foundation.",
    ],
    credentials: [
      "Wall Street executive at age 30 — Kidder Peabody: London, Paris, Geneva, Zurich, Hong Kong, Tokyo",
      "Former Citigroup Managing Director — 100+ M&A transactions · 600+ CEO advisory engagements",
      "EVP & CFO of two NYSE-listed companies",
      "Adjunct Professor: Georgetown McDonough MBA · UC Irvine Paul Merage School of Business",
      "TEDx speaker · Author: The Formula for Success · Three corporate board seats",
      "Has spoken at West Point, Stanford, and institutions across the United States",
    ],
  },
  "erik-dostal": {
    name: "Erik Dostal",
    role: "Senior Program Director",
    img: "https://i.imgur.com/vAvvZud.jpeg",
    tags: ["Education Systems", "Curriculum Design", "International Accreditation", "Franchise Development", "Entrepreneurship"],
    headline: "Built an educational institution. Then franchised it across 25 locations.",
    paras: [
      "Erik Dostal is the founder and president of CA Institute, a comprehensive educational institution he built from the ground up into a leading international provider of English language, business, and professional education — serving over 6,000 students across 25 international franchise locations.",
      "Over nearly three decades, Erik has demonstrated what it means to build an educational institution that operates at genuine scale: generating $4.8M in annual revenues, sustaining 20% year-over-year growth, and closing franchise deals spanning multiple continents, with campuses in Huntington Beach, California and Czech Republic.",
      "He holds an MA in TESOL from the University of Chichester and NILE, an MBA from IDRAC Business School, and a BA in Cultural Anthropology from Chapman University, where he was also a collegiate athlete. A former U.S. Youth National Team soccer player, Erik has channeled his competitive background into youth development, coaching, and the design of high-performance learning environments.",
      "He has authored multiple textbooks and publications on teaching methodology, language acquisition, and business education, and has organized international language symposiums attracting thousands of delegates from around the world. A former advisor to the Czech Ministry of Education and a certified international academic accreditor, his work has received European Small Business Awards recognition across multiple years.",
      "At Excalibur Academy, Erik brings the rare combination of deep pedagogical expertise, proven franchise and systems-building experience, and a practitioner's understanding of what it takes to build educational institutions that last.",
    ],
    credentials: [
      "Founder & CEO — CA Institute: 6,000+ students · 25 international franchises",
      "Campuses in Huntington Beach, CA and Czech Republic",
      "Former advisor to the Czech Ministry of Education",
      "Published textbook author · International academic accreditor",
      "European Small Business Awards recognition",
      "U.S. Youth National Soccer Team player",
    ],
  },
  "christopher-sanders": {
    name: "Christopher Sanders",
    role: "Public Speaking Senior Instructor",
    img: "https://i.imgur.com/EELzLmn.jpeg",
    tags: ["Public Speaking", "Leadership Development", "Mindset Coaching", "Criminal Justice", "MBA", "Doctoral Candidate"],
    headline: "Command presence forged in the field. Delivered in every session.",
    paras: [
      "Christopher Sanders is a servant leader, keynote speaker, and doctoral candidate whose career spans law enforcement, higher education, and transformational personal development. A Deputy Sheriff II with the Orange County Sheriff's Department, he brings to every session the clarity, composure, and command presence that comes from operating under genuine high-stakes pressure.",
      "He holds an MBA in Strategic Management from Davenport University — graduating with a 3.95 GPA — and is completing a Doctorate in Public Administration at the University of La Verne. He has served as an Adjunct Professor at Rancho Santiago Community College District and at Davenport University, where he taught across multiple disciplines for nearly four years.",
      "Beyond the classroom, Christopher runs his own leadership and mindset development seminars — most recently his Living Life Unchained series in Irvine, California — focused on breaking limiting beliefs, building discipline-based systems, and creating lasting behavioral change in adults and young professionals.",
      "A keynote speaker and mindset coach, his work centers on helping individuals break limiting patterns, build structure, and operate with clarity and accountability — bridging real-world public service experience with leadership development and community impact.",
      "At Excalibur Academy, Christopher owns the public speaking block that runs through every single session — developing voice mechanics, physical presence, impromptu delivery, advanced rhetoric, and the kind of composure under pressure that most teenagers have never been asked to find.",
    ],
    credentials: [
      "Deputy Sheriff II — Orange County Sheriff's Department",
      "MBA in Strategic Management, Davenport University (3.95 GPA)",
      "Doctoral Candidate, Public Administration — University of La Verne",
      "Adjunct Professor: Rancho Santiago CCD · Davenport University",
      "Keynote speaker · Mindset coach · Living Life Unchained seminar leader",
    ],
  },
};

function FacultyProfilePage({ slug, setPage }) {
  const isMobile = useIsMobile();
  const f = facultyProfiles[slug];

  if (!f) {
    return (
      <div style={{ background: "#000", minHeight: "100vh", paddingTop: 120, textAlign: "center" }}>
        <p style={{ fontFamily: sans, color: "#C8C0B8", fontSize: 14 }}>Faculty profile not found.</p>
        <button onClick={() => setPage("faculty")} style={{ fontFamily: sans, color: gold, background: "transparent", border: "none", cursor: "pointer", fontSize: 13, marginTop: 16 }}>← Back to Faculty</button>
      </div>
    );
  }

  return (
    <div style={{ background: "#000", paddingTop: 80 }}>

      {/* Hero — full bleed photo */}
      <div style={{ position: "relative", height: isMobile ? 400 : 580, overflow: "hidden" }}>
        <img src={f.img} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "brightness(0.4) grayscale(10%)" }} onError={e => e.target.style.display = "none"} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,.85) 0%, rgba(0,0,0,.3) 60%, transparent 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.95) 0%, transparent 55%)" }} />
        {/* Back button */}
        <button onClick={() => setPage("faculty")} style={{ position: "absolute", top: 24, left: isMobile ? 20 : 60, fontFamily: sans, background: "transparent", border: "none", color: "rgba(199,171,117,.6)", fontSize: 11, cursor: "pointer", letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: 6 }}>← OUR FACULTY</button>
        {/* Name + role overlay */}
        <div style={{ position: "absolute", bottom: isMobile ? 36 : 64, left: isMobile ? 28 : 72, maxWidth: 620 }}>
          <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>{f.role}</p>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(36px,8vw,52px)" : "clamp(48px,5vw,72px)", fontWeight: 600, color: "#F0E8E0", lineHeight: 1.0, marginBottom: 16 }}>{f.name}</h1>
          <div style={{ width: 56, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 16 }} />
          <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 18, color: "#C8C0B8", fontStyle: "italic", lineHeight: 1.55 }}>{f.headline}</p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? 0 : 2, background: "#111" }}>

        {/* Bio — left */}
        <div style={{ background: "#080808", padding: isMobile ? "48px 28px" : "72px 72px" }}>
          <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 36 }} />
          {f.paras.map((para, i) => (
            <p key={i} style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 1.95, color: "#C0B8B0", fontWeight: 300, marginBottom: 22 }}>{para}</p>
          ))}
          <div style={{ marginTop: 48 }}>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>Apply to Study Under {f.name.split(" ")[0]} →</button>
          </div>
        </div>

        {/* Credentials sidebar — right */}
        <div style={{ background: "#07060A", padding: isMobile ? "40px 28px" : "72px 40px" }}>
          <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: "#9A9290", fontWeight: 600, textTransform: "uppercase", marginBottom: 24 }}>Credentials</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {f.credentials.map((cr, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(199,171,117,.07)", alignItems: "flex-start" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: gold, flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontFamily: sans, fontSize: 12, color: "#C0B8B0", fontWeight: 300, lineHeight: 1.65 }}>{cr}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}>
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: "#9A9290", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Expertise</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {f.tags.map((t, i) => (
                <span key={i} style={{ fontFamily: sans, fontSize: 9, color: "#C0B8B0", letterSpacing: "0.1em", border: "1px solid rgba(199,171,117,.15)", padding: "4px 10px", textTransform: "uppercase" }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid rgba(199,171,117,.08)" }}>
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: "#9A9290", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Also Meet</p>
            {Object.values(facultyProfiles).filter(p => p.name !== f.name).slice(0, 3).map((p, i) => (
              <div key={i} onClick={() => setPage(`faculty:${p.name.toLowerCase().replace(/ /g, "-")}`)} style={{ display: "flex", gap: 12, marginBottom: 14, cursor: "pointer", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, overflow: "hidden", border: "1px solid rgba(199,171,117,.15)", flexShrink: 0 }}>
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                </div>
                <div>
                  <p style={{ fontFamily: serif, fontSize: 13, color: "#E8E0D8" }}>{p.name}</p>
                  <p style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.08em" }}>{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: OUR FACULTY (listing)
function FacultyPage({ setPage }) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState({});

  const faculty = [
    {
      name: "Chip Pankow",
      role: "Lead Program Director",
      img: "https://i.imgur.com/Ckny7HG.png",
      tags: ["Entrepreneurship", "Autonomous Systems", "EV Technology", "Motorsport", "Startup Scaling"],
      bio: "Chip Pankow is an entrepreneur and chief executive known for building and scaling ventures across technology, mobility, and global sports. As CEO of Roborace, he transformed a conceptual initiative into the world's first autonomous racing competition, delivering industry-first advancements in AI vehicle control, race logic, and real-time digital twin environments. The program achieved a Guinness World Record for autonomous performance and a record-setting run at the Goodwood Festival of Speed.\n\nHe later led U.S. operations for Arrival, overseeing engineering, software, and simulation teams — contributing to the company's $13 billion NASDAQ listing and establishing a key innovation hub for next-generation electric vehicle platforms.\n\nAs Founder and CEO of Global Rallycross, he introduced modern rallycross to the United States at X-Games and scaled it into a premier motorsport broadcast in over 130 countries, featuring Ken Block, Travis Pastrana, and Tanner Foust. Earlier, as Series Director of Formula BMW, he built the leading international driver development platform that produced multiple Formula 1 World Champions including Sebastian Vettel and Nico Rosberg.\n\nHe secured over $100M in institutional funding across multiple ventures and is a professional Auto & Rally Racer. Currently CEO of SparrowBid, a next-generation travel marketplace."
    },
    {
      name: "Bill Morris",
      role: "Academy Director & Senior Instructor",
      img: "https://i.imgur.com/GDkTAdw.jpeg",
      tags: ["M&A Strategy", "Finance", "Leadership", "TEDx Speaker", "Georgetown MBA Professor"],
      bio: "William Morris is a transformational finance and strategy executive with over 30 years of experience at the highest levels of Wall Street, corporate leadership, and executive education. He began his career at Exxon Corporation, earning four promotions in five years, before heading international finance and operations for Kidder Peabody across London, Paris, Geneva, Zurich, Hong Kong, and Tokyo.\n\nAs Senior Vice President and Managing Director at Geneva Capital Markets — then a division of Citigroup — he completed over 100 closed middle-market M&A transactions and advised more than 600 private-company CEOs on valuation, exits, and strategy. He later served as Executive Vice President and Chief Financial Officer of Media Arts Group, a NYSE-listed company.\n\nA sought-after educator and speaker, Bill is currently an Adjunct Professor at Georgetown University's McDonough School of Business, where he teaches advanced MBA courses on strategic behavior and competitive dynamics. He is also a professor at UC Irvine's Paul Merage School of Business.\n\nBill is the author of The Formula for Success, a TEDx speaker, sits on three corporate boards, and has spoken at institutions from West Point to Stanford."
    },
    {
      name: "Erik Dostal",
      role: "Senior Program Director",
      img: "https://i.imgur.com/vAvvZud.jpeg",
      tags: ["Education Systems", "Curriculum Design", "International Accreditation", "Franchise Development"],
      bio: "Erik Dostal is the founder and president of CA Institute, a comprehensive educational institution he built from the ground up into a leading international provider of English language, business, and professional education — serving over 6,000 students across 25 international franchise locations.\n\nOver nearly three decades, Erik has demonstrated what it means to build an educational institution that operates at genuine scale: generating $4.8M in annual revenues, sustaining 20% year-over-year growth, and closing franchise deals spanning multiple continents.\n\nHe holds an MA in TESOL from the University of Chichester and NILE, an MBA from IDRAC Business School, and a BA in Cultural Anthropology from Chapman University. A former U.S. Youth National Team soccer player, he has authored multiple textbooks and publications on teaching methodology and business education.\n\nA former advisor to the Czech Ministry of Education and a certified international academic accreditor, his work has received European Small Business Awards recognition across multiple years."
    },
    {
      name: "Christopher Sanders",
      role: "Public Speaking Senior Instructor",
      img: "https://i.imgur.com/EELzLmn.jpeg",
      tags: ["Public Speaking", "Leadership Development", "Mindset Coaching", "Criminal Justice", "Doctoral Candidate"],
      bio: "Christopher Sanders is a servant leader, keynote speaker, and doctoral candidate whose career spans law enforcement, higher education, and transformational personal development. A Deputy Sheriff II with the Orange County Sheriff's Department, he brings to every session the clarity, composure, and command presence that comes from operating under genuine high-stakes pressure.\n\nHe holds an MBA in Strategic Management from Davenport University — graduating with a 3.95 GPA — and is completing a Doctorate in Public Administration at the University of La Verne. He has served as an Adjunct Professor at Rancho Santiago Community College District and at Davenport University, teaching across multiple disciplines for nearly four years.\n\nBeyond the classroom, Christopher runs his own leadership and mindset development seminars — most recently his Living Life Unchained series in Irvine, California — focused on breaking limiting beliefs, building discipline-based systems, and creating lasting behavioral change in adults and young professionals.\n\nAt Excalibur Academy, Christopher owns the public speaking block that runs through every single session — developing voice mechanics, physical presence, impromptu delivery, advanced rhetoric, and the kind of composure under pressure that most teenagers have never been asked to find.\n\nHis work centers on helping individuals break limiting patterns, build structure, and operate with clarity and accountability — bridging real-world public service experience with leadership development and community impact."
    },
  ];

  return (
    <div style={{ background: "#000", paddingTop: 80 }}>

      {/* Hero */}
      <div style={{ padding: isMobile ? "60px 24px 48px" : "88px 80px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <Fade>
          <Eyebrow>OUR FACULTY</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(32px,7vw,48px)" : "clamp(44px,5vw,64px)", fontWeight: 600, color: "#E8E0D8", lineHeight: 1.05, marginBottom: 16 }}>
            The people<br /><span style={{ color: gold }}>behind the programme.</span>
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.85, color: "#C0B8B0", fontWeight: 300, maxWidth: 580 }}>
            Every faculty member at Excalibur has operated at the highest levels of their respective field. They are not career academics. They are the people who built, led, and created the things they now teach.
          </p>
        </Fade>
      </div>

      <div style={{ height: 1, background: "rgba(199,171,117,.1)" }} />

      {/* Faculty list */}
      {faculty.map((f, idx) => (
        <Fade key={idx} d={idx * .04}>
          <div style={{ borderBottom: "1px solid rgba(199,171,117,.07)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "52px 24px" : "72px 80px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "320px 1fr", gap: isMobile ? 36 : 80, alignItems: "start" }}>

              {/* Photo + name column */}
              <div>
                <div style={{ position: "relative", paddingBottom: "100%", overflow: "hidden", marginBottom: 24, border: "1px solid rgba(199,171,117,.12)" }}>
                  <img src={f.img} alt={f.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(15%)" }} onError={e => e.target.style.display = "none"} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 50%)" }} />
                </div>
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#E8E0D8", marginBottom: 4 }}>{f.name}</h2>
                <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>{f.role}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {f.tags.map((t, i) => (
                    <span key={i} style={{ fontFamily: sans, fontSize: 9, color: "#C0B8B0", letterSpacing: "0.1em", border: "1px solid rgba(199,171,117,.15)", padding: "3px 8px", textTransform: "uppercase" }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Bio column */}
              <div>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
                {f.bio.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#C0B8B0", fontWeight: 300, marginBottom: 18 }}>{para}</p>
                ))}
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, padding: "10px 22px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", marginTop: 8 }}>Apply to Study Under This Faculty →</button>
              </div>
            </div>
          </div>
        </Fade>
      ))}

      {/* CTA */}
      <div style={{ padding: isMobile ? "60px 24px" : "80px 80px", textAlign: "center" }}>
        <Fade>
          <SectionTitle center>Ready to learn from the best?</SectionTitle>
          <Sub center>Applications for the Summer Intensive 2026 are now open. Enrollment is limited.</Sub>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 44px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, border: "none", cursor: "pointer", marginTop: 28 }}>APPLY NOW</button>
        </Fade>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMING SOON LANDING PAGE
// ─────────────────────────────────────────────
function ComingSoonPage({ onUnlock }) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [passShake, setPassShake] = useState(false);

  const SECRET = "excalibur2026";

  const tryUnlock = () => {
    if (pass.trim().toLowerCase() === SECRET) {
      try { sessionStorage.setItem("ea_unlocked", "1"); } catch(e) {}
      onUnlock();
    } else {
      setPassError(true);
      setPassShake(true);
      setTimeout(() => setPassShake(false), 500);
    }
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Forum&display=swap" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <style>{`*{margin:0;padding:0;box-sizing:border-box}::selection{background:rgba(199,171,117,.2);color:#fff}body{overflow-x:hidden}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>

      {/* Background — pure black with subtle gold glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(199,171,117,.04) 0%, transparent 65%)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "48px 24px" : "80px 40px", textAlign: "center" }}>

        {/* Logo */}
        <img src={LOGO_URL} alt="Excalibur Academy" style={{ width: isMobile ? 200 : 320, height: "auto", objectFit: "contain", marginBottom: 28, filter: "drop-shadow(0 0 60px rgba(199,171,117,.18))" }} onError={e => e.target.style.display = "none"} />

        {/* Eyebrow */}
        <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20, borderBottom: "1px solid rgba(199,171,117,.3)", paddingBottom: 8, display: "inline-block" }}>
          Orange County, California &nbsp;·&nbsp; Founding Class 2026
        </p>

        {/* Title — uniform uppercase via textTransform to match homepage */}
        <h1 style={{ fontFamily: "'Forum', Georgia, serif", fontSize: isMobile ? "clamp(22px,5vw,32px)" : "clamp(28px,3.5vw,44px)", fontWeight: 400, color: "#E8E0D8", lineHeight: 1.05, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 12 }}>
          Excalibur Academy
        </h1>
        <p style={{ fontFamily: sans, fontSize: isMobile ? 12 : 14, letterSpacing: "0.22em", color: gold, textTransform: "uppercase", marginBottom: 16, opacity: 0.85 }}>
          Forging the leaders of tomorrow
        </p>

        {/* Tagline from homepage */}
        <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 16, color: "#C8C0B8", lineHeight: 1.75, maxWidth: 640, marginBottom: 40, fontWeight: 300 }}>
          A premier institute where real entrepreneurs, investors, top CEOs, keynote speakers and distinguished professionals teach the next generation to lead the world — not follow it.
        </p>

        {/* Status banner */}
        <div style={{ background: "rgba(199,171,117,.05)", border: "1px solid rgba(199,171,117,.18)", padding: isMobile ? "20px 24px" : "24px 48px", marginBottom: 44, maxWidth: 660 }}>
          <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: "#4DB87A", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>● Admissions Opening Soon</p>
          <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 15, color: "#E8E0D8", lineHeight: 1.75, fontWeight: 300 }}>For junior and high school seniors.</p>
          <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 15, color: "#E8E0D8", lineHeight: 1.75, fontWeight: 300, marginTop: 4 }}>Enrollment limited to 20 students per cohort.</p>
        </div>

        {/* Program cards — all gold */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111", marginBottom: 52, width: "100%", maxWidth: 880 }}>
          {[
            { label: "SUMMER INTENSIVE", dates: "July & August 2026", detail: "Mon–Fri · 9:30 AM–3:00 PM · $4,500 / wave" },
            { label: "TEN-MONTH FLAGSHIP", dates: "September 2026 – June 2027", detail: "Weekday or Weekend Track · $1,990 / month", flagship: true },
            { label: "SIX-WEEK INTENSIVE", dates: "Four waves · 2026", detail: "Mon & Wed evenings or Saturdays · $3,900 / wave" },
          ].map((p, i) => (
            <div key={i} style={{ background: "#080808", padding: "24px 22px", borderTop: `2px solid ${p.flagship ? gold : "rgba(199,171,117,.2)"}` }}>
              <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>{p.label}</p>
              <p style={{ fontFamily: serif, fontSize: 15, color: "#E8E0D8", marginBottom: 6 }}>{p.dates}</p>
              <p style={{ fontFamily: sans, fontSize: 11, color: "#C8C0B8", fontWeight: 300 }}>{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Faculty credentials — refined split panels */}
        <div style={{ width: "100%", maxWidth: 880, marginBottom: 52 }}>
          <p style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.4em", color: "#C8C0B8", fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Lead Faculty</p>
          <div style={{ background: "#08080A", border: "1px solid rgba(199,171,117,.12)", position: "relative", overflow: "hidden" }}>
            {/* Gold top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
            {/* Corner ornaments */}
            <div style={{ position: "absolute", top: 12, left: 12, width: 18, height: 18, borderTop: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderTop: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 18, height: 18, borderBottom: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 18, height: 18, borderBottom: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ padding: isMobile ? "36px 28px" : "52px 60px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", gap: isMobile ? 32 : 0 }}>
              {/* Faculty 1 */}
              <div style={{ padding: isMobile ? "0" : "0 40px 0 0", textAlign: "center" }}>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${gold})`, margin: "0 auto 20px" }} />
                <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 15, lineHeight: 1.9, color: "#C8C0B8", fontWeight: 400 }}>
                  A CEO who built the world's first autonomous racing series, led the Formula BMW program — developing multiple Formula 1 World Champions — and oversaw a $13B NASDAQ listing. Secured over $100M in institutional funding. Guinness World Record holder and professional racing driver.
                </p>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, margin: "20px auto 0" }} />
              </div>
              {/* Divider */}
              {!isMobile && <div style={{ background: "rgba(199,171,117,.15)", margin: "0 0" }} />}
              {/* Faculty 2 */}
              <div style={{ padding: isMobile ? "0" : "0 0 0 40px", textAlign: "center" }}>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${gold})`, margin: "0 auto 20px" }} />
                <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 15, lineHeight: 1.9, color: "#C8C0B8", fontWeight: 400 }}>
                  A former Citigroup Managing Director with 100+ M&A transactions and 600+ CEO advisory engagements. EVP and CFO of two NYSE-listed companies. Georgetown MBA Professor, TEDx speaker, published author, and member of three corporate boards.
                </p>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, margin: "20px auto 0" }} />
              </div>
            </div>
            {/* Bottom ornament */}
            <div style={{ textAlign: "center", paddingBottom: 20 }}>
              <span style={{ fontFamily: serif, fontSize: 16, color: "rgba(199,171,117,.3)", letterSpacing: "0.3em" }}>✦</span>
            </div>
          </div>
        </div>

        {/* Email capture — invitation card */}
        {!submitted ? (
          <div style={{ width: "100%", maxWidth: 880, marginBottom: 48 }}>
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Family Information Event · May 2026</p>
            <div style={{ background: "#050505", border: `1px solid rgba(199,171,117,.55)`, padding: isMobile ? "36px 28px" : "52px 60px", textAlign: "center", position: "relative" }}>
              {/* Corner ornaments */}
              <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
              {/* Card content */}
              <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 18 }}>Excalibur Academy · May 2026</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 23, color: "#E8E0D8", lineHeight: 1.45, marginBottom: 18 }}>
                Academy Launch and Family Information Soirée<br />at the Mediterranean Estate in San Clemente
              </p>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "0 auto 20px" }} />
              <p style={{ fontFamily: sans, fontSize: isMobile ? 12 : 13, color: "#C0B8B0", fontWeight: 300, lineHeight: 1.85, maxWidth: 520, margin: "0 auto 18px" }}>
                An intimate gathering for a select number of families — featuring faculty introductions, a cocktail reception, a comprehensive information session, and the opportunity to meet the founding team and those leading the programmes.
              </p>
              <p style={{ fontFamily: serif, fontSize: 12, color: gold, letterSpacing: "0.18em", marginBottom: 32 }}>By personal invitation only.</p>
              <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row", maxWidth: 520, margin: "0 auto" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && email && setSubmitted(true)}
                  placeholder="Your email address"
                  style={{ flex: 1, padding: "13px 18px", background: "#000", border: "1px solid rgba(199,171,117,.25)", color: "#E8E0D8", fontFamily: sans, fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = gold}
                  onBlur={e => e.target.style.borderColor = "rgba(199,171,117,.25)"}
                />
                <button
                  onClick={() => email && setSubmitted(true)}
                  style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", flexShrink: 0 }}
                >
                  Request Invitation
                </button>
              </div>
              <p style={{ fontFamily: sans, fontSize: 10, color: "#706860", marginTop: 14, letterSpacing: "0.06em" }}>We will follow up personally. Your information is never shared.</p>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 880, marginBottom: 48 }}>
            <div style={{ background: "#08080A", border: "1px solid rgba(199,171,117,.2)", padding: "44px 52px", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
              <span style={{ fontFamily: serif, fontSize: 28, color: gold, display: "block", marginBottom: 16 }}>✦</span>
              <p style={{ fontFamily: serif, fontSize: 22, color: "#E8E0D8", marginBottom: 12 }}>Thank you.</p>
              <p style={{ fontFamily: sans, fontSize: 14, color: "#C8C0B8", fontWeight: 300, lineHeight: 1.8 }}>We will be in touch personally with details for the May soirée. We look forward to welcoming your family.</p>
            </div>
          </div>
        )}

        {/* Password access */}
        {!showPass ? (
          <button onClick={() => setShowPass(true)} style={{ fontFamily: sans, background: "transparent", border: "none", color: "#333", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Staff access
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, animation: passShake ? "shake 0.4s ease" : "none" }}>
            <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row" }}>
              <input
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); setPassError(false); }}
                onKeyDown={e => e.key === "Enter" && tryUnlock()}
                placeholder="Enter password"
                autoFocus
                style={{ padding: "11px 16px", background: "#0A0A08", border: `1px solid ${passError ? "#c0392b" : "rgba(199,171,117,.2)"}`, color: "#E8E0D8", fontFamily: sans, fontSize: 13, outline: "none", width: isMobile ? "100%" : 220 }}
              />
              <button onClick={tryUnlock} style={{ fontFamily: sans, background: "transparent", border: "1px solid rgba(199,171,117,.3)", color: gold, padding: "11px 20px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", cursor: "pointer", textTransform: "uppercase" }}>
                Enter
              </button>
            </div>
            {passError && <p style={{ fontFamily: sans, fontSize: 11, color: "#c0392b" }}>Incorrect password</p>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "24px 40px", borderTop: "1px solid rgba(199,171,117,.07)" }}>
        <p style={{ fontFamily: sans, fontSize: 11, color: "#444" }}>apply@excaliburacademy.org &nbsp;·&nbsp; support@excaliburacademy.org &nbsp;·&nbsp; Orange County, California</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT — STATE-BASED ROUTER
// ─────────────────────────────────────────────
export default function ExcaliburApp() {
  const [page, setPageRaw] = useState("home");

  // Inject viewport meta into document head for proper mobile rendering
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=5.0";
    // Prevent horizontal overflow
    document.body.style.overflowX = "hidden";
  }, []);

  const setPage = useCallback((p) => {
    setPageRaw(p);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
  }, []);

  const renderPage = () => {
    if (page === "home") return <HomePage setPage={setPage} />;
    if (page === "programs") return <ProgramsPage setPage={setPage} />;
    if (page === "curriculum") return <CurriculumPage setPage={setPage} />;
    if (page === "full-program") return <FullProgramPage setPage={setPage} />;
    if (page === "intensive") return <IntensivePage setPage={setPage} />;
    if (page === "beyond") return <BeyondPage setPage={setPage} />;
    if (page === "faculty") return <FacultyPage setPage={setPage} />;
    if (page.startsWith("faculty:")) return <FacultyProfilePage slug={page.replace("faculty:", "")} setPage={setPage} />;
    if (page === "apply") return <ApplyPage setPage={setPage} />;
    if (page.startsWith("module:")) return <ModulePage slug={page.replace("module:", "")} setPage={setPage} />;
    return <HomePage setPage={setPage} />;
  };

  return (
    <div style={{ background: "#000", color: "#D8D0C8", minHeight: "100vh", fontFamily: sans }}>
      <ScrollProgress />
      <ShimmerStyle />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Forum&display=swap" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <style>{`*{margin:0;padding:0;box-sizing:border-box}::selection{background:rgba(199,171,117,.2);color:#fff}html{scroll-behavior:smooth}body{overflow-x:hidden}button{cursor:pointer;font-family:'DM Sans',sans-serif}img{max-width:100%}`}</style>
      <Nav page={page} setPage={setPage} />

      {renderPage()}
      <Footer setPage={setPage} />
    </div>
  );
}
