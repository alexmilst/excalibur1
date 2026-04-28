import React, { useState, useEffect, useRef, useCallback } from "react";

const STRIPE = "https://buy.stripe.com/placeholder";
const LOGO_URL = "https://i.ibb.co/rKSp526b/upsclae-logo.png";
const LOGO = LOGO_URL;
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Lato', sans-serif";
const eyebrow_font = "'DM Sans', sans-serif";
const gold = "#C7AB75";

// ── RESPONSIVE HOOK ──
function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 900 : false);
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
function StatCounter({ num, suf, label, inView, lightMode }) {
  const counted = useCountUp(num, inView);
  return (
    <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, color: lightMode ? "#111" : "#C7AB75", lineHeight: 1 }}>{counted}{suf}</span>
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
function CountdownTimer({ targetDate, label = "Days Until Wave 1 Opens" }) {
  const calcDays = () => {
    const diff = new Date(targetDate) - new Date();
    return diff <= 0 ? 0 : Math.floor(diff / 86400000);
  };
  const [days, setDays] = useState(calcDays());
  useEffect(() => {
    const i = setInterval(() => setDays(calcDays()), 60000);
    return () => clearInterval(i);
  }, [targetDate]);
  return (
    <div style={{ textAlign: "center", marginBottom: 52 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(100px,18vw,180px)", fontWeight: 300, color: "#FBF7EE", lineHeight: 1, letterSpacing: "-0.04em" }}>{days}</div>
      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, letterSpacing: "0.55em", color: "rgba(199,171,117,.55)", textTransform: "uppercase", marginTop: 14 }}>{label}</div>
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
        <span style={{ fontFamily: serif, color: "#FBF7EE", fontSize: 19, fontWeight: 600, paddingRight: 24, lineHeight: 1.4 }}>{q}</span>
        <span style={{ color: gold, fontSize: 18, flexShrink: 0, marginTop: 3, transform: open ? "rotate(45deg)" : "none", transition: "transform .4s", display: "inline-block" }}>+</span>
      </div>
      <div style={{ maxHeight: open ? 600 : 0, overflow: "hidden", transition: "max-height .6s cubic-bezier(.22,1,.36,1)" }}>
        <p style={{ fontFamily: sans, color: "#FBF7EE", fontSize: 15, lineHeight: 1.9, marginTop: 16, fontWeight: 300, maxWidth: 680 }}>{a}</p>
      </div>
    </div>
  );
}

// ── DATA ──
const currMods = [
  { slug: "public-speaking", title: "The Art of Public Speaking", months: "", tagline: "Presence. Persuasion. Command.", summary: "A rigorous, progressive discipline in persuasion, presence, and executive communication — from voice, posture, and composure to rhetorical strategy, audience psychology, and the architecture of influence.", why: "This is not presentation practice. It is the discipline of learning how to stand before others, think clearly, speak with force, and make an idea impossible to ignore.", body: "Every serious path in leadership begins with the ability to stand before others and speak with clarity, composure, and conviction. This discipline is not about presentation tricks or eliminating filler words. It is a progressive training in persuasion, presence, and executive communication.\n\nStudents begin with the fundamentals: voice, posture, breath, eye contact, structure, and composure under scrutiny. From there, the work advances into narrative design, rhetorical strategy, audience psychology, and the ability to hold attention without volume, spectacle, or force.\n\nGrounded in Aristotle's three modes of persuasion — ethos, pathos, and logos — students learn not only what to say, but when, how, and why to say it. By the end of the program, public speaking is no longer performance. It becomes authority made visible.", whatYouLearn: ["Voice mechanics — projection, pacing, tone variation, and the power of silence", "Physical presence — posture, eye contact, and gesture that conveys authority rather than anxiety", "Aristotle's three modes: ethos (credibility), pathos (emotion), logos (logic)", "Narrative architecture — how to build tension, deliver clarity, and leave one unforgettable idea", "The five-minute pitch — developed, rehearsed, delivered to progressively demanding audiences", "Impromptu speaking — responding to unexpected questions without losing composure", "Advanced rhetoric — anaphora, antithesis, the rule of three", "The psychology of audience management — reading a room and recovering from mistakes in real time"], outcomes: ["Delivers a structured, compelling pitch to a live audience with composure", "Handles hostile questions without losing their thread", "Has been recorded, reviewed, and coached through multiple live presentations"], quote: "“The human voice is the most powerful instrument in the world. The tragedy is that most people never learn to play it.” — Benjamin Disraeli" },
  { slug: "financial-literacy", title: "Financial Literacy & Business Acumen", months: "", tagline: "Understand money. Think like an owner.", summary: "Money is one of the most important languages in the world, and most students are never taught how to speak it. This module teaches the fundamentals of business from an ownership perspective: how companies make money, lose money, price products, manage costs, and decide what is worth pursuing.", why: "Our students learn to read a business the way founders, executives, and investors do — not as a set of abstract numbers, but as a living system of decisions, tradeoffs, incentives, opportunities and consequences.", body: "Money is one of the most important languages in the world, and most students are never taught how to speak it. This module teaches the fundamentals of business from an ownership perspective: how companies make money, lose money, price products, manage costs, and decide what is worth pursuing.\n\nOur students learn to read a business the way founders, executives, and investors do — not as a set of abstract numbers, but as a living system of decisions, tradeoffs, incentives, opportunities and consequences.\n\nFinancial literacy is not about being naturally good with numbers. It is about learning to see reality clearly.", whatYouLearn: ["Revenue vs. profit — and why the difference matters more than most people understand", "How to read a profit-and-loss statement, balance sheet, and cash flow statement", "Unit economics — customer acquisition cost, lifetime value, contribution margin", "Pricing strategy — cost-plus, value-based, competitive, and dynamic pricing", "Compound interest and the mathematics of long-term wealth building", "Equity structures — how ownership in a company is divided, diluted, and valued", "How investors evaluate businesses — multiples, EBITDA, comparable transactions", "Live financial analysis of real local businesses, presented to guest practitioners"], outcomes: ["Reads and interprets a P&L statement without assistance", "Can explain the unit economics of any business they encounter", "Has presented a financial analysis of a real business to a professional audience"], quote: "Financial literacy is not about being naturally good with numbers. It is about learning to see reality clearly." },
  { slug: "ai-technology", title: "AI, Technology & Innovation", months: "", tagline: "Wield the tools reshaping every work process.", summary: "AI is not a separate subject at Excalibur. It is a working instrument used across business research, financial modeling, competitive analysis, pitch development, and venture strategy.", why: "Students learn how founders use technology: to find patterns, test assumptions, compare markets, improve decisions, and execute with greater speed and clarity.", body: "At Excalibur, artificial intelligence is not treated as a standalone subject — it is a working instrument used across business research, financial modeling, competitive analysis, pitch development, and venture strategy. From the first week onward, AI is integrated across disciplines, used the way entrepreneurs, executives, and strategists use it: to find patterns, test assumptions, compare markets, improve decisions, and execute with greater speed and clarity.\n\nStudents learn to deploy AI for rapid market research, real-time competitive analysis, and on-demand financial modelling — tasks that once required teams of analysts and weeks of work. They are trained not merely to use tools, but to ask better questions of them.\n\nThe future will not belong to passive users of technology. It will belong to those with the judgment to direct it.", whatYouLearn: ["How large language models actually work — training data, parameters, inference, and limitations", "AI as a business tool — market research, competitive analysis, financial modeling", "Prompt engineering — how to instruct AI to produce reliable, high-quality outputs", "No-code platform development — building functional tools and automations without code", "AI in each industry sector — how technology is disrupting every major field", "Critical evaluation of AI output — when to trust it, when to verify, when to override", "The ethics of AI — bias, IP, job displacement, and builder responsibility", "Building an AI-powered business concept from research through pitch"], outcomes: ["Uses AI tools for research and strategy as a natural workflow, not a novelty", "Has built at least one functional no-code tool or automation", "Can articulate how AI works beneath the interface to someone unfamiliar with it"], quote: "The future will not belong to passive users of technology. It will belong to those with the judgment to direct it." },
  { slug: "art-of-selling", title: "The Art of Selling & Marketing", months: "", tagline: "Persuasion with integrity. Influence with purpose.", summary: "From social media marketing to nine-figure M&A deals, every outcome in business comes down to selling. This module treats it as a core life skill — training students in real-world persuasion as it actually happens: unscripted, high-stakes, and consequential.", why: "Selling is everywhere in business: raising capital, winning customers, pitching a product, building a brand, negotiating a deal, or convincing a team to believe in a direction.", body: "From social media marketing to nine-figure M&A deals, every outcome in business comes down to selling. This module treats it as a core life skill — training students in real-world persuasion as it actually happens: unscripted, high-stakes, and consequential.\n\nAt Excalibur, students learn the real mechanics of persuasion: listening, questioning, positioning, objection handling, confidence under pressure, and the ability to explain why something matters. This is not about tricks or pressure. It is about clarity, trust, timing, and the courage to make a case.\n\nThe best salespeople are not the loudest voices in the room. They are the sharpest listeners, who asked better questions than anyone else in the room.", whatYouLearn: ["Consultative selling — the discipline of asking, listening, and diagnosing before proposing", "Cialdini's six principles of influence: reciprocity, commitment, social proof, authority, liking, scarcity", "The five most common sales objections and the honest, effective response to each", "Needs analysis — identifying what someone actually wants versus what they say they want", "The anatomy of a sales conversation — opening, discovery, presentation, close", "Cold outreach, warm introduction, and referral mechanics", "The ethics of persuasion — where influence ends and manipulation begins", "Live roleplay with recorded feedback from coaches"], outcomes: ["Conducts a complete consultative sales conversation with genuine listening", "Handles objections without defensiveness or pressure", "Can articulate the ethical framework separating trusted advisors from manipulators"], quote: "" },
  { slug: "leadership", title: "Leadership, Ownership & Influence", months: "", tagline: "Lead with earned authority, not borrowed title.", summary: "Leadership begins where comfort ends: in moments of pressure, uncertainty, disagreement, and responsibility. This module teaches the disciplines behind effective leadership — building trust, reading people, managing conflict, making decisions without perfect information, communicating clearly, and staying composed when others are looking for direction.", why: "Leadership begins where comfort ends: in moments of pressure, uncertainty, disagreement, and responsibility. This module teaches the disciplines behind effective leadership — building trust, reading people, managing conflict, making decisions without perfect information, communicating clearly, and staying composed when others are looking for direction.", body: "Leadership begins where comfort ends: in moments of pressure, uncertainty, disagreement, and responsibility.\n\nThis module teaches the disciplines behind effective leadership — building trust, reading people, managing conflict, making decisions without perfect information, communicating clearly, and staying composed when others are looking for direction.\n\nStudents examine the difference between power and influence, explore emotional intelligence, conflict resolution, courage, team dynamics, and the invisible work of preparation that separates genuine leaders from those who merely hold titles.\n\nA title can be given. Authority has to be earned.", whatYouLearn: ["The five forms of power — legitimate, reward, coercive, expert, referent — and which create lasting authority", "Emotional intelligence — self-awareness, self-regulation, empathy, motivation, and social skill", "Decision-making under uncertainty — frameworks for consequential choices with incomplete information", "Conflict resolution — how to navigate disagreement and maintain relationships across rupture", "Team dynamics — stages of team development and roles within high-performing teams", "The invisible work of leadership — preparation, follow-through, and trust-building habits", "Crisis communication — how to lead when things are going wrong and everyone is watching", "CEO crisis simulation — a live exercise running a fictional company through a real-time emergency"], outcomes: ["Can identify the five forms of power and explain which create lasting influence", "Has led a team through a live crisis simulation", "Can articulate a personal leadership framework as a set of practices, not a personality description"], quote: "“Leadership is the art of getting someone else to do something because he wants to do it.” — Dwight D. Eisenhower" },
  { slug: "business-models", title: "Business Model Analysis", months: "", tagline: "Break down any business. Understand any market. Find the logic.", summary: "This discipline trains students to look beneath the surface of a company and understand the structure underneath: how it creates value, earns revenue, controls costs, reaches customers, defends margins, and survives competition. Students learn to analyze businesses the way founders, executives, and investors do — not by asking whether an idea sounds impressive, but by asking whether the model works.", why: "Business model literacy is one of the most powerful analytical skills a young person can develop. A student who can walk into any company and explain its model within five minutes has capability that most adults cannot demonstrate.", body: "This discipline trains students to see through businesses the way founders, executives, and investors do. Not at the surface level of branding or hype — but at the structural level where money is made, lost, or defended.\n\nStudents learn to break down any company — from a neighbourhood café to a global technology firm — and explain, with clarity and precision, how it generates revenue, where costs concentrate, what advantage protects it, and what single failure point could bring it down.\n\nThey learn to ask the questions that actually matter: What drives demand? What scales? What breaks? What kills this business if it goes wrong?\n\nThe result is not theory — but fluency. Students graduate able to analyse, challenge, and understand any business put in front of them.", whatYouLearn: ["The eight business models: subscription, marketplace, DTC, advertising, franchise, freemium, professional services, hardware-plus-consumable", "How to identify a company's core value proposition and revenue capture mechanism", "Competitive advantage analysis — cost leadership, differentiation, focus, network effects", "Vulnerability mapping — identifying the greatest strategic risk in any business model", "Investor Briefing format — how analysts present company analysis to investment committees", "Case studies: Netflix, Apple, Amazon, Airbnb, Costco — iconic business model evolution", "Business model disruption — how it happens and why incumbents fail to respond", "Live deconstruction of local businesses: model, strengths, blind spots"], outcomes: ["Identifies the business model of any company within minutes of exposure", "Delivers a five-minute Investor Briefing on a real public company to a professional audience", "Completes four quarterly business model analyses, progressively more sophisticated"], quote: "A brilliant product in the wrong business model is just an expensive lesson." },
  { slug: "intellectual-depth", title: "Intellectual Depth & The Art of Class", months: "", tagline: "Think deeply. Move effortlessly among ideas.", summary: "Technical skill can open doors. Intellectual range and social intelligence determine what happens inside the room. This discipline develops the qualities that make a young person not only capable, but memorable: cultural literacy, conversation, etiquette, taste, listening, judgment, and the ability to engage intelligently across history, philosophy, psychology, business, politics, and the arts. Ability to engage serious ideas without pretension.", why: "These are not decorative skills. They are the foundation of presence — the kind that makes others trust, remember, and respect the person in front of them.", body: "True influence is rarely earned through numbers alone. In the rooms where real decisions are made — private dinners, boardrooms, salons, galleries, and negotiations — people are assessed for their class, judgement, manners, and intellectual depth. This discipline exists to ensure Excalibur students are not only capable, but distinguished.\n\nStudents are formed to converse with ease across philosophy, history, psychology, and the arts — the shared language of educated societies. They engage with the foundations of aristocratic education: Homer on honour and leadership; Plato and Aristotle on virtue, reason, and rhetoric; Seneca and Marcus Aurelius on self-command and duty; Machiavelli on power, perception, and statecraft.\n\nThis is not academic display. It is social fluency. An Excalibur graduate can enter any room and make an impression through depth: thoughtful questions, cultural awareness, composed manners, and the ability to connect ideas effortlessly. This is the quiet authority that marks true class — the kind that opens doors, builds alliances, and endures long after the meeting ends.", whatYouLearn: ["Stoic philosophy as a practical framework — Marcus Aurelius, Seneca, Epictetus applied to modern business", "The art of patronage — what the Medici teach about investing in human potential and building influence", "Literary analysis for leaders — The Great Gatsby, The Alchemist examined through ambition and meaning", "Historical leadership case studies — Lincoln, Churchill, Mandela, Jobs", "The social arts — formal dining protocol, professional conversation, how to work a room without working it", "How to be remembered — substance, specificity, and genuine curiosity about others", "Writing with precision — expressing a complex idea in one clear, specific sentence", "The intellectual habits of the most accomplished people — how they read, think, and synthesize"], outcomes: ["References classical philosophy and history naturally in professional conversations", "Navigates a formal dinner or professional networking event with ease", "Has developed a personal reading practice and can discuss ideas from at least five significant books"], quote: "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch" },
  { slug: "industry-sectors", title: "Industry Sectors Rotation", months: "One new sector each month", tagline: "Know every industry. Own any room.", summary: "Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. Over ten months, students explore twelve major sectors of modern commerce.", why: "Most people leave education with deep familiarity of one or two sectors and almost no working knowledge of everything else. An Excalibur graduate who can speak with informed intelligence across ten industries has social and professional range that almost no peer can match.", body: "Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. Over ten months, students explore technology, food and hospitality, finance, real estate, e-commerce, healthcare, media, legal services, manufacturing, energy, sports and fitness, and luxury brands. By graduation, every student holds a Sector Journal documenting all twelve.", whatYouLearn: ["Technology & AI — platform economics, software margins, how the most valuable companies were built", "Finance & Venture Capital — equity, debt, cap tables, term sheets, how investors decide", "Real Estate — development economics, cap rates, wealth-building mechanics", "Food & Hospitality — unit economics, brand-building in a commoditized market", "E-Commerce & Retail — customer acquisition, lifetime value, supply chains, DTC brands", "Healthcare & Biotech — FDA pathways, healthcare economics, why it requires unusual patience", "Media & Entertainment — attention economics, the creator economy, IP valuation", "Legal & Professional Services — contracts, IP, equity agreements every entrepreneur needs to understand", "Manufacturing & Supply Chain — how physical things are made, moved, and sold at scale", "Energy & Sustainability — renewable economics, carbon markets, the greatest entrepreneurial opportunity ahead", "Sports, Fitness & Wellness — athlete branding, sponsorship, franchise valuation", "Luxury & Premium Brands — psychology of desire, scarcity, heritage, and premium pricing"], outcomes: ["Holds a Sector Journal with twelve completed industry analyses", "Can speak knowledgeably about any of the twelve sectors to a professional in that field", "Has met and engaged with twelve guest speakers from twelve different industries"], quote: "The more industries the student understands, the more they realize how similar the underlying principles are — and how different the specifics are. Both things matter." },
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
    shortBio: "Founder & CEO of Excalibur Academy. A serial entrepreneur whose first startup launched in the final year of high school. Educated at elite UK boarding school from age 12, pursued undergraduate studies at Tufts University with a double major in History and Political Science. Founded ventures and led initiatives across Italy, Spain, the USA, and multiple cities across Eastern Europe — including one of St Petersburg's largest art salon programmes, inviting leading academics to lecture in historic venues.",
    tags: ["Academy Founder", "Program Architect", "Entrepreneurship", "Vision & Strategy"],
    bio: "Alexander Milstein is a serial entrepreneur whose first startup launched in the final year of high school. He received an elite private education in London from the age of 12 — living independently at a UK boarding school — before pursuing undergraduate studies at Tufts University in Boston, earning a double major in History and Political Science, and later attending Duke University before leaving to focus on already-successful ventures.\n\nA mission-driven entrepreneur and advocate, he has launched ventures and led initiatives across Italy, Spain, the USA, and multiple cities in Eastern Europe. From a young age, he has been guided by a deep commitment to justice and community care — founding an international youth political debate and leadership club, and playing a key role in national humanitarian efforts across Eastern Europe, helping raise millions for critically ill children in need of life-saving treatment.\n\nHe produced one of the largest art salon events in St Petersburg history — creating an 18th-century Paris salon environment, inviting leading academics and cultural figures to give lectures in historic venues across St Petersburg, Italy, and France.\n\nAs Founder and CEO of Excalibur Academy, he designed the full architecture of the programme — curriculum structure, faculty model, real-world engagements, competition pipeline, and the standard of instruction. He built Excalibur on a single conviction: the most consequential thing a young person can develop is an identity forged through real pressure and real achievement."
  },
  {
    name: "Bill Morris",
    role: "Academy Dean & Senior Instructor",
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
    img: "https://i.imgur.com/HV7hqca.jpeg",
    isLogo: false,
    shortBio: "Program Director. MBA professor. Founder and CEO of international educational institute serving over 6,000 students across 25 franchises worldwide with campuses in Huntington Beach and Czech Republic, former advisor to a national Ministry of Education of Czech Republic, played for the U.S. Youth National Soccer team, published textbook author, and international academic accreditor.",
    tags: ["Education Systems", "Curriculum Design", "International Accreditation", "Franchise Development", "Entrepreneurship"],
    bio: "Erik Dostal is the founder and president of CA Institute, a comprehensive educational institution he built from the ground up into a leading international provider of English language, business, and professional education — serving over 6,000 students across 25 international franchise locations. Over nearly three decades, Erik has demonstrated what it means to build an educational institution that operates at genuine scale: generating $4.8M in annual revenues, sustaining 20% year-over-year growth, and closing franchise deals spanning multiple continents. He holds an MA in TESOL from the University of Chichester and NILE, an MBA from IDRAC Business School, and a BA in Cultural Anthropology from Chapman University, where he was also a collegiate athlete. A former U.S. Youth National Team soccer player, Erik has channeled his competitive background into youth development, coaching, and the design of high-performance learning environments. He has authored multiple textbooks and publications on teaching methodology, language acquisition, and business education, and has organized international language symposiums attracting thousands of delegates from around the world. A former advisor to the Czech Ministry of Education and a certified international academic accreditor, his work has received recognition including European Small Business Awards recognition across multiple years. At Excalibur Academy, Erik brings the rare combination of deep pedagogical expertise, proven franchise and systems-building experience, and a practitioner's understanding of what it takes to build educational institutions that last."
  },
  {
    name: "Christopher Sanders",
    role: "Head of Rhetoric & Executive Communication",
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
    shortBio: "Multilingual operations professional with over five years of experience delivering complex programmes across tourism, hospitality, entertainment, and healthcare. Master's in Labor Economics, Saint Petersburg State University of Economics. At Excalibur Academy, she oversees all operational and administrative infrastructure — scheduling, venues, student communications, and every logistical element of the academy's events and sessions.",
    tags: ["Project Coordination", "Operations Management", "Program Launch", "Multilingual", "Stakeholder Management"],
    bio: "Amina Abdulaeva is a multilingual project coordinator and operations professional with over five years of experience delivering complex programs across tourism, entertainment, hospitality, and healthcare. She holds a Master's degree in Labor Economics from Saint Petersburg State University of Economics, a Bachelor's in International and Strategic Management from Saint Petersburg State University, and completed an exchange semester at the Norwegian School of Economics. Her career spans roles of increasing responsibility across sectors — from coordinating end-to-end international tourism programs and managing the full operational launch of a luxury hotel, to leading the business development and execution of a regional tourist entertainment program that achieved 90% B2B market awareness at launch and secured national television coverage. Most recently, she served as Operations and Product Launch Coordinator at a medical private practice, where she designed and launched a new service package that increased the average client transaction by 80%. Fluent in English and Spanish, and a native Russian speaker, Amina brings rare cross-cultural depth and operational precision to every environment she enters. At Excalibur Academy, she oversees all operational and administrative infrastructure — faculty scheduling, venue coordination, student communications, event production, and the logistical execution of every session, competition, and milestone event the academy runs."
  },
];

const handson = [
  { title: "The Junior Consultant Program", tag: "TEAMS OF 4 · REAL BUSINESS CONSULTING", desc: "Student teams are paired with a real local business facing a real challenge. Over three weeks, each team conducts a structured professional engagement: on-site observation, customer interviews, competitive analysis, SWOT assessment, and financial diagnostics. The program culminates in a Boardroom Finale — a formal fifteen-minute presentation to the business owner, with parents and mentors in attendance.", outcome: "A client-facing consulting report, a formal presentation, and a documented example of applied business judgment." },
  { title: "The Apprentice Externship", tag: "WORK EXPERIENCE · REAL COMPANY", desc: "After eight months of formation, each Full Program student is placed inside a real local business in the industry of their choosing. Students attend real meetings, contribute to active projects, and produce three formal deliverables: a Business Map, a reflective journal, and a Recommendation Memo identifying one strategic opportunity the business is currently missing.", outcome: "Three professional-grade deliverables, direct experience inside a working business, and a reference from an employer who has seen them operate under real conditions." },
  { title: "Micro-Business Launch", tag: "TEAMS · SEED-FUNDED · REVENUE-DRIVEN", desc: "In the program's penultimate month, student teams build and launch micro-ventures designed to reach actual customers and generate revenue. Each team receives faculty guidance, structured accountability, and access to seed support through the Excalibur network of business owners, guest speakers, mentors, and alumni families. The goal is not to simulate entrepreneurship, but to experience the discipline of building something that is tested outside the room — in the real world with real constraints and realities.", outcome: "A micro-business brought from idea to launch — with mentor support, market pressure, real customers, and the lasting understanding that serious work can turn an idea into reality." },
  { title: "Demo Day & Graduation", tag: "GUESTS · INVESTORS · PARENTS", desc: "Demo Day & Graduation is the Flagship capstone. Student teams present their operating micro-businesses before families, mentors, investors, invited guests, and a panel of judges. Each presentation is evaluated on commercial viability, pitch quality, evidence of execution, and composure under questioning. Every graduate receives a professionally bound Excalibur Portfolio — a documented record of the work, presentations, competitions, and applied experiences completed across the program. Our students are not the same people who walked in ten months ago — and everyone in the room can see it.", outcome: "A public performance before a live investor audience, a bound graduation portfolio, and Alumni status in the Excalibur network." },
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
  { name: "Wave 1", season: "Spring", dates: "Apr 5 – May 14", deadline: "Mar 20", status: "open", wd: { days: "Mon & Wed", time: "4:00–6:25 PM", left: 6 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 4 } },
  { name: "Wave 2", season: "Summer", dates: "Jun 16 – Jul 23", deadline: "May 30", status: "open", wd: { days: "Mon & Wed", time: "4:00–6:25 PM", left: 14 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 18 } },
  { name: "Wave 3", season: "Fall", dates: "Oct 5 – Nov 14", deadline: "Sep 20", status: "soon", wd: { days: "Mon & Wed", time: "4:00–6:25 PM", left: 25 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 25 } },
  { name: "Wave 4", season: "Winter", dates: "Jan 5 – Feb 13", deadline: "Dec 20", status: "future", wd: { days: "Mon & Wed", time: "4:00–6:25 PM", left: 25 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 25 } },
];

// ── SHARED UI ──
const sc = (s) => ({ open: "#5DB075", soon: gold, future: "#444" }[s]);
const sl = (s) => ({ open: "Enrolling Now", soon: "Opening Soon", future: "Future Wave" }[s]);

function SBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ fontFamily: sans, padding: "9px 22px", background: active ? "rgba(199,171,117,.08)" : "transparent", border: `1px solid ${active ? "rgba(199,171,117,.3)" : "#1a1a1a"}`, color: active ? gold : "rgba(251,247,238,0.5)", fontSize: 13, cursor: "pointer", transition: "all .25s", fontWeight: 500 }}>{children}</button>
  );
}
function Eyebrow({ children }) {
  return <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: 5, color: gold, fontWeight: 500, marginBottom: 14 }}>{children}</p>;
}
function SectionTitle({ children, center = false }) {
  return <h2 style={{ fontFamily: serif, fontSize: "clamp(26px,4vw,52px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, textAlign: center ? "center" : "left" }}>{children}</h2>;
}
function Sub({ children, center = false }) {
  return <p style={{ fontFamily: serif, fontSize: "clamp(15px,2vw,18px)", color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.7, textAlign: center ? "center" : "left", maxWidth: center ? 580 : "100%", margin: center ? "12px auto 0" : "12px 0 0" }}>{children}</p>;
}
function Dot({ solid = false }) {
  return <div style={{ width: 4, height: 4, borderRadius: "50%", background: gold, opacity: solid ? 1 : .4, marginTop: 8, flexShrink: 0 }} />;
}
function Li({ children, solid = false }) {
  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 13, alignItems: "flex-start" }}>
      <Dot solid={solid} />
      <span style={{ fontFamily: sans, fontSize: 14, color: solid ? "rgba(251,247,238,0.75)" : "rgba(251,247,238,0.5)", fontWeight: 300, lineHeight: 1.6 }}>{children}</span>
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
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: active ? gold : hov ? "#FBF7EE" : "#FBF7EE", cursor: "pointer", transition: "color .2s", paddingBottom: 2, borderBottom: active ? `1px solid ${gold}` : "1px solid transparent", whiteSpace: "nowrap" }}
    >{label}</span>
  );
}
function Nav({ page, setPage }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const allLinks = [
    ["Home", "home"],
    ["The Academy", "about"],
    ["Our Programs", "programs"],
    ["Curriculum", "curriculum"],
    ["Faculty", "faculty"],
    ["The Arena", "beyond"],
    ["Admissions", "apply"],
    ["Contact", "apply"],
    ["Events", "apply"],
  ];
  const go = (p) => { setPage(p); setMenuOpen(false); };

  return (
    <>
      {/* NAV BAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(0,0,0,.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(199,171,117,.12)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* LEFT — logo */}
          <div style={{ width: isMobile ? "auto" : 160, display: "flex", alignItems: "center" }}>
            <div onClick={() => go("home")} style={{ cursor: "pointer", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src={LOGO_URL} alt="Excalibur Academy" style={{ width: 56, height: 56, objectFit: "contain" }} />
            </div>
          </div>

          {/* CENTER — brand name + motto */}
          <div onClick={() => go("home")} style={{ textAlign: "center", cursor: "pointer", flex: 1 }}>
            <div style={{ fontFamily: "'Forum', 'Copperplate', Georgia, serif", fontSize: isMobile ? 12 : 15, letterSpacing: "0.28em", color: "#FBF7EE", textTransform: "uppercase", lineHeight: 1.15, whiteSpace: "nowrap" }}>Excalibur Academy</div>
            {!isMobile && <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 11, letterSpacing: "0.16em", color: "rgba(199,171,117,.65)", fontStyle: "italic", marginTop: 3, whiteSpace: "nowrap" }}>Forging the Leaders of Tomorrow</div>}
          </div>

          {/* RIGHT — APPLY NOW + MENU */}
          <div style={{ width: isMobile ? "auto" : 160, display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
            {!isMobile && (
              <button onClick={() => go("apply")}
                onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = gold; }}
                onMouseLeave={e => { e.currentTarget.style.background = gold; e.currentTarget.style.color = "#000"; }}
                style={{ fontFamily: sans, background: gold, color: "#000", padding: "0 16px", height: 32, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: `1px solid ${gold}`, cursor: "pointer", transition: "all .25s", whiteSpace: "nowrap" }}>
                APPLY NOW
              </button>
            )}
            {/* MENU button */}
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              {!isMobile && <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, letterSpacing: "0.2em", color: "#FBF7EE", textTransform: "uppercase", fontWeight: 500 }}>{menuOpen ? "Close" : "Menu"}</span>}
              <div style={{ display: "flex", flexDirection: "column", gap: 4.5, width: 22 }}>
                <span style={{ display: "block", height: 1.5, background: menuOpen ? gold : "#FBF7EE", transition: "all .3s", transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
                <span style={{ display: "block", height: 1.5, background: menuOpen ? gold : "#FBF7EE", transition: "all .3s", opacity: menuOpen ? 0 : 1 }} />
                <span style={{ display: "block", height: 1.5, background: menuOpen ? gold : "#FBF7EE", transition: "all .3s", transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* MEGA MENU OVERLAY */}
      <div style={{
        position: "fixed", top: 64, left: 0, right: 0, bottom: 0, zIndex: 199,
        background: "#000",
        transform: menuOpen ? "translateY(0)" : "translateY(-100%)",
        opacity: menuOpen ? 1 : 0,
        transition: "transform .45s cubic-bezier(.22,1,.36,1), opacity .35s ease",
        pointerEvents: menuOpen ? "all" : "none",
        display: "flex",
        overflow: "hidden",
      }}>
        {/* Background wordmark — very faint */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
          <span style={{ fontFamily: "'Forum', serif", fontSize: "clamp(120px,20vw,220px)", color: "rgba(199,171,117,.04)", letterSpacing: "0.15em", textTransform: "uppercase", userSelect: "none", whiteSpace: "nowrap" }}>EXCALIBUR</span>
        </div>

        {/* LEFT — nav links */}
        <div style={{ flex: 1, padding: isMobile ? "40px 28px" : "56px 72px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1, overflowY: "auto" }}>
          <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.4em", color: "rgba(199,171,117,.4)", textTransform: "uppercase", marginBottom: 36, fontWeight: 600 }}>Navigation</p>
          {allLinks.map(([l, p], i) => (
            <div key={l} onClick={() => go(p)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: isMobile ? "14px 0" : "16px 0",
              borderBottom: "1px solid rgba(199,171,117,.07)",
              cursor: "pointer", group: true,
            }}
              onMouseEnter={e => { e.currentTarget.querySelector(".ml").style.color = gold; e.currentTarget.querySelector(".arr").style.opacity = "1"; e.currentTarget.querySelector(".arr").style.transform = "translateX(6px)"; }}
              onMouseLeave={e => { e.currentTarget.querySelector(".ml").style.color = "#FBF7EE"; e.currentTarget.querySelector(".arr").style.opacity = "0.3"; e.currentTarget.querySelector(".arr").style.transform = "translateX(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, color: "rgba(199,171,117,.3)", fontStyle: "italic" }}>0{i + 1}</span>
                <span className="ml" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: isMobile ? 26 : 36, fontWeight: 500, color: "#FBF7EE", letterSpacing: "0.04em", transition: "color .2s" }}>{l}</span>
              </div>
              <span className="arr" style={{ fontFamily: sans, fontSize: 18, color: gold, opacity: 0.3, transition: "all .25s", transform: "translateX(0)" }}>→</span>
            </div>
          ))}
          {/* Apply Now in menu */}
          <button onClick={() => go("apply")} style={{ marginTop: 40, alignSelf: "flex-start", fontFamily: sans, background: gold, color: "#000", padding: "14px 40px", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
            APPLY NOW →
          </button>
        </div>

        {/* RIGHT — photo panel (desktop only) */}
        {!isMobile && (
          <div style={{ width: "38%", position: "relative", flexShrink: 0 }}>
            <img src="https://i.imgur.com/mkQ2Nde.jpeg" alt="Excalibur Academy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, rgba(0,0,0,.3) 40%, transparent 100%)" }} />
            {/* Bottom label */}
            <div style={{ position: "absolute", bottom: 48, left: 40 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "rgba(251,247,238,.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Orange County · California</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: gold, fontStyle: "italic", lineHeight: 1.4, whiteSpace: "nowrap" }}>Forging the Leaders of Tomorrow.</p>
            </div>
            {/* Oxford-style CTA card — top right of photo */}
            <div style={{
              position: "absolute", top: 40, right: 36,
              background: gold, padding: "24px 28px", maxWidth: 240,
              cursor: "pointer",
            }} onClick={() => go("apply")}>
              <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.25em", color: "rgba(0,0,0,.55)", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Summer 2026</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 600, color: "#000", lineHeight: 1.25, marginBottom: 14 }}>Waitlist for Summer 2026 Waves Now Open.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: "#000", letterSpacing: "0.08em" }}>Learn More</span>
                <span style={{ fontSize: 14, color: "#000", transition: "transform .2s" }}>→</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── PORTFOLIO FOLDER COMPONENT ──
const portfolioItems = [
  { n: "01", tab: "Investor Pitch", title: "Live Investor Pitch & Funding", tagline: "Public performance. Real feedback. Real judges. Real stakes.", body: "Students present a final venture in a Shark Tank-style pitch competition before real entrepreneurs and investors. Judged. Competitive. Consequential. The closest a high school student will come to a real funding environment before university. Cash prizes are awarded. Investor feedback is recorded and included in the portfolio." },
  { n: "02", tab: "Consulting", title: "Consulting Engagement", tagline: "A professional deliverable with a real client's name on it.", body: "Each student completes a consulting assignment for a local business, producing a deliverable intended for real use by the organisation. Not a simulation — a real client, a real brief, a real outcome. Students work in teams, are supervised by faculty, and present their findings directly to the business owner." },
  { n: "03", tab: "Micro-Business", title: "Micro-Business Launch", tagline: "Real customers. Real revenue. Real accountability.", body: "In the flagship programme, students build and launch a revenue-generating micro-venture with seed funding and a dedicated mentor. They acquire real customers, manage real money, and experience real consequences of every decision they make. Every launch is documented and included in the portfolio." },
  { n: "04", tab: "Externship", title: "Apprenticeship & Externship", tagline: "An internship in the industry sector of the student's choice.", body: "Students complete a 4–6 week externship embedded within a company in their chosen industry sector — sourced from the Academy's network of business and industry partners. They observe, contribute, build professional references, and produce a written reflection that becomes part of the graduation portfolio." },
  { n: "05", tab: "Competition", title: "Competition Record", tagline: "Verified results. Judged by professionals.", body: "Students participate in judged pitch competitions throughout the programs, gaining experience with formal evaluation, structured feedback, and competitive recognition. Results are verified, documented, and included in the portfolio — evidence of performance under genuine competitive environment." },
  { n: "06", tab: "Portfolio", title: "Bound Graduation Portfolio", tagline: "The complete record. Professionally assembled.", body: "All major analyses, reports, awards, presentations, and business plans are professionally compiled into a single, coherent portfolio — a physical and digital record of everything a student built, wrote, delivered, and won across the programs. Presented at graduation. Submitted with university applications." },
  { n: "07", tab: "Recommendations", title: "Faculty Recommendations", tagline: "Letters grounded in direct observation.", body: "Excalibur recommendations are written by lead faculty, top executives, and practitioners who have worked directly with the student and can speak with specificity about performance, judgment, communication, leadership, and growth over time. Not form letters. Observations from professionals who have operated at the highest levels of their fields and watched this student do the same." },
  { n: "08", tab: "Alumni Network", title: "Alumni Network Access", tagline: "A network that compounds over time.", body: "Graduates gain access to a curated alumni and faculty network that supports continued development, mentorship, and professional opportunity — a community of Excalibur graduates, faculty, and guest speakers that grows with every cohort and program." },
];

function PortfolioFolder({ isMobile }) {
  const [openSet, setOpenSet] = React.useState(new Set([0,1,2,3,4,5,6,7]));
  React.useEffect(() => {
    if (isMobile) setOpenSet(new Set([0]));
    else setOpenSet(new Set([0,1,2,3,4,5,6,7]));
  }, [isMobile]);
  const toggle = (i) => {
    if (!isMobile) return;
    setOpenSet(prev => {
      const next = new Set([i]);
      if (prev.has(i) && prev.size === 1) next.clear();
      return next;
    });
  };
  const isOpen = (i) => openSet.has(i);
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 2, background: "#111" }}>
      {portfolioItems.map((item, i) => (
        <div key={i} onClick={() => isMobile && toggle(i)} style={{ background: "#080808", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}`, padding: "28px 24px", cursor: isMobile ? "pointer" : "default", transition: "all .25s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontFamily: serif, fontSize: 11, color: "rgba(199,171,117,.4)", letterSpacing: "0.1em" }}>{item.n}</span>
            {isMobile && <span style={{ fontFamily: sans, fontSize: 14, color: isOpen(i) ? gold : "rgba(251,247,238,0.5)", transition: "transform .25s", display: "inline-block", transform: isOpen(i) ? "rotate(45deg)" : "none" }}>+</span>}
          </div>
          <h4 style={{ fontFamily: serif, fontSize: isMobile ? 22 : 24, fontWeight: 600, color: isOpen(i) ? gold : "#E8E0D8", lineHeight: 1.3, marginBottom: 14 }}>{item.title}</h4>
          {isOpen(i) && (
            <div className={isMobile ? "mod-content" : ""}>
              <div style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
              <p style={{ fontFamily: serif, fontSize: 13, color: gold, fontStyle: "italic", lineHeight: 1.5, marginBottom: 12 }}>{item.tagline}</p>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>{item.body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── PORTFOLIO INDEX — WHITE LUXURY ──
function PortfolioIndexWhite({ isMobile, setPage }) {
  const [active, setActive] = useState(0);
  const item = portfolioItems[active];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "32px 24px 52px" : "48px 80px 72px" }}>
      {isMobile ? (
        // Mobile — vertical accordion
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {portfolioItems.map((it, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(0,0,0,.1)" }}>
              <div onClick={() => setActive(active === i ? -1 : i)} style={{ padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: "rgba(0,0,0,.2)", fontStyle: "italic" }}>{it.n}</span>
                  <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: active === i ? "#000" : "#222" }}>{it.title}</span>
                </div>
                <span style={{ fontFamily: sans, fontSize: 18, color: active === i ? "#8B6914" : "rgba(0,0,0,.25)", transform: active === i ? "rotate(45deg)" : "none", transition: "transform .25s", display: "inline-block" }}>+</span>
              </div>
              {active === i && (
                <div style={{ paddingBottom: 20, paddingLeft: 30 }}>
                  <p style={{ fontFamily: serif, fontSize: 13, color: "#8B6914", fontStyle: "italic", marginBottom: 8 }}>{it.tagline}</p>
                  <p style={{ fontFamily: sans, fontSize: 13, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.8 }}>{it.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Desktop — index left, detail right (like a hotel menu / gallery catalogue)
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, border: "1px solid rgba(0,0,0,.08)" }}>
          {/* Left — index */}
          <div style={{ borderRight: "1px solid rgba(0,0,0,.08)" }}>
            {portfolioItems.map((it, i) => (
              <div key={i} onClick={() => setActive(i)} style={{
                padding: "18px 28px", cursor: "pointer", display: "flex", gap: 16, alignItems: "center",
                background: active === i ? "#fff" : "transparent",
                borderLeft: active === i ? "2px solid #8B6914" : "2px solid transparent",
                borderBottom: "1px solid rgba(0,0,0,.06)", transition: "all .2s",
              }}>
                <span style={{ fontFamily: serif, fontSize: 11, color: active === i ? "#8B6914" : "rgba(0,0,0,.2)", fontStyle: "italic", minWidth: 22, transition: "color .2s" }}>{it.n}</span>
                <span style={{ fontFamily: serif, fontSize: 13, fontWeight: active === i ? 600 : 400, color: active === i ? "#000" : "#555", lineHeight: 1.2, transition: "all .2s" }}>{it.title}</span>
              </div>
            ))}
          </div>
          {/* Right — detail panel */}
          <div style={{ padding: "44px 52px", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 360 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 20 }}>
                <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, color: "rgba(0,0,0,.12)", fontStyle: "italic" }}>{item.n}</span>
                <h3 style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: "#000", lineHeight: 1.1 }}>{item.title}</h3>
              </div>
              <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #8B6914, transparent)", marginBottom: 20 }} />
              <p style={{ fontFamily: serif, fontSize: 16, color: "#8B6914", fontStyle: "italic", marginBottom: 20, lineHeight: 1.5 }}>{item.tagline}</p>
              <p style={{ fontFamily: sans, fontSize: 14, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.9, maxWidth: 560 }}>{item.body}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(0,0,0,.07)" }}>
              <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.3em", color: "rgba(0,0,0,.25)", textTransform: "uppercase" }}>{active + 1} of {portfolioItems.length}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setActive(a => Math.max(0, a - 1))} disabled={active === 0} style={{ background: "none", border: "1px solid rgba(0,0,0,.15)", color: active === 0 ? "rgba(0,0,0,.2)" : "#000", width: 36, height: 36, cursor: active === 0 ? "default" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>‹</button>
                <button onClick={() => setActive(a => Math.min(portfolioItems.length - 1, a + 1))} disabled={active === portfolioItems.length - 1} style={{ background: "none", border: "1px solid rgba(0,0,0,.15)", color: active === portfolioItems.length - 1 ? "rgba(0,0,0,.2)" : "#000", width: 36, height: 36, cursor: active === portfolioItems.length - 1 ? "default" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>›</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FOOTER ──
function Footer({ setPage }) {
  const isMobile = useIsMobile();
  const allLinks = [["HOME","home"],["THE ACADEMY","about"],["OUR PROGRAMS","programs"],["CURRICULUM","curriculum"],["FACULTY","faculty"],["THE ARENA","beyond"],["ADMISSIONS","apply"],["CONTACT","apply"],["EVENTS","apply"]];
  return (
    <footer style={{ background: "#000", borderTop: "1px solid rgba(199,171,117,.15)" }}>
      {/* Brand + Nav */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "48px 24px 32px" : "60px 60px 40px", borderBottom: "1px solid rgba(199,171,117,.08)", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", gap: 32 }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
          <div style={{ fontFamily: "'Forum', serif", fontSize: isMobile ? 22 : 34, color: "#FBF7EE", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1, marginBottom: 10 }}>Excalibur Academy</div>
          <div style={{ fontFamily: serif, fontSize: isMobile ? 13 : 15, color: gold, fontStyle: "italic", fontWeight: 300, letterSpacing: "0.03em" }}>Forging the leaders of tomorrow.</div>
        </div>
        <nav style={{ display: "flex", gap: isMobile ? 16 : 28, flexWrap: "wrap", alignItems: "center" }}>
          {allLinks.map(([l, p]) => (
            <span key={p} onClick={() => setPage(p)} style={{ fontFamily: eyebrow_font, color: "#FBF7EE", fontSize: 10, cursor: "pointer", letterSpacing: "0.3em", fontWeight: 700, textTransform: "uppercase", transition: "color .2s", whiteSpace: "nowrap" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#FBF7EE"}>{l}</span>
          ))}
        </nav>
      </div>
      {/* Emails + Legal */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "36px 24px" : "44px 60px", borderBottom: "1px solid rgba(199,171,117,.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 28 : 0 }}>
          {/* Business info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontFamily: eyebrow_font, fontSize: 9, color: gold, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Excalibur Academy LLC</span>
            <span style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", fontWeight: 300, letterSpacing: "0.03em" }}>23 Corporate Plaza Dr</span>
            <span style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", fontWeight: 300, letterSpacing: "0.03em" }}>Newport Beach, CA</span>
          </div>
          {/* Applications email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, borderLeft: isMobile ? "none" : "1px solid rgba(199,171,117,.15)", paddingLeft: isMobile ? 0 : 48 }}>
            <span style={{ fontFamily: eyebrow_font, fontSize: 9, color: gold, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>For Applications</span>
            <a href="mailto:apply@excaliburacademy.org" style={{ fontFamily: serif, fontSize: 13, color: "#FBF7EE", textDecoration: "none", letterSpacing: "0.05em", fontStyle: "italic", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#FBF7EE"}>apply@excaliburacademy.org</a>
          </div>
          {/* Support email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, borderLeft: isMobile ? "none" : "1px solid rgba(199,171,117,.15)", paddingLeft: isMobile ? 0 : 48 }}>
            <span style={{ fontFamily: eyebrow_font, fontSize: 9, color: gold, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>For Support</span>
            <a href="mailto:support@excaliburacademy.org" style={{ fontFamily: serif, fontSize: 13, color: "#FBF7EE", textDecoration: "none", letterSpacing: "0.05em", fontStyle: "italic", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#FBF7EE"}>support@excaliburacademy.org</a>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 24px" : "20px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: sans, fontSize: 9, color: "rgba(199,171,117,.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>© 2026 Excalibur Academy LLC · Orange County, California</p>
        <p style={{ fontFamily: sans, fontSize: 9, color: "rgba(251,247,238,.4)", letterSpacing: "0.06em" }}>23 Corporate Plaza Dr, Newport Beach, CA</p>
      </div>
    </footer>
  );
}


// ─────────────────────────────────────────────
// INTERACTIVE DAILY SCHEDULE
// ─────────────────────────────────────────────
const summerSchedule = [
  { time: "9:15 AM", dur: "15 min", block: "Arrival", instructor: null, role: null, img: null, desc: "Students arrive and settle into the venue before the day begins. The pace is intentional from the first moment — this is not a summer camp. Every student walks in knowing today will challenge them.", color: "rgba(251,247,238,0.45)" },
  { time: "9:30 AM", dur: "45 min", block: "Public Speaking & Rhetoric", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Every single morning begins the same way: students stand up and speak. Voice projection. Eye contact. Composure under scrutiny. The 10-day arc is deliberately structured — from foundational mechanics in Week 1 to advanced rhetoric, impromptu performance, and Shark Tank pitch rehearsal by Day 10. By the final day, every student has spoken in front of an audience multiple times and received specific, actionable feedback on every performance.", color: "#C7AB75" },
  { time: "10:15 AM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured pause. Conversation between students and faculty continues informally. Some of the most interesting exchanges of the day happen here.", color: "rgba(251,247,238,0.45)" },
  { time: "10:30 AM", dur: "90 min", block: "Block 2 — Specialist · Core Curriculum + Applied", instructor: "Bill Morris / Rotating Specialist", role: "Academy Dean · Domain Expert", img: null, desc: "A senior practitioner delivers the day's core discipline across 90 minutes of instruction, frameworks, and immediate applied drills. Students deploy what they learn before lunch. Across the two-week programme: business model analysis, financial literacy, AI and technology, sales and persuasion, and leadership — each taught by someone with real-world experience at the highest level.", color: "#A89060" },
  { time: "12:00 PM", dur: "30 min", block: "Lunch", instructor: null, role: null, img: null, desc: "Catered lunch from a rotating selection of local restaurants — varied cuisine, served across courses. Informal conversation continues between students and faculty. Social intelligence is part of the curriculum — how you hold yourself in a room, how you listen, how you make people feel remembered. It is practiced here too.", color: "rgba(251,247,238,0.45)" },
  { time: "12:30 PM", dur: "60 min", block: "Distinguished Guest Speaker", instructor: "Daily Rotating Guest", role: "Entrepreneur · Executive · Investor", img: null, desc: "A different senior professional joins every single day. Entrepreneurs who have built and sold companies. Investors who have backed the ventures your children will one day read about. Executives who have led organisations of thousands. Every speaker is hand-selected. Students submit questions in advance. By the end of two weeks, your student will have sat in the same room as ten different leaders from ten different industries — and had the chance to ask them anything.", color: "#C7AB75" },
  { time: "1:30 PM", dur: "15 min", block: "Afternoon Break", instructor: null, role: null, img: null, desc: "A brief reset before the afternoon's final session — the most high-pressure block of the day.", color: "rgba(251,247,238,0.45)" },
  { time: "1:45 PM", dur: "60 min", block: "Block 3 — The War Room", instructor: "Chip Pankow (Mon/Wed/Fri) · Erik Dostal (Tue/Thu)", role: "Lead Program Director · Senior Instructor", img: "https://i.imgur.com/Ckny7HG.png", desc: "Chip Pankow leads Monday, Wednesday, and Friday — Erik Dostal leads Tuesday and Thursday. Three rotating formats: real crisis scenarios where students must decide before learning what actually happened to the real company; startup rescue simulations where teams pitch turnaround strategies under time pressure; and applied workshops where the specialist's content is immediately stress-tested. This is where the day's learning becomes judgment.", color: "#C7AB75" },
  { time: "2:45 PM", dur: "15 min", block: "Debrief & Close", instructor: "War Room Lead", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Every day ends with a structured debrief: what was learned, what surprised you, what you will apply. One specific idea to take home. The Shark Tank Finale closes each wave — student teams pitch before a panel of real investors and entrepreneurs for cash prizes and the first genuine experience of being evaluated by people with no obligation to be kind.", color: "#A89060" },
];

const flagshipWeekdaySchedule = [
  { time: "4:00 PM", dur: "40 min", block: "Block 1 — Public Speaking & Rhetoric", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Every session — every single one, for ten months — opens with public speaking. Students stand up before any other content is delivered. Voice mechanics. Impromptu drills. Pitch coaching. Advanced rhetoric. The progression is deliberate: by graduation, students will have completed over 120 individual speaking reps. They will be transformed communicators — not because they practiced once, but because they practiced every time.", color: "#C7AB75" },
  { time: "4:40 PM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A brief, structured pause before the specialist block.", color: "rgba(251,247,238,0.45)" },
  { time: "4:55 PM", dur: "40 min", block: "Block 2 — Specialist / Academy Dean", instructor: "Monthly Specialist or Bill Morris (1×/month)", role: "Domain Expert · Academy Dean", img: null, desc: "The month's specialist — a working executive, investor, or entrepreneur — delivers the core curriculum block. Eight modules across ten months: financial literacy, business model analysis, sales and marketing, AI and technology, advanced rhetoric, leadership and intellectual depth, and the real-world engagement trilogy. Every specialist has done the thing they teach. Bill Morris takes this block once per month as the Director's Block.", color: "#A89060" },
  { time: "5:35 PM", dur: "10 min", block: "Short Break", instructor: null, role: null, img: null, desc: "A ten-minute reset before the War Room.", color: "rgba(251,247,238,0.45)" },
  { time: "5:45 PM", dur: "40 min", block: "Block 3 — The War Room", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "The programme's signature closing block, rotating weekly across four formats: real-world crisis scenario deconstructions where students decide before learning the outcome; weekly case study analysis — 30 to 40 companies deconstructed across ten months; a live industry guest speaker once per month; and applied workshops where students immediately stress-test the specialist's content under competitive conditions.", color: "#C7AB75" },
  { time: "6:25 PM", dur: "—", block: "Session Close", instructor: null, role: null, img: null, desc: "Sessions conclude. Students leave with a specific assignment, a question to sit with, or a task to execute before the next session. Formation does not stop when the room empties.", color: "rgba(251,247,238,0.45)" },
];

const flagshipSaturdaySchedule = [
  { time: "10:30 AM", dur: "40 min", block: "Block 1a — Public Speaking · Opening", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Saturday opens identically to every weekday session: students stand up and speak before anything else happens. The standard does not change because the day changed. Speaking warm-up, vocal mechanics, and impromptu drills. Christopher teaches 1a and then immediately continues into 1b — no gap, no wait.", color: "#C7AB75" },
  { time: "11:10 AM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A brief pause between the two speaking blocks.", color: "rgba(251,247,238,0.45)" },
  { time: "11:25 AM", dur: "40 min", block: "Block 1b — Public Speaking · Rhetoric & Pitch", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "The second speaking block, consecutive to 1a. Advanced rhetoric, formal pitch architecture, high-stakes debate formats, and Aristotelian persuasion applied to modern business scenarios. Saturday is the most intensive speaking training of the week — nearly two hours with one of the programme's senior instructors, dedicated entirely to communication at the highest level.", color: "#C7AB75" },
  { time: "12:05 PM", dur: "30 min", block: "Lunch Break", instructor: null, role: null, img: null, desc: "Catered lunch from local restaurants — first, second, and third course. Social intelligence is part of the curriculum. How you hold a conversation over a meal, how you listen, how you carry yourself in an informal setting — these are skills that are observed, and quietly taught.", color: "rgba(251,247,238,0.45)" },
  { time: "12:35 PM", dur: "80 min", block: "Block 2 — Specialist / Academy Dean", instructor: "Monthly Specialist or Bill Morris (1×/month)", role: "Domain Expert · Academy Dean", img: null, desc: "Saturday's specialist block runs 80 minutes — the deepest module session of the week. The month's specialist delivers their full curriculum content with time for extended case work and Q&A. Bill Morris takes this block once per month as the Director's Block, covering finance strategy and leadership frameworks at depth.", color: "#A89060" },
  { time: "1:55 PM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured pause before the War Room.", color: "rgba(251,247,238,0.45)" },
  { time: "2:10 PM", dur: "40 min", block: "Block 3a — War Room · Case Study", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Chip teaches 3a and then immediately 3b — no gap between blocks. Block 3a: current events deconstruction or real crisis case study. Students are dropped into the decision cold — they must read the situation, make the call, and defend it. Then Chip reveals what actually happened. Because they already committed to a position, it lands.", color: "#C7AB75" },
  { time: "2:50 PM", dur: "10 min", block: "Short Break", instructor: null, role: null, img: null, desc: "A ten-minute reset between War Room sub-blocks.", color: "rgba(251,247,238,0.45)" },
  { time: "3:00 PM", dur: "40 min", block: "Block 3b — War Room · Applied Workshop", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "The applied workshop: the specialist's content from Block 2 is immediately deployed under pressure. Teams compete, present, and defend their work in front of the group. This is where knowledge becomes capability — where students discover not just what they learned, but whether they can use it when it counts. On guest speaker Saturdays (1×/month), both cohorts attend together.", color: "#C7AB75" },
  { time: "3:40 PM", dur: "5 min", block: "Debrief & Close", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Chip closes the session: preview of next week, key takeaway, students depart. Formation does not stop when the room empties.", color: "#A89060" },
];

const sixWeekSchedule = [
  { time: "4:00 PM", dur: "40 min", block: "Block 1 — Public Speaking & Rhetoric", instructor: "Christopher Sanders", role: "Public Speaking Senior Instructor", img: "https://i.imgur.com/EELzLmn.jpeg", desc: "Every session opens with speaking — without exception. Twelve sessions. Twelve openings. Voice, presence, composure, and rhetorical precision built session by session across six weeks. Week 1 is dedicated entirely to public speaking foundations. From Week 2 onward, the opening block continues to build on each prior session, culminating in Shark Tank pitch rehearsal in Week 6.", color: "#C7AB75" },
  { time: "4:40 PM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A brief, structured pause before the specialist block.", color: "rgba(251,247,238,0.45)" },
  { time: "4:55 PM", dur: "40 min", block: "Block 2 — Specialist / Academy Dean", instructor: "Bill Morris or Rotating Specialist", role: "Academy Dean · Domain Expert", img: null, desc: "One discipline per week, taught by a specialist with direct professional experience in that field. Six weeks, six disciplines: public speaking and rhetoric, financial literacy and business acumen, business model analysis, AI and technology, sales and marketing, and leadership with Shark Tank preparation. Compressed but complete — the full Excalibur curriculum delivered in a high-intensity format.", color: "#A89060" },
  { time: "5:35 PM", dur: "10 min", block: "Short Break", instructor: null, role: null, img: null, desc: "A ten-minute reset before the War Room.", color: "rgba(251,247,238,0.45)" },
  { time: "5:45 PM", dur: "40 min", block: "Block 3 — The War Room", instructor: "Chip Pankow", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Every session closes with the War Room — no exceptions. Applied workshop, simulation, or case study deploying the evening's specialist content under live competitive pressure. The wave closes with a judged Shark Tank Finale before a panel of entrepreneurs and investors. Cash prizes: Best Business Concept ($2,000), Best Pitch ($1,000), Most Innovative ($500).", color: "#C7AB75" },
];

const fieldTrips = [
  { title: "Daytona & Motorsport Racing", tag: "Speed. Strategy. Performance.", img: "https://i.imgur.com/aq7BsSv.jpeg", desc: "At Daytona, students step inside one of the most intense environments in the world: elite motorsport. But Motorsport is more than competition. It is a global business built on capital, engineering, sponsorship, logistics, risk, media, and human decision-making under extraordinary pressure. Guided by one of our Lead Faculty instructors — also a former professional racing driver and the director of Formula BMW, the program that produced F1 World Champions Sebastian Vettel and Nico Rosberg — students examine the economics of elite racing, the innovation forces shaping the automotive world, the discipline required to make decisions at speed, and the chance to experience the legendary circuit with a professional driver. This is not a field trip. It is a masterclass with someone who built the industry.", type: "Weekend" },
  { title: "Silicon Valley — Incubators & Accelerators", tag: "Where the next business revolution is built.", img: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80", desc: "Behind-the-scenes visits to leading venture capital firms, startup incubators, and accelerators across the Bay Area. Students walk through the environments where the world’s most consequential companies began. A curated dinner with a VC partner closes the day.", type: "2-Day" },
  { title: "NYSE — New York Stock Exchange Floor", tag: "The center of global capital.", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", desc: "Access to the NYSE trading floor — one of the most exclusive rooms in American finance. Students meet with market professionals, observe live trading operations, and receive a briefing on how capital markets actually function. Followed by an executive dinner in Manhattan.", type: "3-Day NYC" },
  { title: "Anthropic AI Headquarters", tag: "The frontier of artificial intelligence.", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80", desc: "A rare visit to one of the world's leading AI safety and research organizations. Students engage with researchers and engineers at the forefront of large language model development — the technology reshaping every industry they will enter.", type: "Day Trip" },
  { title: "SpaceX — Launch & Engineering", tag: "The ambition that changes the species.", img: "https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800&q=80", desc: "Behind-the-scenes access to SpaceX's engineering and manufacturing operations. Students see how the world's most ambitious engineering programme is organized, staffed, and executed. A reminder that the biggest ideas in history are built by small teams who refused to accept limits.", type: "Day Trip" },
  { title: "Yosemite — Nature, Clarity & Team Building", tag: "Connection. Clarity. Renewal.", img: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80", desc: "A weekend in Yosemite National Park — hiking, outdoor leadership challenges, and evening team sessions under the stars. A deliberate reminder that mental clarity, resilience, and the ability to lead under pressure are forged as much outside the boardroom as within it.", type: "Weekend" },
];

// ─────────────────────────────────────────────
// INTERACTIVE DAILY SCHEDULE COMPONENT
// ─────────────────────────────────────────────
function ScheduleDetail({ block }) {
  if (!block || !block.block) return null;
  const isBreak = !block.instructor;
  return (
    <div className="mod-content" style={{ padding: "20px 20px", background: "rgba(199,171,117,.03)", borderTop: "1px solid rgba(199,171,117,.1)", borderBottom: "1px solid rgba(199,171,117,.05)" }}>
      {isBreak ? (
        <>
          <p style={{ fontFamily: serif, fontSize: 16, color: "#FBF7EE", marginBottom: 8 }}>{block.block}</p>
          <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.75 }}>{block.desc}</p>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
            {block.img ? (
              <div style={{ width: 44, height: 44, flexShrink: 0, overflow: "hidden", border: "1px solid rgba(199,171,117,.2)", borderRadius: "50%" }}>
                <img src={block.img} alt={block.instructor || ""} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={e => e.target.style.display = "none"} />
              </div>
            ) : (
              <div style={{ width: 44, height: 44, flexShrink: 0, border: "1px solid rgba(199,171,117,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 16, color: "rgba(199,171,117,.3)" }}>✦</span>
              </div>
            )}
            <div>
              <p style={{ fontFamily: serif, fontSize: 15, color: "#FBF7EE", fontWeight: 600, marginBottom: 2 }}>{block.instructor}</p>
              <p style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>{block.role}</p>
            </div>
          </div>
          <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 10 }}>{block.block}</p>
          <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>{block.desc}</p>
        </>
      )}
    </div>
  );
}

function DailyScheduleBlock({ schedule, title, subtitle }) {
  const [active, setActive] = useState(null);
  const isMobile = useIsMobile();

  const toggle = (i) => setActive(active === i ? null : i);

  return (
    <div style={{ background: "#07060A", border: "1px solid rgba(199,171,117,.1)" }}>
      {/* Title */}
      <div style={{ padding: isMobile ? "20px 20px 14px" : "28px 36px 20px", borderBottom: "1px solid rgba(199,171,117,.07)" }}>
        <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{title}</p>
        <p style={{ fontFamily: serif, fontSize: isMobile ? 13 : 15, color: "#FBF7EE", fontStyle: "italic" }}>{subtitle}</p>
      </div>

      {isMobile ? (
        /* MOBILE: each row is an accordion — detail expands inline directly below */
        <div>
          {(schedule || []).map((s, i) => (
            <div key={i}>
              <div onClick={() => toggle(i)} style={{ padding: "14px 20px", cursor: "pointer", borderLeft: `3px solid ${active === i ? gold : "transparent"}`, background: active === i ? "rgba(199,171,117,.05)" : "transparent", borderBottom: "1px solid rgba(199,171,117,.05)", display: "flex", gap: 12, alignItems: "flex-start", transition: "all .2s" }}>
                <div style={{ flexShrink: 0, minWidth: 52 }}>
                  <div style={{ fontFamily: sans, fontSize: 10, color: active === i ? gold : "#706860", fontWeight: 600, letterSpacing: "0.04em" }}>{s.time}</div>
                  <div style={{ fontFamily: sans, fontSize: 9, color: "#504840", marginTop: 1 }}>{s.dur}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: serif, fontSize: 14, color: active === i ? gold : "#C8C0B8", fontWeight: active === i ? 600 : 400, lineHeight: 1.3 }}>{s.block}</div>
                  {s.instructor && <div style={{ fontFamily: sans, fontSize: 9, color: active === i ? "rgba(199,171,117,.6)" : "#605850", marginTop: 2 }}>{s.instructor}</div>}
                </div>
                <span style={{ color: active === i ? gold : "#504840", fontSize: 16, transition: "transform .2s", transform: active === i ? "rotate(45deg)" : "none", display: "inline-block", flexShrink: 0 }}>+</span>
              </div>
              {/* Detail expands DIRECTLY below this row */}
              {active === i && <ScheduleDetail block={s} />}
            </div>
          ))}
        </div>
      ) : (
        /* DESKTOP: sidebar + right detail panel */
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr" }}>
          <div style={{ borderRight: "1px solid rgba(199,171,117,.08)" }}>
            {(schedule || []).map((s, i) => (
              <div key={i} onClick={() => toggle(i)} style={{ padding: "14px 24px", cursor: "pointer", borderLeft: `3px solid ${active === i ? gold : "transparent"}`, background: active === i ? "rgba(199,171,117,.04)" : "transparent", borderBottom: "1px solid rgba(199,171,117,.05)", transition: "all .2s", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  <div style={{ fontFamily: sans, fontSize: 10, color: active === i ? gold : "#706860", fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{s.time}</div>
                  <div style={{ fontFamily: sans, fontSize: 9, color: "#504840", marginTop: 2 }}>{s.dur}</div>
                </div>
                <div>
                  <div style={{ fontFamily: serif, fontSize: 14, color: active === i ? gold : "#C8C0B8", fontWeight: active === i ? 600 : 400, lineHeight: 1.3 }}>{s.block}</div>
                  {s.instructor && <div style={{ fontFamily: sans, fontSize: 9, color: active === i ? "rgba(199,171,117,.6)" : "#605850", marginTop: 2, letterSpacing: "0.06em" }}>{s.instructor}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#09080C" }}>
            {active !== null && (schedule || [])[active] ? (
              <div key={active} style={{ minHeight: 320 }}>
                <ScheduleDetail block={(schedule || [])[active]} />
              </div>
            ) : (
              <div style={{ padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12 }}>
                <span style={{ fontFamily: serif, fontSize: 40, color: "rgba(199,171,117,.1)" }}>✦</span>
                <p style={{ fontFamily: serif, fontSize: 15, color: "rgba(199,171,117,.2)", fontStyle: "italic", textAlign: "center" }}>Select a time block<br />to see what happens in that session</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
function ModulePage({ slug, setPage }) {
  const isMobile = useIsMobile();
  const mod = currMods.find(m => m.slug === slug);
  if (!mod) return null;
  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px 0" : "32px 40px 0" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[["Home", "home"], ["Curriculum", "curriculum"]].map(([l, p]) => (
            <span key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span onClick={() => setPage(p)} style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", cursor: "pointer", letterSpacing: 1 }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "rgba(251,247,238,0.4)"}>{l}</span>
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
          <h1 style={{ fontFamily: serif, fontSize: "clamp(38px,5vw,68px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16, maxWidth: 800 }}>{mod.title}</h1>
          <p style={{ fontFamily: serif, fontSize: 22, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.6, maxWidth: 680 }}>{mod.tagline}</p>
        </Fade>
      </div>
      <Hr />

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap: isMobile ? 40 : 72, alignItems: "start" }}>
          <div>
            <Fade>
              <Eyebrow>ABOUT THIS MODULE</Eyebrow>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 44 }}>{mod.body}</p>
            </Fade>
            <Fade d={.08}>
              <div style={{ background: "#080808", border: "1px solid #151515", borderLeft: `3px solid ${gold}`, padding: "32px 32px", marginBottom: 44 }}>
                <p style={{ fontFamily: serif, fontSize: 21, fontStyle: "italic", color: "#FBF7EE", lineHeight: 1.6 }}>"{mod.quote}"</p>
              </div>
            </Fade>
            <Fade d={.12}>
              <Eyebrow>WHY THIS MATTERS</Eyebrow>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 48 }}>{mod.why}</p>
            </Fade>
            <Fade d={.16}>
              <Eyebrow>WHAT YOU WILL LEARN</Eyebrow>
              <div style={{ border: "1px solid #151515" }}>
                {mod.whatYouLearn.map((item, i) => (
                  <div key={i} style={{ padding: "16px 22px", borderBottom: i < mod.whatYouLearn.length - 1 ? "1px solid #0E0E0E" : "none", display: "flex", gap: 16, alignItems: "flex-start", background: i % 2 === 0 ? "#080808" : "#060606" }}>
                    <span style={{ fontFamily: sans, fontSize: 10, color: gold, opacity: .5, letterSpacing: 1, marginTop: 3, flexShrink: 0, fontWeight: 500 }}>0{i + 1}</span>
                    <span style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", lineHeight: 1.65, fontWeight: 300 }}>{item}</span>
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
                <p style={{ fontFamily: serif, fontSize: 15, color: "#FBF7EE", fontStyle: "italic", marginBottom: 16, lineHeight: 1.5 }}>By the end of this module, every student will:</p>
                {mod.outcomes.map((o, i) => <Li key={i} solid>{o}</Li>)}
              </div>
              <div style={{ background: "#060606", border: "1px solid #151515", borderTop: "none", padding: "22px 28px", marginBottom: 14 }}>
                {[["Schedule", mod.months], ["Program", "Intensive & Full"], ["Location", "Orange County, CA"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", letterSpacing: 1 }}>{k}</span>
                    <span style={{ fontFamily: serif, fontSize: 13, color: "#FBF7EE" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "13px 0", background: gold, color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: 2, border: "none", cursor: "pointer" }}>APPLY NOW →</button>
            </Fade>
            <Fade d={.1}>
              <div style={{ marginTop: 24 }}>
                <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: 3, color: "#FBF7EE", marginBottom: 10, fontWeight: 500 }}>OTHER MODULES</p>
                {currMods.filter(m => m.slug !== slug).slice(0, 5).map((m, i) => (
                  <div key={i} onClick={() => setPage(`module:${m.slug}`)} style={{ padding: "11px 0", borderBottom: "1px solid #0E0E0E", cursor: "pointer" }}>
                    <span style={{ fontFamily: serif, fontSize: 14, color: "#FBF7EE", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#666"}>{m.title} →</span>
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
          <p style={{ fontFamily: serif, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 600, color: "#FBF7EE", marginBottom: 12 }}>This module is part of the complete curriculum.</p>
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

// ── SOIRÉE INVITE BLOCK — reusable across pages ──
function SoireeInviteBlock({ openInquiry }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#060506" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ background: "#050505", border: `1px solid rgba(199,171,117,.55)`, padding: isMobile ? "28px 24px" : "36px 44px", position: "relative" }} className="soiree-card">
          <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
          <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
          <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
          {!submitted ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Family Information Event</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 32 : 48, color: "#FBF7EE", lineHeight: 1.0, fontWeight: 600, marginBottom: 4 }}>May 23</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 13 : 16, color: gold, fontWeight: 400, letterSpacing: "0.08em", marginBottom: 14 }}>Saturday &nbsp;·&nbsp; 5:00 PM – 7:00 PM</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 13 : 16, color: "#FBF7EE", lineHeight: 1.4, marginBottom: 14, fontStyle: "italic" }}>Academy Launch and Family Information Soirée<br />at the Mediterranean Estate in San Clemente</p>
              <div style={{ width: 44, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "0 auto 18px" }} />
              <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, maxWidth: 540, margin: "0 auto 18px" }}>An intimate evening and cocktail reception for a select number of families to meet the faculty, learn about the Academy’s programs, ask questions, and experience the people and standards behind Excalibur before applications open for the inaugural cohorts.</p>
              <p style={{ fontFamily: serif, fontSize: 12, color: gold, letterSpacing: "0.18em", marginBottom: 20 }}>By personal invitation only.</p>
              <div style={{ background: "#000", border: `1px solid rgba(199,171,117,.25)`, padding: "20px 24px", textAlign: "center", maxWidth: 520, margin: "0 auto 24px" }}>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, marginBottom: 12, lineHeight: 1.6 }}>Prospective students will be asked to reflect on one simple question:</p>
                <p style={{ fontFamily: serif, fontSize: isMobile ? 22 : 30, color: gold, fontWeight: 600, lineHeight: 1.3, fontStyle: "italic" }}>"What is your dream?"</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row", maxWidth: 520, margin: "0 auto" }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && email && setSubmitted(true)} placeholder="Your email address" style={{ flex: 1, padding: "13px 18px", background: "#000", border: "1px solid rgba(199,171,117,.25)", color: "#FBF7EE", fontFamily: sans, fontSize: 13, outline: "none" }} onFocus={e => e.target.style.borderColor = gold} onBlur={e => e.target.style.borderColor = "rgba(199,171,117,.25)"} />
                <button onClick={() => { openInquiry && openInquiry(); email && setSubmitted(true); }} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", flexShrink: 0 }}>Request an Invitation</button>
              </div>
              <p style={{ fontFamily: sans, fontSize: 10, color: "#FBF7EE", marginTop: 12 }}>We will contact you with event details and personal invitation.</p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: serif, fontSize: 28, color: gold, display: "block", marginBottom: 14 }}>✦</span>
              <p style={{ fontFamily: serif, fontSize: 22, color: "#FBF7EE", marginBottom: 10 }}>Thank you.</p>
              <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8 }}>We will be in touch personally. We look forward to welcoming your family.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PAGE: CURRICULUM INDEX
// ─────────────────────────────────────────────
function CurriculumPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "36px 16px 32px" : "60px 40px 52px", textAlign: "center" }}>
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
                <h3 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 8 }}>{m.title}</h3>
                <p style={{ fontFamily: serif, fontSize: 16, fontStyle: "italic", color: "#FBF7EE", marginBottom: 12 }}>{m.tagline}</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.7, color: "#FBF7EE", fontWeight: 300, marginBottom: 16 }}>{m.summary}</p>
                <span style={{ fontFamily: sans, fontSize: 11, color: gold, letterSpacing: 2, fontWeight: 500 }}>Explore module →</span>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    <SoireeInviteBlock openInquiry={openInquiry} />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: FULL PROGRAM
// ─────────────────────────────────────────────
function FullProgramPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [activeMod, setActiveMod] = useState(null);
  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "36px 16px 32px" : "60px 40px 48px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(199,171,117,.04) 0%, transparent 70%)" }} />
        <Fade>
          <Eyebrow>THE FLAGSHIP PROGRAM</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(40px,5.5vw,70px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16 }}>The Ten-Month Formation</h1>
          <p style={{ fontFamily: serif, fontSize: 20, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 40px" }}>Not a course. Not a workshop. A complete transformation across ten months of deliberate formation.</p>
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
                <div style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginTop: 6, fontWeight: 300 }}>{l}</div>
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
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>The Full Program is the complete Excalibur formation — ten months of deliberate development across every discipline that defines a consequential career. It is not a series of workshops. It is a year-long transformation built around a cohort of 25 students who challenge each other and graduate with documented, professional-grade experience.</p>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300 }}>Available as Weekday Track (Tue & Thu, 4:00–6:25 PM) or Saturday Track (every Saturday, 10:30 AM–3:45 PM). Both tracks are identical in curriculum and depth. Both share the same milestone events: Monthly Pitch Nights, the consulting project, the externship, the micro-business launch, and Demo Day.</p>
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
        <Fade><Eyebrow>THE TEN-MONTH ARC</Eyebrow><SectionTitle>What a Year Looks Like</SectionTitle></Fade>
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
                <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#FBF7EE", marginBottom: 10, lineHeight: 1.2 }}>{row.t}</h4>
                {row.items.map((item, j) => <div key={j} style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginBottom: 3, fontWeight: 300 }}>— {item}</div>)}
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
                  <div style={{ fontFamily: sans, fontSize: 10, color: "#FBF7EE", marginTop: 2 }}>{m.months}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#080808", padding: "40px 40px" }}>
              <Eyebrow>{currMods[activeMod].months.toUpperCase()}</Eyebrow>
              <h3 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE", marginBottom: 6, lineHeight: 1.2 }}>{currMods[activeMod].title}</h3>
              <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic", marginBottom: 18 }}>{currMods[activeMod].tagline}</p>
              <div style={{ marginBottom: 24 }}>{currMods[activeMod].summary.split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 16 }}>{para}</p>))}</div>
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
                  <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#FBF7EE" }}>{s.name}</h4>
                </div>
                <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.65, color: "#FBF7EE", fontWeight: 300 }}>{s.desc}</p>
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
                <h3 style={{ fontFamily: serif, fontSize: 22, color: "#FBF7EE", fontWeight: 600, marginBottom: 20 }}>{t.schedule}</h3>
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
                  <span style={{ fontFamily: serif, fontSize: 44, fontWeight: 600, color: "#FBF7EE" }}>{t.price}</span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE" }}>{t.period}</span>
                </div>
                {t.features.map((f, j) => <Li key={j} solid={t.accent}>{f}</Li>)}
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", marginTop: 24, padding: "12px 0", background: t.accent ? gold : "transparent", border: t.accent ? "none" : `1px solid rgba(199,171,117,.25)`, color: t.accent ? "#000" : gold, fontSize: 11, fontWeight: t.accent ? 700 : 600, letterSpacing: 2, cursor: "pointer" }}>{t.accent ? "APPLY — ELITE" : "APPLY — CORE"}</button>
              </div>
            ))}
          </div>
        </Fade>
        <Fade d={.12}><p style={{ textAlign: "center", fontFamily: sans, color: "#FBF7EE", fontSize: 12, marginTop: 18 }}>Annual prepayment at 10% reduction. Sibling discount: 15%.</p></Fade>
      </div>

      <div style={{ padding: isMobile ? "48px 16px" : "72px 40px", textAlign: "center" }}>
        <Fade>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(30px,4vw,52px)", fontWeight: 600, color: "#FBF7EE", marginBottom: 12, lineHeight: 1.1 }}>The Founding Class<br /><span style={{ color: gold }}>is forming now.</span></h2>
          <Sub center>Twenty-five students. One year of real formation. A foundation for every arena ahead.</Sub>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 44px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, border: "none", cursor: "pointer", marginTop: 32 }}>APPLY FOR THE FULL PROGRAM</button>
        </Fade>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: 6-WEEK INTENSIVE
// ─────────────────────────────────────────────
function IntensivePage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [activeWave, setActiveWave] = useState(0);
  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "36px 16px 32px" : "60px 40px 48px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(199,171,117,.03) 0%, transparent 70%)" }} />
        <Fade>
          <Eyebrow>SIX-WEEK INTENSIVE</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(40px,5.5vw,68px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16 }}>The compressed formation.</h1>
          <p style={{ fontFamily: serif, fontSize: 20, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 16px" }}>A compressed version of the flagship curriculum. One discipline per week, building toward a Shark Tank–style Finale. Two tracks — Monday & Wednesday evenings or Sunday mornings.</p>
          <p style={{ fontFamily: sans, fontSize: 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, maxWidth: 680, margin: "0 auto 36px" }}>Students progress through the Academy's core disciplines — public speaking, financial literacy, business models, sales and persuasion, technology, and leadership — building toward a culminating Shark Tank–style finale. Instruction is rigorous and applied, emphasizing critical thinking, public speaking, and decision-making.</p>
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
            {[["6 Weeks", "program duration"], ["12 Sessions", "3 hours each"], ["20 Students", "per cohort"], ["4 Waves", "per year"]].map(([v, l], i) => (
              <div key={i} style={{ background: "#080808", padding: "24px 18px", textAlign: "center" }}>
                <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: gold }}>{v}</div>
                <div style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginTop: 5, fontWeight: 300 }}>{l}</div>
              </div>
            ))}
          </div>
        </Fade>
      </div>
      <Hr />

      {/* Program Structure + Schedule */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade>
          <Eyebrow>PROGRAM STRUCTURE</Eyebrow>
          <SectionTitle>Six weeks. Twelve sessions. One standard.</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 64, marginTop: 32 }}>
            <div>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 20 }}>Six weeks in duration. Twelve total sessions. One core discipline per week. Every session follows the same consistent three-block model used across all Excalibur programs.</p>
              {["Public Speaking & Rhetoric", "Specialist Instruction", "Applied Leadership — The War Room"].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 16, height: 1.5, background: "rgba(199,171,117,.5)", marginTop: 9, flexShrink: 0 }} />
                  <span style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginTop: 20 }}>Each week combines instruction, discussion, and hands-on application.</p>
            </div>
            <div>
              <Eyebrow>SCHEDULE OPTIONS</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "WEEKDAY TRACK — GROUP A", schedule: "Monday & Wednesday evenings", time: "4:00–6:25 PM" },
                  { label: "WEEKEND TRACK — GROUP B", schedule: "Sunday mornings", time: "10:30 AM–3:45 PM" },
                ].map((t, i) => (
                  <div key={i} style={{ background: i === 0 ? "#0A0908" : "#080808", padding: "24px 28px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.2)"}` }}>
                    <Eyebrow>{t.label}</Eyebrow>
                    <h3 style={{ fontFamily: serif, fontSize: 20, color: "#FBF7EE", fontWeight: 600, marginBottom: 4 }}>{t.schedule}</h3>
                    <p style={{ fontFamily: serif, fontSize: 16, color: gold }}>{t.time}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, marginTop: 14, lineHeight: 1.7 }}>Both tracks deliver identical curricular content and instructional time.</p>
            </div>
          </div>
        </Fade>
      </div>
      <Hr />

      {/* 6-week arc */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade><Eyebrow>THE SIX-WEEK ARC</Eyebrow><SectionTitle>One discipline per week.</SectionTitle></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "repeat(6, 1fr)", gap: 2, background: "#111", marginTop: 36 }}>
            {[
              { w: "Week 1", t: "Public Speaking & Rhetoric", items: ["Voice mechanics", "Impromptu drills", "60-sec pitch"], hi: true },
              { w: "Week 2", t: "Financial Literacy", items: ["Reading a P&L", "Unit economics", "Business acumen"], hi: false },
              { w: "Week 3", t: "Business Models", items: ["8 model archetypes", "Real case study", "Competitive analysis"], hi: true },
              { w: "Week 4", t: "Sales & Persuasion", items: ["Consultative selling", "Objection handling", "Cialdini's principles"], hi: false },
              { w: "Week 5", t: "Technology & Leadership", items: ["AI as biz tool", "Five forms of power", "Crisis simulation"], hi: true },
              { w: "Week 6", t: "Shark Tank–inspired Finale", items: ["Live investor pitch", "Business presentation", "Prizes & portfolio"], hi: false },
            ].map((row, i) => (
              <div key={i} style={{ background: row.hi ? "#0A0A08" : "#080808", padding: "24px 16px", borderTop: `2px solid ${row.hi ? gold : "rgba(199,171,117,.12)"}` }}>
                <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 2, color: gold, marginBottom: 6, fontWeight: 500 }}>{row.w}</p>
                <h4 style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#FBF7EE", marginBottom: 10, lineHeight: 1.2 }}>{row.t}</h4>
                {row.items.map((item, j) => <div key={j} style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginBottom: 3, fontWeight: 300 }}>— {item}</div>)}
              </div>
            ))}
          </div>
        </Fade>
      </div>

      {/* Culminating Experience */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 72, alignItems: "center" }}>
            <div>
              <Eyebrow>CULMINATING EXPERIENCE</Eyebrow>
              <SectionTitle>The Shark Tank Finale.</SectionTitle>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginTop: 20 }}>The program concludes with a Shark Tank–style finale, where students pitch complete business ideas to real entrepreneurs and investors. Winning teams are awarded prizes and early funding support.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { prize: "$2,000", label: "Best Business Concept" },
                { prize: "$1,000", label: "Best Pitch" },
                { prize: "$500", label: "Most Innovative" },
                { prize: "Tech Pack", label: "Business Accessories Prizes" },
              ].map((p, i) => (
                <div key={i} style={{ background: "#080808", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.12)"}` }}>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>{p.label}</span>
                  <span style={{ fontFamily: serif, fontSize: 20, color: gold, fontWeight: 600 }}>{p.prize}</span>
                </div>
              ))}
            </div>
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
                <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#FBF7EE", marginBottom: 3 }}>{waves[activeWave].name} — {waves[activeWave].season} 2026</h3>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300 }}>{waves[activeWave].dates} · Applications close {waves[activeWave].deadline}</p>
              </div>
              <span style={{ fontFamily: sans, fontSize: 10, letterSpacing: 2, padding: "5px 12px", border: `1px solid ${sc(waves[activeWave].status)}`, color: sc(waves[activeWave].status) }}>{sl(waves[activeWave].status)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
              {[{ label: "WEEKDAY TRACK A", t: waves[activeWave].wd }, { label: "WEEKEND TRACK B", t: waves[activeWave].we }].map(({ label, t }, i) => {
                return (
                  <div key={i} style={{ background: "#080808", padding: "28px 28px" }}>
                    <Eyebrow>{label}</Eyebrow>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      {[["Days", t.days], ["Time", t.time], ["Duration", "6 Weeks"], ["Location", "Orange County"]].map(([k, v]) => (
                        <div key={k}><div style={{ fontFamily: sans, fontSize: 9, letterSpacing: 1.5, color: "rgba(251,247,238,0.5)", marginBottom: 3 }}>{k}</div><div style={{ fontFamily: serif, fontSize: 14, color: "#FBF7EE" }}>{v}</div></div>
                      ))}
                    </div>
                    <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", marginTop: 16, padding: "9px 0", border: "1px solid rgba(199,171,117,.25)", color: gold, fontSize: 10, fontWeight: 600, letterSpacing: 2, background: "transparent", cursor: "pointer" }}>INQUIRE NOW →</button>
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
            <div style={{ fontFamily: serif, fontSize: 48, fontWeight: 600, color: "#FBF7EE", lineHeight: 1 }}>$3,900</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", marginBottom: 24 }}>per wave · four waves per year</div>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>Includes all twelve sessions, guest speaker access, materials, Shark Tank Finale with real investors, and bound graduation portfolio. Spring, Summer, Fall, and Winter waves available.</p>
            <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", marginBottom: 28 }}>Intensive graduates who enroll in the Full Program receive a $500 credit toward their first month's tuition.</p>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 44px", fontSize: 12, fontWeight: 700, letterSpacing: 2, border: "none", cursor: "pointer" }}>APPLY FOR THE INTENSIVE</button>
          </div>
        </Fade>
      </div>
    </div>
  );
}

// ── Standalone schedule section for ProgramsPage ──
function DailyScheduleSection() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("summer");
  const [activeBlock, setActiveBlock] = useState(0);
  const tabs = [
    { id: "summer", label: "Summer Intensive", sched: summerSchedule, subtitle: "Monday – Friday · 9:30 AM – 3:00 PM · July 6–17 & Aug 3–14, 2026" },
    { id: "flagship-wd", label: "Flagship — Weekday", sched: flagshipWeekdaySchedule, subtitle: "Tuesday & Thursday · 4:00–6:15 PM · September 2026 – June 2027" },
    { id: "flagship-sat", label: "Flagship — Saturday", sched: flagshipSaturdaySchedule, subtitle: "Every Saturday · 10:30 AM–3:00 PM · September 2026 – June 2027" },
    { id: "six-week", label: "Six-Week Intensive", sched: sixWeekSchedule, subtitle: "Monday & Wednesday · 4:00–7:00 PM · Four waves per year" },
  ];
  const current = tabs.find(t => t.id === activeTab) || tabs[0];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
      <Fade>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Eyebrow>A DAY AT EXCALIBUR</Eyebrow>
          <SectionTitle center>What a real session looks like.</SectionTitle>
          <Sub center>Click any block to meet the instructor and see exactly what happens in that session.</Sub>
        </div>
      </Fade>
      <Fade d={.06}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontFamily: sans, padding: "9px 18px", background: activeTab === t.id ? "rgba(199,171,117,.08)" : "transparent", border: `1px solid ${activeTab === t.id ? "rgba(199,171,117,.4)" : "rgba(199,171,117,.12)"}`, color: activeTab === t.id ? gold : "#C8C0B8", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: activeTab === t.id ? 600 : 400, transition: "all .2s" }}>{t.label}</button>
          ))}
        </div>
        <DailyScheduleBlock schedule={current.sched} title={current.label} subtitle={current.subtitle} />
      </Fade>
    </div>
  );
}

function SummerContent({ setPage, isMobile, summerLeft }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
      {[
        { label: "WAVE 1 — JULY", dates: "July 6 – 18, 2026", left: summerLeft[0], items: [["Schedule", "Mon–Fri · 9:30 AM–3:00 PM"], ["Duration", "2 weeks"], ["Guest Speakers", "Daily"], ["Finale", "Shark Tank · July 18"]] },
        { label: "WAVE 2 — AUGUST", dates: "Aug 3 – 15, 2026", left: summerLeft[1], items: [["Schedule", "Mon–Fri · 9:30 AM–3:00 PM"], ["Duration", "2 weeks"], ["Guest Speakers", "Daily"], ["Finale", "Shark Tank · Aug 15"]] },
      ].map((t, i) => {
        const filled = 25 - t.left;
        return (
          <div key={i} style={{ background: "#080808", padding: "24px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <Eyebrow>{t.label}</Eyebrow>
              <span style={{ fontFamily: sans, fontSize: 9, color: "#4DB87A", letterSpacing: "0.1em", fontWeight: 600, border: "1px solid #4DB87A", padding: "2px 8px" }}>ENROLLING NOW</span>
            </div>
            <p style={{ fontFamily: serif, fontSize: 15, color: "#FBF7EE", marginBottom: 16 }}>{t.dates}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {t.items.map(([k, v]) => (<div key={k}><div style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div><div style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE" }}>{v}</div></div>))}
            </div>
            <div style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
              <span>{filled} enrolled</span><span style={{ color: t.left < 8 ? gold : "#C8C0B8" }}>{t.left} remaining</span>
            </div>
            <div style={{ height: 2, background: "#1a1a1a", marginBottom: 14 }}><div style={{ height: "100%", width: `${(filled/25)*100}%`, background: "#4DB87A" }} /></div>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", border: "1px solid rgba(199,171,117,.25)", color: gold, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", background: "transparent", cursor: "pointer" }}>APPLY NOW →</button>
          </div>
        );
      })}
    </div>
  );
}

function FlagshipContent({ setPage, isMobile, flagshipLeft }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
      {[
        { label: "WEEKDAY TRACK", schedule: "Tue & Thu · 4:00–6:15 PM", left: flagshipLeft[0], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Tue & Thu evenings"], ["Ends", "June 2027"], ["Price", "$1,990/month"], ["Seats", "25 per cohort"]] },
        { label: "SATURDAY TRACK", schedule: "Saturday · 10:30 AM–3:00 PM", left: flagshipLeft[1], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Full-day Saturdays"], ["Ends", "June 2027"], ["Price", "$1,990/month"], ["Seats", "25 per cohort"]] },
      ].map((t, i) => {
        return (
          <div key={i} style={{ background: "#080808", padding: "24px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <Eyebrow>{t.label}</Eyebrow>
            </div>
            <p style={{ fontFamily: serif, fontSize: 15, color: "#FBF7EE", marginBottom: 16 }}>{t.schedule}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {t.items.map(([k, v]) => (<div key={k}><div style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div><div style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE" }}>{v}</div></div>))}
            </div>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", cursor: "pointer" }}>INQUIRE NOW →</button>
          </div>
        );
      })}
    </div>
  );
}

function IntensiveContent({ setPage, isMobile, waves, activeWave, setActiveWave }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#060606", borderBottom: "1px solid #111", flexWrap: "wrap" }}>
        {waves.map((w, i) => <button key={i} onClick={() => setActiveWave(i)} style={{ fontFamily: sans, padding: "7px 16px", background: activeWave === i ? "rgba(199,171,117,.08)" : "transparent", border: `1px solid ${activeWave === i ? "rgba(199,171,117,.3)" : "#1a1a1a"}`, color: activeWave === i ? gold : "#C8C0B8", fontSize: 12, cursor: "pointer", transition: "all .25s" }}>{w.name} · {w.season}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 1, background: "#111" }}>
        {[{ label: "WEEKDAY TRACK", t: waves[activeWave].wd }, { label: "WEEKEND TRACK", t: waves[activeWave].we }].map(({ label, t }, i) => {
          const isOpen = waves[activeWave].status === "open";
          return (
            <div key={i} style={{ background: "#080808", padding: "24px 24px" }}>
              <Eyebrow>{label}</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16, marginTop: 12 }}>
                {[["Days", t.days], ["Time", t.time], ["Dates", waves[activeWave].dates], ["Location", "Orange County, CA"]].map(([k, v]) => (<div key={k}><div style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div><div style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE" }}>{v}</div></div>))}
              </div>
              <p style={{ fontFamily: sans, fontSize: 11, color: isOpen ? "#4DB87A" : gold, letterSpacing: "0.1em", marginBottom: 14 }}>{isOpen ? "● Enrolling Now" : "Coming Soon — Join Waitlist"}</p>
              <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", border: "1px solid rgba(199,171,117,.25)", color: gold, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", background: "transparent", cursor: "pointer" }}>{isOpen ? "INQUIRE NOW →" : "JOIN WAITLIST →"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MOBILE PROGRAM CONTENT HELPERS ──
function SummerProgramContent({ prog, openInquiry, setPage, isMobile }) {
  const gold = "#C7AB75";
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans = "'Lato', 'DM Sans', sans-serif";
  const eyebrow_font = "'Lato', sans-serif";
  return (
    <div>
      <div style={{ position: "relative", background: "#000" }}>
        <img src={prog.photo} alt={prog.title} style={{ width: "100%", display: "block", objectFit: "contain" }} />
      </div>
      <div style={{ background: "#fff", padding: "32px 24px" }}>
        {/* Enrollment tracker */}
        <div style={{ background: "#000", padding: "20px 22px", marginBottom: 24 }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.4em", color: "rgba(199,171,117,.55)", fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Enrollment Status · Summer 2026</p>
          {[{ wave: "Wave I", dates: "July 6–18", enrolled: 14, total: 20 }, { wave: "Wave II", dates: "Aug 3–15", enrolled: 9, total: 20 }].map((w, i) => (
            <div key={i} style={{ marginBottom: i === 0 ? 16 : 0, paddingBottom: i === 0 ? 16 : 0, borderBottom: i === 0 ? "1px solid rgba(199,171,117,.08)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: serif, fontSize: 13, fontWeight: 600, color: "#FBF7EE" }}>{w.wave} · {w.dates}</span>
                <span style={{ fontFamily: sans, fontSize: 11, color: "#4DB87A" }}>{w.enrolled}/{w.total}</span>
              </div>
              <div style={{ height: 2, background: "rgba(255,255,255,.06)" }}><div style={{ height: "100%", width: `${(w.enrolled/w.total)*100}%`, background: "#4DB87A" }} /></div>
            </div>
          ))}
        </div>
        {prog.desc.split("\n\n").map((p, i) => <p key={i} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 14 }}>{p}</p>)}
        <div style={{ marginTop: 16, marginBottom: 16, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 16 }}>
          {prog.details.map(([k, v]) => <div key={k} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}><span style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.2em", color: "rgba(0,0,0,.4)", textTransform: "uppercase" }}>{k}</span><span style={{ fontFamily: sans, fontSize: 12, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.5, whiteSpace: "pre-line" }}>{v}</span></div>)}
        </div>
        <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.3em", color: "#8B6914", textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>{prog.featuresLabel}</p>
        {prog.features.map((f, j) => <div key={j} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.06)", alignItems: "flex-start" }}><span style={{ fontFamily: serif, fontSize: 10, color: "rgba(0,0,0,.2)", fontStyle: "italic", flexShrink: 0 }}>{String(j+1).padStart(2,"0")}</span><span style={{ fontFamily: sans, fontSize: 12, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.7 }}>{f}</span></div>)}
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => openInquiry && openInquiry(prog.id)} style={{ fontFamily: sans, padding: "13px 28px", background: "#000", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW →</button>
          <button onClick={() => setPage(prog.id)} style={{ fontFamily: sans, padding: "13px 22px", background: "transparent", border: "1px solid rgba(0,0,0,.2)", color: "#000", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>
        </div>
      </div>
    </div>
  );
}

function DarkProgramContent({ prog, openInquiry, setPage, isMobile }) {
  const gold = "#C7AB75";
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans = "'Lato', 'DM Sans', sans-serif";
  const eyebrow_font = "'Lato', sans-serif";
  return (
    <div style={{ background: "#06050A", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 8 }}>{prog.title}</h2>
      <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 24, lineHeight: 1.4 }}>{prog.tagline}</p>
      <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 20 }} />
      {prog.desc.split("\n\n").map((p, i) => <p key={i} style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>{p}</p>)}
      <div style={{ borderTop: "1px solid rgba(199,171,117,.08)", paddingTop: 16, marginTop: 8, marginBottom: 16 }}>
        {prog.details.map(([k, v]) => <div key={k} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(199,171,117,.05)" }}><span style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.2em", color: "rgba(199,171,117,.4)", textTransform: "uppercase" }}>{k}</span><span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.5, whiteSpace: "pre-line" }}>{v}</span></div>)}
      </div>
      <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.3em", color: gold, textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>{prog.featuresLabel}</p>
      {prog.features.map((f, j) => <div key={j} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}><span style={{ fontFamily: serif, fontSize: 10, color: "rgba(199,171,117,.3)", fontStyle: "italic", flexShrink: 0 }}>{String(j+1).padStart(2,"0")}</span><span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7 }}>{f}</span></div>)}
      <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => openInquiry && openInquiry(prog.id)} style={{ fontFamily: sans, padding: "12px 28px", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>{prog.flagship ? "APPLY — FLAGSHIP →" : "APPLY NOW →"}</button>
        {!prog.flagship && <button onClick={() => setPage(prog.id)} style={{ fontFamily: sans, padding: "12px 20px", background: "transparent", border: `1px solid ${gold}`, color: gold, fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: PROGRAMS OVERVIEW
// ─────────────────────────────────────────────
function ProgramsPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [activeWave, setActiveWave] = useState(0);
  const [activeProgram, setActiveProgram] = useState(0);

  const programs = [
    {
      tag: "SUMMER INTENSIVE", id: "summer", flagship: false, status: "WAITLIST NOW OPEN", statusColor: "#4DB87A",
      title: "Summer Intensive",
      tagline: "Two weeks. Full days. Serious momentum.",
      photo: "https://i.imgur.com/ua2WSIA.jpeg",
      desc: "The Summer Intensive is a two-week, full-day program offered in July and August for high school juniors and seniors ready to experience Excalibur's core model in a concentrated format.\n\nEach day combines public speaking training, business, innovation, marketing and leadership instruction, applied workshops, and sessions with distinguished guest speakers. Students rotate through all major curricular areas and engage daily with guest lecturers and specialists drawn from a range of professional fields.\n\nThe program culminates in The Excalibur Venture Finale — a Shark Tank–inspired pitch finale where student teams present original business concepts to a panel of experienced judges and real investors. Selected projects receive rewards and prizes ranging from top business tech accessories to real seed funding support.",
      details: [
        ["Schedule", "Wave I: July 6–18, 2026  ·  Wave II: August 3–15, 2026\nMonday–Friday · 9:30 AM–3:00 PM"],
        ["Class Size", "Limited to 20 students per wave"],
        ["Tuition", "$4,500+ per wave"],
        ["Included", "Catered lunches from local restaurants, distinguished guest speakers, faculty-led workshops, pitch development, and The Excalibur Venture Grand Finale before families and invited professionals."],
      ],
      features: [
        "All eight curriculum disciplines across two weeks",
        "Guest speaker every single day — real entrepreneurs, top executives and notable guest speakers",
        "Full-day interactive sessions: pitching, debate, case studies, workshops",
        "Includes catered lunches from local restaurants, refreshments during scheduled breaks, and courtyard time between instructional blocks.",
        "Shark Tank–inspired Venture Finale: teams pitch live to real judges for startup investment prizes — $2,000 Best Concept, $1,000 Best Pitch, $500 Most Innovative, as well as tech business accessories",
        "Field trip to local businesses — behind-the-scenes tour and owner conversation",
        "Bound portfolio awarded at Shark Tank–inspired Finale",
        "Alumni & Mentors network access upon completion",
      ],
      featuresLabel: "The Experience",
    },
    {
      tag: "TEN-MONTH FLAGSHIP", id: "full-program", flagship: true, status: "ENROLLING SOON", statusColor: gold,
      title: "Ten-Month Program",
      tagline: "The complete formation.",
      photo: null,
      desc: "The complete Excalibur formation — ten months across all eight disciplines, all twelve industry sectors, and three real-world engagements. Two parallel tracks give families scheduling flexibility. The same curriculum, the same faculty, the same standard.",
      details: [
        ["Schedule", "Weekday: Tue & Thu · 4:00–6:25 PM (Group B)\nor Saturday: 10:30 AM–3:45 PM (Group A)"],
        ["Class Size", "15–25 per track · 30–50 total"],
        ["Tuition", "$1,990 / month"],
        ["Dates", "September 2026 – June 2027 · Founding Class"],
      ],
      features: ["All 8 modules at full depth across a structured 4-phase arc", "10 industry sector rotations — one guest professional per month", "Three-block session model: Speaking Coach + Lead Instructor + Specialist", "Junior Consultant Program — 3-week real business engagement", "Apprentice Externship — 4–6 weeks inside a real company", "Funded Micro-Business Launch with a dedicated mentor", "Monthly Pitch Night before live judges and parents", "City Championship (biannual) and National Championship pipeline", "Bound graduation portfolio + faculty letters of recommendation", "College admissions counseling and portfolio review"],
      featuresLabel: "The Experience",
    },
    {
      tag: "SIX-WEEK INTENSIVE", id: "intensive", flagship: false, status: "ENROLLING SOON", statusColor: gold,
      title: "Six-Week Intensive",
      tagline: "The compressed formation.",
      photo: null,
      desc: "A compressed version of the flagship curriculum. One discipline per week, building toward a Shark Tank–style Finale. Two tracks — Monday & Wednesday evenings or Sunday mornings. Twelve total sessions, structured as 12 sessions of three hours each.",
      details: [
        ["Schedule", "Mon & Wed evenings · 4:00–6:25 PM (Group A)\nor Sunday (Group B)"],
        ["Class Size", "20 students per wave"],
        ["Tuition", "$3,900 / wave"],
        ["Waves", "Four per year · Spring, Summer, Fall, Winter"],
      ],
      features: ["Full curriculum across six weeks — one module per week", "Weekday evening or Sunday morning track", "Guest speaker every week from a different industry", "Shark Tank–style Finale closes each wave with live investor panel"],
      featuresLabel: "The Experience",
    },
  ];

  const prog = programs[activeProgram];

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "36px 16px 32px" : "60px 40px 48px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>OUR PROGRAMS · EXCALIBUR ACADEMY</Eyebrow>
          <SectionTitle center>Three programs. One standard.</SectionTitle>
          <Sub center>Every program is built around the same faculty, the same session model, curriculum and the same conviction: that teenagers are capable of far more than most programs dare to ask of them.</Sub>
        </Fade>
      </div>

      <Hr />

      {/* LUXURY PROGRAM SHOWCASE */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0" : "0 0 80px" }}>

        {/* Program selector — luxury three-panel cards */}
        {isMobile ? (
          /* MOBILE — accordion: click card, content drops below that card */
          <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "#111" }}>
            {programs.map((p, i) => (
              <div key={i}>
                <button onClick={() => setActiveProgram(activeProgram === i ? -1 : i)} style={{
                  width: "100%", background: activeProgram === i ? "#080808" : "#050505",
                  border: "none", borderTop: activeProgram === i ? `2px solid ${gold}` : "2px solid rgba(199,171,117,.12)",
                  padding: "22px 20px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.15em", fontWeight: 700, color: p.statusColor, border: `1px solid ${p.statusColor}`, padding: "2px 7px" }}>{p.status}</span>
                    </div>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: activeProgram === i ? "#FBF7EE" : "rgba(251,247,238,.5)", lineHeight: 1.1, marginBottom: 4 }}>{p.title}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: activeProgram === i ? gold : "rgba(199,171,117,.4)", fontStyle: "italic" }}>{p.tagline}</p>
                  </div>
                  <span style={{ fontFamily: sans, fontSize: 20, color: activeProgram === i ? gold : "rgba(199,171,117,.3)", transform: activeProgram === i ? "rotate(45deg)" : "none", transition: "transform .3s", flexShrink: 0, marginLeft: 12 }}>+</span>
                </button>
                {/* Content drops right below this card on mobile */}
                {activeProgram === i && (
                  <div style={{ background: "#000" }}>
                    {p.photo ? <SummerProgramContent prog={p} openInquiry={openInquiry} setPage={setPage} isMobile={true} /> : <DarkProgramContent prog={p} openInquiry={openInquiry} setPage={setPage} isMobile={true} />}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* DESKTOP — three side-by-side cards */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, background: "#111", marginBottom: 2 }}>
            {programs.map((p, i) => (
              <button key={i} onClick={() => setActiveProgram(i)} style={{
                background: activeProgram === i ? "#080808" : "#050505",
                border: "none", borderTop: activeProgram === i ? `2px solid ${gold}` : "2px solid rgba(199,171,117,.12)",
                padding: "32px 36px", cursor: "pointer", transition: "all .3s", textAlign: "left",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.15em", fontWeight: 700,
                    color: p.statusColor, border: `1px solid ${p.statusColor}`, padding: "2px 8px",
                    opacity: activeProgram === i ? 1 : 0.5 }}>{p.status}</span>
                </div>
                <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.35em", color: activeProgram === i ? gold : "rgba(199,171,117,.3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{p.tag}</p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: activeProgram === i ? "#FBF7EE" : "rgba(251,247,238,.3)", lineHeight: 1.05, marginBottom: 8, transition: "color .3s" }}>{p.title}</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: activeProgram === i ? gold : "rgba(199,171,117,.2)", fontStyle: "italic", lineHeight: 1.3, transition: "color .3s" }}>{p.tagline}</p>
                {activeProgram === i && <div style={{ width: 28, height: 1, background: gold, marginTop: 18 }} />}
              </button>
            ))}
          </div>
        )}

        {/* Program detail */}
        <div key={activeProgram}>

          {prog.photo ? (
            /* ── SUMMER: full photo + white content below ── */
            <div>
              {/* Photo — full width, show entire image, no crop */}
              <div style={{ position: "relative", background: "#000" }}>
                <img src={prog.photo} alt={prog.title} style={{ width: "100%", display: "block", maxHeight: isMobile ? 320 : 520, objectFit: "contain", objectPosition: "center" }} />
              </div>

              {/* Content below photo — white background, two columns */}
              <div style={{ background: "#fff", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>

                {/* LEFT — heading, desc, status, details */}
                <div style={{ padding: isMobile ? "36px 24px" : "52px 52px", borderRight: isMobile ? "none" : "1px solid rgba(0,0,0,.07)" }}>
                  {/* Status + tag */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: sans, fontSize: 9, color: prog.statusColor, border: `1px solid ${prog.statusColor}`, padding: "3px 10px", letterSpacing: "0.15em", fontWeight: 600 }}>{prog.status}</span>
                    <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.3em", color: "rgba(0,0,0,.35)", textTransform: "uppercase" }}>{prog.tag}</span>
                  </div>
                  <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 42, fontWeight: 600, color: "#000", lineHeight: 1.0, marginBottom: 8 }}>{prog.title}</h2>
                  <p style={{ fontFamily: serif, fontSize: 16, color: "#8B6914", fontStyle: "italic", marginBottom: 24, lineHeight: 1.4 }}>{prog.tagline}</p>

                  {/* ENROLLMENT TRACKER — luxury hotel style */}
                  <div style={{ background: "#000", padding: "24px 28px", marginBottom: 28 }}>
                    <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.4em", color: "rgba(199,171,117,.55)", fontWeight: 600, textTransform: "uppercase", marginBottom: 18 }}>Enrollment Status · Summer 2026</p>
                    {[
                      { wave: "Wave I", dates: "July 6–18", days: "Mon–Fri · 9:30 AM–3 PM", enrolled: 14, total: 20 },
                      { wave: "Wave II", dates: "August 3–15", days: "Mon–Fri · 9:30 AM–3 PM", enrolled: 9, total: 20 },
                    ].map((w, i) => (
                      <div key={i} style={{ marginBottom: i === 0 ? 20 : 0, paddingBottom: i === 0 ? 20 : 0, borderBottom: i === 0 ? "1px solid rgba(199,171,117,.08)" : "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                          <div>
                            <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#FBF7EE", marginRight: 10 }}>{w.wave}</span>
                            <span style={{ fontFamily: sans, fontSize: 11, color: "rgba(251,247,238,.45)", fontWeight: 300 }}>{w.dates} · {w.days}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: serif, fontSize: 13, color: "#4DB87A" }}>{w.enrolled} enrolled</span>
                            <span style={{ fontFamily: sans, fontSize: 10, color: "rgba(251,247,238,.3)", marginLeft: 8 }}>{w.total - w.enrolled} remaining</span>
                          </div>
                        </div>
                        <div style={{ height: 2, background: "rgba(255,255,255,.06)", borderRadius: 1 }}>
                          <div style={{ height: "100%", width: `${(w.enrolled / w.total) * 100}%`, background: `linear-gradient(90deg, #4DB87A, rgba(77,184,122,.6))`, transition: "width .8s ease", borderRadius: 1 }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                          <span style={{ fontFamily: sans, fontSize: 9, color: "rgba(251,247,238,.25)", letterSpacing: "0.05em" }}>0</span>
                          <span style={{ fontFamily: sans, fontSize: 9, color: "rgba(251,247,238,.25)", letterSpacing: "0.05em" }}>{w.total} max</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ width: 32, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 24 }} />
                  {prog.desc.split("\n\n").map((para, i) => (
                    <p key={i} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 14 }}>{para}</p>
                  ))}
                  {/* Details */}
                  <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 20 }}>
                    {prog.details.map(([k, v]) => (
                      <div key={k} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 16, padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
                        <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.2em", color: "rgba(0,0,0,.4)", textTransform: "uppercase", paddingTop: 2 }}>{k}</span>
                        <span style={{ fontFamily: sans, fontSize: 12, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.6, whiteSpace: "pre-line" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button onClick={() => openInquiry && openInquiry(prog.id)} style={{ fontFamily: sans, padding: "13px 32px", background: "#000", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW →</button>
                    <button onClick={() => setPage(prog.id)} style={{ fontFamily: sans, padding: "13px 28px", background: "transparent", border: "1px solid rgba(0,0,0,.25)", color: "#000", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>
                  </div>
                </div>

                {/* RIGHT — features + Day at Excalibur */}
                <div style={{ padding: isMobile ? "36px 24px" : "52px 52px", background: "#fafafa" }}>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: "#8B6914", textTransform: "uppercase", fontWeight: 600, marginBottom: 20 }}>{prog.featuresLabel}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 40 }}>
                    {prog.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(0,0,0,.07)", alignItems: "flex-start" }}>
                        <span style={{ fontFamily: serif, fontSize: 11, color: "rgba(0,0,0,.2)", fontStyle: "italic", flexShrink: 0, paddingTop: 2 }}>{String(j + 1).padStart(2, "0")}</span>
                        <span style={{ fontFamily: sans, fontSize: 13, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.7 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {/* Day at Excalibur CTA */}
                  <div style={{ borderTop: "1px solid rgba(0,0,0,.1)", paddingTop: 32 }}>
                    <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>A Day at Excalibur</p>
                    <h3 style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, fontWeight: 600, color: "#000", lineHeight: 1.15, marginBottom: 10 }}>What a real session looks like.</h3>
                    <p style={{ fontFamily: sans, fontSize: 13, color: "#444", fontWeight: 300, lineHeight: 1.8, marginBottom: 20 }}>Click any block to meet the instructor and see exactly what happens in that session.</p>
                    <button onClick={() => setPage("summer")} style={{ fontFamily: sans, background: "transparent", border: "1px solid rgba(0,0,0,.2)", color: "#000", padding: "11px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>VIEW FULL DAY SCHEDULE →</button>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── SIX-WEEK / FLAGSHIP: original dark two-column layout ── */
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0, minHeight: isMobile ? "auto" : 640 }}>
              <div style={{ background: "#06050A", padding: isMobile ? "44px 28px" : "64px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid rgba(199,171,117,.06)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                    <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase" }}>{prog.tag}</p>
                    <span style={{ fontFamily: sans, fontSize: 9, color: prog.statusColor, border: `1px solid ${prog.statusColor}`, padding: "3px 8px", letterSpacing: "0.1em", fontWeight: 600 }}>{prog.status}</span>
                  </div>
                  <h2 style={{ fontFamily: serif, fontSize: isMobile ? 32 : 48, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 10 }}>{prog.title}</h2>
                  <p style={{ fontFamily: serif, fontSize: 17, color: gold, fontStyle: "italic", marginBottom: 36, lineHeight: 1.4 }}>{prog.tagline}</p>
                  <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 28 }} />
                  {prog.desc.split("\n\n").map((para, i) => (
                    <p key={i} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 16 }}>{para}</p>
                  ))}
                </div>
                <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid rgba(199,171,117,.08)", paddingTop: 28 }}>
                  {prog.details.map(([k, v]) => (
                    <div key={k} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 16, padding: "10px 0", borderBottom: "1px solid rgba(199,171,117,.05)" }}>
                      <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.2em", color: "rgba(199,171,117,.5)", textTransform: "uppercase", paddingTop: 2 }}>{k}</span>
                      <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6, whiteSpace: "pre-line" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#080808", padding: isMobile ? "36px 28px" : "64px 52px", display: "flex", flexDirection: "column" }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: gold, textTransform: "uppercase", fontWeight: 600, marginBottom: 22 }}>{prog.featuresLabel}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
                  {prog.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
                      <span style={{ fontFamily: serif, fontSize: 11, color: "rgba(199,171,117,.35)", fontStyle: "italic", flexShrink: 0, paddingTop: 2 }}>{String(j + 1).padStart(2, "0")}</span>
                      <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => openInquiry && openInquiry(prog.id)} style={{ fontFamily: sans, padding: "13px 32px", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
                    {prog.flagship ? "APPLY — FLAGSHIP →" : "APPLY NOW →"}
                  </button>
                  {!prog.flagship && (
                    <button onClick={() => setPage(prog.id)} style={{ fontFamily: sans, padding: "13px 28px", background: "transparent", border: `1px solid ${gold}`, color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Hr />

      {/* THREE-BLOCK SESSION MODEL */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px", background: "#050505" }}>
        <Fade>
          <Eyebrow>THE SESSION MODEL</Eyebrow>
          <SectionTitle>Every session. Every program.</SectionTitle>
          <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginTop: 12, marginBottom: 36, maxWidth: 680 }}>Every session at Excalibur follows the same three-block structure, regardless of the program or the week.</p>
        </Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
            {[
              { n: "Block 1", star: true, title: "Public Speaking Instructor", sub: "Opens every session", desc: "Speaking warm-up, impromptu drills, pitch practice, debate exercises, rhetoric training. The Speaking Coach sets the energy for the entire session. By graduation, students will have completed 120+ individual speaking reps across structured and unstructured exercises.", color: gold },
              { n: "Block 2", star: false, title: "Lead Instructor — The War Room", sub: "The real world, every week", desc: "Rotates weekly between: (1) current events and business news analysis, (2) weekly case study deconstruction — approximately 30–40 companies by graduation, (3) guest industry speaker once per month, and (4) applied workshop where students immediately apply the specialist's content.", color: gold },
              { n: "Block 3", star: false, title: "Specialist Instructor", sub: "The month's module", desc: "The monthly specialist delivers their core module content — Finance, AI, Sales, Leadership, Intellectual Depth, Business Models, or Industry Sectors. Each specialist is a practitioner with real-world experience in the discipline they teach.", color: gold },
            ].map((b, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 30px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.15)"}` }}>
                <div style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.2em", color: b.star ? gold : "rgba(251,247,238,0.45)", marginBottom: 8, fontWeight: 600 }}>{b.star ? "★ " : ""}{b.n}</div>
                <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#FBF7EE", marginBottom: 4, lineHeight: 1.2 }}>{b.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.1em", marginBottom: 16 }}>{b.sub}</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <Hr />

      {/* INTERACTIVE DAILY SCHEDULE */}
      <DailyScheduleSection />

      <Hr />

      {/* SCHEDULE */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>2026–2027 SCHEDULE</Eyebrow><SectionTitle>Enrollment & Tracks.</SectionTitle></Fade>
        <div style={{ marginTop: 36 }}>
          <ScheduleTabs setPage={setPage} isMobile={isMobile} waves={waves} gold={gold} />
        </div>
      </div>

    <SoireeInviteBlock openInquiry={openInquiry} />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: APPLY
// ─────────────────────────────────────────────
function ApplyPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [prog, setProg] = useState(null);
  const [track, setTrack] = useState(null);
  const [wave, setWave] = useState(null);

  const ready = prog === "launchpad" || (prog && track && wave);

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "36px 16px 32px" : "60px 40px 48px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>ADMISSIONS · INAUGURAL CLASS 2026</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(38px,5vw,64px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16 }}>A place for students ready to be challenged.</h1>
          <p style={{ fontFamily: serif, fontSize: 20, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>Excalibur is Admission to Excalibur is intentionally limited. With twenty-five students per cohort, the process is designed to preserve the quality of the room: students who are curious, engaged, motivated, and prepared to take the work seriously. The small cohort model allows faculty to work closely with each student, offering individual feedback, personal guidance, and meaningful attention throughout the program — not occasional observation from the back of the room.</p>
        </Fade>
      </div>

      <Hr />

      {/* ADMISSIONS PHILOSOPHY */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 72 }}>
          <Fade>
            <Eyebrow>WHO WE ARE LOOKING FOR</Eyebrow>
            <SectionTitle>Readiness. Not résumés.</SectionTitle>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginTop: 18, marginBottom: 16 }}>We are Excalibur is not looking for the most polished resume, or the student with the longest list of activities. The Academy looks for curiosity, maturity, motivation, and a genuine interest in business, leadership, communication, and how the world actually works.</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>Excalibur The right applicant does not need a perfect résumé. The right applicant arrives ready to think, speak, listen, make mistakes, build, receive feedback, and grow.</p>
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
                    <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: "#FBF7EE", marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.5 }}>{s.sub}</div>
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
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>THE PROCESS</Eyebrow><SectionTitle center>Four steps.</SectionTitle><Sub center>The admissions process is intentionally personal and respectful of each family’s time. Its purpose is not to overwhelm with unnecessary formality, but to understand the student, answer the family’s questions, and ensure a strong fit for the Excalibur cohort.</Sub></div></Fade>
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
                  <h4 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: "#FBF7EE", marginBottom: 6, lineHeight: 1.2 }}>{s.title}</h4>
                  <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.1em", marginBottom: 14 }}>{s.time}</p>
                  <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.75, color: "#FBF7EE", fontWeight: 300 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </Fade>

          {/* Interview note */}
          <Fade d={.1}>
            <div style={{ background: "#080808", border: "1px solid #151515", borderLeft: `3px solid ${gold}`, padding: "28px 36px", marginTop: 2 }}>
              <p style={{ fontFamily: serif, fontSize: 17, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>"The interview is the part of our process we value most — not because we are testing students, but because it is the only way to genuinely understand who they are."</p>
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
                <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.25em", color: "#FBF7EE", textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>What we don't require</p>
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
              <div style={{ width: 30, height: 30, background: prog ? gold : "#111", border: `1px solid ${prog ? gold : "rgba(199,171,117,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: prog ? "#000" : "rgba(251,247,238,0.6)", transition: "all .3s" }}>1</div>
              <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE" }}>Choose Your Program</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 2, background: "#111" }}>
              {[
                { id: "launchpad", label: "LAUNCHPAD", title: "Launchpad Intensive", price: "$349", desc: "One Saturday. Four hours. The first taste of what Excalibur is." },
                { id: "intensive", label: "INTENSIVE", title: "Six-Week Intensive", price: "$2,500 / wave", desc: "Six weeks. Full curriculum. Demo Day before live investors." },
                { id: "full", label: "FULL PROGRAM", title: "Ten-Month Program", price: "$1,990 / month", desc: "Ten months. Complete formation. The flagship." },
              ].map((p) => (
                <div key={p.id} onClick={() => { setProg(p.id); setTrack(null); setWave(null); }} style={{ background: prog === p.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${prog === p.id ? gold : "transparent"}`, transition: "all .25s" }}>
                  <Eyebrow>{p.label}</Eyebrow>
                  <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#FBF7EE", marginBottom: 6, lineHeight: 1.2 }}>{p.title}</h3>
                  <p style={{ fontFamily: serif, fontSize: 15, color: gold, marginBottom: 10 }}>{p.price}</p>
                  <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{p.desc}</p>
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
                <div style={{ width: 30, height: 30, background: track ? gold : "#111", border: `1px solid ${track ? gold : "rgba(199,171,117,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: track ? "#000" : "rgba(251,247,238,0.6)", transition: "all .3s" }}>2</div>
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE" }}>Choose Your Track</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
                {[
                  { id: "weekday", label: "WEEKDAY TRACK", title: "Tuesday & Thursday", sub: "4:00–7:00 PM", detail: "3 hours per session after school. Fits any weekend schedule." },
                  { id: "weekend", label: "WEEKEND TRACK", title: "Every Saturday", sub: "9:00 AM–3:00 PM", detail: "Full-day immersion. More time with speakers and deeper workshops." },
                ].map((t) => (
                  <div key={t.id} onClick={() => { setTrack(t.id); setWave(null); }} style={{ background: track === t.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${track === t.id ? gold : "transparent"}`, transition: "all .25s" }}>
                    <Eyebrow>{t.label}</Eyebrow>
                    <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#FBF7EE", marginBottom: 4 }}>{t.title}</h3>
                    <p style={{ fontFamily: serif, fontSize: 17, color: gold, marginBottom: 10 }}>{t.sub}</p>
                    <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>{t.detail}</p>
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
                <div style={{ width: 30, height: 30, background: wave ? gold : "#111", border: `1px solid ${wave ? gold : "rgba(199,171,117,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: wave ? "#000" : "rgba(251,247,238,0.6)", transition: "all .3s" }}>3</div>
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE" }}>Choose Your Wave</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111" }}>
                {waves.map((w) => {
                  const t = track === "weekday" ? w.wd : w.we;
                  return (
                    <div key={w.name} onClick={() => { if (w.status !== "future") setWave(w.name); }} style={{ background: wave === w.name ? "#0C0C0A" : "#080808", padding: "24px 18px", cursor: w.status === "future" ? "not-allowed" : "pointer", opacity: w.status === "future" ? .35 : 1, borderTop: `2px solid ${wave === w.name ? gold : "transparent"}`, transition: "all .25s" }}>
                      <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 2, color: sc(w.status), fontWeight: 500, marginBottom: 6 }}>{w.season.toUpperCase()}</p>
                      <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#FBF7EE", marginBottom: 3 }}>{w.name}</h4>
                      <p style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginBottom: 12 }}>{w.dates}</p>
                      <p style={{ fontFamily: sans, fontSize: 11, color: t.left < 8 ? gold : "#777", marginBottom: 5 }}>{t.left} seats left</p>
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
                <div style={{ width: 30, height: 30, background: wave ? gold : "#111", border: `1px solid ${wave ? gold : "rgba(199,171,117,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 12, fontWeight: 700, color: wave ? "#000" : "rgba(251,247,238,0.6)", transition: "all .3s" }}>3</div>
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE" }}>Confirm Your Enrollment</h2>
              </div>
              <div style={{ background: "#080808", padding: "36px 32px", borderTop: `2px solid ${gold}` }}>
                <Eyebrow>TEN-MONTH FLAGSHIP</Eyebrow>
                <div style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: "#FBF7EE", marginBottom: 6 }}>$1,990 <span style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300 }}>/ month</span></div>
                <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>The complete Excalibur experience: all eight modules, sector rotations, pitch nights, consulting-style work, externship exposure, micro-venture development, the Excalibur Portfolio, and alumni network access.</p>
                <div style={{ display: "flex", gap: 8, cursor: "pointer" }} onClick={() => setWave("monthly")}>
                  <div style={{ width: 16, height: 16, border: `1px solid ${wave === "monthly" ? gold : "#333"}`, background: wave === "monthly" ? gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    {wave === "monthly" && <span style={{ color: "#000", fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>Request the information and admissions package for the Ten-Month Flagship Program.</p>
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
              <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: "#FBF7EE", marginBottom: 10 }}>Your place is waiting.</h3>
              <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 28px" }}>The application takes 10–15 minutes. Shortlisted students are invited to an admissions interview. Final decisions within 5 business days. Your seat is held for 72 hours upon acceptance. Your seat is held for 72 hours upon acceptance.</p>
              <a href={STRIPE} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 48px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, textDecoration: "none", display: "inline-block", boxShadow: "0 4px 32px rgba(199,171,117,.15)" }}>COMPLETE APPLICATION →</a>
              <p style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginTop: 16 }}>apply@excaliburacademy.org · We reply within one business day.</p>
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
    { id: "flagship", label: "Ten-Month Flagship", status: "ENROLLING SOON", statusColor: gold },
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
                  <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2 }}>{p.label}</div>
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
              <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: "#FBF7EE", marginBottom: 6, lineHeight: 1.2 }}>{p.label}</div>
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
                <p style={{ fontFamily: serif, fontSize: 16, color: "#FBF7EE", marginBottom: 20 }}>{t.dates}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  {t.items.map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>{filled} enrolled</span>
                  <span style={{ color: t.left < 8 ? gold : "#C8C0B8", fontWeight: t.left < 8 ? 600 : 300 }}>{t.left} remaining</span>
                </div>
                <div style={{ height: 2, background: "#1a1a1a", marginBottom: 14 }}><div style={{ height: "100%", width: `${(filled/25)*100}%`, background: "#4DB87A" }} /></div>
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
            return (
              <div key={i} style={{ background: "#080808", padding: "28px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Eyebrow>{t.label}</Eyebrow>
                </div>
                <p style={{ fontFamily: serif, fontSize: 16, color: "#FBF7EE", marginBottom: 20 }}>{t.schedule}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  {t.items.map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", background: "transparent", border: "1px solid rgba(199,171,117,.3)", color: gold, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", cursor: "pointer" }}>INQUIRE NOW →</button>
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
              const isOpen = waves[activeWave].status === "open";
              return (
                <div key={i} style={{ background: "#080808", padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Eyebrow>{label}</Eyebrow>
                    {waves[activeWave].status === "soon" && <span style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.1em", fontWeight: 600 }}>OPENING SOON</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                    {[["Days", t.days], ["Time", t.time], ["Dates", waves[activeWave].dates], ["Location", "Orange County"]].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", marginBottom: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPage("apply")} style={{ fontFamily: sans, width: "100%", padding: "9px 0", border: `1px solid rgba(199,171,117,.25)`, color: gold, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", background: "transparent", cursor: "pointer" }}>INQUIRE NOW →</button>
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
  const hasFacultyPage = ["Chip Pankow", "Bill Morris", "Erik Dostal", "Christopher Sanders", "Amina Abdulaeva"].includes(c.name);

  return (
    <div style={{ background: "#080808", borderTop: i === 0 ? `2px solid ${gold}` : "2px solid rgba(199,171,117,.1)", overflow: "hidden" }}>
      {/* Photo — full portrait, same as faculty page */}
      <div style={{ height: 0, paddingBottom: "110%", overflow: "hidden", position: "relative", background: "#0D0D0B" }}>
        {c.isLogo ? (
          <>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={LOGO_URL} alt="Excalibur Academy" style={{ width: 80, height: 80, objectFit: "contain", opacity: 0.35 }} onError={e => e.target.style.display = "none"} />
            </div>
            {c.role === "Role to be confirmed" && (
              <div style={{ position: "absolute", bottom: 16, left: 24, fontFamily: sans, fontSize: 9, color: "#FBF7EE", letterSpacing: "0.15em", textTransform: "uppercase" }}>Role to be announced</div>
            )}
          </>
        ) : (
          <img src={c.img} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(15%)" }} onError={e => e.target.style.display = "none"} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,.9) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px" }}>
          <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2 }}>{c.name}</div>
          <div style={{ fontFamily: sans, fontSize: 10, color: gold, marginTop: 3, letterSpacing: "0.08em" }}>{c.role}</div>
        </div>
      </div>

      {/* Tags + shortBio */}
      <div style={{ padding: "20px 24px 24px" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {c.tags && c.tags.map((t, j) => <span key={j} style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", border: "1px solid #1a1a1a", padding: "2px 7px" }}>{t}</span>)}
        </div>
        <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: hasFacultyPage ? 14 : 0 }}>
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
function HomePage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [activeMod, setActiveMod] = useState(0);
  React.useEffect(() => { if (isMobile) setActiveMod(null); }, [isMobile]);
  const [activeCat, setActiveCat] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeTier, setActiveTier] = useState(0);
  const [speakerIdx, setSpeakerIdx] = useState(0);
  const [activeWave, setActiveWave] = useState(0);
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
          {isMobile ? <>WAITLIST NOW OPEN — SUMMER INTENSIVE · JULY & AUGUST 2026 · <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setPage("apply")}>Apply Now →</span></> : <>✦ &nbsp; Waitlist Now Open for Summer Intensive &nbsp;·&nbsp; July & August 2026 &nbsp;·&nbsp; Limited Cohort &nbsp;·&nbsp; 25 Students Per Cohort Only &nbsp;·&nbsp;<span style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, marginLeft: 8 }} onClick={() => setPage("apply")}>Apply Now →</span>&nbsp; ✦</>}
        </p>
      </div>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: isMobile ? "60px 24px 40px" : "40px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://res.cloudinary.com/dzy2nwt7a/image/upload/v1773790972/dana-point-in-california_epyjh4.webp)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.13 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.45) 0%, rgba(0,0,0,.72) 55%, #000 100%)" }} />

        <Fade>
          <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", borderBottom: `1px solid rgba(199,171,117,.35)`, paddingBottom: 6, display: "inline-block", marginBottom: 28 }}>
            Founding Class &nbsp;·&nbsp; Orange County &nbsp;·&nbsp; 2026
          </p>
        </Fade>

        <Fade d={.1} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ fontFamily: "'Forum', 'Copperplate', Georgia, serif", fontWeight: 400, fontSize: "clamp(33px,3.6vw,54px)", letterSpacing: "0.28em", color: "#FBF7EE", textTransform: "uppercase", marginBottom: 8, textShadow: "0 2px 40px rgba(199,171,117,.12)" }}>
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
          <h1 style={{ fontFamily: serif, fontSize: "clamp(18px,1.8vw,28px)", fontWeight: 500, lineHeight: 1.25, color: "#FBF7EE", maxWidth: 700, marginBottom: 6, fontStyle: "italic" }}>
            School teaches how to take tests.
          </h1>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(18px,1.8vw,28px)", fontWeight: 600, lineHeight: 1.25, color: gold, maxWidth: 700, marginBottom: 24 }}>
            We teach how to take lead.
          </h1>
        </Fade>

        <Fade d={.3} style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: serif, fontSize: "clamp(22px,2vw,30px)", lineHeight: 1.7, color: "#FBF7EE", maxWidth: 640, marginBottom: 28, fontWeight: 300 }}>A premier institute where real entrepreneurs, investors, top executives, keynote speakers and distinguished professionals teach the next generation to lead the world — not follow it.</p>
        </Fade>

        <Fade d={.4} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row", alignItems: "center", marginBottom: 24 }}>
            <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer", boxShadow: "0 4px 40px rgba(199,171,117,.2)" }}>Join the Founding Class</button>
            <button onClick={() => setPage("programs")} style={{ fontFamily: sans, border: `1px solid rgba(199,171,117,.35)`, color: gold, padding: "13px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", background: "transparent", cursor: "pointer" }}>Explore Programs</button>
          </div>
          <p style={{ color: "#FBF7EE", fontSize: 11, letterSpacing: "0.12em", fontFamily: sans, textTransform: "uppercase", marginBottom: 8 }}>Ages 16–17 (Junior & Senior) &nbsp;·&nbsp; 25 students per cohort &nbsp;·&nbsp; Orange County, CA</p>
          <p style={{ color: "#FBF7EE", fontSize: "clamp(13px,1.2vw,16px)", letterSpacing: "0.04em", fontFamily: serif, fontStyle: "italic", marginBottom: 0, lineHeight: 1.6 }}>Classes hosted in South Orange County's historic villas and venues,<br />inspired by the traditions of European elite education.</p>
        </Fade>
      </section>


      {/* LEAD FACULTY — postcard after hero */}
      <section style={{ background: "#000", borderBottom: `1px solid rgba(199,171,117,.1)`, padding: isMobile ? "40px 24px" : "52px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ background: "#080808", border: `1px solid rgba(199,171,117,.25)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
            <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: "#FBF7EE", fontWeight: 600, textTransform: "uppercase", padding: "20px 28px 0" }}>Lead Faculty</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", padding: isMobile ? "16px 24px 24px" : "20px 40px 28px", gap: isMobile ? 20 : 0 }}>
              <div style={{ padding: isMobile ? "0" : "0 36px 0 0" }}>
                <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
                <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>A CEO who built the world's first autonomous racing series, directed the Formula BMW programme — developing multiple Formula 1 World Champions — and oversaw a $13 billion NASDAQ listing. Secured over $100M in institutional funding. Guinness World Record holder. Professional Auto & Rally Racer.</p>
              </div>
              {!isMobile && <div style={{ background: "rgba(199,171,117,.12)" }} />}
              <div style={{ padding: isMobile ? "0" : "0 0 0 36px" }}>
                <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
                <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>A former Citigroup Managing Director with 100+ M&A transactions and 600+ CEO advisory engagements. EVP and CFO of two NYSE-listed companies. Georgetown MBA Professor and TEDx speaker. Has spoken at institutions from West Point to Stanford.</p>
              </div>
            </div>
            <div style={{ textAlign: "center", paddingBottom: 16 }}>
              <span style={{ fontFamily: serif, fontSize: 16, color: "rgba(199,171,117,.25)", letterSpacing: "0.3em" }}>✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMER ENROLLMENT BANNER */}
      <section style={{ background: "#000", borderBottom: `1px solid rgba(199,171,117,.15)`, padding: isMobile ? "48px 24px" : "64px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>⚡ Waitlist Now Open</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(28px,5vw,36px)" : "clamp(32px,3.5vw,48px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 8 }}>
              Summer Intensive 2026
            </h2>
            <p style={{ fontFamily: sans, fontSize: 12, color: gold, letterSpacing: "0.1em", marginBottom: 20 }}>Enrollment Begins May 15, 2026</p>
            {/* You Asked. We Listened. */}
            <div style={{ marginBottom: 24, background: "#09090B", border: `1px solid rgba(199,171,117,.3)`, padding: "20px 24px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${gold}, rgba(199,171,117,.2), transparent)` }} />
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.3em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>You Asked. We Listened.</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, color: "#FBF7EE", fontWeight: 600, lineHeight: 1.35 }}>Due to high demand and our commitment to keeping cohort sizes small — a personalised, real experience — we are introducing a second two-week intensive wave in August 2026.</p>
            </div>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: 24 }}>
              Offered in two waves — July and August — this full-day, Monday-through-Friday intensive is led by senior faculty, former Fortune 500 executives, accomplished leaders, top industry specialists, and distinguished guest speakers. The program emphasizes business and leadership curriculum, public speaking, real-world case studies, immersive startup simulations, and live pitch development, culminating in a Shark Tank-style finale. Enrollment is limited to 20 students per cohort.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {[
                "Sessions: 9:30 AM – 3:00 PM · Mon–Fri",
                "Wave 1: July 6 – 18, 2026",
                "Wave 2: August 3 – 15, 2026",
                "Guest Speakers: Distinguished speaker rotating daily",
                "Finale: Shark Tank-inspired start-up competition with real investors and judges",
                "Eligibility: Ages 15–17 (rising juniors and seniors) · 25 students per wave",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 14, height: 1.5, background: gold, marginTop: 8, flexShrink: 0 }} />
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>{f}</span>
                </div>
              ))}
            </div>
          </Fade>

        </div>
      </section>


      <SoireeInviteBlock openInquiry={openInquiry} />

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
                <p style={{ fontFamily: serif, fontSize: "clamp(18px,2.4vw,26px)", lineHeight: 1.7, color: "#FBF7EE", fontWeight: 400, fontStyle: "italic", marginBottom: 28 }}>
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
      <section style={{ background: "#F5F3EE", padding: 0 }}>
        <Fade>
        {/* Full-width photo strip with text overlay */}
        <div style={{ position: "relative", height: isMobile ? 260 : 440, overflow: "hidden" }}>
          <img src="https://i.imgur.com/y5bXKH5.jpeg" alt="Orange County estate" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,.75) 0%, rgba(0,0,0,.2) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", bottom: isMobile ? 28 : 52, left: isMobile ? 28 : 72, maxWidth: 540 }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>About the Academy</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(28px,6vw,38px)" : "clamp(36px,4vw,54px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 14 }}>The Academy</h2>
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)` }} />
          </div>

        </div>

        {/* Main content — asymmetric grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", background: "#F5F3EE" }}>

          {/* Left panel — founding statement + session model */}
          <div style={{ padding: isMobile ? "48px 28px" : "64px 72px" }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 17 : 19, lineHeight: 1.85, color: "#111", fontWeight: 400, marginBottom: 28, fontStyle: "italic", borderLeft: `2px solid rgba(199,171,117,.5)`, paddingLeft: 20 }}>
              Excalibur Leadership Academy is a premier institute for entrepreneurship and leadership for ambitious teenagers aged 16–17 in Orange County, California. We are building the institution we wish had existed when we were young — one where students are mentored by accomplished adults who have built companies, led teams, and operated under real stakes.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 20 }}>
              Our sessions take place in historic estates and private venues across Newport Beach, Laguna Beach, and San Clemente, inspired by the traditions of European elite education.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 32 }}>
              Every session follows a rigorous three-block format: rhetoric and public speaking with a speaking coach, real-world business analysis and applied workshops led by senior faculty, and deep domain instruction from rotating specialists for every industry. No filler. No theory divorced from practice — only formation that builds confidence, judgment, and mental fortitude.
            </p>
            {/* Three pillars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { n: "01", t: "Speaking & Rhetoric", d: "Every session opens with the Speaking Coach." },
                { n: "02", t: "Real-World Analysis", d: "Lead Instructor — applied workshops and case studies." },
                { n: "03", t: "Domain Mastery", d: "Monthly specialist with deep practitioner experience." },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,.08)", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: "#000", minWidth: 24, marginTop: 2 }}>{p.n}</span>
                  <div>
                    <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: "#000", letterSpacing: "0.08em", marginBottom: 3 }}>{p.t}</p>
                    <p style={{ fontFamily: sans, fontSize: 12, color: "#1a1a1a", fontWeight: 300 }}>{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          {!isMobile && <div style={{ background: "rgba(0,0,0,.08)" }} />}

          {/* Right panel — outcomes + Why This Matters */}
          <div style={{ padding: isMobile ? "0 28px 48px" : "64px 72px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 24 }}>
              Our faculty are not simply career academics. They are entrepreneurs, executives, investors, and professionals who teach from lived experience. Students learn public speaking, financial reasoning, business strategy, sales and marketing, leadership, technology and AI, and the social arts through live case studies, startup simulations, consulting projects, and competitive pitch forums.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 40 }}>
              By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, worked in teams under pressure, and competed in Shark Tank-style finals. In our flagship program, students launch revenue-generating micro-ventures and graduate with a bound portfolio of work that sets them apart for university admissions — and beyond.
            </p>

            {/* WHY THIS MATTERS NOW */}
            <div style={{ borderTop: `1px solid rgba(0,0,0,.1)`, paddingTop: 32, marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 28, height: 1, background: "#8B6914", flexShrink: 0 }} />
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 20 : 24, fontWeight: 600, color: "#000", letterSpacing: "0.02em" }}>Why This Matters Now</h3>
              </div>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 16 }}>
                The skills that determine success — public speaking, strategic thinking, financial judgment, leadership, and the ability to persuade — are largely absent from traditional education. At the same time, artificial intelligence is rapidly reshaping industries and dissolving career paths once considered secure.
              </p>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300 }}>
                What cannot be replaced are human capacities: confidence under pressure, ownership of outcomes, the ability to lead, to sell an idea, resilience after failure, and the ability to act when the path is uncertain. Entrepreneurs have built industries, challenged assumptions, and shaped every major era of innovation. Excalibur exists to prepare students to lead the next business revolution.
              </p>
            </div>

            <div style={{ marginTop: "auto" }}>
              <button onClick={() => setPage("programs")} style={{ fontFamily: sans, background: "transparent", border: `1px solid rgba(0,0,0,.35)`, color: "#000", padding: "11px 26px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Explore Programs →</button>
            </div>
          </div>
        </div>

        {/* Quote — warm white */}
        <div style={{ background: "#EDEAE3", padding: isMobile ? "48px 24px" : "64px 80px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 24, color: "#111", fontStyle: "italic", lineHeight: 1.7 }}>
              "By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, worked in teams under pressure, and competed in Shark Tank-style finals."
            </p>
          </div>
        </div>
        </Fade>
      </section>

            {/* STATS — black background, gold numbers */}
      <section style={{ padding: isMobile ? "40px 16px" : "56px 40px", background: "#000" }}>
        <div ref={statsRef} style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: 2, background: "#111" }}>
          {[["10", " Months", "academic year program"], ["6", " Weeks", "intensive track"], ["25", "", "students per cohort"], ["8", "", "curriculum modules"], ["30+", "", "guest speakers / year"], ["2", "", "summer waves"]].map(([num, suf, l], i) => (
            <div key={i} style={{ background: "#080808", padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: 32, fontWeight: 600, color: gold, lineHeight: 1 }}>
                <StatCounter num={num} suf={suf} label="" inView={statsInView} lightMode={false} />
              </div>
              <p style={{ fontFamily: sans, color: "#FBF7EE", fontSize: 11, marginTop: 7, fontWeight: 300 }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THREE PROGRAMS */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>THREE PATHS INTO EXCALIBUR</Eyebrow><SectionTitle center>Choose Your Entry Point</SectionTitle><Sub center>From two-week summer intensives and six-week sprint programmes to a ten-month Flagship — weekday and weekend tracks, designed around your schedule. Three paths into Excalibur.</Sub></div></Fade>

          {/* SUMMER — full width on top */}
          <Fade d={.06}>
            <div style={{ background: "#080808", borderTop: `2px solid rgba(199,171,117,.35)`, marginBottom: 2, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr 1px 1fr", overflow: "hidden" }}>
              {/* Left: identity */}
              <div style={{ padding: isMobile ? "40px 28px" : "52px 52px" }}>
                <Eyebrow>SUMMER INTENSIVE · JULY &amp; AUGUST</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 34 : 42, fontWeight: 600, color: "#FBF7EE", lineHeight: 1, marginBottom: 8 }}>Summer Intensive</h3>
                <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic", marginBottom: 20 }}>Two weeks. Full days. Real stakes.</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>Two waves — July 6–18 and August 3–15. Full days, Monday through Friday, led by senior faculty, Fortune 500 executives, and distinguished guest speakers. Every session culminates in a Shark Tank-inspired finale before real investors and families.</p>
              </div>
              {!isMobile && <div style={{ background: "rgba(199,171,117,.08)" }} />}
              {/* Middle: details */}
              <div style={{ padding: isMobile ? "0 28px 28px" : "52px 44px", display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  ["Sessions", "9:30 AM – 3:00 PM · Mon–Fri"],
                  ["Wave 1", "July 6 – 18, 2026"],
                  ["Wave 2", "August 3 – 15, 2026"],
                  ["Guest Speakers", "Distinguished speaker rotating daily"],
                  ["Finale", "Shark Tank–inspired with real investors and judges"],
                  ["Eligibility", "Ages 15–17 · 25 students per wave"],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
                    <span style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.08em", minWidth: 90, paddingTop: 1, fontWeight: 500 }}>{k}</span>
                    <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300 }}>{v}</span>
                  </div>
                ))}
              </div>
              {!isMobile && <div style={{ background: "rgba(199,171,117,.08)" }} />}
              {/* Right: price + CTA */}
              <div style={{ padding: isMobile ? "0 28px 40px" : "52px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.3em", color: "#4DB87A", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>● Accepting Applications</p>
                  <div style={{ fontFamily: serif, fontSize: 38, color: "#FBF7EE", fontWeight: 600, lineHeight: 1, marginBottom: 4 }}>$4,500</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, marginBottom: 28 }}>Per two-week wave · includes catered lunches from local restaurants, distinguished guest speakers, and a Shark Tank-inspired live startup pitch finale before families, investors, entrepreneurs, and invited judges.</div>
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
                <Eyebrow>ENTRY TRACK · THE IGNITION</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1, marginBottom: 6 }}>Six-Week Intensive</h3>
                <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 20 }}>Four waves per year · Spring, Summer, Fall, Winter</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: 24 }}>Offered in four waves annually, the Six-Week Intensive distills the complete Excalibur curriculum into a focused, high‑impact experience. Six weeks in duration. Twelve total sessions. One core discipline per week. Every session follows the same consistent three-block model used across all Excalibur programs: public speaking, specialist block and applied workshop with startup simulations, case studies and team exercises.</p>
                <div style={{ height: 1, background: "rgba(199,171,117,.08)", marginBottom: 20 }} />
                {["A focused version of Excalibur’s eight-discipline curriculum", "Flexible weekday evening or Sunday half-day format", "Guest speakers from business, entrepreneurship, finance, and leadership", "Public speaking training in every class", "Team-based micro-venture project with faculty guidance", "Judged Shark Tank–inspired Finale before invited guests, families, and professionals", "Access to the Excalibur alumni network", "Priority consideration for the Ten-Month Flagship Program"].map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 12, marginBottom: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 14, height: 1, background: "rgba(199,171,117,.4)", marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 32, display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontFamily: serif, fontSize: 32, color: "#FBF7EE", fontWeight: 600 }}>$3,500</span>
                  <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300 }}>/ wave</span>
                </div>
                <button onClick={() => setPage("intensive")} style={{ fontFamily: sans, padding: "11px 26px", background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>EXPLORE INTENSIVE →</button>
              </div>

              {/* FULL PROGRAM */}
              <div style={{ background: "#090907", padding: isMobile ? "40px 28px" : "52px 48px", borderTop: `2px solid ${gold}`, position: "relative" }}>
                <div style={{ position: "absolute", top: 18, right: 20, fontFamily: sans, background: "rgba(199,171,117,.08)", color: gold, padding: "3px 10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid rgba(199,171,117,.2)" }}>FLAGSHIP</div>
                <Eyebrow>FULL IMMERSION</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1, marginBottom: 6 }}>Flagship Ten-Month Program</h3>
                <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 20 }}>The complete formation.</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: 24 }}>The Full Formation is Excalibur’s ten-month flagship — a deep, immersive course of study for students ready for complete entrepreneurial, intellectual, and personal formation across all eight modules, ten industry sectors, and real-world applied engagements.</p>
                <div style={{ height: 1, background: "rgba(199,171,117,.12)", marginBottom: 20 }} />
                {["Full ten-month curriculum across all eight core modules", "All ten industry sectors with guest leaders", "Junior Consultant Program — real local business engagement", "Apprentice Externship — 4–6 weeks inside a real company", "Funded micro-business launch with a dedicated mentor", "Monthly Pitch Night and Competitions", "Bound graduation portfolio of all academic and professional work", "Eligibility for London and Geneva international summer 2027 programs"].map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 12, marginBottom: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 14, height: 1, background: gold, marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 32, display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontFamily: serif, fontSize: 32, color: "#FBF7EE", fontWeight: 600 }}>$1,990</span>
                  <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300 }}>/ month</span>
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
              /* MOBILE: accordion — all closed initially */
              <div style={{ border: "1px solid #151515" }}>
                {currMods.map((m, i) => (
                  <div key={i} style={{ borderBottom: "1px solid #0E0E0E" }}>
                    <div onClick={() => setActiveMod(activeMod === i ? null : i)} style={{ padding: "18px 20px", cursor: "pointer", borderLeft: `3px solid ${activeMod === i ? gold : "transparent"}`, background: activeMod === i ? "rgba(199,171,117,.04)" : "#060606", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s" }}>
                      <div style={{ fontFamily: serif, fontSize: 19, fontWeight: activeMod === i ? 600 : 400, color: activeMod === i ? gold : "#D8D0C8", lineHeight: 1.3 }}>{m.title}</div>
                      <div style={{ fontFamily: sans, fontSize: 16, color: activeMod === i ? gold : "rgba(251,247,238,0.5)", transition: "transform .25s", transform: activeMod === i ? "rotate(45deg)" : "none", lineHeight: 1 }}>+</div>
                    </div>
                    {activeMod === i && (
                      <div style={{ background: "#080808", padding: "24px 20px 28px" }}>
                        <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 14 }}>{m.tagline}</p>
                        <div style={{ marginBottom: 18 }}>{m.body.split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>{para}</p>))}</div>
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
                    {activeMod !== null && <p style={{ fontFamily: sans, color: gold, fontSize: 10, letterSpacing: "0.3em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>{currMods[activeMod].months}</p>}
                    {activeMod !== null && <h3 style={{ fontFamily: serif, fontSize: "clamp(26px,3vw,36px)", fontWeight: 600, color: "#FBF7EE", marginBottom: 8, lineHeight: 1.15 }}>{currMods[activeMod].title}</h3>}
                    {activeMod !== null && <p style={{ fontFamily: serif, fontSize: 19, color: gold, fontStyle: "italic", marginBottom: 20 }}>{currMods[activeMod].tagline}</p>}
                    {activeMod !== null && <div style={{ marginBottom: 24 }}>{currMods[activeMod].body.split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>{para}</p>))}</div>}
                    {activeMod !== null && <button onClick={() => setPage(`module:${currMods[activeMod].slug}`)} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.2em", fontWeight: 700, border: `1px solid rgba(199,171,117,.3)`, padding: "9px 18px", background: "transparent", cursor: "pointer", textTransform: "uppercase" }}>Explore This Module →</button>}
                  </div>
                </div>
              </div>
            )}
          </Fade>
          <Fade d={.12}>
            <div style={{ marginTop: 2, background: "#060606", border: "1px solid #111", borderTop: "none", padding: "17px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300 }}>All eight modules covered in both the Intensive and the Full Program.</span>
              <button onClick={() => setPage("curriculum")} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: 2, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>VIEW ALL MODULES →</button>
            </div>
          </Fade>
        </div>
      </section>



      {/* WHERE THEORY MEETS REALITY */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>REAL-WORLD ENGAGEMENT</Eyebrow><SectionTitle center>Where Theory Meets Reality</SectionTitle><Sub center>The curriculum builds the foundation. These engagements give Excalibur its distinctive weight: applied work, public performance, professional feedback, lasting friendships, shared memories, and skills carried for life.</Sub></div></Fade>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {handson.map((p, i) => (
              <Fade key={i} d={i * .05}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : i % 2 === 0 ? "3fr 2fr" : "2fr 3fr", background: "#111", minHeight: isMobile ? "auto" : 200 }}>
                  {i % 2 !== 0 && !isMobile && (
                    <div style={{ background: "#050504", padding: "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.06)" }}>
                      <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, rgba(199,171,117,.4), transparent)`, marginBottom: 18 }} />
                      <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Outcome</p>
                      <p style={{ fontFamily: serif, fontSize: 20, lineHeight: 1.65, color: "#FBF7EE", fontStyle: "italic" }}>{p.outcome}</p>
                      <div style={{ position: "absolute", top: 20, right: 20, fontFamily: serif, fontSize: 52, color: "rgba(199,171,117,.04)", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                    </div>
                  )}
                  <div style={{ background: "#09090B", padding: isMobile ? "40px 24px" : "52px 56px", borderTop: `2px solid ${i < 2 ? gold : "rgba(199,171,117,.18)"}`, position: "relative" }}>
                    <div style={{ position: "absolute", top: 20, right: 20, fontFamily: serif, fontSize: isMobile ? 32 : 52, color: "rgba(199,171,117,.05)", lineHeight: 1, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</div>
                    <Eyebrow>{p.tag}</Eyebrow>
                    <h3 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 34, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 16, marginTop: 8 }}>{p.title}</h3>
                    <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 18 }} />
                    <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>{p.desc}</p>
                  </div>
                  {(i % 2 === 0 || isMobile) && (
                    <div style={{ background: "#050504", padding: isMobile ? "28px 24px" : "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.06)" }}>
                      <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, rgba(199,171,117,.4), transparent)`, marginBottom: 18 }} />
                      <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Outcome</p>
                      <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 20, lineHeight: 1.65, color: "#FBF7EE", fontStyle: "italic" }}>{p.outcome}</p>
                    </div>
                  )}
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* FACULTY & LEADERSHIP — white background strip */}
      <section style={{ background: "#F5F3EE", padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#000", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>FACULTY & LEADERSHIP</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 16 }}>The People In the Room.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#111", fontWeight: 300, lineHeight: 1.7, maxWidth: 680, margin: "0 auto" }}>From a CEO who built the world’s first autonomous racing series, directed the Formula BMW program, and oversaw a $13B NASDAQ listing, to a former Citigroup Managing Director with over 100 M&A transactions and 600+ CEO advisory engagements, EVP/CFO of two NYSE-listed companies, TEDx speaker and Georgetown MBA Professor.</p>
          </div></Fade>
          <Fade d={.08}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 2, background: "#E8E4DC" }}>
              {coaches.map((co, i) => (
                <Fade key={i} d={i * .04}>
                  <CoachCard c={co} i={i} setPage={setPage} light={true} />
                </Fade>
              ))}
            </div>
          </Fade>
          <Fade d={.12}><div style={{ textAlign: "center", marginTop: 32 }}><button onClick={() => setPage("faculty")} style={{ fontFamily: sans, background: "transparent", border: "1px solid #000", color: "#000", padding: "11px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>VIEW ALL FACULTY →</button></div></Fade>
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
                    <h4 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: "#FBF7EE", marginBottom: 10, lineHeight: 1.2 }}>{f.title}</h4>
                    <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.75, color: "#FBF7EE", fontWeight: 300 }}>{f.desc}</p>
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

            {/* EXCALIBUR IVY PORTFOLIO — merged with college admissions */}
      <section style={{ background: "#F5F3EE", padding: 0 }}>

        {/* Photos — heading on solid dark block so it is always visible */}
        {!isMobile ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: 420 }}>
            <div style={{ overflow: "hidden", position: "relative" }}>
              <img src="https://i.imgur.com/f87iq9i.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", padding: "28px 36px" }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>The Excalibur Graduate</p>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,3vw,42px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 8 }}>Excalibur “Ivy” Portfolio</h2>
                <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic" }}>A record that speaks for itself.</p>
              </div>
            </div>
            <div style={{ overflow: "hidden", position: "relative" }}>
              <img src="https://i.imgur.com/sWnhc5H.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,.85)", padding: "28px 36px" }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>College Admissions Advisor</p>
                <p style={{ fontFamily: serif, fontSize: 16, color: "#FBF7EE", fontStyle: "italic" }}>Why Excalibur Students Stand Apart</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height: 280, overflow: "hidden", position: "relative" }}>
            <img src="https://i.imgur.com/f87iq9i.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", padding: "20px 24px" }}>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>The Excalibur Graduate</p>
              <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 6 }}>Excalibur “Ivy” Portfolio</h2>
              <p style={{ fontFamily: serif, fontSize: 14, color: gold, fontStyle: "italic" }}>A record that speaks for itself.</p>
            </div>
          </div>
        )}

        {/* Intro + eight components */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "36px 24px 0" : "52px 80px 0", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 80, alignItems: "start" }}>
          <div>
            <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 16 }} />
            <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 1.85, color: "#1a1a1a", fontWeight: 300 }}>Every Excalibur student graduates with a portfolio of documented, verifiable work — one that no other programme in the country offers. This portfolio reflects sustained performance, leadership under pressure, and accountability for outcomes.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 24, height: 1, background: "#000" }} />
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: isMobile ? 14 : 18, color: "#000", fontWeight: 400, lineHeight: 1.75, fontStyle: "italic" }}>Eight documented components · Verified · Professionally assembled · Submitted with university applications.</p>
          </div>
        </div>

        {/* Interactive 8-component index */}
        <PortfolioIndexWhite isMobile={isMobile} setPage={setPage} />

        {/* College admissions — merged below */}
        <div style={{ background: "#EDEAE3", padding: isMobile ? "48px 24px" : "64px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 36 : 80 }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#000", fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>PORTFOLIO THAT SPEAKS FOR ITSELF</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 12 }}>College Admissions Advisor</h2>
              <p style={{ fontFamily: serif, fontSize: 17, color: "#000", fontStyle: "italic", marginBottom: 22, lineHeight: 1.3 }}>Why Excalibur Students Stand Apart</p>
              <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 22 }} />
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 16 }}>An Excalibur graduate approaches college admission with proof of applied real-world leadership and work experience. A consulting report. An externship record. A micro-business launch. Competition results. A graduation portfolio. Faculty recommendations written by top executives and professionals who watched them operate, lead, and execute.</p>
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300 }}>College admissions advisors help translate that record into a serious admissions strategy — shaping the student’s academic and personal narrative, advising on school positioning, preparing for interviews, and helping present the portfolio in a way that strengthens applications to highly selective colleges and universities.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: "#000", fontWeight: 600, textTransform: "uppercase", marginBottom: 24 }}>What This Means in Practice</p>
              {["Portfolio reviewed and built by admissions counselors specifically for university applications", "Faculty letters grounded in ten months of direct observation — not form letters", "Verified competition results and externship documentation", "Interview preparation built around real, specific experience", "A narrative unavailable to most students due to lack of comparable experience"].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 16, height: 1.5, background: "#000", marginTop: 9, flexShrink: 0 }} />
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.7 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

            {/* SCARCITY SIGNAL */}
      <section style={{ background: "#000", padding: isMobile ? "36px 24px" : "32px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: isMobile ? 20 : 32, alignItems: "center", justifyContent: "center", flexWrap: "wrap", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4DB87A", flexShrink: 0 }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 20, color: "#FBF7EE", lineHeight: 1.3 }}>Summer Intensive 2026 is now accepting applications. <span style={{ color: gold }}>Limited cohort.</span></p>
          </div>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: isMobile ? "12px 28px" : "13px 36px", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", cursor: "pointer", textTransform: "uppercase", border: "none", flexShrink: 0 }}>SECURE YOUR PLACE →</button>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#000", padding: isMobile ? "80px 16px" : "120px 40px", textAlign: "center" }}>
        <Fade>
          <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 32 }}>Limited Enrollment</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(32px,7vw,52px)" : "clamp(44px,5vw,72px)", fontWeight: 600, lineHeight: 1.0, marginBottom: 12, color: "#FBF7EE" }}>
            Waitlist for Summer Waves
          </h2>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(32px,7vw,52px)" : "clamp(44px,5vw,72px)", fontWeight: 300, lineHeight: 1.0, marginBottom: 48, color: gold, fontStyle: "italic" }}>
            Now Open.
          </h2>
          {/* Countdown — clean, minimal, no boxes */}
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.3em", color: "rgba(199,171,117,.5)", textTransform: "uppercase", marginBottom: 20 }}>Wave 1 starts July 6, 2026</p>
            <CountdownTimer targetDate="2026-07-06T09:30:00" label="Days Until Summer July Wave Begins" />
          </div>
          {/* Three bold statements */}
          <div style={{ maxWidth: 700, margin: "0 auto 60px", display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { n: "I", head: "A Cohort of Twenty-Five", body: "Each wave is limited to twenty-five students. Student receives direct faculty attention and mentorship, and becomes part of the Excalibur family." },
              { n: "II", head: "A Dedicated Family Coordinator", body: "From first inquiry through graduation, each family is assigned a personal coordinator. One point of contact. Direct communication, guidance and support from first contact." },
              { n: "III", head: "Private Invitation to the May Soirée", body: "An intimate evening at a Mediterranean estate in San Clemente. Meet the faculty, the founding team, and the families who will form the first class. By personal invitation only." },
            ].map(({ n, head, body }, i) => (
              <div key={i} style={{ padding: isMobile ? "28px 0" : "36px 0", borderBottom: "1px solid rgba(199,171,117,.08)", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "48px 1fr", gap: isMobile ? 12 : 36, alignItems: "flex-start", textAlign: "left" }}>
                <span style={{ fontFamily: serif, fontSize: isMobile ? 16 : 20, fontWeight: 300, color: "rgba(199,171,117,.35)", lineHeight: 1, letterSpacing: "0.1em", fontStyle: "italic", paddingTop: 4 }}>{n}</span>
                <div>
                  <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 10 }}>{head}</p>
                  <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: isMobile ? "16px 40px" : "18px 60px", fontSize: isMobile ? 13 : 14, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>JOIN THE WAITLIST</button>
          <p style={{ fontFamily: eyebrow_font, color: "#FBF7EE", fontSize: 9, marginTop: 24, letterSpacing: "0.2em", fontWeight: 600 }}>APPLY@EXCALIBURACADEMY.ORG</p>
        </Fade>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: THE ARENA
// ─────────────────────────────────────────────
function BeyondPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [activeTier, setActiveTier] = useState(0);

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "36px 16px 32px" : "60px 40px 48px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>BEYOND THE ACADEMY</Eyebrow>
          <SectionTitle center>Build. Present. Compete. Prove it.</SectionTitle>
          <Sub center>The curriculum builds the foundations. Beyond the classroom, students put them to work through pitch competitions, business challenges, consulting-style projects, field experiences, and venture development — each designed to create tangible outcomes and build an executive portfolio.</Sub>
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
                  <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 18 }}>{p.title}</h3>
                  <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>{p.desc}</p>
                </div>
                <div style={{ background: "#060606", padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.04)" }}>
                  <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 3, color: "#FBF7EE", fontWeight: 500, marginBottom: 14 }}>THE OUTCOME</p>
                  <p style={{ fontFamily: serif, fontSize: 18, lineHeight: 1.65, color: "#FBF7EE", fontStyle: "italic" }}>{p.outcome}</p>
                </div>
              </div>
            </Fade>
          ))}

          {/* College admissions block */}
          <Fade d={.16}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", background: "#111" }}>
              <div style={{ background: "#080808", padding: "44px 40px", borderTop: `2px solid ${gold}` }}>
                <Eyebrow>COLLEGE ADMISSIONS ADVANTAGE</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 18 }}>A portfolio that speaks for itself.</h3>
                <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>An Excalibur graduate arrives at their college application with evidence most applications cannot manufacture: presentations delivered, businesses analyzed, pitch competitions judged, venture concepts developed, externship experience documented, and faculty recommendations written by professionals who observed the work directly.</p>
                <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>College admissions advisors help translate that record into a serious admissions strategy — shaping the student’s academic and personal narrative, advising on school positioning, preparing for interviews, and helping present the portfolio in a way that strengthens applications to highly selective colleges and universities.</p>
              </div>
              <div style={{ background: "#060606", padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.04)" }}>
                <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: 3, color: "#FBF7EE", fontWeight: 500, marginBottom: 20 }}>WHAT THIS MEANS IN PRACTICE</p>
                {[
                  "Bound graduation portfolio: consulting reports, externship deliverables, pitch recordings, business analyses, Sector Journal, and personal leadership framework",
                  "Faculty letters of recommendation written by practitioners who observed the student across ten months under real conditions — specific, credible, and impossible to confuse with a form letter",
                  "Verified competition record: Monthly Pitch Night results, City Championship standing, National Championship performance",
                  "Admissions counselor reviews and shapes the portfolio narrative for each university application",
                  "Interview preparation grounded in real experience — not scripted answers, but genuine stories from things that actually happened",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 16, height: 1.5, background: gold, marginTop: 9, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
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
        <Fade><Eyebrow>COMPETITIONS</Eyebrow><SectionTitle>Performance under genuine pressure.</SectionTitle><p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginTop: 12, maxWidth: 680 }}>Every competition at Excalibur is evaluated by real professionals — entrepreneurs, investors, and executives who have no obligation to be generous. Students know this. That is precisely the point.</p></Fade>
        <Fade d={.08}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 2, background: "#111", marginTop: 36 }}>
            {[
              { title: "Monthly Pitch Night", tag: "12× per year · All programs", desc: "Students present pitches before a panel of guest judges drawn from the local business community, including entrepreneurs, investors, and senior professionals. Pitches are evaluated on clarity of thinking, commercial viability, quality of delivery, and composure under live questioning. Parents are invited to attend. After each presentation, students receive specific, actionable feedback and awards. Over the course of ten months, the growth is substantial: students who begin the year hesitant or unsure progress to confidently fielding demanding investor questions with poise and precision." },
              { title: "Shark Tank style Finale", tag: "Summer & Six-Week programs", desc: "The Shark Tank–inspired pitch forum where student teams present complete business concepts before entrepreneurs, investors, and senior professionals. Judges evaluate each pitch on clarity, commercial viability, originality, delivery, and composure under questioning. Families are invited to attend, and awards are presented for Best Business Concept, Best Pitch, and Most Innovative Venture. Judges ask direct questions. Ideas are tested. Presentations are scored. This is not a soft showcase. It is the moment where the work has to stand on its own." },
              { title: "OC Championship", tag: "Biannual · Flagship students", desc: "The Excalibur Championship is a biannual competition for all Excalibur Flagship students, held at a premium venue with judges drawn from the professional community. Students compete individually and in teams across multiple disciplines. Awards and formal recognition are presented in a ceremony." },
              { title: "Demo Day & Graduation", tag: "Annual · Flagship capstone", desc: "The culminating event. Each team delivers a ten-minute pitch of its micro‑business concept before an audience of parents, mentors, investors, and members of the press. A panel of judges evaluates each presentation on commercial viability, quality of the pitch, evidence of execution, and composure under questioning. Every graduate receives a professionally bound portfolio and formal alumni status. The transformation is evident: students who entered the program months earlier leave with a level of confidence, clarity, and presence that is unmistakable to everyone in the room." },
            ].map((c, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 32px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}` }}>
                <Eyebrow>{c.tag.toUpperCase()}</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#FBF7EE", marginBottom: 16, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <Hr />

      {/* DISTINCTIONS */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>DISTINCTIONS & HONORS</Eyebrow><SectionTitle center>What Excellence Earns</SectionTitle><Sub center>Excalibur distinctions recognize students who perform at the highest standard: clear thinking, strong execution, persuasive communication, leadership under pressure, and work that stands apart.</Sub></div></Fade>
        <Fade d={.08}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
            {distinctions.map((d, i) => <SBtn key={i} active={activeTier === i} onClick={() => setActiveTier(i)}>{d.tier}</SBtn>)}
          </div>
        </Fade>
        <Fade d={.12}>
          <p style={{ fontFamily: sans, fontSize: 10, color: "#FBF7EE", letterSpacing: 2, textAlign: "center", marginBottom: 18 }}>{distinctions[activeTier].label.toUpperCase()}</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 2, background: "#111" }}>
            {distinctions[activeTier].awards.map((a, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 28px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.15)"}` }}>
                <Eyebrow>{a.sub.toUpperCase()}</Eyebrow>
                <h4 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#FBF7EE", marginBottom: 14, lineHeight: 1.2 }}>{a.title}</h4>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.75, color: "#FBF7EE", fontWeight: 300 }}>{a.desc}</p>
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
          <SectionTitle>Step inside the places where dreams become realities.</SectionTitle>
          <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginTop: 12, marginBottom: 36, maxWidth: 680 }}>Students visit companies, studios, venues, institutions, and working environments where dreams become realities. They meet the people behind those organizations, ask questions, observe how decisions are made, and connect classroom ideas to the realities of leadership, business, and execution.</p>
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
                  <h4 style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, color: "#FBF7EE", marginBottom: 12, lineHeight: 1.2 }}>{f.title}</h4>
                  <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.75, color: "#FBF7EE", fontWeight: 300 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <Hr />

      <SoireeInviteBlock openInquiry={openInquiry} />
      {/* CTA */}
      <div style={{ padding: isMobile ? "60px 16px" : "80px 40px", textAlign: "center" }}>
        <Fade>
          <Eyebrow>APPLY FOR THE 2026-2027 COHORT</Eyebrow>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,48px)", fontWeight: 600, color: "#FBF7EE", marginBottom: 12, lineHeight: 1.1 }}><br /><span style={{ color: gold }}>the moment you apply.</span></h2>
          <Sub center>Now accepting applications for the inaugural class. Twenty-five students per cohort. Selective admission. Limited enrollment.</Sub>
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
    role: "Academy Dean & Senior Instructor",
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
    img: "https://i.imgur.com/HV7hqca.jpeg",
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
  "amina-abdulaeva": {
    name: "Amina Abdulaeva",
    role: "Operations Director",
    img: "https://i.imgur.com/SeOkgm8.jpeg",
    tags: ["Project Coordination", "Operations Management", "Program Launch", "Multilingual", "Stakeholder Management"],
    headline: "The operational foundation every elite programme requires.",
    paras: [
      "Amina Abdulaeva is a multilingual operations and project management professional with over five years of experience delivering complex programmes across tourism, entertainment, hospitality, and healthcare. She brings a rare combination of academic rigour, cross-cultural fluency, and hands-on execution capability to every environment she operates in.",
      "She holds a Master's degree in Labor Economics from Saint Petersburg State University of Economics, a Bachelor's in International and Strategic Management from Saint Petersburg State University, and completed an exchange semester at the Norwegian School of Economics — one of Europe's leading business institutions.",
      "Her career spans roles of increasing responsibility across sectors: coordinating end-to-end international tourism programmes, managing the full operational launch of a luxury hotel, and leading the business development and execution of a regional tourist entertainment programme that achieved 90% B2B market awareness at launch and secured national television coverage.",
      "Most recently, she served as Operations and Product Launch Coordinator at a medical private practice, where she designed and launched a new service package that increased the average client transaction by 80%.",
      "Fluent in English and Spanish, and a native Russian speaker, Amina brings rare cross-cultural depth and operational precision to every environment she enters. At Excalibur Academy, she oversees all operational and administrative infrastructure — faculty scheduling, venue coordination, student communications, event production, and the logistical execution of every session, competition, and milestone event the academy runs.",
    ],
    credentials: [
      "Master's — Labor Economics, Saint Petersburg State University of Economics",
      "Bachelor's — International & Strategic Management, Saint Petersburg State University",
      "Exchange semester — Norwegian School of Economics",
      "Luxury hotel operational launch — full project management",
      "Regional tourism programme — 90% B2B market awareness at launch · National TV coverage",
      "Product launch — 80% increase in average client transaction",
      "Fluent: English, Spanish · Native: Russian",
    ],
  },
};

function FacultyProfilePage({ slug, setPage }) {
  const isMobile = useIsMobile();
  const f = facultyProfiles[slug];

  if (!f) {
    return (
      <div style={{ background: "#000", minHeight: "100vh", paddingTop: 120, textAlign: "center" }}>
        <p style={{ fontFamily: sans, color: "#FBF7EE", fontSize: 14 }}>Faculty profile not found.</p>
        <button onClick={() => setPage("faculty")} style={{ fontFamily: sans, color: gold, background: "transparent", border: "none", cursor: "pointer", fontSize: 13, marginTop: 16 }}>← Back to Faculty</button>
      </div>
    );
  }

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* Hero — photo beside info, no crop */}
      <div style={{ background: "#07060A", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
        <button onClick={() => setPage("faculty")} style={{ display: "block", padding: isMobile ? "16px 20px" : "20px 60px", fontFamily: sans, background: "transparent", border: "none", color: "rgba(199,171,117,.6)", fontSize: 11, cursor: "pointer", letterSpacing: "0.15em" }}>← OUR FACULTY</button>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "360px 1fr", maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 0 40px" : "0 40px 64px", gap: isMobile ? 28 : 64, alignItems: "start" }}>
          {/* Photo — full show, no crop */}
          <div style={{ overflow: "hidden", border: "1px solid rgba(199,171,117,.12)" }}>
            <img src={f.img} alt={f.name} style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} onError={e => e.target.style.display = "none"} />
          </div>
          {/* Info */}
          <div style={{ padding: isMobile ? "0 24px" : "32px 0 0" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>{f.role}</p>
            <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(32px,7vw,48px)" : "clamp(40px,4vw,60px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16 }}>{f.name}</h1>
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 16 }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 18, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.6 }}>{f.headline}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 24 }}>
              {f.tags.map((t, i) => (
                <span key={i} style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", letterSpacing: "0.1em", border: "1px solid rgba(199,171,117,.2)", padding: "3px 10px", textTransform: "uppercase" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? 0 : 2, background: "#111" }}>

        {/* Bio — left */}
        <div style={{ background: "#080808", padding: isMobile ? "48px 28px" : "72px 72px" }}>
          <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 36 }} />
          {f.paras.map((para, i) => (
            <p key={i} style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 22 }}>{para}</p>
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
                <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{cr}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}>
            <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: "#9A9290", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Expertise</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {f.tags.map((t, i) => (
                <span key={i} style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", letterSpacing: "0.1em", border: "1px solid rgba(199,171,117,.15)", padding: "4px 10px", textTransform: "uppercase" }}>{t}</span>
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
                  <p style={{ fontFamily: serif, fontSize: 13, color: "#FBF7EE" }}>{p.name}</p>
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
function FacultyPage({ setPage, openInquiry }) {
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
      role: "Academy Dean & Senior Instructor",
      img: "https://i.imgur.com/GDkTAdw.jpeg",
      tags: ["M&A Strategy", "Finance", "Leadership", "TEDx Speaker", "Georgetown MBA Professor"],
      bio: "William Morris is a transformational finance and strategy executive with over 30 years of experience at the highest levels of Wall Street, corporate leadership, and executive education. He began his career at Exxon Corporation, earning four promotions in five years, before heading international finance and operations for Kidder Peabody across London, Paris, Geneva, Zurich, Hong Kong, and Tokyo.\n\nAs Senior Vice President and Managing Director at Geneva Capital Markets — then a division of Citigroup — he completed over 100 closed middle-market M&A transactions and advised more than 600 private-company CEOs on valuation, exits, and strategy. He later served as Executive Vice President and Chief Financial Officer of Media Arts Group, a NYSE-listed company.\n\nA sought-after educator and speaker, Bill is currently an Adjunct Professor at Georgetown University's McDonough School of Business, where he teaches advanced MBA courses on strategic behavior and competitive dynamics. He is also a professor at UC Irvine's Paul Merage School of Business.\n\nBill is the author of The Formula for Success, a TEDx speaker, sits on three corporate boards, and has spoken at institutions from West Point to Stanford."
    },
    {
      name: "Erik Dostal",
      role: "Senior Program Director",
      img: "https://i.imgur.com/HV7hqca.jpeg",
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
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* Hero */}
      <div style={{ padding: isMobile ? "60px 24px 48px" : "88px 80px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <Fade>
          <Eyebrow>OUR FACULTY</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(32px,7vw,48px)" : "clamp(44px,5vw,64px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16 }}>
            The people<br /><span style={{ color: gold }}>behind the programme.</span>
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, maxWidth: 580 }}>
            Excalibur faculty are not chosen for titles alone. They are selected for experience, judgment, communication, and the ability to make serious material useful to ambitious high school students. They have built companies, led teams, advised leaders, taught at top institutions, raised capital, negotiated deals, and stood in the arenas they now teach.
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
                <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE", marginBottom: 4 }}>{f.name}</h2>
                <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>{f.role}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {f.tags.map((t, i) => (
                    <span key={i} style={{ fontFamily: sans, fontSize: 9, color: "#FBF7EE", letterSpacing: "0.1em", border: "1px solid rgba(199,171,117,.15)", padding: "3px 8px", textTransform: "uppercase" }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Bio column */}
              <div>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
                {f.bio.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>{para}</p>
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
          <SectionTitle center>Ready to study with the people who have stood in the arenas they teach?</SectionTitle>
          <Sub center>Applications for the Summer Intensive 2026 are now open. Enrollment is limited.</Sub>
          <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 44px", fontSize: 13, fontWeight: 700, letterSpacing: 2.5, border: "none", cursor: "pointer", marginTop: 28 }}>APPLY NOW</button>
        </Fade>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// PAGE: ABOUT
// ─────────────────────────────────────────────
function AboutPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* HERO — H7T1wmI background, main heading */}
      <div style={{ position: "relative", height: isMobile ? 420 : 620, overflow: "hidden" }}>
        <img src="https://i.imgur.com/H7T1wmI.png" alt="Excalibur Academy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "brightness(0.45)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.85) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: isMobile ? "0 24px" : "0 80px" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 24 }}>About Excalibur Academy</p>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(26px,6vw,36px)" : "clamp(38px,4vw,58px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.15, marginBottom: 0 }}>
            The European Canon of Excellence
          </h1>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(26px,6vw,36px)" : "clamp(38px,4vw,58px)", fontWeight: 600, color: gold, lineHeight: 1.15, marginTop: 6 }}>
            The American Spirit of Leadership & Innovation
          </h1>
          <div style={{ width: 64, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "28px auto 0" }} />
        </div>
      </div>

      {/* THE ACADEMY — white background block */}
      <Fade>
        <div style={{ background: "#FAFAF8", padding: isMobile ? "56px 24px" : "80px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 80, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#111", fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Academy</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 28 }}>Forging the leaders of tomorrow</h2>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 18 }}>Excalibur Leadership Academy is a premier institute for entrepreneurship, business, and leadership for ambitious teenagers aged 16–17 in Orange County, California. We are building the institution we wish had existed when we were young — one where students are mentored by accomplished adults who have built companies, led teams, and operated under real stakes.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 18 }}>Our sessions take place in historic estates and private venues across Newport Beach, Laguna Beach, and San Clemente, inspired by the traditions of European elite education.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 18 }}>Every session follows a rigorous three-block format: rhetoric and public speaking with a speaking coach, real-world business analysis and applied workshops led by senior faculty, and deep domain instruction from rotating specialists for every industry. No filler. No theory divorced from practice — only formation that builds confidence, judgment, and mental fortitude.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300 }}>Our faculty are not career academics. They are entrepreneurs, executives, investors, and professionals who teach from lived experience. Students learn public speaking, financial reasoning, business strategy, sales and marketing, leadership, technology and AI, and the social arts through live case studies, startup simulations, consulting projects, and competitive pitch forums.</p>
            </div>
            <div>
              <div style={{ height: isMobile ? 300 : 460, overflow: "hidden", border: "1px solid rgba(0,0,0,.08)", marginBottom: 28 }}>
                <img src="https://i.imgur.com/PGjUc7X.jpeg" alt="Excalibur Academy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={e => e.target.style.display="none"} />
              </div>
              <div style={{ borderLeft: "3px solid #C7AB75", paddingLeft: 20 }}>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300 }}>By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, worked in teams under pressure, and competed in Shark Tank-style finals. In our flagship program, students launch revenue-generating micro-ventures and graduate with a bound portfolio of work that sets them apart for university admissions — and beyond.</p>
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* FZa8mNV — full width photo between sections */}
      <div style={{ height: isMobile ? 240 : 360, overflow: "hidden", position: "relative" }}>
        <img src="https://i.imgur.com/FZa8mNV.jpeg" alt="Excalibur Academy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "brightness(0.6)" }} onError={e => e.target.style.display="none"} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.3) 0%, transparent 35%, transparent 65%, rgba(0,0,0,.5) 100%)" }} />
        <div style={{ position: "absolute", bottom: isMobile ? 20 : 36, left: 0, right: 0, textAlign: "center" }}>
          <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 20, color: "#FBF7EE", fontStyle: "italic", letterSpacing: "0.04em" }}>Orange County, California · Inaugural Class 2026</p>
        </div>
      </div>

      {/* WHY THIS MATTERS NOW — dark block */}
      <Fade>
        <div style={{ background: "#080608", padding: isMobile ? "56px 24px" : "80px 80px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Why This Matters Now</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 40, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 36 }}>Schools teach how to take tests.
We teach how to lead.</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 28 : 52 }}>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>The skills that determine success — public speaking, strategic thinking, financial judgment, leadership, and the ability to persuade — are largely absent from traditional education. At the same time, AI is rapidly reshaping industries and dissolving career paths once considered secure.</p>
              <div>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>What cannot be replaced are human capacities: confidence under pressure, ownership of outcomes, the ability to lead, to sell an idea, to recover from failure, and to act when the path is uncertain. Entrepreneurs have powered business revolutions, built modern industry, and are now shaping the age of AI.</p>
                <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, color: gold, fontStyle: "italic", lineHeight: 1.5 }}>Excalibur exists to prepare students to lead the next business revolution.</p>
              </div>
            </div>
          </div>
        </div>

        {/* WHAT IS BEHIND A NAME — text left, image right — merged, no gap */}
        <div style={{ background: "#07060A", padding: isMobile ? "56px 24px" : "80px 80px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>What is Behind a Name?</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 30 : 44, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 28 }}>The Meaning of Excalibur.</h2>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 28 }} />
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 20 }}>In Arthurian legend, Excalibur is more than a sword or power. It is a symbol of leadership and excellence. It represents the right to lead — earned through judgment, courage, responsibility, and character. At Excalibur Academy, leadership is treated the same way. It is not about being the loudest in the room or holding the highest title. It is about becoming the kind of person others can trust to think clearly, act responsibly, and lead under pressure.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 28 }}>The Knights of the Round Table represented more than strength in battle. It stood for a broader ideal of leadership: courage joined with judgment, debate joined with loyalty, and ambition governed by honor. At Excalibur, that ideal becomes an educational model. Students are trained not for one narrow skill, but for the range of capacities leadership requires.</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, color: gold, fontStyle: "italic", lineHeight: 1.4 }}>That is our model.</p>
            </div>
            <div style={{ height: 48 }} />
            <div style={{ height: isMobile ? 300 : 520, overflow: "hidden" }}>
              <img src="https://i.imgur.com/QNW043y.jpeg" alt="King Arthur — Excalibur" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} onError={e => e.target.style.display="none"} />
            </div>
          </div>
        </div>
      </Fade>

      {/* OUR PHILOSOPHY — white background, LZ29Hjy + DhYCwhg */}
      <Fade>
        <div style={{ background: "#FAFAF8", padding: isMobile ? "56px 24px" : "80px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#111", fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Our Philosophy</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 38, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 32 }}>Classical formation. Modern ambition.</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 64, marginBottom: 48 }}>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300 }}>Excalibur Academy exists to restore a form of education that once produced statesmen, generals, patrons of culture, and innovators — while equipping it for the demands of the modern world. Our foundation is European in character: classical formation, intellectual depth, discipline of mind, and cultivated presence, while our heart and soul is unmistakably American: with fire, hustle, innovation and leadership.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300 }}>For centuries, European education focused not only on knowledge, but on formation — the shaping of judgment, character, taste, and authority. From Ancient Greek warriors trained in rhetoric and philosophy, to Roman senators schooled in governance and persuasion, to Renaissance leaders educated across art, politics, and commerce, excellence was understood as multidimensional. Excalibur returns to this tradition while extending it into the modern age — where leadership now requires command of technology, AI, entrepreneurship, and global complexity.</p>
            </div>
            {/* Two photos side by side */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2 }}>
              <div style={{ height: isMobile ? 240 : 380, overflow: "hidden" }}>
                <img src="https://i.imgur.com/LZ29Hjy.jpeg" alt="Ancient Greece — classical tradition" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }} onError={e => e.target.style.display="none"} onMouseEnter={e => e.target.style.transform="scale(1.04)"} onMouseLeave={e => e.target.style.transform="scale(1)"} />
              </div>
              <div style={{ height: isMobile ? 240 : 380, overflow: "hidden" }}>
                <img src="https://i.imgur.com/DhYCwhg.jpeg" alt="European heritage" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }} onError={e => e.target.style.display="none"} onMouseEnter={e => e.target.style.transform="scale(1.04)"} onMouseLeave={e => e.target.style.transform="scale(1)"} />
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* A MULTIDIMENSIONAL LEADER — dark block */}
      <Fade>
        <div style={{ background: "#07060A", padding: isMobile ? "56px 24px" : "80px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>A Multidimensional Leader</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 40, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 36 }}>Ownership and Excellence.</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 28 : 72 }}>
              <div>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 22 }}>Excalibur students are forged to lead commanding respect, to speak with precision, to think with depth, to take risks intelligently, and to remain composed under scrutiny. They study public speaking and executive communication alongside financial reasoning and strategy. They learn the art of class and presence alongside risk management, ownership of outcomes, and modern innovation in AI and emerging technology. They are trained to take responsibility not only for success, but also failure — and to learn decisively from both, and own the next step through resilience and will.</p>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>This is a type of leader forged by Excalibur Academy — a leader of range and depth. One who is credible from every angle. Intellectual without being abstract. Decisive without being reckless. Cultured without being performative. When such a student enters a room — whether an art gallery, a boardroom, a negotiation, or a stage — the authority is natural. Conversations are grounded. Presence is composed. Leadership is evident.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* Real stakes — luxury quote block, no yellow overlay */}
                <div style={{ position: "relative", marginBottom: 28 }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: gold }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: gold }} />
                  <div style={{ padding: isMobile ? "28px 0" : "36px 0" }}>
                    {["Real Responsibilities.", "Real Decisions.", "Real Stakes.", "Real Mistakes.", "Real Lessons.", "Real Successes."].map((line, i) => (
                      <p key={i} style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, color: i % 2 === 0 ? "#F0E8E0" : gold, fontWeight: i % 2 === 0 ? 600 : 300, lineHeight: 1.45, fontStyle: i % 2 !== 0 ? "italic" : "normal" }}>{line}</p>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>At Excalibur Academy, students do not learn theory alone. They are forged through real responsibility, real decisions, and real consequences. Through applied leadership, entrepreneurship, and execution — tested under pressure rather than discussed in isolation. They experience global perspective through international programs and summer immersions in places such as London and Geneva, learning to operate across cultures with confidence and respect.</p>
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* CLOSING STATEMENT — full bleed black luxury */}
      <Fade>
        <div style={{ background: "#F5F3EE", padding: isMobile ? "56px 24px" : "80px 80px", textAlign: "center" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 20 }}>Excalibur graduates are not prepared by theory alone. They are prepared by repeated practice: speaking, presenting, analyzing, building, competing, receiving feedback, and improving under scrutiny. They leave with the confidence to address a room, the judgment to defend an idea, and the maturity to take responsibility for the choices they make.</p>
            <div style={{ height: 1, background: "rgba(199,171,117,.4)", margin: "32px auto", maxWidth: 120 }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 28, color: "#000", fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>This is not an education designed to avoid difficulty.</p>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 28, color: "#111", fontWeight: 600, lineHeight: 1.4, marginBottom: 32 }}>It is an education designed to form leaders.</p>
            <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300 }}>Excalibur does not aim to build theory specialists alone — but leaders forged broadly, deeply, and deliberately, ready for whatever arena they step into next.</p>
          </div>
        </div>
      </Fade>

      {/* STATEMENT — full bleed black, gold lines */}
      <div style={{ background: "#000", padding: isMobile ? "72px 24px" : "100px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Subtle corner marks */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
          <div key={i} style={{ position: "absolute", [v]: 24, [h]: 24, width: 20, height: 20,
            [`border${v[0].toUpperCase()+v.slice(1)}`]: "1px solid rgba(199,171,117,.25)",
            [`border${h[0].toUpperCase()+h.slice(1)}`]: "1px solid rgba(199,171,117,.25)",
          }} />
        ))}
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.55em", color: "#FBF7EE", fontWeight: 600, textTransform: "uppercase", marginBottom: 52 }}>Excalibur Academy</p>
          {[
            "Where Dreams become goals.",
            "Goals become discipline.",
            "Discipline becomes achievement.",
          ].map((line, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? (isMobile ? 20 : 28) : 0 }}>
              <p style={{
                fontFamily: serif,
                fontSize: isMobile ? "clamp(32px,8vw,44px)" : "clamp(44px,5vw,68px)",
                fontWeight: 300,
                color: gold,
                lineHeight: 1.05,
                letterSpacing: "0.02em",
                fontStyle: "italic",
              }}>{line}</p>
            </div>
          ))}
          <div style={{ width: 1, height: 52, background: `linear-gradient(to bottom, ${gold}, transparent)`, margin: "44px auto 0" }} />
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 2, background: "#111" }}>
        {[["16–17", "Age range"], ["25", "Students per cohort"], ["10", "Months flagship"], ["8", "Curriculum modules"]].map(([v, l], i) => (
          <div key={i} style={{ background: "#080808", padding: "36px 20px", textAlign: "center", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}` }}>
            <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 600, color: gold, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: sans, color: "#FBF7EE", fontSize: 13, marginTop: 10, letterSpacing: "0.05em" }}>{l}</div>
          </div>
        ))}
      </div>

      <SoireeInviteBlock openInquiry={openInquiry} />
    </div>
  );
}




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
      <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Forum&display=swap" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <style>{`*{margin:0;padding:0;box-sizing:border-box}::selection{background:rgba(199,171,117,.2);color:#fff}body{overflow-x:hidden}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>

      {/* Background — pure black with subtle gold glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(199,171,117,.04) 0%, transparent 65%)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "48px 24px" : "80px 40px", textAlign: "center" }}>

        {/* Logo */}
        <img src={LOGO_URL} alt="Excalibur Academy" style={{ width: isMobile ? 200 : 320, height: "auto", objectFit: "contain", marginBottom: 28, filter: "drop-shadow(0 0 60px rgba(199,171,117,.18))" }} onError={e => e.target.style.display = "none"} />

        {/* Eyebrow */}
        <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20, borderBottom: "1px solid rgba(199,171,117,.3)", paddingBottom: 8, display: "inline-block" }}>
          Waitlist Now Open for Summer Intensive July & August Waves 2026 &nbsp;·&nbsp; Apply Now &nbsp;·&nbsp; Limited Cohort &nbsp;·&nbsp; 25 Students Only
        </p>

        {/* Title — uniform uppercase via textTransform to match homepage */}
        <h1 style={{ fontFamily: "'Forum', Georgia, serif", fontSize: isMobile ? "clamp(22px,5vw,32px)" : "clamp(28px,3.5vw,44px)", fontWeight: 400, color: "#FBF7EE", lineHeight: 1.05, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 12 }}>
          Excalibur Academy
        </h1>
        <p style={{ fontFamily: sans, fontSize: isMobile ? 12 : 14, letterSpacing: "0.22em", color: gold, textTransform: "uppercase", marginBottom: 16, opacity: 0.85 }}>
          Forging the leaders of tomorrow
        </p>

        {/* Tagline from homepage */}
        <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 16, color: "#FBF7EE", lineHeight: 1.75, maxWidth: 640, marginBottom: 40, fontWeight: 300 }}>
          A premier institute where real entrepreneurs, investors, top executives, keynote speakers and distinguished professionals teach the next generation to lead the world — not follow it.
        </p>

        {/* Status banner */}
        <div style={{ background: "rgba(199,171,117,.05)", border: "1px solid rgba(199,171,117,.18)", padding: isMobile ? "20px 24px" : "24px 48px", marginBottom: 44, maxWidth: 660 }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#4DB87A", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>● Admissions Opening Soon</p>
          <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 15, color: "#FBF7EE", lineHeight: 1.75, fontWeight: 300 }}>For junior and high school seniors.</p>
          <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 15, color: "#FBF7EE", lineHeight: 1.75, fontWeight: 300, marginTop: 4 }}>Enrollment limited to 20 students per cohort.</p>
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
              <p style={{ fontFamily: serif, fontSize: 15, color: "#FBF7EE", marginBottom: 6 }}>{p.dates}</p>
              <p style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", fontWeight: 300 }}>{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Faculty credentials — refined split panels */}
        <div style={{ width: "100%", maxWidth: 880, marginBottom: 52 }}>
          <p style={{ fontFamily: sans, fontSize: 12, letterSpacing: "0.4em", color: "#FBF7EE", fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Lead Faculty</p>
          <div style={{ background: "#08080A", border: "1px solid rgba(199,171,117,.12)", position: "relative", overflow: "hidden" }}>
            {/* Gold top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
            {/* Corner ornaments */}
            <div style={{ position: "absolute", top: 12, left: 12, width: 18, height: 18, borderTop: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderTop: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 18, height: 18, borderBottom: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 18, height: 18, borderBottom: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ padding: isMobile ? "28px 24px" : "36px 44px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", gap: isMobile ? 32 : 0 }}>
              {/* Faculty 1 */}
              <div style={{ padding: isMobile ? "0" : "0 40px 0 0", textAlign: "center" }}>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${gold})`, margin: "0 auto 20px" }} />
                <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 15, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 400 }}>
                  A CEO who built the world's first autonomous racing series, led the Formula BMW program — developing multiple Formula 1 World Champions — and oversaw a $13B NASDAQ listing. Secured over $100M in institutional funding. Guinness World Record holder and professional racing driver.
                </p>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, margin: "20px auto 0" }} />
              </div>
              {/* Divider */}
              {!isMobile && <div style={{ background: "rgba(199,171,117,.15)", margin: "0 0" }} />}
              {/* Faculty 2 */}
              <div style={{ padding: isMobile ? "0" : "0 0 0 40px", textAlign: "center" }}>
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${gold})`, margin: "0 auto 20px" }} />
                <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 15, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 400 }}>
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
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Family Information Event · May 2026</p>
            <div style={{ background: "#050505", border: `1px solid rgba(199,171,117,.55)`, padding: isMobile ? "28px 24px" : "36px 44px", textAlign: "center", position: "relative" }}>
              {/* Corner ornaments */}
              <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: `1px solid ${gold}`, borderLeft: `1px solid ${gold}` }} />
              <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: `1px solid ${gold}`, borderRight: `1px solid ${gold}` }} />
              {/* Card content */}
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 18 }}>Excalibur Academy · May 2026</p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 23, color: "#FBF7EE", lineHeight: 1.45, marginBottom: 18 }}>
                Academy Launch and Family Information Soirée<br />at the Mediterranean Estate in San Clemente
              </p>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "0 auto 20px" }} />
              <p style={{ fontFamily: sans, fontSize: isMobile ? 12 : 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, maxWidth: 520, margin: "0 auto 18px" }}>
                An intimate evening and cocktail reception for a select number of families to meet the faculty, learn about the programs, and experience the standard of the Academy firsthand.
              </p>
              <p style={{ fontFamily: serif, fontSize: 12, color: gold, letterSpacing: "0.18em", marginBottom: 32 }}>By personal invitation only.</p>
              <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row", maxWidth: 520, margin: "0 auto" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && email && setSubmitted(true)}
                  placeholder="Your email address"
                  style={{ flex: 1, padding: "13px 18px", background: "#000", border: "1px solid rgba(199,171,117,.25)", color: "#FBF7EE", fontFamily: sans, fontSize: 13, outline: "none" }}
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
              <p style={{ fontFamily: sans, fontSize: 10, color: "rgba(251,247,238,0.5)", marginTop: 14, letterSpacing: "0.06em" }}>A member of our admissions team will be in touch within 24 hours with next steps.</p>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 880, marginBottom: 48 }}>
            <div style={{ background: "#08080A", border: "1px solid rgba(199,171,117,.2)", padding: "44px 52px", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
              <span style={{ fontFamily: serif, fontSize: 28, color: gold, display: "block", marginBottom: 16 }}>✦</span>
              <p style={{ fontFamily: serif, fontSize: 22, color: "#FBF7EE", marginBottom: 12 }}>Thank you.</p>
              <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8 }}>Our admissions team will follow up personally with details for the May soirée. We would be honored to welcome your family.</p>
            </div>
          </div>
        )}

        {/* Password access */}
        {!showPass ? (
          <button onClick={() => setShowPass(true)} style={{ fontFamily: sans, background: "transparent", border: "none", color: "rgba(251,247,238,0.6)", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: 3 }}>
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
                style={{ padding: "11px 16px", background: "#0A0A08", border: `1px solid ${passError ? "#c0392b" : "rgba(199,171,117,.2)"}`, color: "#FBF7EE", fontFamily: sans, fontSize: 13, outline: "none", width: isMobile ? "100%" : 220 }}
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
        <p style={{ fontFamily: sans, fontSize: 11, color: "rgba(251,247,238,0.4)" }}>apply@excaliburacademy.org &nbsp;·&nbsp; support@excaliburacademy.org &nbsp;·&nbsp; Orange County, California</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT — STATE-BASED ROUTER
// ─────────────────────────────────────────────
// ── STICKY MOBILE APPLY BUTTON ──
function StickyMobileCTA({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999, background: "#000", borderTop: `1px solid rgba(199,171,117,.35)` }}>
      <button onClick={() => openInquiry && openInquiry()} style={{ width: "100%", fontFamily: "'DM Sans', sans-serif", background: gold, color: "#000", padding: "14px 0", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
Apply for Summer 2026 →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// LUXURY INQUIRY MODAL
// ─────────────────────────────────────────────
function InquiryModal({ open, onClose, defaultProgram }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    parentFirst: "", parentLast: "",
    email: "", phone: "",
    address: "", city: "", state: "", zip: "",
    contactMethod: "", contactTime: "",
    students: [{ firstName: "", lastName: "", age: "", grade: "" }],
    programs: [],
    summerWave: "",
    sendPackage: "",
    mailingAddress: "",
    hearAbout: "",
  });

  const gold = "#C7AB75";
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans = "'Lato', 'DM Sans', sans-serif";
  const eyebrow = "'Lato', sans-serif";

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addStudent = () => {
    if (form.students.length < 5) set("students", [...form.students, { firstName: "", lastName: "", age: "", grade: "" }]);
  };
  const updateStudent = (i, k, v) => {
    const s = [...form.students];
    s[i] = { ...s[i], [k]: v };
    set("students", s);
  };

  const toggleProgram = (p) => {
    const cur = form.programs;
    set("programs", cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p]);
  };

  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; setStep(1); setSubmitted(false); }
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (defaultProgram && open) set("programs", [defaultProgram]);
  }, [defaultProgram, open]);

  if (!open) return null;

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    background: "#000", border: "1px solid rgba(199,171,117,.25)",
    color: "#FBF7EE", fontFamily: sans, fontSize: 14, outline: "none",
    transition: "border-color .2s", borderRadius: 0,
  };
  const inputClass = "inquiry-input";
  const focusStyle = (e) => e.target.style.borderColor = gold;
  const blurStyle = (e) => e.target.style.borderColor = "rgba(199,171,117,.2)";

  const Label = ({ children }) => (
    <p style={{ fontFamily: eyebrow, fontSize: 9, letterSpacing: "0.25em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{children}</p>
  );

  const Chip = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      fontFamily: sans, fontSize: 12, padding: "10px 18px", cursor: "pointer",
      background: active ? gold : "transparent",
      color: active ? "#000" : "#FBF7EE",
      border: `1px solid ${active ? gold : "rgba(199,171,117,.25)"}`,
      transition: "all .2s", fontWeight: active ? 700 : 300, letterSpacing: "0.03em",
    }}>{label}</button>
  );

  const programs = [
    { id: "summer-wave1", label: "Summer Intensive · Wave 1 (July)" },
    { id: "summer-wave2", label: "Summer Intensive · Wave 2 (August)" },
    { id: "six-week", label: "Six-Week Intensive" },
    { id: "flagship", label: "Ten-Month Flagship Program" },
  ];

  const grades = ["9th Grade", "10th Grade", "11th Grade", "12th Grade"];
  const contactMethods = ["Phone Call", "Email", "Text Message", "WhatsApp"];
  const contactTimes = ["Morning (9–12)", "Afternoon (12–5)", "Evening (5–8)", "Weekends"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,.85)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: isMobile ? "0" : "24px",
      overflowY: "auto",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#000", border: "1px solid rgba(199,171,117,.3)",
        width: "100%", maxWidth: 740,
        maxHeight: isMobile ? "100dvh" : "92vh",
        overflowY: "auto",
        position: "relative",
        display: "flex", flexDirection: "column",
      }}>
        {/* Corner accents */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
          <div key={i} style={{ position: "absolute", [v]: 12, [h]: 12, width: 16, height: 16,
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: `1px solid rgba(199,171,117,.45)`,
            [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: `1px solid rgba(199,171,117,.45)`,
            pointerEvents: "none", zIndex: 2 }} />
        ))}

        {/* Header */}
        <div style={{ padding: isMobile ? "32px 28px 20px" : "40px 52px 24px", borderBottom: "1px solid rgba(199,171,117,.08)", position: "sticky", top: 0, background: "#000", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontFamily: eyebrow, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Excalibur Academy · Inquiry</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 34, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05 }}>
                {submitted ? "Thank You." : step === 1 ? "Tell Us About Your Family." : step === 2 ? "Your Prospective Student." : "Program & Preferences."}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(251,247,238,.4)", fontSize: 22, cursor: "pointer", lineHeight: 1, marginTop: 4, padding: "4px 8px", transition: "color .2s" }} onMouseEnter={e=>e.target.style.color="#FBF7EE"} onMouseLeave={e=>e.target.style.color="rgba(251,247,238,.4)"}>×</button>
          </div>
          {/* Step indicator */}
          {!submitted && (
            <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ height: 2, flex: 1, background: s <= step ? gold : "rgba(199,171,117,.15)", transition: "background .4s" }} />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "28px 28px 32px" : "40px 52px 48px", flex: 1 }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontFamily: serif, fontSize: 52, color: gold, marginBottom: 20 }}>✦</div>
              <p style={{ fontFamily: serif, fontSize: 22, color: "#FBF7EE", marginBottom: 12, lineHeight: 1.4 }}>Your inquiry has been received.</p>
              <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, maxWidth: 440, margin: "0 auto 32px" }}>A member of our admissions team will be in touch within 24 hours. We look forward to welcoming your family to Excalibur Academy.</p>
              <div style={{ width: 44, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "0 auto 32px" }} />
              <button onClick={onClose} style={{ fontFamily: sans, background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, padding: "12px 36px", fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Close</button>
            </div>
          ) : step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Parent name */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <div><Label>Parent / Guardian First Name</Label><input className={inputClass} style={inputStyle} value={form.parentFirst} onChange={e=>set("parentFirst",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="First name" /></div>
                <div><Label>Last Name</Label><input className={inputClass} style={inputStyle} value={form.parentLast} onChange={e=>set("parentLast",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Last name" /></div>
              </div>
              {/* Contact */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <div><Label>Email Address</Label><input type="email" className={inputClass} style={inputStyle} value={form.email} onChange={e=>set("email",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="your@email.com" /></div>
                <div><Label>Phone Number</Label><input type="tel" className={inputClass} style={inputStyle} value={form.phone} onChange={e=>set("phone",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="+1 (___) ___-____" /></div>
              </div>
              {/* Preferred contact */}
              <div>
                <Label>Preferred Method of Contact</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {contactMethods.map(m => <Chip key={m} label={m} active={form.contactMethod === m} onClick={() => set("contactMethod", m)} />)}
                </div>
              </div>
              <div>
                <Label>Best Time to Reach You</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {contactTimes.map(t => <Chip key={t} label={t} active={form.contactTime === t} onClick={() => set("contactTime", t)} />)}
                </div>
              </div>
              {/* Address */}
              <div>
                <Label>Home Address</Label>
                <input style={{ ...inputStyle, marginBottom: 8 }} value={form.address} onChange={e=>set("address",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Street address" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px", gap: 8 }}>
                  <input className={inputClass} style={inputStyle} value={form.city} onChange={e=>set("city",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="City" />
                  <input className={inputClass} style={inputStyle} value={form.state} onChange={e=>set("state",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="State" />
                  <input className={inputClass} style={inputStyle} value={form.zip} onChange={e=>set("zip",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="ZIP" />
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7 }}>Please provide details for each prospective student. If you have more than one child who may be interested, add them below.</p>
              {form.students.map((s, i) => (
                <div key={i} style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", padding: "24px 24px", position: "relative" }}>
                  <p style={{ fontFamily: eyebrow, fontSize: 9, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Student {i + 1}</p>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                    <div><Label>First Name</Label><input className={inputClass} style={inputStyle} value={s.firstName} onChange={e=>updateStudent(i,"firstName",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="First name" /></div>
                    <div><Label>Last Name</Label><input className={inputClass} style={inputStyle} value={s.lastName} onChange={e=>updateStudent(i,"lastName",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Last name" /></div>
                    <div><Label>Age</Label><input type="number" min="14" max="19" className={inputClass} style={inputStyle} value={s.age} onChange={e=>updateStudent(i,"age",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Age" /></div>
                    <div>
                      <Label>Current School Year</Label>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {grades.map(g => <Chip key={g} label={g} active={s.grade === g} onClick={() => updateStudent(i,"grade",g)} />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {form.students.length < 5 && (
                <button onClick={addStudent} style={{ fontFamily: sans, background: "transparent", border: "1px dashed rgba(199,171,117,.25)", color: "rgba(199,171,117,.6)", padding: "12px", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", cursor: "pointer", textAlign: "center" }}>+ Add Another Student</button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Program interest */}
              <div>
                <Label>Program Interest (select all that apply)</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {programs.map(p => (
                    <button key={p.id} onClick={() => toggleProgram(p.id)} style={{
                      fontFamily: sans, fontSize: 13, padding: "14px 20px", cursor: "pointer", textAlign: "left",
                      background: form.programs.includes(p.id) ? "rgba(199,171,117,.08)" : "transparent",
                      color: form.programs.includes(p.id) ? gold : "#FBF7EE",
                      border: `1px solid ${form.programs.includes(p.id) ? gold : "rgba(199,171,117,.18)"}`,
                      transition: "all .2s", fontWeight: form.programs.includes(p.id) ? 500 : 300,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      {p.label}
                      {form.programs.includes(p.id) && <span style={{ fontSize: 14 }}>✦</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Private invitation + package */}
              <div>
                <Label>Admissions Package & Private Invitation</Label>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>Would you like to receive your private invitation to the May 23 family soirée and admissions package by post?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Yes — send by post", "Email only"].map(opt => <Chip key={opt} label={opt} active={form.sendPackage === opt} onClick={() => set("sendPackage", opt)} />)}
                </div>
                {form.sendPackage === "Yes — send by post" && (
                  <div style={{ marginTop: 16 }}>
                    <Label>Mailing Address (if different from above)</Label>
                    <input className={inputClass} style={inputStyle} value={form.mailingAddress} onChange={e=>set("mailingAddress",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Leave blank if same as home address" />
                  </div>
                )}
              </div>
              {/* How did you hear */}
              <div>
                <Label>How did you hear about Excalibur Academy?</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Referral", "Social Media", "Search", "Event", "Press / Media", "Other"].map(h => <Chip key={h} label={h} active={form.hearAbout === h} onClick={() => set("hearAbout", h)} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {!submitted && (
          <div style={{ padding: isMobile ? "20px 28px" : "24px 52px", borderTop: "1px solid rgba(199,171,117,.08)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#000", position: "sticky", bottom: 0 }}>
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} style={{ fontFamily: sans, background: "transparent", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "12px 28px", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase" }}>← Back</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", border: "none", cursor: "pointer", textTransform: "uppercase" }}>Continue →</button>
            ) : (
              <button onClick={() => setSubmitted(true)} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", border: "none", cursor: "pointer", textTransform: "uppercase" }}>Submit Inquiry →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExcaliburApp() {
  const [page, setPageRaw] = useState("home");
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryProgram, setInquiryProgram] = useState("");

  const openInquiry = useCallback((program = "") => {
    setInquiryProgram(program);
    setInquiryOpen(true);
  }, []);

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
    if (p === "apply") { openInquiry(); return; }
    setPageRaw(p);
    window.scrollTo(0, 0);
  }, [openInquiry]);

  const renderPage = () => {
    if (page === "home") return <HomePage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "programs") return <ProgramsPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "curriculum") return <CurriculumPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "full-program") return <FullProgramPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "intensive") return <IntensivePage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "beyond") return <BeyondPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "about") return <AboutPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "faculty") return <FacultyPage setPage={setPage} openInquiry={openInquiry} />;
    if (page.startsWith("faculty:")) return <FacultyProfilePage slug={page.replace("faculty:", "")} setPage={setPage} />;
    if (page === "apply") return <ApplyPage setPage={setPage} openInquiry={openInquiry} />;
    if (page.startsWith("module:")) return <ModulePage slug={page.replace("module:", "")} setPage={setPage} />;
    return <HomePage setPage={setPage} openInquiry={openInquiry} />;
  };

  return (
    <div style={{ background: "#000", color: "#FBF7EE", minHeight: "100vh", fontFamily: "'Lato', sans-serif" }}>
      <ScrollProgress />
      <ShimmerStyle />
      <StickyMobileCTA setPage={setPage} openInquiry={openInquiry} />
      <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Forum&display=swap" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <style>{`*{margin:0;padding:0;box-sizing:border-box}::selection{background:rgba(199,171,117,.2);color:#fff}html{scroll-behavior:smooth}body{overflow-x:hidden}button{cursor:pointer;font-family:'Lato',sans-serif}img{max-width:100%}.inquiry-input::placeholder{color:rgba(251,247,238,0.7)!important}.inquiry-input{color:#FBF7EE!important}`}</style>
      <Nav page={page} setPage={setPage} />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} defaultProgram={inquiryProgram} />
      {renderPage()}
      <Footer setPage={setPage} />
    </div>
  );
}
