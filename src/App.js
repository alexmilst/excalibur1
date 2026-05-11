import React, { useState, useEffect, useRef, useCallback } from "react";

const STRIPE = "https://buy.stripe.com/placeholder";
const LOGO_URL = "https://i.ibb.co/rKSp526b/upsclae-logo.png";
const LOGO = LOGO_URL;
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif";
const eyebrow_font = "'DM Sans', sans-serif";
const gold = "#C7AB75";

// ── RESPONSIVE HOOK ──


// ─────────────────────────────────────────────────────────
// WEB3FORMS SUBMIT
// Get your free access key at web3forms.com (takes 30 sec)
// Enter your Microsoft 365 email → get key → paste below
// ─────────────────────────────────────────────────────────
const WEB3FORMS_KEY = "a1a5e781-b29e-449e-b08d-3447d8f8900f";

async function sendEmail(data) {
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...data }),
    });
    const json = await res.json();
    console.log("Web3Forms response:", json);
    return json.success;
  } catch (e) {
    console.error("Web3Forms error:", e);
    return false;
  }
}

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
      <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 10, letterSpacing: "0.55em", color: "rgba(199,171,117,.55)", textTransform: "uppercase", marginTop: 14 }}>{label}</div>
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

function Breadcrumb({ items, setPage }) {
  // items = [{label, page}] — last item is current page (no link)
  if (!items || items.length === 0) return null;
  const gold = "#C7AB75";
  const sans = "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif";
  return (
    <div style={{ background: "#000", borderBottom: "1px solid rgba(199,171,117,.08)", padding: "10px 48px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span onClick={() => setPage("home")} style={{ fontFamily: sans, fontSize: 10, color: "#C7AB75", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "color .2s" }}
          onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "rgba(199,171,117,.5)"}>Home</span>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <span style={{ fontFamily: sans, fontSize: 9, color: "rgba(199,171,117,.25)" }}>›</span>
            {i === items.length - 1 ? (
              <span style={{ fontFamily: sans, fontSize: 10, color: "rgba(199,171,117,.8)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.label}</span>
            ) : (
              <span onClick={() => setPage(item.page)} style={{ fontFamily: sans, fontSize: 10, color: "#C7AB75", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "color .2s" }}
                onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "rgba(199,171,117,.5)"}>{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
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
  { slug: "stocks-crypto-trading", title: "Stocks, Crypto & Market Literacy", months: "", tagline: "Understanding capital, risk, and market behavior.", summary: "Most people interact with financial markets their entire lives without ever understanding how they actually work. This module builds genuine market literacy from the ground up — covering how equity markets are structured, how companies are valued, how crypto works as both a financial and technological phenomenon, and why the discipline of serious investors begins with judgment, not intuition.", why: "Financial markets are not a separate world reserved for Wall Street professionals. They are the underlying mechanism of every business, every valuation, and every act of capital allocation. A student who understands how markets work thinks differently about every business decision they will ever make.", body: "This module builds market literacy from the ground up. Students learn how equity markets are structured, how companies are valued, how earnings, growth expectations, interest rates, news, and investor psychology influence price movement, and why markets often react before the wider public understands why.\n\nCrypto is studied as both a financial and technological phenomenon. Students examine blockchain, digital assets, decentralized finance, and the distinction between real innovation and speculation.\n\nThe module introduces the habits of serious investors and traders: thesis development, risk management, psychology of loss aversion and emotional control. Through simulated market exercises and paper trading, students learn how quickly emotion can distort judgment — and why discipline matters.\n\nThe goal is to develop students who understand how capital moves, how markets think, and how financial decisions should be approached with judgment and restraint, when money, emotion, and uncertainty collide.", whatYouLearn: ["How equity markets work — exchanges, market makers, order types, and price discovery", "How to read a stock — P/E ratios, EPS, revenue multiples, and what they actually tell you", "Technical analysis fundamentals — trend lines, support and resistance, volume signals", "Crypto fundamentals — blockchain mechanics, tokenomics, DeFi, and how to evaluate a project", "Risk management — position sizing, stop losses, portfolio construction, and the mathematics of ruin", "The psychology of trading — loss aversion, confirmation bias, overconfidence, and how professionals override them", "Macroeconomic forces — how interest rates, inflation, Fed policy, and global events move markets", "Live paper trading simulation — building and defending a real portfolio thesis before a panel"], outcomes: ["Can read a stock chart and explain what it tells them without assistance", "Understands the difference between investing and speculation — and the disciplines each requires", "Has completed a live paper trading simulation and presented their portfolio thesis to a professional panel"], quote: "The market is a device for transferring money from the impatient to the patient. — Warren Buffett" },
  { slug: "ai-technology", title: "AI, Technology & Innovation", months: "", tagline: "Wield the tools reshaping every work process.", summary: "AI is not a separate subject at Excalibur. It is a working instrument used across business research, financial modeling, competitive analysis, pitch development, and venture strategy.", why: "Students learn how founders use technology: to find patterns, test assumptions, compare markets, improve decisions, and execute with greater speed and clarity.", body: "At Excalibur, artificial intelligence is not treated as a standalone subject — it is a working instrument used across business research, financial modeling, competitive analysis, pitch development, and venture strategy. From the first week onward, AI is integrated across disciplines, used the way entrepreneurs, executives, and strategists use it: to find patterns, test assumptions, compare markets, improve decisions, and execute with greater speed and clarity.\n\nStudents learn to deploy AI for rapid market research, real-time competitive analysis, and on-demand financial modelling — tasks that once required teams of analysts and weeks of work. They are trained not merely to use tools, but to ask better questions of them.\n\nThe future will not belong to passive users of technology. It will belong to those with the judgment to direct it.", whatYouLearn: ["How large language models actually work — training data, parameters, inference, and limitations", "AI as a business tool — market research, competitive analysis, financial modeling", "Prompt engineering — how to instruct AI to produce reliable, high-quality outputs", "No-code platform development — building functional tools and automations without code", "AI in each industry sector — how technology is disrupting every major field", "Critical evaluation of AI output — when to trust it, when to verify, when to override", "The ethics of AI — bias, IP, job displacement, and builder responsibility", "Building an AI-powered business concept from research through pitch"], outcomes: ["Uses AI tools for research and strategy as a natural workflow, not a novelty", "Has built at least one functional no-code tool or automation", "Can articulate how AI works beneath the interface to someone unfamiliar with it"], quote: "The future will not belong to passive users of technology. It will belong to those with the judgment to direct it." },
  { slug: "art-of-selling", title: "The Art of Selling & Marketing", months: "", tagline: "Persuasion with integrity. Influence with purpose.", summary: "From social media marketing to nine-figure M&A deals, every outcome in business comes down to selling. This module treats it as a core life skill — training students in real-world persuasion as it actually happens: unscripted, high-stakes, and consequential.", why: "Selling is everywhere in business: raising capital, winning customers, pitching a product, building a brand, negotiating a deal, or convincing a team to believe in a direction.", body: "From social media marketing to nine-figure M&A deals, every outcome in business comes down to selling. This module treats it as a core life skill — training students in real-world persuasion as it actually happens: unscripted, high-stakes, and consequential.\n\nAt Excalibur, students learn the real mechanics of persuasion: listening, questioning, positioning, objection handling, confidence under pressure, and the ability to explain why something matters. This is not about tricks or pressure. It is about clarity, trust, timing, and the courage to make a case.\n\nThe best salespeople are not the loudest voices in the room. They are the sharpest listeners, who asked better questions than anyone else in the room.", whatYouLearn: ["Consultative selling — the discipline of asking, listening, and diagnosing before proposing", "Cialdini's six principles of influence: reciprocity, commitment, social proof, authority, liking, scarcity", "The five most common sales objections and the honest, effective response to each", "Needs analysis — identifying what someone actually wants versus what they say they want", "The anatomy of a sales conversation — opening, discovery, presentation, close", "Cold outreach, warm introduction, and referral mechanics", "The ethics of persuasion — where influence ends and manipulation begins", "Live roleplay with recorded feedback from coaches"], outcomes: ["Conducts a complete consultative sales conversation with genuine listening", "Handles objections without defensiveness or pressure", "Can articulate the ethical framework separating trusted advisors from manipulators"], quote: "" },
  { slug: "leadership", title: "Leadership, Ownership & Influence", months: "", tagline: "Lead with earned authority, not borrowed title.", summary: "Leadership begins where comfort ends: in moments of pressure, uncertainty, disagreement, and responsibility. This module teaches the disciplines behind effective leadership — building trust, reading people, managing conflict, making decisions without perfect information, communicating clearly, and staying composed when others are looking for direction.", why: "Leadership begins where comfort ends: in moments of pressure, uncertainty, disagreement, and responsibility. This module teaches the disciplines behind effective leadership — building trust, reading people, managing conflict, making decisions without perfect information, communicating clearly, and staying composed when others are looking for direction.", body: "Leadership begins where comfort ends: in moments of pressure, uncertainty, disagreement, and responsibility.\n\nThis module teaches the disciplines behind effective leadership — building trust, reading people, managing conflict, making decisions without perfect information, communicating clearly, and staying composed when others are looking for direction.\n\nStudents examine the difference between power and influence, explore emotional intelligence, conflict resolution, courage, team dynamics, and the invisible work of preparation that separates genuine leaders from those who merely hold titles.\n\nA title can be given. Authority has to be earned.", whatYouLearn: ["The five forms of power — legitimate, reward, coercive, expert, referent — and which create lasting authority", "Emotional intelligence — self-awareness, self-regulation, empathy, motivation, and social skill", "Decision-making under uncertainty — frameworks for consequential choices with incomplete information", "Conflict resolution — how to navigate disagreement and maintain relationships across rupture", "Team dynamics — stages of team development and roles within high-performing teams", "The invisible work of leadership — preparation, follow-through, and trust-building habits", "Crisis communication — how to lead when things are going wrong and everyone is watching", "CEO crisis simulation — a live exercise running a fictional company through a real-time emergency"], outcomes: ["Can identify the five forms of power and explain which create lasting influence", "Has led a team through a live crisis simulation", "Can articulate a personal leadership framework as a set of practices, not a personality description"], quote: "“Leadership is the art of getting someone else to do something because he wants to do it.” — Dwight D. Eisenhower" },
  { slug: "business-models", title: "Business Model Analysis", months: "", tagline: "Break down any business. Understand any market. Find the logic.", summary: "This discipline trains students to look beneath the surface of a company and understand the structure underneath: how it creates value, earns revenue, controls costs, reaches customers, defends margins, and survives competition. Students learn to analyze businesses the way founders, executives, and investors do — not by asking whether an idea sounds impressive, but by asking whether the model works.", why: "Business model literacy is one of the most powerful analytical skills a young person can develop. A student who can walk into any company and explain its model within five minutes has capability that most adults cannot demonstrate.", body: "This discipline trains students to see through businesses the way founders, executives, and investors do. Not at the surface level of branding or hype — but at the structural level where money is made, lost, or defended.\n\nStudents learn to break down any company — from a neighbourhood café to a global technology firm — and explain, with clarity and precision, how it generates revenue, where costs concentrate, what advantage protects it, and what single failure point could bring it down.\n\nThey learn to ask the questions that actually matter: What drives demand? What scales? What breaks? What kills this business if it goes wrong?\n\nThe result is not theory — but fluency. Students graduate able to analyse, challenge, and understand any business put in front of them.", whatYouLearn: ["The eight business models: subscription, marketplace, DTC, advertising, franchise, freemium, professional services, hardware-plus-consumable", "How to identify a company's core value proposition and revenue capture mechanism", "Competitive advantage analysis — cost leadership, differentiation, focus, network effects", "Vulnerability mapping — identifying the greatest strategic risk in any business model", "Investor Briefing format — how analysts present company analysis to investment committees", "Case studies: Netflix, Apple, Amazon, Airbnb, Costco — iconic business model evolution", "Business model disruption — how it happens and why incumbents fail to respond", "Live deconstruction of local businesses: model, strengths, blind spots"], outcomes: ["Identifies the business model of any company within minutes of exposure", "Delivers a five-minute Investor Briefing on a real public company to a professional audience", "Completes four quarterly business model analyses, progressively more sophisticated"], quote: "A brilliant product in the wrong business model is just an expensive lesson." },
  { slug: "intellectual-depth", title: "Intellectual Depth & The Art of Class", months: "", tagline: "Think deeply. Move effortlessly among ideas.", summary: "Technical skill can open doors. Intellectual range and social intelligence determine what happens inside the room. This discipline develops the qualities that make a young person not only capable, but memorable: cultural literacy, conversation, etiquette, taste, listening, judgment, and the ability to engage intelligently across history, philosophy, psychology, business, politics, and the arts. Ability to engage serious ideas without pretension.", why: "These are not decorative skills. They are the foundation of presence — the kind that makes others trust, remember, and respect the person in front of them.", body: "True influence is rarely earned through numbers alone. In the rooms where real decisions are made — private dinners, boardrooms, salons, galleries, and negotiations — people are assessed for their class, judgement, manners, and intellectual depth. This discipline exists to ensure Excalibur students are not only capable, but distinguished.\n\nStudents are formed to converse with ease across philosophy, history, psychology, and the arts — the shared language of educated societies. They engage with the foundations of aristocratic education: Homer on honour and leadership; Plato and Aristotle on virtue, reason, and rhetoric; Seneca and Marcus Aurelius on self-command and duty; Machiavelli on power, perception, and statecraft.\n\nThis is not academic display. It is social fluency. An Excalibur graduate can enter any room and make an impression through depth: thoughtful questions, cultural awareness, composed manners, and the ability to connect ideas effortlessly. This is the quiet authority that marks true class — the kind that opens doors, builds alliances, and endures long after the meeting ends.", whatYouLearn: ["Stoic philosophy as a practical framework — Marcus Aurelius, Seneca, Epictetus applied to modern business", "The art of patronage — what the Medici teach about investing in human potential and building influence", "Literary analysis for leaders — The Great Gatsby, The Alchemist examined through ambition and meaning", "Historical leadership case studies — Lincoln, Churchill, Mandela, Jobs", "The social arts — formal dining protocol, professional conversation, how to work a room without working it", "How to be remembered — substance, specificity, and genuine curiosity about others", "Writing with precision — expressing a complex idea in one clear, specific sentence", "The intellectual habits of the most accomplished people — how they read, think, and synthesize"], outcomes: ["References classical philosophy and history naturally in professional conversations", "Navigates a formal dinner or professional networking event with ease", "Has developed a personal reading practice and can discuss ideas from at least five significant books"], quote: "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch" },
  { slug: "college-admissions", title: "College Admissions & Personal Development", months: "", tagline: "Start forging your own path. Dig Deeper. Ignite your true passions.", summary: "This module helps students prepare not only for college applications, but for the deeper question behind them: who they are becoming, what they care about, and where their energy naturally comes alive.", why: "College applications are a mirror. The student who has spent time understanding their own direction, building real things, and developing a genuine point of view will always present more compellingly than the student who assembled a transcript. Excalibur exists to build that student.", body: "This module helps students prepare not only for college applications, but for the deeper question behind them: who they are becoming, what they care about, and where their energy naturally comes alive.\n\nStudents work with Excalibur’s college advisor on application strategy, personal narrative, portfolio presentation, recommendation preparation, interview readiness, and how their Excalibur experience can strengthen their college applications and future academic goals.\n\nEach student participates in monthly 1:1 personal development sessions designed to help them reflect seriously on their strengths, interests, ambitions, values, and sense of direction. The goal is not to force a life plan too early, but to help each student understand what creates curiosity, discipline, and spark — and how to begin building around it.", whatYouLearn: ["How to identify and articulate your intellectual interests and personal values", "College application strategy — positioning, school selection, timeline, and narrative arc", "How to write a compelling personal statement rooted in genuine experience", "How to present your Excalibur portfolio and real-world work in applications", "Interview preparation — composure, storytelling, and how to handle hard questions", "How to approach recommendation letters — who to ask, how to guide them, what to include", "Personal reflection practice — strengths, interests, patterns, and direction", "How to build a personal roadmap that extends beyond the application season"], outcomes: ["Has a completed college application strategy and timeline", "Has written a personal statement draft reviewed by the Excalibur college advisor", "Has participated in at least four 1:1 personal development sessions and documented key findings about their own direction"], quote: "The student who knows who they are will always write a better essay than the student who simply knows what they have done." },
  { slug: "industry-sectors", title: "Industry Sectors Rotation", months: "One new sector each month", tagline: "Know every industry. Own any room.", summary: "Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. Over ten months, students explore twelve major sectors of modern commerce.", why: "Most people leave education with deep familiarity of one or two sectors and almost no working knowledge of everything else. An Excalibur graduate who can speak with informed intelligence across ten industries has social and professional range that almost no peer can match.", body: "Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. Over ten months, students explore technology, finance, real estate, food and hospitality, e-commerce, healthcare, media, automotive and sports, manufacturing, energy and sustainability, and luxury brands. By graduation, every student holds a Sector Journal documenting all twelve.", whatYouLearn: ["Technology & AI — platform economics, software margins, how the most valuable companies were built", "Finance & Venture Capital — equity, debt, cap tables, term sheets, how investors decide", "Real Estate — development economics, cap rates, wealth-building mechanics", "Food & Hospitality — unit economics, brand-building in a commoditized market", "E-Commerce & Retail — customer acquisition, lifetime value, supply chains, DTC brands", "Healthcare & Biotech — FDA pathways, healthcare economics, why it requires unusual patience", "Media & Entertainment — attention economics, the creator economy, IP valuation", "Legal & Professional Services — contracts, IP, equity agreements every entrepreneur needs to understand", "Manufacturing & Supply Chain — how physical things are made, moved, and sold at scale", "Energy & Sustainability — renewable economics, carbon markets, the greatest entrepreneurial opportunity ahead", "Automotive & Sports — automotive business models, motorsport economics, franchise valuation, athlete branding", "Luxury & Premium Brands — psychology of desire, scarcity, heritage, and premium pricing"], outcomes: ["Holds a Sector Journal with twelve completed industry analyses", "Can speak knowledgeably about any of the twelve sectors to a professional in that field", "Has met and engaged with twelve guest speakers from twelve different industries"], quote: "The more industries the student understands, the more they realize how similar the underlying principles are — and how different the specifics are. Both things matter." },
];

const sectors = [
  { name: "Technology & AI", n: "Month 1", desc: "Platform economics, software margins, and how the most valuable companies in history were built on code." },
  { name: "Finance & Venture Capital", n: "Month 2", desc: "How money moves, compounds, and builds empires. Equity, debt, cap tables, and investor decision logic." },
  { name: "Real Estate", n: "Month 3", desc: "The oldest wealth-building vehicle in history. Development economics, cap rates, cash flow vs. appreciation." },
  { name: "Food & Hospitality", n: "Month 4", desc: "Unit economics of a restaurant, the hospitality mindset, and how operators like Danny Meyer redefined service." },
  { name: "E-Commerce & Retail", n: "Month 5", desc: "Customer acquisition costs, lifetime value, supply chains, and how the best DTC brands build communities." },
  { name: "Healthcare & Biotech", n: "Month 6", desc: "FDA pathways, healthcare economics, and why healthcare entrepreneurship requires unusual patience and conviction." },
  { name: "Media & Entertainment", n: "Month 7", desc: "How attention is monetized, the creator economy, and the economics of culture." },
  { name: "Automotive & Sports", n: "Month 8", desc: "Automotive business models, motorsport economics, athlete branding, sponsorship, and franchise valuation." },
  { name: "Manufacturing & Supply Chain", n: "Month 9", desc: "How physical things are made, moved, and sold at scale. Sourcing, quality control, inventory economics." },
  { name: "Energy & Sustainability", n: "Month 10", desc: "Renewable energy economics, carbon markets, and the greatest entrepreneurial opportunity of the next generation." },
  { name: "Luxury & Premium Brands", n: "Months 9 & 10", desc: "The psychology and economics of desire. How LVMH and Ferrari charge ten times the rational price — and have waitlists." },
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
    shortBio: "Founder & CEO of Excalibur Academy. Born in New York City and Russian by heritage, Alexander’s worldview was shaped by St. Petersburg, Paris, London, and the wider European cultural tradition. Educated from age 12 at a British private boarding school outside London, he later earned his degree from Tufts University in History and Political Science. A serial entrepreneur since first year of college, Alexander has built ventures across the U.S. and Europe, including a youth discussion and debate club, and an art salon series hosted in historic venues with curators, collectors, historians, and cultural speakers. He now leads Excalibur Academy, a leadership and entrepreneurship institute for ambitious high school students in Orange County.",
    tags: ["Academy Founder", "Program Architect", "Entrepreneurship", "Vision & Strategy"],
    linkedin: "https://www.linkedin.com/in/alexander-milstein",
    bio: "Founder & CEO of Excalibur Academy. Born in New York City and Russian by heritage, Alexander’s worldview was shaped by St. Petersburg, Paris, London, and the wider European cultural tradition. At twelve, he left for boarding school outside London — an experience that built independence early and exposed him to a more global understanding of education, discipline, class, culture, and ambition.\n\nAlexander later earned his bachelor’s degree from Tufts University, double majoring in History and Political Science. His intellectual interests have always lived at the intersection of history, power, art, leadership, and human character — from ancient Greek civilization and classical art to political debate, philosophy, literature, and conversations that move beyond the surface.\n\nAlexander began building ventures in college, founding a youth political debate and leadership club, and later a cultural company that produced immersive History of Art lecture salons in St. Petersburg. Hosted in historic venues, these salons brought together museum curators, collectors, historians, academics, speakers, and cultural figures — reviving the spirit of intellectual society around art, history, and serious conversation.\n\nWith Excalibur Academy, Alexander is building the institution where students are not simply taught information, but formed through public speaking, business judgment, intellectual depth, leadership, entrepreneurship, and real-world experience. Excalibur is built for students ready to build and lead their own path — through clear thinking, strong communication, real work, and the courage to begin."
  },
  {
    name: "Bill Morris",
    role: "Academy Dean & Senior Instructor",
    img: "https://i.imgur.com/GDkTAdw.jpeg",
    isLogo: false,
    shortBio: "Academy Dean and Lead Faculty. Became a Wall Street executive at age 30, heading International Finance and Operations for investment bank Kidder Peabody in London, Paris, Geneva, Zurich, Hong Kong and Tokyo. Former Executive Vice President and Chief Financial Officer of Media Arts Group (NYSE Company). Former Citigroup Managing Director with over 100 M&A transactions and 600+ CEO advisory engagements, EVP/CFO of two NYSE-listed companies, TEDx speaker, and published author. Adjunct professor at Georgetown University and UC Irvine’s Paul Merage School of Business. Sits on three corporate boards. Has spoken at leading global and national institutions from West Point to Stanford.",
    tags: ["M&A Strategy", "Finance", "Leadership", "TEDx Speaker", "Author", "Georgetown MBA Professor"],
    linkedin: "https://www.linkedin.com/in/billmorris1/",
    bio: "William Morris is a transformational finance and strategy executive with over 30 years of experience at the highest levels of Wall Street, corporate leadership, and executive education. He began his career at Exxon Corporation, earning four promotions in five years, before heading international finance and operations for Kidder Peabody across London, Paris, Geneva, Zurich, Hong Kong, and Tokyo. As Senior Vice President and Managing Director at Geneva Capital Markets — then a division of Citigroup — he completed over 100 closed middle-market M&A transactions and advised more than 600 private-company CEOs on valuation, exits, and strategy. He later served as Executive Vice President and Chief Financial Officer of Media Arts Group, a NYSE-listed company, overseeing financial operations, investor relations, and the company's $450M brand portfolio. A sought-after educator and speaker, Bill is currently an Adjunct Professor at Georgetown University's McDonough School of Business, where he teaches advanced MBA courses on strategic behavior and competitive dynamics. He is the author of The Formula for Success, a TEDx speaker, and the holder of a Guinness World Record — 20,100 consecutive sit-ups in 11 hours and 32 minutes — achieved while raising over $150,000 for the Make-A-Wish Foundation. At Excalibur Academy, Bill serves as Academy Director, overseeing curriculum strategy, faculty coordination, guest speaker programming, and academic standards across all programs."
  },
  {
    name: "Chip Pankow",
    role: "Lead Program Director",
    img: "https://i.imgur.com/Ckny7HG.png",
    isLogo: false,
    shortBio: "Program Director. Lead Faculty. Former CEO who created the world's first autonomous racing series, co-founded a global motorsport franchise broadcast on ESPN and NBC, directed Formula 1 BMW's global program, which developed multiple Formula 1 World Champions including Sebastian Vettel and Nico Rosberg. Secured over $100M in institutional funding. Oversaw a $13 billion NASDAQ listing, establishing a key innovation hub for next-generation electric vehicle platforms. As CEO of Roborace, transformed a conceptual initiative into the world's first autonomous racing competition, achieving a Guinness World Record for autonomous performance. Professional Auto & Rally Racer.",
    tags: ["Entrepreneurship", "Autonomous Systems", "EV Technology", "Global Motorsport", "Startup Scaling", "Institutional Funding"],
    linkedin: "https://www.linkedin.com/in/chip-pankow-a2977536/",
    bio: "Chip Pankow is an entrepreneur and chief executive known for building and scaling ventures across technology, mobility, and global sports. Guided by a passion for the projects he pursues, he has consistently translated bold ideas into high-impact platforms through a combination of technical fluency, operational discipline, and decisive execution. In the technology sector, Pankow has led complex, multidisciplinary teams working at the forefront of innovation. As CEO of Roborace, he transformed a conceptual initiative into the world's first autonomous racing competition, delivering industry-first advancements in AI vehicle control, race logic, and real-time digital twin environments. The program achieved a Guinness World Record for autonomous performance and a record-setting run at the Goodwood Festival of Speed. He later led U.S. operations for Arrival, overseeing engineering, software, and simulation teams and contributing to the company's NASDAQ listing, establishing a key innovation hub for next-generation electric vehicle platforms. Pankow's entrepreneurial foundation was built through the creation of globally recognized sports properties. As Founder and CEO of Global Rallycross, he introduced modern rallycross to the United States at X-Games and scaled it into a premier motorsport with drivers including Ken Block, Travis Pastrana and Tanner Foust, featuring broadcast distribution in over 130 countries and partnerships with leading media organizations. Earlier, as Series Director of Formula BMW, he built a leading international driver development platform that became the proven pathway to Formula 1 before its successful transition to new ownership. He also founded Emotive, an experiential marketing company that became a trusted partner to global automotive brands including Ferrari, BMW, Audi, Michelin, and General Motors. Currently, as Chief Executive Officer of SparrowBid, Pankow is leading the development of a next-generation travel marketplace designed to redefine how consumers access and price hotel inventory in this highly competitive $400 billion industry. His success is rooted in his ability to identify opportunity, align stakeholders, and execute at speed — consistently turning passion-driven ideas into scalable, enduring platforms."
  },
  {
    name: "Erik Dostal",
    role: "Senior Program Director",
    img: "https://i.imgur.com/HV7hqca.jpeg",
    isLogo: false,
    shortBio: "Program Director. MBA professor. Founder and CEO of international educational institute serving over 6,000 students across 25 franchises worldwide with campuses in Huntington Beach and Europe, former advisor to a national Ministry of Education of Czech Republic, played for the U.S. Youth National Soccer team, published textbook author, and international academic accreditor.",
    tags: ["Education Systems", "Curriculum Design", "International Accreditation", "Franchise Development", "Entrepreneurship"],
    bio: "Erik Dostal is the founder and president of CA Institute, a comprehensive educational institution he built from the ground up into a leading international provider of English language, business, and professional education — serving over 6,000 students across 25 international franchise locations. Over nearly three decades, Erik has demonstrated what it means to build an educational institution that operates at genuine scale: generating $4.8M in annual revenues, sustaining 20% year-over-year growth, and closing franchise deals spanning multiple continents. He holds an MA in TESOL from the University of Chichester and NILE, an MBA from IDRAC Business School, and a BA in Cultural Anthropology from Chapman University, where he was also a collegiate athlete. A former U.S. Youth National Team soccer player, Erik has channeled his competitive background into youth development, coaching, and the design of high-performance learning environments. He has authored multiple textbooks and publications on teaching methodology, language acquisition, and business education, and has organized international language symposiums attracting thousands of delegates from around the world. A former advisor to the Czech Ministry of Education and a certified international academic accreditor, his work has received recognition including European Small Business Awards recognition across multiple years. At Excalibur Academy, Erik brings the rare combination of deep pedagogical expertise, proven franchise and systems-building experience, and a practitioner's understanding of what it takes to build educational institutions that last."
  },
  {
    name: "Christopher Sanders",
    role: "Senior Public Speaking Instructor",
    img: "https://i.imgur.com/EELzLmn.jpeg",
    isLogo: false,
    shortBio: "Servant Leader, Keynote Speaker, Doctoral Candidate. Public safety professional and leadership-focused educator currently serving as a Deputy Sheriff with the Orange County Sheriff’s Department. Alongside his law enforcement role, Christopher teaches criminal justice as an instructor and adjunct professor, and is a doctoral candidate with an MBA background. A keynote speaker and mindset coach, focused on discipline, self-mastery, and personal transformation — bridging real-world public service experience with leadership development and community impact.",
    tags: ["Public Speaking", "Leadership Development", "Mindset Coaching", "Criminal Justice", "MBA", "Doctoral Candidate"],
    linkedin: "https://www.linkedin.com/in/christopher-sanders-abd-mba-dre-97a85332/",
    bio: "Christopher Sanders is a servant leader, keynote speaker, and doctoral candidate whose career spans law enforcement, higher education, and transformational personal development. A Deputy Sheriff II with the Orange County Sheriff's Department, he brings to every session the clarity, composure, and command presence that comes from operating under genuine high-stakes pressure. He holds an MBA in Strategic Management from Davenport University — graduating with a 3.95 GPA — and is completing a Doctorate in Public Administration at the University of La Verne. He has served as an Adjunct Professor at Rancho Santiago Community College District and at Davenport University, where he taught across multiple disciplines for nearly four years. Beyond the classroom, Christopher runs his own leadership and mindset development seminars — most recently his Living Life Unchained series in Irvine, California — focused on breaking limiting beliefs, building discipline-based systems, and creating lasting behavioral change in adults and young professionals. His StrengthsFinder profile reflects the qualities that define his teaching: Achiever, Futuristic, Focus, Strategic, and Positivity. At Excalibur Academy, Christopher owns the public speaking block that runs through every single session — developing voice mechanics, physical presence, impromptu delivery, advanced rhetoric, and the kind of composure under pressure that most teenagers have never been asked to find."
  },
  {
    name: "Amina Abdulaeva",
    role: "Operations Director",
    img: "https://i.imgur.com/SeOkgm8.jpeg",
    isLogo: false,
    shortBio: "Multilingual operations professional with over five years of experience delivering complex programmes across tourism, hospitality, entertainment, and healthcare. Master's in Labor Economics, Saint Petersburg State University of Economics. At Excalibur Academy, she oversees all operational and administrative infrastructure — scheduling, venues, student communications, and every logistical element of the academy's events and sessions.",
    tags: ["Project Coordination", "Operations Management", "Program Launch", "Multilingual", "Stakeholder Management"],
    linkedin: "https://www.linkedin.com/in/amina-abdulaeva-a2a68729a/",
    bio: "Amina Abdulaeva is a multilingual project coordinator and operations professional with over five years of experience delivering complex programs across tourism, entertainment, hospitality, and healthcare. She holds a Master's degree in Labor Economics from Saint Petersburg State University of Economics, a Bachelor's in International and Strategic Management from Saint Petersburg State University, and completed an exchange semester at the Norwegian School of Economics. Her career spans roles of increasing responsibility across sectors — from coordinating end-to-end international tourism programs and managing the full operational launch of a luxury hotel, to leading the business development and execution of a regional tourist entertainment program that achieved 90% B2B market awareness at launch and secured national television coverage. Most recently, she served as Operations and Product Launch Coordinator at a medical private practice, where she designed and launched a new service package that increased the average client transaction by 80%. Fluent in English and Spanish, and a native Russian speaker, Amina brings rare cross-cultural depth and operational precision to every environment she enters. At Excalibur Academy, she oversees all operational and administrative infrastructure — faculty scheduling, venue coordination, student communications, event production, and the logistical execution of every session, competition, and milestone event the academy runs."
  },
];

const handson = [
  { title: "The Junior Consultant Program", tag: "TEAMS OF 4 · REAL BUSINESS CONSULTING", desc: "Student teams are paired with a real local business. Over three weeks, each team conducts a structured professional engagement: on-site observation, customer interviews, competitive analysis, SWOT assessment, and marketing strategy. The program culminates in a Boardroom Finale — a formal presentation of the consultant reports to the business owner and the executive team.", outcome: "A client-facing consulting report, a formal presentation, and a documented example of applied business judgment." },
  { title: "The Apprentice Externship", tag: "WORK EXPERIENCE · REAL COMPANY", desc: "After eight months of formation, each Full Program student is placed inside a real local business in the industry of their choosing. Students attend real meetings, contribute to active projects, and produce three formal deliverables: a Business Map, a reflective journal, and a Recommendation Memo identifying one strategic opportunity the business is currently missing.", outcome: "Three professional-grade deliverables, direct experience inside a working business, and a reference from an employer who has seen them operate under real conditions." },
  { title: "Micro-Business Launch", tag: "TEAMS · SEED-FUNDED · MENTORED", desc: "In the Flagship's penultimate program month, student teams build and launch micro-ventures designed to reach actual customers and aimed to generate revenue. Each team receives faculty guidance, structured accountability, and access to seed support through the Excalibur network of business owners, investors, mentors, and allies. The goal is not to simulate entrepreneurship, but to experience the discipline of building something that is tested outside the room — in the real world with real constraints and realities.", outcome: "A micro-business brought from idea to launch — with mentor support, market pressure, real customers, and the lasting understanding that hard work, passion and discipline can turn a dream into reality." },
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
  { name: "Wave 1", season: "Spring", dates: "Apr 5 – May 14", deadline: "Mar 20", status: "open", wd: { days: "Mon & Wed", time: "4:00–6:30 PM", left: 6 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 4 } },
  { name: "Wave 2", season: "Summer", dates: "Jun 16 – Jul 23", deadline: "May 30", status: "open", wd: { days: "Mon & Wed", time: "4:00–6:30 PM", left: 14 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 18 } },
  { name: "Wave 3", season: "Fall", dates: "Oct 5 – Nov 14", deadline: "Sep 20", status: "soon", wd: { days: "Mon & Wed", time: "4:00–6:30 PM", left: 25 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 25 } },
  { name: "Wave 4", season: "Winter", dates: "Jan 5 – Feb 13", deadline: "Dec 20", status: "future", wd: { days: "Mon & Wed", time: "4:00–6:30 PM", left: 25 }, we: { days: "Sunday", time: "10:30 AM–3:45 PM", left: 25 } },
];

// ── SHARED UI ──
const sc = (s) => ({ open: "#5DB075", soon: gold, future: "#444" }[s]);
const sl = (s) => ({ open: "Enrolling Now", soon: "Opening Soon", future: "Future Wave" }[s]);

function SBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ fontFamily: sans, padding: "9px 22px", background: active ? "rgba(199,171,117,.08)" : "transparent", border: `1px solid ${active ? "rgba(199,171,117,.3)" : "#1a1a1a"}`, color: active ? gold : "#FBF7EE", fontSize: 13, cursor: "pointer", transition: "all .25s", fontWeight: 500 }}>{children}</button>
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
      <span style={{ fontFamily: sans, fontSize: 14, color: solid ? "#FBF7EE" : "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{children}</span>
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
  const [programsOpen, setProgramsOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);

  const pagePhotos = {
    home: "https://i.imgur.com/mkQ2Nde.jpeg",
    about: "https://i.imgur.com/sAPvGtO.jpeg",
    programs: "https://i.imgur.com/1clG3YB.jpeg",
    "summer-detail": "https://i.imgur.com/N4OB8dS.jpeg",
    "flagship-detail": "https://i.imgur.com/eyeb9rX.jpeg",
    intensive: "https://i.imgur.com/P86gddQ.png",
    curriculum: "https://i.imgur.com/vG8mtVQ.jpeg",
    faculty: "https://i.imgur.com/Cv3LTsu.jpeg",
    beyond: "https://i.imgur.com/1QP3p5p.jpeg",
    apply: "https://i.imgur.com/aDzpYsK.jpeg",
    admissions: "https://i.imgur.com/aDzpYsK.jpeg",
    contact: "https://i.imgur.com/5xUqLbH.jpeg",
    events: "https://i.imgur.com/SjLpa14.jpeg",
    Contact: "https://i.imgur.com/5xUqLbH.jpeg",
    Events: "https://i.imgur.com/SjLpa14.jpeg",
  };

  const allLinks = [
    ["Home", "home", null],
    ["The Academy", "about", null],
    ["Our Programs", "programs", [
      { label: "Summer Intensive", page: "summer-detail", sub: "July & August · Two Weeks" },
      { label: "Flagship 10-Month", page: "flagship-detail", sub: "Full Immersion · Sep–Jun" },
      { label: "Six-Week Intensive", page: "intensive", sub: "Four Waves Per Year" },
      { label: "View All Programs", page: "programs", sub: "Compare All Three" },
    ]],
    ["Curriculum", "curriculum", null],
    ["Faculty", "faculty", null],
    ["The Arena", "beyond", null],
    ["Admissions", "admissions", null],
    ["Contact", "apply", null],
    ["Events", "events", null],
  ];
  const go = (p) => { setPage(p); setMenuOpen(false); setProgramsOpen(false); setHoveredNav(null); };

  const activePhoto = hoveredNav ? (pagePhotos[hoveredNav] || pagePhotos.home) : pagePhotos.home;

  return (
    <>
      {/* NAV BAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(0,0,0,.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(199,171,117,.12)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* LEFT  -  logo + name + motto (desktop) | name only (mobile) */}
          <div onClick={() => go("home")} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", flex: isMobile ? 1 : "0 0 auto" }}>
            {!isMobile && <div style={{ width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src={LOGO_URL} alt="Excalibur Academy" style={{ width: 52, height: 52, objectFit: "contain" }} />
            </div>}
            <div style={{ paddingLeft: isMobile ? 0 : 0 }}>
              <div style={{ fontFamily: "'Forum', 'Copperplate', Georgia, serif", fontSize: isMobile ? 18 : 22, letterSpacing: "0.28em", color: "#FBF7EE", textTransform: "uppercase", lineHeight: 1.15, whiteSpace: "nowrap" }}>Excalibur Academy</div>
              {!isMobile && <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 11, letterSpacing: "0.16em", color: gold, fontStyle: "italic", marginTop: 3, whiteSpace: "nowrap" }}>Forging the Leaders of Tomorrow</div>}
            </div>
          </div>

          {/* RIGHT  -  APPLY NOW + MENU */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
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
        overflowY: "auto",
      }}>
        {/* Background wordmark  -  very faint */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
          <span style={{ fontFamily: "'Forum', serif", fontSize: "clamp(120px,20vw,220px)", color: "rgba(199,171,117,.04)", letterSpacing: "0.15em", textTransform: "uppercase", userSelect: "none", whiteSpace: "nowrap" }}>EXCALIBUR</span>
        </div>

        {/* LEFT  -  nav links */}
        <div style={{ flex: 1, padding: isMobile ? "36px 28px 48px" : "48px 72px 64px", display: "flex", flexDirection: "column", justifyContent: "flex-start", position: "relative", zIndex: 1 }}>
          {allLinks.map(([l, p, subs], i) => (
            <div key={l}>
              <div onClick={() => subs ? setProgramsOpen(o => !o) : go(p)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: isMobile ? "14px 0" : "16px 0",
                borderBottom: "1px solid rgba(199,171,117,.07)",
                cursor: "pointer",
              }}
                onMouseEnter={e => { const ml = e.currentTarget.querySelector(".ml"); const arr = e.currentTarget.querySelector(".arr"); if(ml) ml.style.color = gold; if(arr) { arr.style.opacity = "1"; arr.style.transform = "translateX(6px)"; } setHoveredNav(pagePhotos[p] ? p : l); }}
                onMouseLeave={e => { const ml = e.currentTarget.querySelector(".ml"); const arr = e.currentTarget.querySelector(".arr"); if(ml) ml.style.color = "#FBF7EE"; if(arr) { arr.style.opacity = "0.3"; arr.style.transform = "translateX(0)"; } setHoveredNav(null); }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, color: "rgba(199,171,117,.3)", fontStyle: "italic" }}>0{i + 1}</span>
                  <span className="ml" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: isMobile ? 26 : 36, fontWeight: 500, color: "#FBF7EE", letterSpacing: "0.04em", transition: "color .2s" }}>{l}</span>
                </div>
                <span className="arr" style={{ fontFamily: sans, fontSize: subs ? 22 : 18, color: gold, opacity: 0.3, transition: "all .25s", transform: "translateX(0)" }}>{subs ? (programsOpen ? "−" : "+") : "→"}</span>
              </div>
              {subs && programsOpen && (
                <div style={{ paddingLeft: isMobile ? 20 : 36, paddingBottom: 12, borderBottom: "1px solid rgba(199,171,117,.07)" }}>
                  {subs.map((sub) => (
                    <div key={sub.page} onClick={() => go(sub.page)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", cursor: "pointer", borderBottom: "1px solid rgba(199,171,117,.04)" }}
                      onMouseEnter={e => e.currentTarget.querySelector(".sl").style.color = gold}
                      onMouseLeave={e => e.currentTarget.querySelector(".sl").style.color = "#FBF7EE"}
                    >
                      <div>
                        <div className="sl" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 18 : 22, fontWeight: 500, color: "#FBF7EE", lineHeight: 1.2, transition: "color .2s" }}>{sub.label}</div>
                        <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: gold, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>{sub.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Apply Now in menu */}
          <button onClick={() => go("apply")} style={{ marginTop: 40, alignSelf: "flex-start", fontFamily: sans, background: gold, color: "#000", padding: "14px 40px", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
            APPLY NOW →
          </button>
        </div>

        {/* RIGHT  -  photo panel (desktop only) */}
        {!isMobile && (
          <div style={{ width: "38%", position: "relative", flexShrink: 0 }}>
            <img src={activePhoto} alt="Excalibur Academy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transition: "opacity .35s ease" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, rgba(0,0,0,.3) 40%, transparent 100%)" }} />
            {/* Bottom label */}
            <div style={{ position: "absolute", bottom: 48, left: 40 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#FBF7EE", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Orange County · California</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: gold, fontStyle: "italic", lineHeight: 1.4, whiteSpace: "nowrap" }}>Forging the Leaders of Tomorrow.</p>
            </div>
            {/* Oxford-style CTA card  -  top right of photo */}
            <div style={{
              position: "absolute", top: 40, right: 36,
              background: gold, padding: "24px 28px", maxWidth: 240,
              cursor: "pointer",
            }} onClick={() => go("apply")}>
              <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.25em", color: "rgba(0,0,0,.55)", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Summer 2026</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 600, color: "#000", lineHeight: 1.25, marginBottom: 14 }}>Now Accepting Applications.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: "#000", letterSpacing: "0.08em" }}>Apply Now</span>
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
  { n: "01", tab: "Investor Pitch", title: "Live Investor Pitch & Funding", tagline: "Public performance. Real feedback. Real judges. Real stakes.", body: "Students present their final venture concepts before a panel of entrepreneurs, investors, and senior professionals in a formal pitch competition inspired by Shark Tank.\n\nThis is not a classroom showcase. It is a judged venture forum where students are expected to defend their ideas, answer real investor & expert questions, and demonstrate the quality of their leadership thinking under pressure. Prizes are awarded, including seed investment from local investors and Academy allies. Feedback is recorded, and the experience becomes part of the student\u2019s portfolio." },
  { n: "02", tab: "Consulting", title: "Consulting Engagement", tagline: "A professional deliverable with a real client's name on it.", body: "Each student completes a consulting assignment for a local business, producing a deliverable intended for real use by the organisation. Not a simulation — a real client, a real brief, a real outcome. Students work in teams, are supervised by faculty, and present their findings directly to the business owner." },
  { n: "03", tab: "Micro-Business", title: "Micro-Business Launch", tagline: "Real customers. Real revenue. Real accountability.", body: "In the Flagship Program, students do more than pitch ideas \u2014 they <em>forge</em> their dreams. Teams, under assigned mentors\u2019 guidance develop micro-ventures, test them with customers, manage real budgets, create marketing campaigns, pursue revenue, and learn what happens when an idea meets the market.\n\nEvery launch is documented and included in the Excalibur Portfolio, giving students a record of real execution, not just classroom theory." },
  { n: "04", tab: "Externship", title: "Apprenticeship & Externship", tagline: "An internship in the industry sector of the student's choice.", body: "Students complete a 4\u20136 week externship inside a company or professional environment connected to their chosen industry sector, sourced through the Academy\u2019s network of business and industry partners.\n\nThe world often asks young people for experience before giving them the chance to earn it. Excalibur changes that equation. Through selected externships, students observe real work, contribute where appropriate, build professional references, and document the experience as part of their graduation portfolio." },
  { n: "05", tab: "Competition", title: "Competition Record", tagline: "Verified results. Judged by professionals.", body: "Students participate in judged pitch competitions throughout the programs, gaining experience with formal evaluation, structured feedback, and competitive recognition. Results are verified, documented, and included in the portfolio — evidence of performance under genuine competitive environment." },
  { n: "06", tab: "Portfolio", title: "Bound Graduation Portfolio", tagline: "The complete record. Professionally assembled.", body: "All major analyses, reports, awards, presentations, and business plans are professionally compiled into a single, coherent portfolio — a physical and digital record of everything a student built, wrote, delivered, and won across the programs. Presented at graduation. Submitted with university applications." },
  { n: "07", tab: "Recommendations", title: "Faculty Recommendations", tagline: "Letters grounded in direct observation.", body: "Excalibur recommendations are written by lead faculty, top executives, and practitioners who have worked directly with the student and can speak with specificity about performance, judgment, communication, leadership, and growth over time. Not form letters. Observations from professionals who have operated at the highest levels of their fields and watched the student do the same." },
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
            <span style={{ fontFamily: serif, fontSize: 11, color: "#C7AB75", letterSpacing: "0.1em" }}>{item.n}</span>
            {isMobile && <span style={{ fontFamily: sans, fontSize: 14, color: isOpen(i) ? gold : "#FBF7EE", transition: "transform .25s", display: "inline-block", transform: isOpen(i) ? "rotate(45deg)" : "none" }}>+</span>}
          </div>
          <h4 style={{ fontFamily: serif, fontSize: isMobile ? 22 : 24, fontWeight: 600, color: isOpen(i) ? gold : "#E8E0D8", lineHeight: 1.3, marginBottom: 14 }}>{item.title}</h4>
          {isOpen(i) && (
            <div className={isMobile ? "mod-content" : ""}>
              <div style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
              <p style={{ fontFamily: serif, fontSize: 13, color: gold, fontStyle: "italic", lineHeight: 1.5, marginBottom: 12 }}>{item.tagline}</p>
              <div style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>
                {item.body.split('\n\n').map((para, pi) => (
                  <p key={pi} style={{ marginBottom: pi < item.body.split('\n\n').length - 1 ? 12 : 0 }} dangerouslySetInnerHTML={{ __html: para }} />
                ))}
              </div>
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
                  <div style={{ fontFamily: sans, fontSize: 13, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.8 }}>
                    {it.body.split('\n\n').map((para, pi) => (
                      <p key={pi} style={{ marginBottom: pi < it.body.split('\n\n').length - 1 ? 12 : 0 }} dangerouslySetInnerHTML={{ __html: para }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Desktop — index left, detail right (like a hotel menu / gallery catalogue)
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, border: "1px solid rgba(0,0,0,.08)" }}>
          {/* Left  -  index */}
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
          {/* Right  -  detail panel */}
          <div style={{ padding: "44px 52px", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 360 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 20 }}>
                <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, color: "rgba(0,0,0,.12)", fontStyle: "italic" }}>{item.n}</span>
                <h3 style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: "#000", lineHeight: 1.1 }}>{item.title}</h3>
              </div>
              <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #8B6914, transparent)", marginBottom: 20 }} />
              <p style={{ fontFamily: serif, fontSize: 16, color: "#8B6914", fontStyle: "italic", marginBottom: 20, lineHeight: 1.5 }}>{item.tagline}</p>
              <div style={{ fontFamily: sans, fontSize: 14, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.9, maxWidth: 560 }}>
                {item.body.split('\n\n').map((para, pi) => (
                  <p key={pi} style={{ marginBottom: pi < item.body.split('\n\n').length - 1 ? 14 : 0 }} dangerouslySetInnerHTML={{ __html: para }} />
                ))}
              </div>
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
            <span style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", fontWeight: 300, letterSpacing: "0.03em" }}>125 Newport Center Drive</span>
            <span style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", fontWeight: 300, letterSpacing: "0.03em" }}>Newport Beach, CA 92660</span>
          </div>
          {/* Applications email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, borderLeft: isMobile ? "none" : "1px solid rgba(199,171,117,.15)", paddingLeft: isMobile ? 0 : 48 }}>
            <span style={{ fontFamily: eyebrow_font, fontSize: 9, color: gold, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>ADMISSIONS</span>
            <a href="mailto:apply@excaliburacademy.org" style={{ fontFamily: serif, fontSize: 13, color: "#FBF7EE", textDecoration: "none", letterSpacing: "0.05em", fontStyle: "italic", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#FBF7EE"}>apply@excaliburacademy.org</a>
          </div>
          {/* Support email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, borderLeft: isMobile ? "none" : "1px solid rgba(199,171,117,.15)", paddingLeft: isMobile ? 0 : 48 }}>
            <span style={{ fontFamily: eyebrow_font, fontSize: 9, color: gold, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>SUPPORT & GENERAL INQUIRIES</span>
            <a href="mailto:support@excaliburacademy.org" style={{ fontFamily: serif, fontSize: 13, color: "#FBF7EE", textDecoration: "none", letterSpacing: "0.05em", fontStyle: "italic", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "#FBF7EE"}>support@excaliburacademy.org</a>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 24px" : "20px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: sans, fontSize: 9, color: "#C7AB75", letterSpacing: "0.08em", textTransform: "uppercase" }}>© 2026 Excalibur Academy LLC · Orange County, California</p>
        <p style={{ fontFamily: sans, fontSize: 9, color: "rgba(251,247,238,.4)", letterSpacing: "0.06em" }}>125 Newport Center Drive, Newport Beach, CA 92660</p>
      </div>
    </footer>
  );
}


// ─────────────────────────────────────────────
// INTERACTIVE DAILY SCHEDULE
// ─────────────────────────────────────────────
const summerSchedule = [
  { time: "9:15 AM", dur: "15 min", block: "Arrival", instructor: null, role: null, img: null, desc: "Students are welcomed by the Teaching Assistants, settle in with their cohort, and begin the day in an atmosphere that feels lively, polished, and personal. There is time to connect, get comfortable, and step into the rhythm of the program before the first session begins.", color: "rgba(251,247,238,0.45)" },
  { time: "9:30 AM", dur: "45 min", block: "Public Speaking & Executive Communication", instructor: "", role: "Senior Public Speaking Instructor", img: null, desc: "Students are on their feet from the start. Voice, presence, eye contact, body language, impromptu delivery, pitch mechanics, rhetorical precision, and confidence under pressure. This opening block runs every day, building the communication foundation that everything else depends on.", color: "#C7AB75" },
  { time: "10:15 AM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured pause between sessions, with catered snacks and refreshments provided by the Academy — from light bites and fruit bowls to healthy açaí bowls, smoothies, milkshakes, and seasonal selections. Students recharge, listen to lounge music, and continue conversations informally with classmates, Teaching Assistants, faculty, and instructors. Often, some of the most interesting exchanges of the day happen here — between sessions, in the moments when ideas keep moving.", color: "rgba(251,247,238,0.45)" },
  { time: "10:30 AM", dur: "90 min", block: "Venture Development Studio", instructor: "", role: "Lead Faculty", img: null, desc: "The central working block of the Intensive. Students build venture concepts through entrepreneurial mindset, business fundamentals, market research, customer psychology, competitive analysis, brand positioning, marketing strategy, and business plan development.", color: "#A89060" },
  { time: "12:00 PM", dur: "30 min", block: "Lunch", instructor: null, role: null, img: null, desc: "Students enjoy a catered three-course lunch from a rotating selection of local restaurants, with menus that may include Mediterranean mezze and grilled entrées, coastal California salads and seasonal bowls, Italian pastas, French-inspired plates, Japanese bento-style selections, and modern American favorites. Lunch is also a time for conversation — with classmates, Teaching Assistants, faculty, and instructors — in a relaxed but polished setting. Social intelligence is part of the Excalibur experience: listening well, asking thoughtful questions, carrying oneself with ease, and making others feel seen and remembered. Dietary restrictions and allergies are requested before the program begins.", color: "rgba(251,247,238,0.45)" },
  { time: "12:30 PM", dur: "60 min", block: "Distinguished Guest Speaker", instructor: "", role: "Entrepreneur · Executive · Investor", img: null, desc: "Each program day features a senior guest speaker from business, investing, entrepreneurship, technology, leadership, or the arts. Speakers are carefully selected for the substance of their experience: founders who have built companies, investors who understand capital and risk, executives who have led complex organizations, and professionals with serious judgment to share. Students can ask any questions and take part in a live conversation designed to move beyond biography into decisions, mistakes, lessons, and the realities of leadership. By the end of the program, students will have been in the room with leaders across multiple industries — and had the opportunity to ask thoughtful questions directly.", color: "#C7AB75" },
  { time: "1:30 PM", dur: "15 min", block: "Afternoon Break", instructor: null, role: null, img: null, desc: "A brief reset before the final session of the day. Students step outside, recharge with a light treat — gelato, smoothies, or freshly pressed juices — and reconnect with classmates, Teaching Assistants, and faculty. With lounge music in the background and the pressure briefly lifted, the break gives students time to reset before the final push.", color: "rgba(251,247,238,0.45)" },
  { time: "1:45 PM", dur: "60 min", block: "Applied Skills Session", instructor: "", role: "Lead Faculty", img: null, desc: "Rotating daily between AI tools for business research, marketing and branding workshops, sales and customer psychology, risk management, pitch rehearsal and critique, executive communication drills, and competitive team exercises. Every session is hands-on and directly connected to the venture work.", color: "#C7AB75" },
  { time: "2:45 PM", dur: "15 min", block: "Debrief & Close", instructor: "War Room Lead", role: "Lead Program Director", img: "https://i.imgur.com/Ckny7HG.png", desc: "Each day ends with a structured debrief: what was learned, what challenged the group, and what ideas can be carried forward. Students leave with one clear takeaway from the day — a concept, question, habit, or standard to apply beyond the classroom.", color: "#A89060" },
];

const flagshipWeekdaySchedule = [
  { time: "4:00 PM", dur: "40 min", block: "Block 1 — Public Speaking & Rhetoric", instructor: "", role: "Senior Public Speaking Instructor", img: null, desc: "Public speaking is a central discipline in every Excalibur program. Students get on their feet, speak to the room, practice eye contact, strengthen their voice, and learn how to communicate with confidence. The work develops from foundational mechanics into rhetoric, debate, impromptu speaking, persuasive delivery, and pitch preparation. With repeated practice and direct feedback, students build the kind of presence that carries into interviews, presentations, leadership roles, and every room ahead.", color: "#C7AB75" },
  { time: "4:40 PM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured pause between sessions, with catered snacks and refreshments provided by the Academy — from light bites and fruit bowls to healthy açaí bowls, smoothies, milkshakes, and seasonal selections. Students recharge, listen to lounge music, and continue conversations informally with classmates, Teaching Assistants, faculty, and instructors. Often, some of the most interesting exchanges of the day happen here — between sessions, in the moments when ideas keep moving.", color: "rgba(251,247,238,0.45)" },
  { time: "4:55 PM", dur: "40 min", block: "Block 2 — Specialist / Academy Dean", instructor: "", role: "Domain Expert · Academy Dean", img: null, desc: "The Specialist Instructor leads the core academic block, introducing the day’s discipline through serious instruction, professional frameworks, and guided application. Students engage the material immediately through discussion, analysis, exercises, and applied drills. Subjects include business model analysis, financial literacy, stock & trading, AI and technology, sales and persuasion, leadership & risk management, and sector-specific business rotation — taught by practitioners who bring lived experience into the room.", color: "#A89060" },
  { time: "5:35 PM", dur: "15 min", block: "Short Break", instructor: null, role: null, img: null, desc: "A brief reset. Students step out, recharge, and return ready for the War Room.", color: "rgba(251,247,238,0.45)" },
  { time: "5:50 PM", dur: "40 min", block: "Block 3 — The War Room", instructor: "", role: "Lead Program Director", img: null, desc: "The War Room is where instruction becomes application. Led by senior faculty, this block places students into structured business scenarios that require analysis, decision-making, communication, and teamwork under pressure, rotating through three formats: (1) What Would You Have Done? — students are placed inside real business moments before knowing the outcome, make the call, defend their reasoning, then learn what actually happened; (2) Your Move — students inherit a company in crisis, build a turnaround strategy, and present their decisions to faculty as if pitching a skeptical investor; (3) Apply It Now — the day’s specialist content is immediately put to work through live exercises, workshops, and team challenges.", color: "#C7AB75" },
  { time: "6:30 PM", dur: "—", block: "Session Close", instructor: null, role: null, img: null, desc: "Each day ends with a structured debrief: what was learned, what challenged the group, and what ideas can be carried forward. Students leave with one clear takeaway from the day — a concept, question, habit, or standard to apply beyond the classroom.", color: "rgba(251,247,238,0.45)" },
];

const flagshipSaturdaySchedule = [
  { time: "10:30 AM", dur: "40 min", block: "Block 1a — Public Speaking · Opening", instructor: "", role: "Senior Public Speaking Instructor", img: null, desc: "Saturday opens identically to every other Excalibur session: students stand up and speak before anything else happens. Speaking warm-up, vocal mechanics, and impromptu drills. Christopher teaches 1a and immediately continues into 1b — no gap, no wait, no idle time between blocks.", color: "#C7AB75" },
  { time: "11:10 AM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured pause between sessions, with catered snacks and refreshments provided by the Academy — from light bites and fruit bowls to healthy açaí bowls, smoothies, milkshakes, and seasonal selections. Students recharge, listen to lounge music, and continue conversations informally with classmates, Teaching Assistants, faculty, and instructors. Often, some of the most interesting exchanges of the day happen here — between sessions, in the moments when ideas keep moving.", color: "rgba(251,247,238,0.45)" },
  { time: "11:25 AM", dur: "40 min", block: "Block 1b — Public Speaking · Rhetoric & Pitch", instructor: "", role: "Senior Public Speaking Instructor", img: null, desc: "The second speaking block, consecutive to 1a. Advanced rhetoric, formal pitch architecture, high-stakes debate formats, and Aristotelian persuasion applied to modern business scenarios. Saturday is the most intensive speaking training of the week — nearly two hours with one of the programme's senior instructors, dedicated entirely to communication at the highest level.", color: "#C7AB75" },
  { time: "12:05 PM", dur: "30 min", block: "Lunch Break", instructor: null, role: null, img: null, desc: "Students enjoy a catered three-course lunch from a rotating selection of local restaurants, with menus that may include Mediterranean mezze and grilled entrées, coastal California salads and seasonal bowls, Italian pastas, French-inspired plates, Japanese bento-style selections, and modern American favorites. Lunch is also a time for conversation — with classmates, Teaching Assistants, faculty, and instructors — in a relaxed but polished setting. Social intelligence is part of the Excalibur experience: listening well, asking thoughtful questions, carrying oneself with ease, and making others feel seen and remembered. Dietary restrictions and allergies are requested before the program begins.", color: "rgba(251,247,238,0.45)" },
  { time: "12:35 PM", dur: "80 min", block: "Block 2 — Specialist / Academy Dean", instructor: "", role: "Domain Expert · Academy Dean", img: null, desc: "The Specialist Instructor leads the core academic block, introducing the day’s discipline through serious instruction, professional frameworks, and guided application. Students engage the material immediately through discussion, analysis, exercises, and applied drills. Subjects include business model analysis, financial literacy, stock & trading, AI and technology, sales and persuasion, leadership & risk management, and sector-specific business rotation — taught by practitioners who bring lived experience into the room.", color: "#A89060" },
  { time: "1:55 PM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured pause between sessions, with catered snacks and refreshments provided by the Academy — from light bites and fruit bowls to healthy açaí bowls, smoothies, milkshakes, and seasonal selections. Students recharge, listen to lounge music, and continue conversations informally with classmates, Teaching Assistants, faculty, and instructors. Often, some of the most interesting exchanges of the day happen here — between sessions, in the moments when ideas keep moving.", color: "rgba(251,247,238,0.45)" },
  { time: "2:10 PM", dur: "40 min", block: "Block 3a — War Room · Case Study", instructor: "", role: "Lead Program Director", img: null, desc: "Current events deconstruction or real crisis case study. Students are placed inside real business moments before knowing the outcome. They analyze the situation, make the call, defend their reasoning, and then learn what actually happened.", color: "#C7AB75" },
  { time: "2:50 PM", dur: "10 min", block: "Short Break", instructor: null, role: null, img: null, desc: "A brief reset between War Room sub-blocks.", color: "rgba(251,247,238,0.45)" },
  { time: "3:00 PM", dur: "40 min", block: "Block 3b — War Room · Applied Workshop", instructor: "", role: "Lead Program Director", img: null, desc: "The specialist's content from Block 2 is immediately deployed under pressure. Teams compete, present, and defend their work in front of the group. Finance, AI, sales, leadership, branding, strategy, and industry analysis become active tools rather than abstract concepts.", color: "#C7AB75" },
  { time: "3:40 PM", dur: "5 min", block: "Debrief & Close", instructor: "", role: "Lead Program Director", img: null, desc: "Each day ends with a structured debrief: what was learned, what challenged the group, and what ideas can be carried forward. Students leave with one clear takeaway from the day — a concept, question, habit, or standard to apply beyond the classroom.", color: "#A89060" },
];

const sixWeekSchedule = [
  { time: "4:00 PM", dur: "40 min", block: "Block 1 — Public Speaking & Rhetoric", instructor: "", role: "Senior Public Speaking Instructor", img: null, desc: "Public speaking is a central discipline in every Excalibur program. Students get on their feet, speak to the room, practice eye contact, strengthen their voice, and learn how to communicate with confidence. The work develops from foundational mechanics into rhetoric, debate, impromptu speaking, persuasive delivery, and pitch preparation. With repeated practice and direct feedback, students build the kind of presence that carries into interviews, presentations, leadership roles, and every room ahead.", color: "#C7AB75" },
  { time: "4:40 PM", dur: "15 min", block: "Snack Break", instructor: null, role: null, img: null, desc: "A structured pause between sessions, with catered snacks and refreshments provided by the Academy — from light bites and fruit bowls to healthy açaí bowls, smoothies, milkshakes, and seasonal selections. Students recharge, listen to lounge music, and continue conversations informally with classmates, Teaching Assistants, faculty, and instructors. Often, some of the most interesting exchanges of the day happen here — between sessions, in the moments when ideas keep moving.", color: "rgba(251,247,238,0.45)" },
  { time: "4:55 PM", dur: "40 min", block: "Block 2 — Specialist / Academy Dean", instructor: "", role: "Academy Dean · Domain Expert", img: null, desc: "The Specialist Instructor leads the core academic block, introducing the day’s discipline through serious instruction, professional frameworks, and guided application. Students engage the material immediately through discussion, analysis, exercises, and applied drills. Subjects include business model analysis, financial literacy, stock & trading, AI and technology, sales and persuasion, leadership & risk management, and sector-specific business rotation — taught by practitioners who bring lived experience into the room.", color: "#A89060" },
  { time: "5:35 PM", dur: "15 min", block: "Short Break", instructor: null, role: null, img: null, desc: "A brief reset. Students step out, recharge, and return ready for the War Room.", color: "rgba(251,247,238,0.45)" },
  { time: "5:50 PM", dur: "40 min", block: "Block 3 — The War Room", instructor: "", role: "Lead Program Director", img: null, desc: "The War Room is where instruction becomes application. Led by senior faculty, this block places students into structured business scenarios that require analysis, decision-making, communication, and teamwork under pressure, rotating through three formats: (1) What Would You Have Done? — students are placed inside real business moments before knowing the outcome, make the call, defend their reasoning, then learn what actually happened; (2) Your Move — students inherit a company in crisis, build a turnaround strategy, and present their decisions to faculty as if pitching a skeptical investor; (3) Apply It Now — the day’s specialist content is immediately put to work through live exercises, workshops, and team challenges.", color: "#C7AB75" },
];

const fieldTrips = [
  { title: "Daytona & Motorsport Racing", tag: "Speed. Strategy. Performance.", img: "https://i.imgur.com/aq7BsSv.jpeg", desc: "At Daytona, students enter the world of elite motorsport — a global business of speed, capital, engineering, sponsorship, risk, media, and high-pressure decision-making. Led by our lead faculty member — a former professional racing driver and Formula BMW director — this is not just a field trip; it is a rare masterclass inside one of the world’s most elite and intense industries.", type: "Weekend" },
  { title: "Silicon Valley — Incubators & Accelerators", tag: "Where the next business revolution is built.", img: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80", desc: "Behind-the-scenes visits to leading venture capital firms, startup incubators, and accelerators across the Bay Area. Students walk through the environments where the world’s most consequential companies began. A curated dinner with a VC partner closes the day.", type: "2-Day" },
  { title: "TED Talks — San Diego", tag: "The most important ideas in the world. Live.", img: "https://i.imgur.com/OG9TuYo.jpeg", desc: "One of the world’s most influential gatherings of ideas, innovation, and leadership. TED’s power lies in compression: exceptional people distilling their most important thinking into eighteen unforgettable minutes. Students study not only the ideas themselves, but the architecture of communication from the most consequential leaders in the world.", type: "Day Trip" },
  { title: "SF + LA Tech Week", tag: "Five days. Hundreds of the most significant companies.", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80", desc: "Two extraordinary events hosted across San Francisco and Los Angeles where hundreds of portfolio companies open their doors for panels, founder conversations, and networking in the environments where consequential decisions actually get made. Students attend across both cities — five days that cover more real business acumen than most accumulate in a lifetime.", type: "5-Day" },
  { title: "SpaceX — Launch & Engineering", tag: "The ambition that changes the species.", img: "https://i.imgur.com/9qB01yy.jpeg", desc: "Students witness a SpaceX launch from the water on a private charter — a rare vantage point on one of the most consequential engineering achievements of our time. It is an unforgettable proximity to history in motion: the ignition, the ascent, the booster separation, the controlled return — explained in real time by space engineers who understand the physics, the stakes, and the ambition behind the mission.", type: "Weekend" },
  { title: "Yosemite — Nature, Clarity & Team Building", tag: "Connection. Clarity. Renewal.", img: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80", desc: "A weekend in Yosemite National Park — hiking, outdoor leadership challenges, and evening team sessions under the stars. A deliberate reminder that mental clarity, resilience, and the ability to lead under pressure are forged as much outside the boardroom as within it.", type: "Weekend" },
];

// ─────────────────────────────────────────────
// INTERACTIVE DAILY SCHEDULE COMPONENT
// ─────────────────────────────────────────────
function ScheduleDetail({ block }) {
  if (!block || !block.block) return null;
  const isBreak = !block.instructor;
  return (
    <div className="mod-content" style={{ padding: "32px 36px", background: "#FAF8F4", borderTop: "1px solid rgba(0,0,0,.07)" }}>
      {isBreak ? (
        <>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: "#111", letterSpacing: "0.01em", marginBottom: 14, lineHeight: 1.1 }}>{block.block}</p>
          <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#333", fontWeight: 300, lineHeight: 1.85 }}>{block.desc}</p>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
            {block.img ? (
              <div style={{ width: 48, height: 48, flexShrink: 0, overflow: "hidden", border: "1px solid rgba(0,0,0,.1)", borderRadius: "50%" }}>
                <img src={block.img} alt={block.instructor || ""} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={e => e.target.style.display = "none"} />
              </div>
            ) : (
              <div style={{ width: 48, height: 48, flexShrink: 0, border: "1px solid rgba(0,0,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "rgba(0,0,0,.2)" }}>✦</span>
              </div>
            )}
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, color: "#111", fontWeight: 600, marginBottom: 2 }}>{block.instructor}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#8B6914", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>{block.role}</p>
            </div>
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: "#111", letterSpacing: "0.01em", marginBottom: 14, lineHeight: 1.1 }}>{block.block}</p>
          <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#333", fontWeight: 300, lineHeight: 1.9 }}>{block.desc}</p>
        </>
      )}
    </div>
  );
}

function DailyScheduleBlock({ schedule, title, subtitle }) {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();

  const toggle = (i) => setActive(active === i ? null : i);

  return (
    <div style={{ background: "#FAF8F4", border: "1px solid rgba(0,0,0,.08)" }}>
      {/* Title */}
      <div style={{ padding: isMobile ? "20px 20px 16px" : "28px 36px 22px", borderBottom: "1px solid rgba(0,0,0,.07)", background: "#fff" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{title}</p>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: isMobile ? 14 : 17, color: "#222", fontWeight: 400, letterSpacing: "0.01em" }}>{subtitle}</p>
      </div>

      {isMobile ? (
        <div>
          {(schedule || []).map((s, i) => (
            <div key={i}>
              <div onClick={() => toggle(i)} style={{ padding: "14px 20px", cursor: "pointer", borderLeft: `3px solid ${active === i ? "#8B6914" : "transparent"}`, background: active === i ? "rgba(139,105,20,.04)" : "#FAF8F4", borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", gap: 12, alignItems: "flex-start", transition: "all .2s" }}>
                <div style={{ flexShrink: 0, minWidth: 52 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, color: active === i ? "#8B6914" : "#555", fontWeight: 600, lineHeight: 1 }}>{s.time}</div>
                  <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: "#555", marginTop: 2 }}>{s.dur}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{s.block}</div>
                  {s.instructor && <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: active === i ? "#8B6914" : "#999", marginTop: 2 }}>{s.instructor}</div>}
                </div>
                <span style={{ color: active === i ? "#8B6914" : "#bbb", fontSize: 16, transition: "transform .2s", transform: active === i ? "rotate(45deg)" : "none", display: "inline-block", flexShrink: 0 }}>+</span>
              </div>
              {active === i && <ScheduleDetail block={s} />}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr" }}>
          <div style={{ borderRight: "1px solid rgba(0,0,0,.07)", background: "#fff" }}>
            {(schedule || []).map((s, i) => (
              <div key={i} onClick={() => toggle(i)} style={{ padding: "14px 24px", cursor: "pointer", borderLeft: `3px solid ${active === i ? "#8B6914" : "transparent"}`, background: active === i ? "rgba(139,105,20,.05)" : "transparent", borderBottom: "1px solid rgba(0,0,0,.05)", transition: "all .2s", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, color: active === i ? "#8B6914" : "#555", fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap" }}>{s.time}</div>
                  <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: "#555", marginTop: 3 }}>{s.dur}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{s.block}</div>
                  {s.instructor && <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: active === i ? "#8B6914" : "#999", marginTop: 2, letterSpacing: "0.06em" }}>{s.instructor}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#FAF8F4" }}>
            {active !== null && (schedule || [])[active] ? (
              <div key={active} style={{ minHeight: 320 }}>
                <ScheduleDetail block={(schedule || [])[active]} />
              </div>
            ) : (
              <div style={{ padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12 }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "rgba(0,0,0,.08)" }}>✦</span>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "rgba(0,0,0,.25)", fontStyle: "italic", textAlign: "center" }}>Select a time block<br />to see what happens in that session</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
const summerModules = [
  {
    n: "01", slug: "summer-public-speaking",
    title: "Public Speaking & Executive Communication",
    tagline: "Students are on their feet from the start. Voice, presence, and the confidence to own any room.",
    summary: "The most important professional skill is also the most neglected. This module builds it from the ground up — every single day. By the end of two weeks, students who arrived nervous to speak in public leave with the mechanics, habits, and composure to address any room with authority.",
    body: "Public speaking is not a gift. It is a discipline — one that can be trained, refined, and made instinctive through repetition and direct feedback.\n\nEvery day of the Summer Intensive opens with this block. Students build from physical foundations — posture, breath, eye contact, voice projection — into rhetorical structure, impromptu delivery, persuasive framing, and pitch mechanics. By the final week, they are practicing investor-grade presentations and defending their business concepts under real pressure.\n\nThe goal is not polish for its own sake. It is the ability to think on your feet, communicate under pressure, and hold a room — skills that compound across every arena ahead.",
    whatYouLearn: ["Voice mechanics — projection, pace, tone, and clarity", "Physical presence — posture, eye contact, movement, and command of space", "Impromptu speaking — structured responses under time pressure with no preparation", "Rhetorical structure — how to build an argument that lands", "Persuasive delivery — Aristotle's ethos, pathos, logos applied to real scenarios", "Pitch mechanics — how to open, build tension, and close a business presentation", "Composure under pressure — handling hard questions, objections, and skeptical audiences", "Elevator pitch — your concept in 60 seconds, refined and rehearsed"],
    outcomes: ["Can stand up and speak to a room without notes on any given topic", "Has completed 30+ individual speaking reps across two weeks with direct faculty feedback", "Delivers a polished investor pitch at the Excalibur Venture Finale"],
    quote: "The human brain starts working the moment you are born and never stops until you stand up to speak in public. — George Jessel",
  },
  {
    n: "02", slug: "summer-entrepreneurial-mindset",
    title: "The Entrepreneurial Mindset & Business Fundamentals",
    tagline: "How real businesses start. How founders think. How ideas become ventures.",
    summary: "Before students can build a business plan, they need to understand how businesses actually work — and how the people who build them think. This module installs the entrepreneurial operating system: how to identify opportunity, stress-test an idea, and move from concept to fundable venture.",
    body: "Entrepreneurship is not about having ideas. It is about having the judgment to know which ideas are worth pursuing, the discipline to test them quickly, and the clarity to explain why they matter.\n\nThis module covers the fundamentals every founder needs: how markets work, how customers think, how value is created and captured, and what separates a business from a hobby. Students examine real companies — how they started, what problem they solved, and what made them defensible — and begin applying those frameworks to their own venture concepts.\n\nThe session is practical from the start. By the end of the module, each team has a defined business idea, a basic understanding of their market, and a clear problem they are solving.",
    whatYouLearn: ["The entrepreneurial mindset — how founders think differently about problems and opportunity", "Idea validation — how to test whether an idea is worth pursuing before building it", "Market sizing — TAM, SAM, SOM and what they tell investors", "Value creation and capture — how businesses make money and why some models are stronger than others", "Problem-solution fit — how to define a problem precisely and match it to a solution", "Business model basics — the eight archetypes and which fits your concept", "Real company case studies — from first idea to fundable venture", "Team dynamics — how to work effectively as a founding team under pressure"],
    outcomes: ["Has identified and defined their team's venture concept", "Can articulate the problem they are solving and who they are solving it for", "Understands the basic mechanics of how businesses create and capture value"],
    quote: "The entrepreneurial journey starts with a question, not an answer. — Unknown",
  },
  {
    n: "03", slug: "summer-marketing-branding",
    title: "Marketing, Branding & Customer Psychology",
    tagline: "Who is your customer? How do you reach them? How do you make them care?",
    summary: "Marketing is not advertising. It is the deep understanding of who your customer is, what they actually want, and how to position your product so they choose you over everyone else. This module teaches students to think like marketers — with real frameworks, real examples, and direct application to their own venture.",
    body: "Every business lives or dies by its ability to reach the right customer with the right message at the right time. Most founders underestimate how hard this is — and how much thinking it requires before anything is built.\n\nThis module walks students through the complete marketing stack: customer definition, persona development, channel strategy, brand identity, positioning, digital marketing fundamentals, and the psychology that drives purchasing decisions. Students study how great brands are built — from luxury to tech to consumer goods — and apply those principles directly to their own venture concepts.\n\nBy the end of the module, each team has a defined target customer, a brand positioning statement, and a basic marketing strategy for their business plan.",
    whatYouLearn: ["Customer segmentation — how to define and describe your ideal customer precisely", "Buyer psychology — what drives decisions and how to design for them", "Brand identity — name, positioning, voice, and visual presence", "The marketing funnel — awareness, consideration, conversion, retention", "Digital marketing channels — social, search, content, email, and when to use each", "Storytelling in marketing — how to make people care about what you are building", "Cialdini's principles of influence — social proof, scarcity, authority, reciprocity", "Building a marketing plan — strategy, channels, budget allocation, and measurement"],
    outcomes: ["Has a defined target customer persona for their venture", "Has written a brand positioning statement", "Has built a basic marketing strategy as part of the team business plan"],
    quote: "Marketing is no longer about the stuff that you make, but about the stories you tell. — Seth Godin",
  },
  {
    n: "04", slug: "summer-competitive-analysis",
    title: "Competitive Analysis & Market Research",
    tagline: "Who else is doing this? Why would a customer choose you?",
    summary: "No investor will back a team that cannot answer these two questions clearly. This module teaches students to map the competitive landscape, understand what makes a business defensible, and position their venture for a market that already has players in it.",
    body: "Every market has competition. The question is not whether competitors exist — it is whether you understand them better than they understand themselves, and whether your positioning makes your offering the obvious choice for the right customer.\n\nStudents learn structured competitive analysis: how to identify direct and indirect competitors, how to map them across key dimensions, how to identify gaps and white space, and how to articulate a differentiated value proposition. They study real market maps — from consumer tech to food and beverage to services — and build their own for their venture concept.\n\nThe module also covers primary market research: how to talk to potential customers, what questions to ask, how to interpret what you hear, and how to use that intelligence to sharpen your positioning.",
    whatYouLearn: ["Competitive mapping — identifying and categorizing direct and indirect competitors", "Porter's Five Forces — the structural analysis of industry attractiveness", "SWOT analysis — applied to your own venture and your top competitors", "Differentiation strategy — what makes your offering genuinely different and why it matters", "Value proposition design — the precise articulation of why customers should choose you", "Primary research — how to conduct customer interviews and what to listen for", "Market gap analysis — how to identify underserved segments and white space", "Competitive moats — what makes a business hard to copy and how to build one"],
    outcomes: ["Has completed a competitive landscape map for their venture", "Has conducted at least one customer conversation and documented the findings", "Has a clear differentiated value proposition included in the team business plan"],
    quote: "Know your enemy and know yourself, and you can fight a hundred battles without disaster. — Sun Tzu",
  },
  {
    n: "05", slug: "summer-ai-business-tool",
    title: "AI as a Business Tool",
    tagline: "Not a threat. A tool. Learn to use it better than anyone in the room.",
    summary: "AI is not replacing founders. It is multiplying the output of founders who know how to use it. This module gives students practical fluency with AI tools for business research, copywriting, competitor analysis, deck building, and ideation — turning a two-person team into a ten-person team in terms of output.",
    body: "The question is no longer whether to use AI in business. It is how to use it well — with judgment, speed, and the ability to direct it toward real outcomes rather than generic outputs.\n\nThis module is entirely practical. Students learn how to use AI tools to research markets and competitors faster, draft and refine marketing copy, build and iterate on business decks, generate and stress-test business model assumptions, and automate outreach and research tasks that would otherwise take days.\n\nEqually important: students learn what AI cannot do — the judgment calls, the customer conversations, the leadership decisions, and the creative leaps that still require a human mind with real information and real stakes.",
    whatYouLearn: ["AI tools for business research — how to use AI to map markets, competitors, and trends at speed", "Prompt engineering for business — how to write prompts that produce useful, specific outputs", "AI for marketing copy — drafting positioning statements, ad copy, email campaigns, and social content", "AI for deck building — structuring investor presentations with AI-assisted frameworks", "AI for competitive intelligence — monitoring competitors and synthesizing industry signals", "AI for customer research — using AI to analyze patterns in customer conversations and reviews", "The limits of AI — where human judgment, relationships, and creativity are irreplaceable", "Building an AI-powered workflow — integrating AI tools into a real business operating rhythm"],
    outcomes: ["Has used AI tools to conduct market research for their venture", "Has generated and refined marketing copy for their business plan using AI", "Has built a section of their investor deck with AI-assisted structuring"],
    quote: "The technology is not the moat. The judgment to deploy it is. — Unknown",
  },
  {
    n: "06", slug: "summer-sales-persuasion-pitch",
    title: "Sales, Persuasion & The Pitch",
    tagline: "Every founder is a salesperson. Every presentation is a pitch. Learn to win the room.",
    summary: "Sales is not manipulation. It is the art of understanding what someone needs, showing them that you have it, and giving them a reason to act. This module covers the full arc from persuasion principles to elevator pitch to investor presentation — culminating in the Excalibur Venture Finale.",
    body: "Every founder pitches — to investors, to customers, to partners, to the team they are trying to recruit. The ability to sell an idea with clarity, conviction, and composure under questioning is one of the highest-value skills a young professional can develop.\n\nThis module begins with the psychology of persuasion — how decisions are actually made, what triggers trust, and what kills it. Students practice consultative selling, objection handling, and the art of closing. They learn the architecture of a great pitch: how to open with a hook, build tension with a problem, resolve with a solution, and close with a call to action.\n\nThe final days of the module are dedicated to rehearsal for the Venture Finale: live pitch runs, timed presentations, Q&A drills with faculty acting as skeptical investors, and feedback sessions designed to tighten every slide, every sentence, and every answer.",
    whatYouLearn: ["The psychology of persuasion — Cialdini's principles applied to business contexts", "Consultative selling — how to understand a customer's real need before presenting a solution", "Objection handling — how to welcome and neutralize resistance without losing the room", "The elevator pitch — your business in 60 seconds, crisp, compelling, and memorable", "Investor pitch architecture — problem, solution, market, model, team, ask", "Storytelling in sales — how to make your pitch feel like a narrative rather than a presentation", "Q&A mastery — how to handle hard questions with composure and precision", "Closing — how to move from interest to commitment"],
    outcomes: ["Has delivered a timed investor pitch with no notes", "Has completed multiple live Q&A sessions with faculty acting as skeptical investors", "Presents at the Excalibur Venture Finale before a panel of real investors and judges"],
    quote: "Selling is not something you do to people. It is something you do for people. — Zig Ziglar",
  },
];


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
function SoireeInviteBlock({ openInquiry, setPage = () => {} }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", city: "", studentName: "", studentAge: "", studentGrade: "",
    inviteMethod: "", attendees: "", dietary: "", school: "", mailingAddress: "", comments: "",
  });
  const isMobile = useIsMobile();
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const iStyle = { width: "100%", padding: "12px 16px", background: "#000", border: "1px solid rgba(199,171,117,.25)", color: "#FBF7EE", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" };
  const focus = e => e.target.style.borderColor = gold;
  const blur  = e => e.target.style.borderColor = "rgba(199,171,117,.25)";
  const grades = ["9th Grade", "10th Grade", "11th Grade", "12th Grade"];
  const inviteMethods = ["By Post", "Email", "Both"];

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return;
    setSending(true);
    await sendEmail({
      subject: "Soirée Invitation Request — " + form.name,
      name: form.name, phone: form.phone, city: form.city,
      student_name: form.studentName, student_age: form.studentAge, student_grade: form.studentGrade,
      school: form.school,
      invite_method: form.inviteMethod, mailing_address: form.mailingAddress,
      attendees: form.attendees, dietary: form.dietary,
      comments: form.comments,
      type: "Soiree Invitation Request",
      message: "Soiree request from " + form.name,
    });
    setSending(false);
    setSubmitted(true);
  };

  return (
    <section style={{ padding: isMobile ? "52px 16px" : "80px 40px", background: "#000" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ border: "1px solid rgba(199,171,117,.4)", position: "relative", background: "#050505" }} className="soiree-card">
          {/* Top gold line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
          {/* Corner brackets */}
          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
            <div key={i} style={{ position: "absolute", [v]: 14, [h]: 14, width: 22, height: 22,
              [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: `1px solid ${gold}`,
              [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: `1px solid ${gold}`,
              pointerEvents: "none" }} />
          ))}

          {!submitted ? (
            <>
              {/* PHOTO + CONTENT grid */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Photo  -  full width on mobile, left column on desktop */}
                {isMobile ? (
                  <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
                    <img src="https://i.imgur.com/wf1ttmj.jpeg" alt="Excalibur Soirée" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #050505 100%)" }} />
                  </div>
                ) : null}
                <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "380px 1fr", minHeight: isMobile ? "auto" : 520 }}>
                {/* Photo desktop */}
                {!isMobile && (
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src="https://i.imgur.com/wf1ttmj.jpeg" alt="Excalibur Soirée" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, #050505 100%)" }} />
                  </div>
                )}
                {/* Content */}
                <div style={{ padding: isMobile ? "44px 28px" : "56px 60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 28 }}>Private Family Information Event · Excalibur Academy 2026</p>
                  {/* Ornament */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, width: "100%", maxWidth: 440 }}>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(199,171,117,.35))" }} />
                    <span style={{ fontFamily: serif, fontSize: 14, color: gold }}>✦</span>
                    <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(199,171,117,.35), transparent)" }} />
                  </div>
                  {/* Date */}
                  <p style={{ fontFamily: serif, fontSize: isMobile ? 72 : 96, fontWeight: 300, color: "#FBF7EE", lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 6 }}>May 27</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 8 }}>
                    <div style={{ width: 18, height: "1px", background: `linear-gradient(90deg, transparent, ${gold})` }} />
                    <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 16 : 20, color: gold, fontStyle: "italic", fontWeight: 600, letterSpacing: "0.12em", margin: 0 }}>Wednesday &nbsp;·&nbsp; 6:00 – 8:00 PM</p>
                    <div style={{ width: 18, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)` }} />
                  </div>
                  <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 24, color: "#FBF7EE", lineHeight: 1.3, marginBottom: 16, fontWeight: 400 }}>Academy Launch & Family Information Soirée</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 15 : 18, color: gold, lineHeight: 1.4, marginBottom: 6, fontStyle: "italic", fontWeight: 700, letterSpacing: "0.12em" }}>at</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', 'Bodoni MT', Georgia, serif", fontSize: isMobile ? 28 : 42, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 6, fontWeight: 300, fontStyle: "italic", letterSpacing: "0.04em" }}>Laguna Niguel City Hall Ballroom</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 36 }}>
                    <div style={{ width: 28, height: "1px", background: "rgba(199,171,117,0.4)" }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: gold, lineHeight: 1, fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", margin: 0 }}>Laguna Niguel · California</p>
                    <div style={{ width: 28, height: "1px", background: "rgba(199,171,117,0.4)" }} />
                  </div>
                  <div style={{ width: 52, height: "1px", background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, marginBottom: 28 }} />
                  {/* Body */}
                  <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: isMobile ? 13 : 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 2.0, maxWidth: 520, marginBottom: 28 }}>An intimate invitation-only evening for a selected number of families, marking the official launch of Excalibur Academy. The evening includes live jazz, hors d’oeuvres, faculty introductions, program & curriculum presentations, as well as the opportunity to meet the founder, leadership team, and other prospective Excalibur families.</p>
                  {/* By Invitation */}
                  <p style={{ fontFamily: serif, fontSize: 17, color: gold, letterSpacing: "0.15em", marginBottom: 28, textTransform: "uppercase" }}>By Personal Invitation Only</p>
                  {/* Dream question */}
                  <div style={{ border: "1px solid rgba(199,171,117,.25)", padding: isMobile ? "18px 18px" : "24px 36px", textAlign: "center", maxWidth: 540, marginBottom: 32, position: "relative", width: "100%" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(199,171,117,.4), transparent)" }} />
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, letterSpacing: "0.08em", color: "#FBF7EE", fontWeight: 400, fontStyle: "italic", marginBottom: 14 }}>On the evening, prospective students &amp; parents will be asked to share an answer to one question</p>
                    <p style={{ fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', Georgia, serif", fontSize: isMobile ? 28 : 42, color: gold, fontWeight: 400, lineHeight: 1.25, fontStyle: "italic" }}>"What is your dream?"</p>
                  </div>
                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row", width: "100%", maxWidth: 460, marginBottom: 14 }}>
                    <button onClick={() => setShowForm(true)} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", flex: 1 }}>Request Invitation</button>
                    <button onClick={() => setPage("events")} style={{ fontFamily: sans, background: "transparent", color: gold, padding: "13px 22px", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid rgba(199,171,117,.35)", cursor: "pointer", flex: 1 }}>Event Information →</button>
                  </div>
                  <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 11, color: "rgba(199,171,117,.55)", marginTop: 4, lineHeight: 1.7, maxWidth: 420 }}>Invitations will be extended personally by the Founder of Excalibur Academy.</p>
                </div>
              </div> {/* close inner grid */}
              </div> {/* close flex column wrapper */}

              {/* REQUEST INVITATION FORM  -  inline popup */}
              {showForm && (
                <div style={{ borderTop: "1px solid rgba(199,171,117,.2)", padding: isMobile ? "32px 24px" : "44px 60px", background: "#000" }}>
                  <div style={{ maxWidth: 640, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 700, textTransform: "uppercase" }}>Request Your Invitation</p>
                      <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: gold, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <input className="inquiry-input" style={{...iStyle}} placeholder="Your Name *" value={form.name} onChange={e => setF("name", e.target.value)} onFocus={focus} onBlur={blur} />
                      <input className="inquiry-input" style={{...iStyle}} placeholder="Phone Number *" value={form.phone} onChange={e => setF("phone", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                    <input className="inquiry-input" style={{...iStyle, marginBottom: 10}} placeholder="City" value={form.city} onChange={e => setF("city", e.target.value)} onFocus={focus} onBlur={blur} />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 80px", gap: 10, marginBottom: 10 }}>
                      <input className="inquiry-input" style={{...iStyle}} placeholder="Prospective Student Name" value={form.studentName} onChange={e => setF("studentName", e.target.value)} onFocus={focus} onBlur={blur} />
                      <input className="inquiry-input" style={{...iStyle}} placeholder="Age" value={form.studentAge} onChange={e => setF("studentAge", e.target.value)} onFocus={focus} onBlur={blur} />
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", gridColumn: isMobile ? "1" : "3" }}>
                        {grades.map(g => (
                          <button key={g} onClick={() => setF("studentGrade", g)} style={{ fontFamily: sans, fontSize: 10, padding: "8px 10px", cursor: "pointer", background: form.studentGrade === g ? gold : "transparent", color: form.studentGrade === g ? "#000" : "#FBF7EE", border: `1px solid ${form.studentGrade === g ? gold : "rgba(199,171,117,.2)"}`, transition: "all .2s", whiteSpace: "nowrap" }}>{g}</button>
                        ))}
                      </div>
                    </div>
                    <input className="inquiry-input" style={{...iStyle, marginBottom: 10}} placeholder="School Name" value={form.school} onChange={e => setF("school", e.target.value)} onFocus={focus} onBlur={blur} />
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.22em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Preferred Invitation Method</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {inviteMethods.map(m => (
                          <button key={m} onClick={() => setF("inviteMethod", m)} style={{ fontFamily: sans, fontSize: 12, padding: "9px 16px", cursor: "pointer", background: form.inviteMethod === m ? gold : "transparent", color: form.inviteMethod === m ? "#000" : "#FBF7EE", border: `1px solid ${form.inviteMethod === m ? gold : "rgba(199,171,117,.2)"}`, transition: "all .2s" }}>{m}</button>
                        ))}
                      </div>
                    </div>
                    {(form.inviteMethod === "By Post" || form.inviteMethod === "Both") && (
                      <input className="inquiry-input" style={{...iStyle, marginBottom: 10}} placeholder="Mailing Address *" value={form.mailingAddress} onChange={e => setF("mailingAddress", e.target.value)} onFocus={focus} onBlur={blur} />
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <input className="inquiry-input" style={{...iStyle}} placeholder="Expected number of guests" value={form.attendees} onChange={e => setF("attendees", e.target.value)} onFocus={focus} onBlur={blur} />
                      <input className="inquiry-input" style={{...iStyle}} placeholder="Dietary restrictions (optional)" value={form.dietary} onChange={e => setF("dietary", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                    <textarea className="inquiry-input" style={{...iStyle, marginBottom: 20, minHeight: 80, resize: "vertical"}} placeholder="Comments or questions (optional)" value={form.comments} onChange={e => setF("comments", e.target.value)} onFocus={focus} onBlur={blur} />
                    <button onClick={handleSubmit} disabled={sending || !form.name || !form.phone} style={{ fontFamily: sans, background: (!form.name || !form.phone) ? "rgba(199,171,117,.4)" : gold, color: "#000", padding: "13px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer", width: "100%", transition: "all .2s" }}>{sending ? "Sending..." : "Submit Invitation Request"}</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: isMobile ? "52px 28px" : "80px 72px", textAlign: "center" }}>
              <span style={{ fontFamily: serif, fontSize: 40, color: gold, display: "block", marginBottom: 24 }}>✦</span>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 28 : 38, color: "#FBF7EE", marginBottom: 14, fontWeight: 300 }}>Thank you.</p>
              <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 2.0, maxWidth: 480, margin: "0 auto" }}>We will be in touch personally with event details and your private invitation. We look forward to welcoming your family to Excalibur.</p>
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
  const [activeModule, setActiveModule] = useState(0);
  React.useEffect(() => { setActiveModule(isMobile ? null : 0); }, [isMobile]);

  const industries = [
    { n: "01", sector: "Technology & AI", desc: "Platform economics, software margins, how the most valuable companies were built." },
    { n: "02", sector: "Finance & Venture Capital", desc: "Equity, debt, cap tables, term sheets, how investors decide." },
    { n: "03", sector: "Real Estate", desc: "Development economics, cap rates, wealth-building mechanics." },
    { n: "04", sector: "Food & Hospitality", desc: "Unit economics, brand-building in a commoditized market." },
    { n: "05", sector: "E-Commerce & Retail", desc: "Customer acquisition, lifetime value, supply chains, DTC brands." },
    { n: "06", sector: "Healthcare & Biotech", desc: "FDA pathways, healthcare economics, why it requires unusual patience." },
    { n: "07", sector: "Media & Entertainment", desc: "Attention economics, the creator economy, IP valuation." },
    { n: "08", sector: "Legal & Professional Services", desc: "Contracts, IP, equity agreements every entrepreneur needs to understand." },
    { n: "09", sector: "Manufacturing & Supply Chain", desc: "How physical things are made, moved, and sold at scale." },
    { n: "10", sector: "Energy & Sustainability", desc: "Renewable economics, carbon markets, the greatest entrepreneurial opportunity ahead." },
    { n: "11", sector: "Sports, Fitness & Wellness", desc: "Athlete branding, sponsorship, franchise valuation." },
    { n: "12", sector: "Luxury & Premium Brands", desc: "Psychology of desire, scarcity, heritage, and premium pricing." },
  ];

  const tenMonthArc = [
    { m: "Month 1–2", t: "Foundation", items: ["Public Speaking I & II", "Mindset & identity", "First pitch night", "Business model primer"] },
    { m: "Month 3", t: "Financial Literacy", items: ["Reading a P&L", "Unit economics", "Pricing strategy", "Guest: Finance pro"] },
    { m: "Month 4", t: "The Art of Selling", items: ["Consultative selling", "Psychology of persuasion", "Objection handling", "Live roleplay"] },
    { m: "Month 5", t: "Stocks, Crypto & Market Literacy", items: ["How markets work", "Stock analysis", "Crypto fundamentals", "Trading simulation"] },
    { m: "Month 6", t: "AI & Technology", items: ["How AI works", "No-code tools", "AI-powered research", "Build a tool"] },
    { m: "Month 7", t: "Speaking III + Finance II", items: ["Advanced rhetoric", "Investor Briefing I", "Mid-year competition", "Sector: Finance"] },
    { m: "Month 7–8", t: "Junior Consultant", items: ["Assigned to real business", "On-site observation", "Customer research", "Boardroom Finale"] },
    { m: "Month 9", t: "Public Speaking IV", items: ["Advanced narrative", "Sector speaker series", "Externship begins", "City Champ prep"] },
    { m: "Month 10", t: "Leadership", items: ["Five forms of power", "Emotional intelligence", "CEO crisis simulation", "Conflict resolution"] },
    { m: "Month 11", t: "Micro-Business Launch", items: ["Assigned mentor & funding", "Build real venture", "Weekly check-ins", "Revenue target"] },
    { m: "Month 12", t: "Graduation", items: ["Financial Literacy III", "Investor Briefing II", "Gala & Graduation prep", "Portfolio & ceremony"] },
    { m: "Throughout", t: "Sector Rotation", items: ["12 industries, 12 speakers", "Sector Journal", "One case study/month", "Real practitioner every time"] },
    { m: "Throughout", t: "Intellectual Depth", items: ["Stoic philosophy", "Literary analysis", "Social arts", "Writing with precision"] },
  ];

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      <Breadcrumb items={[{label:"Curriculum",page:"curriculum"}]} setPage={setPage} />

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden", height: isMobile ? 400 : 560 }}>
        <img src="https://i.imgur.com/vG8mtVQ.jpeg" alt="Excalibur Curriculum" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.3) 0%, rgba(0,0,0,.85) 100%)" }} />
        <div style={{ position: "absolute", bottom: isMobile ? 36 : 60, left: isMobile ? 24 : 72, maxWidth: 620 }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>The Curriculum · Excalibur Academy</p>
            <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(36px,7vw,52px)" : "clamp(48px,5vw,72px)", fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 14, letterSpacing: "0.02em" }}>Eight Disciplines.<br />One Formation.</h1>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 17, color: gold, fontStyle: "italic", lineHeight: 1.4 }}>Delivered by practitioners who have built, led, and created at the highest level.</p>
          </Fade>
        </div>
      </div>

      {/* ── INTRO STRIP ── */}
      <div style={{ background: "#000", padding: isMobile ? "40px 24px" : "52px 80px", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 24 : 0 }}>
          {[
            { n: "8", label: "Core Disciplines", sub: "Across all three programs" },
            { n: "12", label: "Industry Sectors", sub: "One per month with a guest professional" },
            { n: "30+", label: "Guest Speakers / Year", sub: "Real executives, investors, founders" },
          ].map((s, i) => (
            <div key={i} style={{ padding: isMobile ? "0" : "0 48px", textAlign: "center", borderLeft: !isMobile && i > 0 ? "1px solid rgba(199,171,117,.1)" : "none" }}>
              <div style={{ fontFamily: serif, fontSize: isMobile ? 48 : 58, fontWeight: 300, color: "#FBF7EE", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 8 }}>{s.n}</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: gold, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: sans, fontSize: 11, color: "rgba(199,171,117,.55)", fontWeight: 300 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── EIGHT MODULES ── */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Editorial heading  -  asymmetric, luxury */}
          <Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 80, alignItems: "end", marginBottom: 64, paddingBottom: 40, borderBottom: "1px solid rgba(199,171,117,.12)" }}>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>The Curriculum · Eight Disciplines</p>
                <h2 style={{ fontFamily: serif, fontSize: isMobile ? 36 : 58, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, letterSpacing: "0.01em" }}>Inside the<br />Classroom</h2>
              </div>
              <div>
                <div style={{ width: 32, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 20 }} />
                <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 24 }}>Ten disciplines — taught by executive business leaders, distinguished keynote speakers, and professors from leading universities. Click any module to learn more.</p>
                <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", lineHeight: 1.6 }}>No career academics. No theory divorced from practice. Every instructor has done the thing they teach.</p>
              </div>
            </div>
          </Fade>

          {/* Modules  -  editorial numbered rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {currMods.map((m, i) => (
              <Fade key={i} d={i * .03}>
                <div
                  onClick={() => setPage(`module:${m.slug}`)}
                  style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "72px 1fr 1fr 120px", gap: isMobile ? 12 : 32, padding: isMobile ? "28px 0" : "32px 0", borderBottom: "1px solid rgba(199,171,117,.1)", cursor: "pointer", alignItems: "center", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(199,171,117,.03)"; e.currentTarget.style.paddingLeft = isMobile ? "0" : "12px"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "0"; }}
                >
                  {/* Number */}
                  <span style={{ fontFamily: serif, fontSize: isMobile ? 28 : 38, fontWeight: 300, color: "rgba(199,171,117,.2)", lineHeight: 1, flexShrink: 0 }}>{m.n}</span>
                  {/* Title + tagline */}
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.28em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{m.phase || "Core Module"}</p>
                    <h3 style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.15, marginBottom: 4 }}>{m.title}</h3>
                    <p style={{ fontFamily: serif, fontSize: 13, fontStyle: "italic", color: gold, lineHeight: 1.3 }}>{m.tagline}</p>
                  </div>
                  {/* Summary  -  desktop only */}
                  {!isMobile && <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>{m.summary}</p>}
                  {/* CTA */}
                  {isMobile ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                      <span style={{ color: gold, fontSize: 22, fontWeight: 300 }}>→</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                      <span style={{ fontFamily: sans, fontSize: 9, color: gold, letterSpacing: "0.22em", fontWeight: 600, textTransform: "uppercase" }}>Learn More</span>
                      <span style={{ color: gold, fontSize: 13 }}>→</span>
                    </div>
                  )}
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </div>

      {/* ── INDUSTRY ROTATION ── */}
      <div style={{ background: "#FAF8F4", padding: isMobile ? "52px 24px" : "72px 80px", borderTop: "1px solid rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.45em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Industry Sectors Rotation</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 44, fontWeight: 600, color: "#111", lineHeight: 1.05, marginBottom: 8 }}>Know Every Industry. Own Any Room.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#444", fontWeight: 300, lineHeight: 1.8, marginBottom: 40, maxWidth: 600 }}>Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. By graduation, every student holds a Sector Journal documenting all twelve.</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: 0 }}>
            {industries.map((ind, i) => (
              <div key={i} style={{ padding: isMobile ? "20px 0" : "24px 24px", borderBottom: "1px solid rgba(0,0,0,.07)", borderLeft: !isMobile && i % 4 !== 0 ? "1px solid rgba(0,0,0,.07)" : "none", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontFamily: serif, fontSize: 12, color: "rgba(0,0,0,.2)", fontStyle: "italic", flexShrink: 0, paddingTop: 2 }}>{ind.n}</span>
                <div>
                  <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.2, marginBottom: 4 }}>{ind.sector}</p>
                  <p style={{ fontFamily: sans, fontSize: 11, color: "#555", fontWeight: 300, lineHeight: 1.6 }}>{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 10-MONTH ARC ── */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>The Ten-Month Arc</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 44, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 8 }}>What a Year Looks Like.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 40, maxWidth: 600 }}>Ten months, structured across four phases. Every month builds on the last.</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 2, background: "#111" }}>
            {tenMonthArc.map((row, i) => (
              <div key={i} style={{ background: "#080808", padding: "24px 20px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.06)"}` }}>
                <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.18em", color: gold, marginBottom: 6, fontWeight: 600 }}>{row.m}</p>
                <h4 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: "#FBF7EE", marginBottom: 10, lineHeight: 1.2 }}>{row.t}</h4>
                {row.items.map((item, j) => <div key={j} style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginBottom: 4, fontWeight: 300 }}>— {item}</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXCALIBUR IVY PORTFOLIO ── */}
      <section style={{ background: "#F5F3EE", padding: 0 }}>
        {!isMobile ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: 420 }}>
            <div style={{ overflow: "hidden", position: "relative" }}>
              <img src="https://i.imgur.com/f87iq9i.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", padding: "28px 36px" }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>The Excalibur Graduate</p>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,3vw,42px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 8 }}>Excalibur "Ivy" Portfolio</h2>
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
              <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 6 }}>Excalibur "Ivy" Portfolio</h2>
              <p style={{ fontFamily: serif, fontSize: 14, color: gold, fontStyle: "italic" }}>A record that speaks for itself.</p>
            </div>
          </div>
        )}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "36px 24px 0" : "52px 80px 0", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 80 }}>
          <div>
            <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 16 }} />
            <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 1.85, color: "#1a1a1a", fontWeight: 300 }}>Every Excalibur student graduates with a portfolio of documented, verifiable work — one that no other programme in the country offers. This portfolio reflects sustained performance, leadership under pressure, and accountability for outcomes.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 24, height: 1, background: "#000" }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 18, color: "#000", fontWeight: 400, lineHeight: 1.75, fontStyle: "italic" }}>Documented components · Verified · Professionally assembled · Submitted with university applications.</p>
          </div>
        </div>
        <PortfolioIndexWhite isMobile={isMobile} setPage={setPage} />
      </section>

      {/* ── BEYOND THE CLASSROOM CTA ── */}
      <div style={{ background: "#000", padding: isMobile ? "52px 24px" : "64px 80px", borderTop: "1px solid rgba(199,171,117,.1)", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 80, alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.5em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Beyond the Classroom</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 38, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 12 }}>The curriculum is only the beginning.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, marginBottom: 28 }}>Junior Consulting. Apprentice Externships. Micro-Business Launches. Field trips to Silicon Valley, SpaceX, Anthropic, Daytona, and more. Competitions judged by real investors. Discover what Excalibur students do beyond the classroom.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: isMobile ? "flex-start" : "flex-end" }}>
            <button onClick={() => setPage("beyond")} style={{ fontFamily: sans, padding: "14px 40px", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>What's Beyond the Classroom →</button>
            <button onClick={() => setPage("flagship-detail")} style={{ fontFamily: sans, padding: "13px 32px", background: "transparent", border: "1px solid rgba(199,171,117,.35)", color: gold, fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Explore Flagship Program →</button>
          </div>
        </div>
      </div>

      {/* ── APPLY / CHOOSE PROGRAM ── */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>Enrollment</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 40, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 36 }}>Choose Your Program</h2>
          <FlagshipEnrollSelector openInquiry={openInquiry} isMobile={isMobile} />
        </div>
      </div>

      {/* ── SOIREE ── */}
      <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />

    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: FULL PROGRAM
// ─────────────────────────────────────────────
function FullProgramPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [activeMod, setActiveMod] = useState(0);
  React.useEffect(() => { setActiveMod(isMobile ? null : 0); }, [isMobile]);
  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "36px 16px 32px" : "60px 40px 48px", textAlign: "center", position: "relative" }}>
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
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>The Full Program is the complete Excalibur formation — ten months of deliberate development across every discipline that defines a consequential career. It is not a series of workshops. It is a year-long transformation built around a cohort of 20 students who challenge each other and graduate with documented, professional-grade experience.</p>
              <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300 }}>Available as Weekday Track (Tue & Thu, 4:00–6:30 PM) or Saturday Track (every Saturday, 10:30 AM–3:45 PM). Both tracks are identical in curriculum and depth. Both share the same milestone events: Monthly Pitch Nights, the consulting project, the externship, the micro-business launch, and Academy Gala & Graduation Day.</p>
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
              { m: "Month 5", t: "Stocks, Crypto & Market Literacy", items: ["How markets work", "Stock analysis", "Crypto fundamentals", "Trading simulation"] },
    { m: "Month 6", t: "AI & Technology", items: ["How AI works", "No-code tools", "AI-powered research", "Build a tool"] },
              { m: "Month 7", t: "Speaking III + Finance II", items: ["Advanced rhetoric", "Investor Briefing I", "Mid-year competition", "Sector: Finance"] },
              { m: "Month 7–8", t: "Junior Consultant", items: ["Assigned to real business", "On-site observation", "Customer research", "Boardroom Finale"] },
              { m: "Month 9", t: "Public Speaking IV", items: ["Advanced narrative", "Sector speaker series", "Externship begins", "City Champ prep"] },
              { m: "Month 9–10", t: "Leadership & Micro-Business", items: ["Five forms of power", "CEO crisis simulation", "Assigned mentor & funding", "Build real venture"] },
              { m: "Month 10", t: "Academy Gala & Graduation Day", items: ["Investor Briefing II", "Portfolio assembly", "Academy Gala & Graduation Day", "Alumni status"] },
              { m: "Throughout", t: "Sector Rotation", items: ["10 industries, 10 speakers", "Sector Journal", "One case study/month", "Real practitioner every time"] },
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
        <Fade><Eyebrow>EXPLORE THE CURRICULUM</Eyebrow><SectionTitle>Nine Modules in Depth</SectionTitle><Sub>Click any module to read the full description, learning outcomes, and why it matters.</Sub></Fade>
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
              { label: "WEEKDAY TRACK", schedule: "Tuesday & Thursday · 4:00–7:00 PM", details: ["3-hour sessions after school, 6 days per week", "~96 sessions over 10 months · 18 hrs/month", "Guest speakers every Thursday", "Shared events: competitions, Academy Gala & Graduation Day, externship"] },
              { label: "WEEKEND TRACK", schedule: "Every Saturday · 9:00 AM–3:00 PM", details: ["Full-day immersion — deeper workshop time", "~48 Saturdays over 10 months · 6 hrs each", "Guest speakers attend in-person all morning", "Shared events: competitions, Academy Gala & Graduation Day, externship"] },
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
              { tier: "MONTHLY", price: "$1,900", period: "/month", limit: "", features: ["Full 10-month curriculum", "Weekday or Weekend Track", "All guest speakers & sector rotation", "Junior Consultant engagement", "Apprentice Externship placement", "Micro-Business Launch", "Monthly Pitch Night eligibility", "Bound graduation portfolio", "Alumni network access"], accent: false },
              { tier: "ANNUAL", price: "$1,490", period: "/month", limit: "FOUNDING RATE", features: ["Full 10-month curriculum — identical access", "Reserved seat for the full academic year", "Preferred scheduling and priority placement", "Junior Consultant & Externship access", "Micro-business launch in teams with a dedicated mentor", "Bound graduation portfolio", "Alumni network access"], accent: true },
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
          <Sub center>Twenty students. One year of real formation. A foundation for every arena ahead.</Sub>
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
  // breadcrumb marker
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
                  { label: "WEEKDAY TRACK — GROUP A", schedule: "Monday & Wednesday evenings", time: "4:00–6:30 PM" },
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
                        <div key={k}><div style={{ fontFamily: sans, fontSize: 9, letterSpacing: 1.5, color: "#FBF7EE", marginBottom: 3 }}>{k}</div><div style={{ fontFamily: serif, fontSize: 14, color: "#FBF7EE" }}>{v}</div></div>
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
function DailyScheduleSection({ sectionRef }) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("summer");
  const [activeBlock, setActiveBlock] = useState(0);
  const tabs = [
    { id: "summer", label: "Summer Intensive", sched: summerSchedule, subtitle: "Monday – Friday · 9:30 AM – 3:30 PM · July 6–18 & Aug 3–15, 2026" },
    { id: "flagship-wd", label: "Flagship — Weekday", sched: flagshipWeekdaySchedule, subtitle: "Tuesday & Thursday · 4:00–6:15 PM · September 2026 – June 2027" },
    { id: "flagship-sat", label: "Flagship — Saturday", sched: flagshipSaturdaySchedule, subtitle: "Every Saturday · 10:30 AM–3:00 PM · September 2026 – June 2027" },
    { id: "six-week", label: "Six-Week Intensive", sched: sixWeekSchedule, subtitle: "Monday & Wednesday · 4:00–7:00 PM · Four waves per year" },
  ];
  const current = tabs.find(t => t.id === activeTab) || tabs[0];
  return (
    <div ref={sectionRef} style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
      <Fade>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>A Day at Excalibur</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(26px,3vw,38px)", fontWeight: 600, color: "#111", lineHeight: 1.1, marginBottom: 8 }}>What a real session looks like.</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#444", fontWeight: 300, lineHeight: 1.7 }}>Click any block to meet the instructor and see exactly what happens in that session.</p>
        </div>
      </Fade>
      <Fade d={.06}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontFamily: sans, padding: "9px 18px", background: activeTab === t.id ? "#111" : "transparent", border: `1px solid ${activeTab === t.id ? "#111" : "rgba(0,0,0,.2)"}`, color: activeTab === t.id ? "#fff" : "#555", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: activeTab === t.id ? 600 : 400, transition: "all .2s" }}>{t.label}</button>
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
        { label: "WAVE 1 — JULY", dates: "July 6 – 18, 2026", left: summerLeft[0], items: [["Schedule", "Mon–Fri · 9:30 AM–3:30 PM"], ["Duration", "2 weeks"], ["Guest Speakers", "Daily"], ["Finale", "Shark Tank · July 18"]] },
        { label: "WAVE 2 — AUGUST", dates: "Aug 3 – 15, 2026", left: summerLeft[1], items: [["Schedule", "Mon–Fri · 9:30 AM–3:30 PM"], ["Duration", "2 weeks"], ["Guest Speakers", "Daily"], ["Finale", "Shark Tank · Aug 15"]] },
      ].map((t, i) => {
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

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPage("apply")} style={{ fontFamily: sans, flex: 1, padding: "9px 0", background: gold, border: "none", color: "#000", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", cursor: "pointer" }}>APPLY NOW →</button>
              <button onClick={() => setPage("summer-detail")} style={{ fontFamily: sans, flex: 1, padding: "9px 0", border: "1px solid rgba(199,171,117,.3)", color: gold, fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", background: "transparent", cursor: "pointer" }}>LEARN MORE →</button>
            </div>
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
        { label: "WEEKDAY TRACK", schedule: "Tue & Thu · 4:00–6:15 PM", left: flagshipLeft[0], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Tue & Thu evenings"], ["Ends", "June 2027"], ["Price", "$1,900/month"], ["Seats", "20 per cohort"]] },
        { label: "SATURDAY TRACK", schedule: "Saturday · 10:30 AM–3:00 PM", left: flagshipLeft[1], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Full-day Saturdays"], ["Ends", "June 2027"], ["Price", "$1,900/month"], ["Seats", "20 per cohort"]] },
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
function SummerProgramContent({ prog, openInquiry, setPage, scrollToSchedule }) {
  const g = "#C7AB75";
  const sr = "'Cormorant Garamond', Georgia, serif";
  const sn = "'Lato', sans-serif";
  const ey = "'DM Sans', sans-serif";
  return (
    <div>

      {/* 2  -  PHOTO  -  full-width, fixed height, same as desktop */}
      <div style={{ overflow: "hidden", height: 220 }}>
        <img src={prog.photo} alt={prog.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
      </div>

      {/* 3  -  MAIN CONTENT  -  white background */}
      <div style={{ background: "#fff" }}>

        {/* Header block */}
        <div style={{ padding: "32px 20px 24px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: sn, fontSize: 8, color: prog.statusColor, border: `1px solid ${prog.statusColor}`, padding: "3px 10px", letterSpacing: "0.15em", fontWeight: 600 }}>{prog.status}</span>
            <span style={{ fontFamily: ey, fontSize: 8, letterSpacing: "0.3em", color: "rgba(0,0,0,.35)", textTransform: "uppercase" }}>{prog.tag}</span>
          </div>
          <h2 style={{ fontFamily: sr, fontSize: 34, fontWeight: 600, color: "#000", lineHeight: 1.0, marginBottom: 6 }}>{prog.title}</h2>
          <p style={{ fontFamily: sr, fontSize: 15, color: "#8B6914", fontStyle: "italic", marginBottom: 20, lineHeight: 1.4 }}>{prog.tagline}</p>
          <div style={{ width: 32, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 22 }} />
          {prog.desc.split("\n\n").map((para, i) => (
            <p key={i} style={{ fontFamily: sn, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 14 }}>{para}</p>
          ))}
        </div>

        {/* Details grid */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,.07)", borderBottom: "1px solid rgba(0,0,0,.07)", margin: "0 20px" }}>
          {prog.details.map(([k, v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
              <span style={{ fontFamily: ey, fontSize: 8, letterSpacing: "0.2em", color: "rgba(0,0,0,.38)", textTransform: "uppercase", paddingTop: 2 }}>{k}</span>
              <span style={{ fontFamily: sn, fontSize: 12, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.6, whiteSpace: "pre-line" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ padding: "28px 20px 0" }}>
          <p style={{ fontFamily: ey, fontSize: 8, letterSpacing: "0.35em", color: "#8B6914", textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>{prog.featuresLabel}</p>
          {prog.features.map((f, j) => (
            <div key={j} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: "1px solid rgba(0,0,0,.06)", alignItems: "flex-start" }}>
              <span style={{ fontFamily: sr, fontSize: 10, color: "rgba(0,0,0,.18)", fontStyle: "italic", flexShrink: 0, paddingTop: 2 }}>{String(j + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: sn, fontSize: 12, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.75 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* A Day at Excalibur CTA  -  matches desktop right-column block */}
        <div style={{ margin: "28px 20px", background: "#000", padding: "24px 22px" }}>
          <p style={{ fontFamily: ey, fontSize: 8, letterSpacing: "0.4em", color: g, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>A Day at Excalibur</p>
          <h3 style={{ fontFamily: sr, fontSize: 20, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 8 }}>What a real session looks like.</h3>
          <p style={{ fontFamily: sn, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 18 }}>Tap to see the full daily schedule for the Summer Intensive.</p>
          <button onClick={scrollToSchedule} style={{ fontFamily: sn, background: g, border: "none", color: "#000", padding: "12px 22px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>VIEW FULL DAY SCHEDULE →</button>
        </div>

        {/* CTA Buttons */}
        <div style={{ padding: "0 20px 36px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => openInquiry && openInquiry(prog.id)} style={{ fontFamily: sn, padding: "15px 28px", background: "#000", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>APPLY NOW →</button>
          <button onClick={() => setPage("summer-detail")} style={{ fontFamily: sn, padding: "15px 22px", background: "transparent", border: "1px solid rgba(0,0,0,.2)", color: "#000", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>LEARN MORE →</button>
        </div>
      </div>
    </div>
  );
}

function DarkProgramContent({ prog, openInquiry, setPage }) {
  const g = "#C7AB75";
  const sr = "'Cormorant Garamond', Georgia, serif";
  const sn = "'Lato', sans-serif";
  const ey = "'DM Sans', sans-serif";
  const hasPic = !!prog.photo;
  return (
    <div style={{ background: "#000" }}>

      {/* Photo strip if program has one (Flagship) */}
      {hasPic && (
        <div style={{ overflow: "hidden", height: 220 }}>
          <img src={prog.photo} alt={prog.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
        </div>
      )}

      {/* Main content */}
      <div style={{ padding: "32px 20px 0" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontFamily: sn, fontSize: 8, color: prog.statusColor, border: `1px solid ${prog.statusColor}`, padding: "3px 10px", letterSpacing: "0.15em", fontWeight: 600 }}>{prog.status}</span>
          <span style={{ fontFamily: ey, fontSize: 8, letterSpacing: "0.3em", color: "rgba(199,171,117,.35)", textTransform: "uppercase" }}>{prog.tag}</span>
        </div>
        <h2 style={{ fontFamily: sr, fontSize: 34, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 6 }}>{prog.title}</h2>
        <p style={{ fontFamily: sr, fontSize: 15, color: g, fontStyle: "italic", marginBottom: 20, lineHeight: 1.4 }}>{prog.tagline}</p>
        <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${g}, transparent)`, marginBottom: 22 }} />
        {prog.desc.split("\n\n").map((para, i) => (
          <p key={i} style={{ fontFamily: sn, fontSize: 13, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>{para}</p>
        ))}
      </div>

      {/* Details */}
      <div style={{ borderTop: "1px solid rgba(199,171,117,.07)", borderBottom: "1px solid rgba(199,171,117,.07)", margin: "0 20px" }}>
        {prog.details.map(([k, v]) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(199,171,117,.05)" }}>
            <span style={{ fontFamily: ey, fontSize: 8, letterSpacing: "0.2em", color: "rgba(199,171,117,.38)", textTransform: "uppercase", paddingTop: 2 }}>{k}</span>
            <span style={{ fontFamily: sn, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6, whiteSpace: "pre-line" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{ fontFamily: ey, fontSize: 8, letterSpacing: "0.35em", color: g, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>{prog.featuresLabel}</p>
        {prog.features.map((f, j) => (
          <div key={j} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
            <span style={{ fontFamily: sr, fontSize: 10, color: "rgba(199,171,117,.25)", fontStyle: "italic", flexShrink: 0, paddingTop: 2 }}>{String(j + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: sn, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.75 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div style={{ padding: "28px 20px 36px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => openInquiry && openInquiry(prog.id)} style={{ fontFamily: sn, padding: "15px 28px", background: g, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>
          {prog.flagship ? "APPLY — FLAGSHIP →" : "APPLY NOW →"}
        </button>
        <button onClick={() => setPage(prog.flagship ? "flagship-detail" : prog.id)} style={{ fontFamily: sn, padding: "15px 20px", background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: g, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>LEARN MORE →</button>
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
  const scheduleRef = React.useRef(null);
  const scrollToSchedule = () => scheduleRef.current && scheduleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

  const programs = [
    {
      tag: "SUMMER INTENSIVE", id: "summer", flagship: false, status: "WAITLIST NOW OPEN", statusColor: "#4DB87A",
      title: "Summer Intensive",
      tagline: "Two weeks. Full days. Venture & Leadership Launchpad.",
      photo: "https://i.imgur.com/ua2WSIA.jpeg",
      desc: "The Summer Intensive is a two-week, full-day program offered in July and August for high school students ages 15–18 who are ready to turn ambition into discipline and action.\n\nEvery day begins with public speaking and executive communication training. Students are on their feet from the first morning — practicing voice, presence, eye contact, persuasion, and composure under pressure.\n\nThe core of the program is venture development. Working in teams, students research a market, identify a real problem, define their customer, study the competition, build a marketing strategy, and structure a business plan.\n\nApplied workshops, AI tool sessions, and daily guest speakers from business and entrepreneurship support the venture work throughout the two weeks, helping students turn an idea into a pitch-ready concept.\n\nThe program culminates in the Shark Tank Inspired — Excalibur Venture Finale — a live pitch competition where student teams present their business plans before investors, entrepreneurs, executives, and invited judges.\n\nTeams are evaluated on the strength of their concept, market research, customer insight, marketing strategy, business logic, and composure under questioning. Awards are presented for the strongest performances, with prizes ranging from premium business accessories to custom surfboards, scooters, event tickets and cash awards.",
      details: [
        ["Schedule", "Wave I: July 6–18, 2026  ·  Wave II: August 3–15, 2026\nMonday–Friday · 9:30 AM–3:30 PM"],
        ["Class Size", "Limited to 20 students per wave"],
        ["Tuition", "$410 / full day · $4,500 per wave"],
        ["Included", "Catered lunches from local restaurants, distinguished guest speakers, faculty-led workshops, pitch development, and The Excalibur Venture Grand Finale before families and invited professionals."],
      ],
      features: [
        "Daily public speaking and executive communication training",
        "Venture development — market research, competitor analysis, business planning",
        "Marketing strategy, branding, and customer psychology",
        "AI tools for business research, analysis, and presentation",
        "Sales, persuasion, and pitch training",
        "Distinguished guest speakers from different industry sectors, business and entrepreneurship daily",
        "Excalibur Venture Finale — live Shark Tank-inspired pitch before real investors, entrepreneurs, and executives",
        "Bound Certificate of Completion and Graduate Portfolio",
        "Catered daily lunches, snacks, smoothies and refreshments",
        "Daily Academy Shuttle for pick up/drop off (for South OC students)",
      ],
      featuresLabel: "What’s Included",
    },
    {
      tag: "TEN-MONTH FLAGSHIP", id: "full-program", flagship: true, status: "ENROLLING SOON", statusColor: gold,
      title: "Ten-Month Program",
      tagline: "The complete formation.",
      photo: "https://i.imgur.com/eyeb9rX.jpeg",
      desc: "The Excalibur Ten-Month Flagship is the Academy’s primary program — a complete, ten-month course of excellence for ambitious high school students in Orange County, California.\n\nOffered in two parallel tracks — Weekday (Tuesday & Thursday evenings) and Saturday (morning) — both deliver identical curriculum, the same faculty, and the same standard of instruction. Students choose the track that fits their schedule; the formation they receive is the same.\n\nAcross ten months, students progress through all ten core disciplines: Public Speaking & Rhetoric, Financial Literacy, Business Model Analysis, The Art of Selling & Marketing, Stocks, Crypto & Market Literacy, AI & Technology, Leadership & Influence, Intellectual Depth & The Art of Class, Industry Sectors Rotation, and College Admissions & Personal Development.\n\nEach month, a dedicated specialist — a working executive, investor, or entrepreneur — leads the core curriculum block. The Lead Instructor runs the applied workshops and executive business simulations in every session. The Public Speaking Instructor opens every class.\n\nBeyond the classroom, students complete three real-world engagements: the Junior Consultant Program (advising a real local business), the Apprentice Externship (4–6 weeks embedded inside a company), and the Micro-business launch in teams with a dedicated mentor.\n\nThe program concludes in June with Academy Gala & Graduation Day — the Flagship capstone — where student teams present their micro-businesses before families, mentors, investors, invited guests, and a panel of judges.\n\nGraduates leave with the Excalibur Academy Portfolio — a professionally assembled record designed to support college applications — along with real-world experience, lasting friendships, greater confidence, and skills for every arena ahead.",
      details: [
        ["Schedule", "Weekday: Tue & Thu · 4:00–6:30 PM (Group B)\nor Saturday: 10:30 AM–3:45 PM (Group A)"],
        ["Class Size", "20 per track · Founding Class"],
        ["Tuition", "$1,900 / month"],
        ["Dates", "September 2026 – June 2027"],
      ],
      features: [
        "All 10 core modules at full depth across a structured 4-phase arc",
        "12 industry sector rotations — one dedicated guest professional per month",
        "Three-block session model: Speaking Coach + War Room + Specialist",
        "Junior Consultant Program — 3-week advisory engagement with a real local business",
        "Apprentice Externship — 4–6 weeks embedded inside a company in your chosen industry",
        "Micro-business launch in teams with a dedicated mentor",
        "Monthly Pitch Night before live judges, investors, and parents",
        "OC Championship (biannual) — competitive pitch event at a premium venue",
        "Bound Excalibur Portfolio — every analysis, report, and competition result, professionally compiled",
        "Faculty letters of recommendation from lead executives and practitioners",
        "College admissions strategy and portfolio review with a dedicated advisor",
        "Alumni network access — graduates, faculty, mentors, and guest speakers",
      ],
      featuresLabel: "The Formation",
    },
    {
      tag: "SIX-WEEK INTENSIVE", id: "intensive", flagship: false, status: "ENROLLING SOON", statusColor: gold,
      title: "Six-Week Intensive",
      tagline: "The compressed formation.",
      photo: "https://i.imgur.com/P86gddQ.png",
      desc: "A compressed version of the flagship curriculum. One discipline per week, building toward a Shark Tank–style Finale. Two tracks — Monday & Wednesday evenings or Sunday mornings. Twelve total sessions, structured as 12 sessions of three hours each.",
      details: [
        ["Schedule", "Mon & Wed evenings · 4:00–6:30 PM (Group A)\nor Sunday (Group B)"],
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
      <Breadcrumb items={[{label:"Our Programs",page:"programs"}]} setPage={setPage} />
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

        {/* Program selector  -  luxury three-panel cards */}
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
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: activeProgram === i ? "#FBF7EE" : "#FBF7EE", lineHeight: 1.1, marginBottom: 4 }}>{p.title}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: activeProgram === i ? gold : "rgba(199,171,117,.4)", fontStyle: "italic" }}>{p.tagline}</p>
                  </div>
                  <span style={{ fontFamily: sans, fontSize: 20, color: activeProgram === i ? gold : "rgba(199,171,117,.3)", transform: activeProgram === i ? "rotate(45deg)" : "none", transition: "transform .3s", flexShrink: 0, marginLeft: 12 }}>+</span>
                </button>
                {/* Content drops right below this card on mobile */}
                {activeProgram === i && (
                  <div style={{ background: "#000" }}>
                    {p.id === "summer" ? <SummerProgramContent prog={p} openInquiry={openInquiry} setPage={setPage} scrollToSchedule={scrollToSchedule} /> : <DarkProgramContent prog={p} openInquiry={openInquiry} setPage={setPage} />}
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

        {/* Program detail  -  desktop only; mobile renders content inside each accordion card */}
        {!isMobile && <div key={activeProgram}>

          {prog.id === "summer" ? (
            /* ── SUMMER: tracker above photo, then white content below ── */
            <div>

              {/* Photo  -  controlled height strip */}
              <div style={{ background: "#000", overflow: "hidden", height: isMobile ? 200 : 320 }}>
                <img src="https://i.imgur.com/N4OB8dS.jpeg" alt="Summer Intensive at Excalibur" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              </div>

              {/* Content below photo  -  white background, two columns */}
              <div style={{ background: "#fff", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>

                {/* LEFT  -  heading, desc, details */}
                <div style={{ padding: isMobile ? "36px 24px" : "52px 52px", borderRight: isMobile ? "none" : "1px solid rgba(0,0,0,.07)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: sans, fontSize: 9, color: prog.statusColor, border: `1px solid ${prog.statusColor}`, padding: "3px 10px", letterSpacing: "0.15em", fontWeight: 600 }}>{prog.status}</span>
                    <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.3em", color: "rgba(0,0,0,.35)", textTransform: "uppercase" }}>{prog.tag}</span>
                  </div>
                  <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 42, fontWeight: 600, color: "#000", lineHeight: 1.0, marginBottom: 8 }}>{prog.title}</h2>
                  <p style={{ fontFamily: serif, fontSize: 16, color: "#8B6914", fontStyle: "italic", marginBottom: 28, lineHeight: 1.4 }}>{prog.tagline}</p>
                  <div style={{ width: 32, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 24 }} />
                  {prog.desc.split("\n\n").map((para, i) => (
                    <p key={i} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 14 }}>{para}</p>
                  ))}
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
                    <button onClick={() => setPage("summer-detail")} style={{ fontFamily: sans, padding: "13px 28px", background: "transparent", border: "1px solid rgba(0,0,0,.25)", color: "#000", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>
                  </div>
                </div>

                {/* RIGHT  -  features */}
                <div style={{ padding: isMobile ? "36px 24px" : "52px 52px", background: "#fafafa" }}>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: "#8B6914", textTransform: "uppercase", fontWeight: 600, marginBottom: 20 }}>{prog.featuresLabel}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 36 }}>
                    {prog.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(0,0,0,.07)", alignItems: "flex-start" }}>
                        <span style={{ fontFamily: serif, fontSize: 11, color: "rgba(0,0,0,.2)", fontStyle: "italic", flexShrink: 0, paddingTop: 2 }}>{String(j + 1).padStart(2, "0")}</span>
                        <span style={{ fontFamily: sans, fontSize: 13, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.7 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {/* Day at Excalibur */}
                  <div style={{ background: "#000", padding: "28px 28px" }}>
                    <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>A Day at Excalibur</p>
                    <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 8 }}>What a real session looks like.</h3>
                    <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 18 }}>Click any block to meet the instructor and see exactly what happens in that session. Summer Intensive.</p>
                    <button onClick={scrollToSchedule} style={{ fontFamily: sans, background: gold, border: "none", color: "#000", padding: "11px 22px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>VIEW FULL DAY SCHEDULE →</button>
                  </div>
                </div>
              </div>
            </div>

          ) : prog.id === "full-program" ? (
            /* ── FLAGSHIP: mirrors summer layout but black background ── */
            <div>
              {/* Photo strip */}
              <div style={{ background: "#000", overflow: "hidden", height: isMobile ? 200 : 320 }}>
                <img src={prog.photo} alt={prog.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              </div>

              {/* Content  -  black background, two columns */}
              <div style={{ background: "#000", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0 }}>

                {/* LEFT */}
                <div style={{ padding: isMobile ? "36px 24px" : "52px 52px", borderRight: isMobile ? "none" : "1px solid rgba(199,171,117,.07)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: sans, fontSize: 9, color: prog.statusColor, border: `1px solid ${prog.statusColor}`, padding: "3px 10px", letterSpacing: "0.15em", fontWeight: 600 }}>{prog.status}</span>
                    <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.3em", color: "#C7AB75", textTransform: "uppercase" }}>{prog.tag}</span>
                  </div>
                  <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 42, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 8 }}>{prog.title}</h2>
                  <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic", marginBottom: 28, lineHeight: 1.4 }}>{prog.tagline}</p>
                  <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
                  {prog.desc.split("\n\n").map((para, i) => (
                    <p key={i} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>{para}</p>
                  ))}
                  <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid rgba(199,171,117,.08)", paddingTop: 20 }}>
                    {prog.details.map(([k, v]) => (
                      <div key={k} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 16, padding: "10px 0", borderBottom: "1px solid rgba(199,171,117,.06)" }}>
                        <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.2em", color: "rgba(199,171,117,.45)", textTransform: "uppercase", paddingTop: 2 }}>{k}</span>
                        <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6, whiteSpace: "pre-line" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button onClick={() => openInquiry && openInquiry(prog.id)} style={{ fontFamily: sans, padding: "13px 32px", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>APPLY — FLAGSHIP →</button>
                    <button onClick={() => setPage("flagship-detail")} style={{ fontFamily: sans, padding: "13px 28px", background: "transparent", border: `1px solid rgba(199,171,117,.35)`, color: gold, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>
                  </div>
                </div>

                {/* RIGHT  -  features + Day at Excalibur */}
                <div style={{ padding: isMobile ? "36px 24px" : "52px 52px", background: "#080808" }}>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: gold, textTransform: "uppercase", fontWeight: 600, marginBottom: 20 }}>{prog.featuresLabel}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 36 }}>
                    {prog.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
                        <span style={{ fontFamily: serif, fontSize: 11, color: "rgba(199,171,117,.3)", fontStyle: "italic", flexShrink: 0, paddingTop: 2 }}>{String(j + 1).padStart(2, "0")}</span>
                        <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {/* Day at Excalibur */}
                  <div style={{ background: "#06050A", border: "1px solid rgba(199,171,117,.12)", padding: "28px 28px" }}>
                    <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>A Day at Excalibur</p>
                    <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 8 }}>What a real session looks like.</h3>
                    <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 18 }}>Click any block to meet the instructor and see exactly what happens in that session. Flagship Program.</p>
                    <button onClick={scrollToSchedule} style={{ fontFamily: sans, background: gold, border: "none", color: "#000", padding: "11px 22px", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>VIEW FULL DAY SCHEDULE →</button>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── SIX-WEEK: dark two-column layout ── */
            <div>
              {/* Photo strip */}
              <div style={{ height: isMobile ? 200 : 320, overflow: "hidden", background: "#000" }}>
                <img src={prog.photo} alt={prog.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              </div>
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
                      <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.2em", color: "#C7AB75", textTransform: "uppercase", paddingTop: 2 }}>{k}</span>
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
                  <button onClick={() => setPage(prog.flagship ? "flagship-detail" : prog.id)} style={{ fontFamily: sans, padding: "13px 28px", background: "transparent", border: `1px solid ${gold}`, color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>}
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
              { n: "BLOCK 1", title: "Public Speaking Instructor", sub: "Opens every session", desc: "Speaking warm-up, impromptu drills, pitch practice, debate exercises, rhetoric training. The Speaking Coach sets the energy for the entire session. By graduation, students will have completed 120+ individual speaking reps across structured and unstructured exercises." },
              { n: "BLOCK 2", title: "Specialist Instructor", sub: "The month's module", desc: "The monthly specialist delivers their core module content — Finance, AI & tech, Sales, Leadership, Crypto & Trading, Intellectual Depth & Art of Networking, Business Models, or Industry Sectors. Each specialist is a practitioner with real-world experience in the discipline they teach." },
              { n: "BLOCK 3", title: "Lead Instructor — The War Room", sub: "The real world, every week", desc: "Rotates weekly between: (1) current events and business news analysis, (2) start-up simulations, risk management & weekly case study deconstruction — approximately 30–40 companies by graduation, (3) guest industry speaker once per month, and (4) applied workshop where students immediately apply the specialist's content." },
            ].map((b, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 30px", borderTop: `2px solid ${gold}` }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.25em", color: gold, marginBottom: 10, fontWeight: 700 }}>{b.n}</div>
                <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#FBF7EE", marginBottom: 4, lineHeight: 1.2 }}>{b.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.1em", marginBottom: 16 }}>{b.sub}</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>

      <section style={{ background: "#FAF8F4" }}>
      {/* INTERACTIVE DAILY SCHEDULE */}
      <DailyScheduleSection sectionRef={scheduleRef} />
      </section>

      {/* SCHEDULE */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <Fade><Eyebrow>2026–2027 SCHEDULE</Eyebrow><SectionTitle>Enrollment & Tracks.</SectionTitle></Fade>
        <div style={{ marginTop: 36 }}>
          <ScheduleTabs setPage={setPage} isMobile={isMobile} waves={waves} gold={gold} />
        </div>
      </div>

    <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: APPLY
// ─────────────────────────────────────────────
function ApplyPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const faqs = [
    { q: "Is Excalibur only for students who already have business experience?", a: "No. Excalibur is designed for motivated students with curiosity, maturity, and readiness to grow. Prior business experience is not the point. The program is built to develop communication, judgment, leadership, and execution." },
    { q: "Is the application difficult?", a: "No. The application is intentionally straightforward. The process is selective, but not complicated." },
    { q: "How quickly will families hear back?", a: "A member of the admissions team will follow up within 24 hours after an inquiry or application submission." },
    { q: "Are parents involved?", a: "Yes. Families receive onboarding information, access to the family portal, invitations to key events, and communication from the Excalibur team. Families are also invited to selected presentations, final events, and the Family Information Session." },
    { q: "What makes the program selective?", a: "Cohort size, student readiness, and fit. Excalibur is designed around direct feedback, discussion, public speaking, team work, and applied challenges. The admissions process helps ensure students are ready to participate fully." },
    { q: "What happens after acceptance?", a: "Accepted families receive onboarding materials, portal access, schedule details, dietary forms, event information, and preparation materials before the program begins." },
  ];

  const steps = [
    {
      n: "01",
      title: "Submit the Program Application",
      body: "The application is short, clear, and designed to be respectful of each family's time. Excalibur is selective, and every application is reviewed personally by the admissions team.",
    },
    {
      n: "02",
      title: "Admissions Follow-Up",
      body: "A member of the admissions team will contact the family within 24 hours to answer questions, discuss the student's interests, and confirm availability for the selected program or wave.\n\nThis conversation is personal, not bureaucratic. It helps determine whether Excalibur is the right fit and gives families a clear understanding of the program experience.",
    },
    {
      n: "03",
      title: "Admissions Review",
      body: "The Academy reviews each application for readiness, motivation, maturity, and fit with the selected cohort.\n\nWhen appropriate, a student conversation may be scheduled to better understand the student's interests, goals, and ability to contribute to the room.",
    },
    {
      n: "04",
      title: "Secure Enrollment",
      body: "Once accepted, families may secure the student's seat with a deposit. Enrollment is limited, and seats are confirmed in the order of acceptance and deposit completion.",
    },
    {
      n: "05",
      title: "Pre-Program Onboarding",
      body: "Before the program begins, confirmed families receive a welcome packet, program overview, schedule details, dietary preference form, and an invitation to a Family Information Session held before the wave or program start.\n\nEach family is also given access to the Excalibur student and family portals, where schedules, event information, lunch selections, shuttle requests if needed, team communication, and administrative updates are managed in one place.",
    },
  ];

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden", height: isMobile ? 420 : 580 }}>
        <img src="https://i.imgur.com/aDzpYsK.jpeg" alt="Excalibur Admissions" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.2) 0%, rgba(0,0,0,.9) 100%)" }} />
        <div style={{ position: "absolute", bottom: isMobile ? 36 : 64, left: isMobile ? 24 : 72, maxWidth: 720 }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>Admissions · Excalibur Academy</p>
            <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(34px,7vw,48px)" : "clamp(48px,5vw,72px)", fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 16, letterSpacing: "0.02em" }}>For students ready to<br />turn dreams into reality.</h1>
            <div style={{ width: 48, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 18 }} />
            <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, maxWidth: 580 }}>Excalibur Academy admits a limited number of students into each cohort to preserve the quality of instruction, discussion, mentorship, and feedback. The admissions process is personal, selective, and intentionally straightforward. It is designed to understand the student, answer the family's questions, and ensure a strong fit for the Academy.</p>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 13 : 15, color: gold, fontStyle: "italic", marginTop: 16 }}>Applications are now open for Summer 2026.</p>
          </Fade>
        </div>
      </div>

      {/* ── PROGRAMS ACCEPTING APPLICATIONS ── */}
      <div style={{ background: "#000", padding: isMobile ? "60px 24px" : "80px 80px", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 32 : 52, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 52, letterSpacing: "0.02em" }}>Programs Accepting Applications</h2>
          </Fade>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              {
                status: "ACCEPTING APPLICATIONS NOW", statusColor: "#4DB87A",
                label: "Summer Intensive", dates: "July & August 2026",
                price: "$410 / full day", period: "· $4,500 per wave",
                desc: "A two-week intensive for high school students aged 15–18 (rising juniors and seniors) who want to experience Excalibur's core model in a concentrated format.\n\nStudents train in public speaking, business, leadership, AI, sales, venture development, and applied strategy — culminating in The Excalibur Venture Court, a Shark Tank–inspired pitch finale before families, investors, entrepreneurs, and invited judges.\n\nLimited enrollment per wave. 20 per cohort.",
                page: "summer-detail",
              },
              {
                status: "ENROLLING SOON", statusColor: gold,
                label: "Ten-Month Flagship", dates: "September 2026 – June 2027",
                price: "$1,990", period: "per month",
                desc: "Excalibur's complete September-to-June program for ambitious high school juniors and seniors.\n\nStudents move through all ten core disciplines, complete real-world engagements, participate in selected expeditions, present at Excalibur Academy Gala & Graduation Day, and graduate with the Excalibur Academy Portfolio — a professionally assembled record of work designed to support college applications and distinguish students through evidence of leadership, communication, execution, and real-world experience.",
                page: "flagship-detail",
              },
              {
                status: "ENROLLING SOON", statusColor: gold,
                label: "Six-Week Intensive", dates: "Four waves per year",
                price: "$3,900", period: "per wave",
                desc: "A focused version of Excalibur's core curriculum, offered in weekday evening or Sunday half-day formats.\n\nStudents progress through the Academy's core disciplines, practice public speaking in every class, work with guest speakers and specialist instructors, develop a team venture project, and conclude with a judged Academy Gala & Graduation Day.\n\nPriority consideration may be given to students applying later for the Ten-Month Flagship.",
                page: "intensive",
              },
            ].map((prog, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 0, borderTop: "1px solid rgba(199,171,117,.1)", padding: isMobile ? "36px 0" : "52px 0", alignItems: "start" }}>
                {/* Left  -  label, price, status */}
                <div style={{ paddingRight: isMobile ? 0 : 64, marginBottom: isMobile ? 24 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: prog.statusColor, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.22em", color: prog.statusColor, fontWeight: 700, textTransform: "uppercase" }}>{prog.status}</span>
                  </div>
                  <h3 style={{ fontFamily: serif, fontSize: isMobile ? 32 : 48, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 4, letterSpacing: "0.01em" }}>{prog.label}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: gold, textTransform: "uppercase", marginBottom: 32, fontWeight: 400 }}>{prog.dates}</p>
                  <div>
                    <span style={{ fontFamily: serif, fontSize: isMobile ? 40 : 52, fontWeight: 300, color: gold, letterSpacing: "-0.02em", lineHeight: 1 }}>{prog.price}</span>
                    <span style={{ fontFamily: sans, fontSize: 12, color: gold, fontWeight: 300, marginLeft: 8 }}>{prog.period}</span>
                  </div>
                  <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button onClick={() => openInquiry && openInquiry()} style={{ fontFamily: sans, padding: "13px 32px", background: gold, border: "none", color: "#000", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Apply Now →</button>
                    <button onClick={() => setPage(prog.page)} style={{ fontFamily: sans, padding: "13px 24px", background: "transparent", border: "1px solid rgba(199,171,117,.3)", color: gold, fontSize: 10, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Learn More →</button>
                  </div>
                </div>
                {/* Right  -  description */}
                <div style={{ borderLeft: isMobile ? "none" : "1px solid rgba(199,171,117,.1)", paddingLeft: isMobile ? 0 : 64 }}>
                  {prog.desc.split("\n\n").map((para, j) => (
                    <p key={j} style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: j < 2 ? 16 : 0 }}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW TO APPLY  -  interactive vertical steps ── */}
      <div style={{ background: "#FAF8F4", padding: isMobile ? "60px 24px" : "80px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>How to Apply</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 48, fontWeight: 300, color: "#111", lineHeight: 1.0, marginBottom: 52, letterSpacing: "0.01em" }}>Five steps. Admissions Process.</h2>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 80, alignItems: "start" }}>
            {/* Left  -  step list */}
            <div style={{ background: "#FAF8F4" }}>
              {steps.map((step, i) => {
                const isActive = activeStep === i;
                return (
                  <div key={i} onClick={() => setActiveStep(i)} style={{ cursor: "pointer", borderTop: "1px solid rgba(0,0,0,.08)", padding: "24px 0", transition: "all .2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ width: 48, height: 48, border: `1.5px solid ${isActive ? "#111" : "rgba(0,0,0,.15)"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isActive ? "#111" : "transparent", transition: "all .25s" }}>
                        <span style={{ fontFamily: serif, fontSize: 16, fontWeight: isActive ? 600 : 300, color: isActive ? "#fff" : "#555", transition: "all .25s" }}>{step.n}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, fontWeight: isActive ? 600 : 400, color: isActive ? "#111" : "#555", lineHeight: 1.2, transition: "all .25s" }}>{step.title}</p>
                      </div>
                      <span style={{ fontFamily: sans, fontSize: 18, color: isActive ? "#111" : "#bbb", transition: "all .25s", transform: isActive ? "rotate(45deg)" : "none", display: "inline-block", flexShrink: 0 }}>+</span>
                    </div>
                    {isMobile && isActive && (
                      <div style={{ paddingLeft: 68, paddingTop: 16, paddingBottom: 8 }}>
                        {step.body.split("\n\n").map((p, j) => (
                          <p key={j} style={{ fontFamily: sans, fontSize: 13, color: "#333", fontWeight: 300, lineHeight: 1.85, marginBottom: j < step.body.split("\n\n").length - 1 ? 12 : 0 }}>{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ borderTop: "1px solid rgba(0,0,0,.08)" }} />
            </div>
            {/* Right  -  active step detail (desktop) */}
            {!isMobile && (
              <div style={{ position: "sticky", top: 80 }}>
                <div style={{ background: "#111", padding: "48px 44px", minHeight: 360 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.4em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Step {steps[activeStep] && steps[activeStep].n}</p>
                  <h3 style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.15, marginBottom: 24 }}>{steps[activeStep] && steps[activeStep].title}</h3>
                  <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
                  {steps[activeStep] && steps[activeStep].body.split("\n\n").map((p, j) => (
                    <p key={j} style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* ── TEN-MONTH INTERVIEW NOTE ── */}
      <div style={{ background: "#FAF8F4", padding: isMobile ? "60px 24px" : "80px 80px", borderTop: "1px solid rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ paddingLeft: isMobile ? 20 : 44, borderLeft: "3px solid #111" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Ten-Month Flagship · Admissions Interview</p>
            <h3 style={{ fontFamily: serif, fontSize: isMobile ? 22 : 32, fontWeight: 300, color: "#111", lineHeight: 1.15, marginBottom: 24 }}>Admission to the Ten-Month Flagship includes a brief admissions interview with the Excalibur Admissions Committee.</h3>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#222", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>Interviews are approximately 15–20 minutes and are held on alternating Saturdays. Students meet with members of the Academy leadership team, which may include the Academy Dean, Dean of Admissions, lead faculty, and admissions committee members.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#222", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>The interview is not designed to test perfection. Excalibur is not looking for the flawless résumé, the highest grades alone, or the most rehearsed answers. The Academy looks for students with curiosity, drive, resilience, critical thinking, and the readiness to step into the real world — intellectually, socially, and practically.</p>
            <p style={{ fontFamily: serif, fontSize: 16, color: "#8B6914", fontStyle: "italic", lineHeight: 1.7 }}>We are looking for dreamers with discipline, builders with courage, and students prepared to think seriously, work hard, receive feedback, and take responsibility for their growth.</p>
          </div>
        </div>
      </div>

      }      </div>

      {/* ── FAMILY INFORMATION SESSION + WHAT HAPPENS AFTER ── */}
      <div style={{ background: "#000", padding: isMobile ? "60px 24px" : "80px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 52 : 80 }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>The Family Information Session</p>
            <h3 style={{ fontFamily: serif, fontSize: isMobile ? 24 : 34, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 24 }}>Before the program begins, families are brought inside the experience.</h3>
            <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>Confirmed families will receive an invitation to a Family Information Session before the start of the program.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>The session is designed to introduce families to the Academy's structure, location, schedule, expectations, faculty model, student experience, final events, logistics, and communication systems.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 28 }}>Families will have the opportunity to ask questions, meet members of the Excalibur team and the Faculty, and understand how the program is designed to support each student from the first day through Academy Gala & Graduation Day.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 32 }}>Each family will also receive access to the Excalibur student and family portal — where schedules, event information, lunch selections, shuttle requests if needed, faculty communications, team updates, and all administrative information are managed in one place.</p>
            <button onClick={() => setPage("events")} style={{ fontFamily: sans, padding: "12px 28px", background: "transparent", border: `1px solid rgba(199,171,117,.4)`, color: gold, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>View Upcoming Events →</button>
          </Fade>
          <Fade d={.08}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>What Happens After Acceptance</p>
            <h3 style={{ fontFamily: serif, fontSize: isMobile ? 24 : 34, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 24 }}>A clear path before the first day.</h3>
            <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 24 }}>Accepted students and families receive everything needed to prepare for the program:</p>
            {["Welcome packet", "Program schedule", "Faculty and instructor overview", "Family Information Session invitation", "Portal access", "Dietary preference and allergy form", "Lunch selection system", "Shuttle request options, if available", "Event calendar", "Student expectations", "Communication channels with the Excalibur team"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(199,171,117,.08)", alignItems: "center" }}>
                <span style={{ fontFamily: serif, fontSize: 11, color: gold, flexShrink: 0 }}>—</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
            <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginTop: 24, lineHeight: 1.7 }}>The goal is to make the process polished, organized, and personal from the beginning.</p>
          </Fade>
        </div>
      </div>

      {/* ── STANDARD OF THE ROOM ── */}
      <div style={{ background: "#FAF8F4", padding: isMobile ? "60px 24px" : "80px 80px", borderTop: "1px solid rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>The Standard of the Room</p>
            <h3 style={{ fontFamily: serif, fontSize: isMobile ? 24 : 34, fontWeight: 300, color: "#111", lineHeight: 1.1, marginBottom: 24 }}>Limited Cohort.</h3>
            <div style={{ width: 36, height: 1, background: "#111", marginBottom: 24 }} />
            <p style={{ fontFamily: sans, fontSize: 14, color: "#222", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>At Excalibur, the people in the room shape the experience.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#222", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>Students are expected to show up prepared, participate seriously, treat others with respect, and contribute to a culture of ambition, curiosity, and excellence.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#222", fontWeight: 300, lineHeight: 1.9, marginBottom: 24 }}>The Academy is not built around passive attendance. It is built around active participation: speaking, listening, building, questioning, presenting, receiving feedback, and improving.</p>
            <p style={{ fontFamily: serif, fontSize: 16, color: "#8B6914", fontStyle: "italic", lineHeight: 1.6 }}>The standard is high because the opportunity is serious.</p>
          </Fade>
        </div>
      </div>

      {/* ── EXCALIBUR IVY PORTFOLIO ── full copy from home page ── */}
      <section style={{ background: "#F5F3EE", padding: 0 }}>
        {!isMobile ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: 420 }}>
            <div style={{ overflow: "hidden", position: "relative" }}>
              <img src="https://i.imgur.com/f87iq9i.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", padding: "28px 36px" }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>The Excalibur Graduate</p>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,3vw,42px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 8 }}>Excalibur "Ivy" Portfolio</h2>
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
              <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 6 }}>Excalibur "Ivy" Portfolio</h2>
              <p style={{ fontFamily: serif, fontSize: 14, color: gold, fontStyle: "italic" }}>A record that speaks for itself.</p>
            </div>
          </div>
        )}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "36px 24px 0" : "52px 80px 0", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 80 }}>
          <div>
            <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 16 }} />
            <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 1.85, color: "#1a1a1a", fontWeight: 300 }}>Every Excalibur student graduates with a portfolio of documented, verifiable work — one that no other programme in the country offers. This portfolio reflects sustained performance, leadership under pressure, and accountability for outcomes.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 24, height: 1, background: "#000" }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 18, color: "#000", fontWeight: 400, lineHeight: 1.75, fontStyle: "italic" }}>Documented components · Verified · Professionally assembled · Submitted with university applications.</p>
          </div>
        </div>
        <PortfolioIndexWhite isMobile={isMobile} setPage={setPage} />
      </section>

      {/* ── TUITION ── */}
      <div style={{ background: "#000", padding: isMobile ? "60px 24px" : "80px 80px", borderTop: "1px solid rgba(199,171,117,.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Tuition & Enrollment</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 48, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 8, letterSpacing: "0.01em" }}>Program tuition varies by track.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, marginBottom: 52, maxWidth: 620 }}>Tuition depends on the selected program and schedule. Families receive complete tuition details, deposit information, and payment options during the admissions process.</p>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 0 }}>
            {[
              { label: "Summer Intensive", price: "$410", period: "per full day · $4,500 per wave", detail: "Two waves — July & August 2026.\n20 students per wave." },
              { label: "Six-Week Intensive", price: "$3,900", period: "per wave", detail: "Four waves per year.\nWeekday evening or weekend formats." },
              { label: "Ten-Month Flagship", price: "$1,990", period: "per month", detail: "September 2026 – June 2027.\nWeekday or Saturday track." },
            ].map((t, i) => (
              <div key={i} style={{ padding: isMobile ? "36px 0" : "0 48px", borderLeft: !isMobile && i > 0 ? "1px solid rgba(199,171,117,.1)" : "none", borderTop: isMobile && i > 0 ? "1px solid rgba(199,171,117,.1)" : "none" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>{t.label}</p>
                <div style={{ fontFamily: serif, fontSize: isMobile ? 48 : 60, fontWeight: 300, color: "#FBF7EE", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>{t.price}</div>
                <p style={{ fontFamily: sans, fontSize: 12, color: gold, fontWeight: 300, marginBottom: 24 }}>{t.period}</p>
                <div style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 16 }} />
                <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8 }}>{t.detail}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: serif, fontSize: 14, color: gold, fontWeight: 300, marginTop: 48, fontStyle: "italic" }}>Enrollment is confirmed only after acceptance and deposit completion.</p>
        </div>
      </div>


      {/* ── REQUEST INFORMATION / APPLY ── */}
      <div style={{ background: "#FAF8F4", padding: isMobile ? "60px 24px" : "80px 80px", borderTop: "1px solid rgba(0,0,0,.07)", textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>Request Information</p>
        <h2 style={{ fontFamily: serif, fontSize: isMobile ? 32 : 52, fontWeight: 300, color: "#111", lineHeight: 1.0, marginBottom: 10, letterSpacing: "0.01em" }}>Admissions begins with a conversation.</h2>
        <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 18, color: "#8B6914", fontStyle: "italic", marginBottom: 40, lineHeight: 1.5 }}>A member of the admissions team will respond personally within 24 hours.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => openInquiry && openInquiry("summer")} style={{ fontFamily: sans, padding: "14px 40px", background: "#111", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Apply for Summer 2026 →</button>
          <button onClick={() => openInquiry && openInquiry("summer-pkg")} style={{ fontFamily: sans, padding: "14px 32px", background: "transparent", border: "1px solid rgba(0,0,0,.25)", color: "#111", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Request Summer Program Package →</button>
          <button onClick={() => openInquiry && openInquiry("full")} style={{ fontFamily: sans, padding: "14px 32px", background: "transparent", border: "1px solid rgba(0,0,0,.25)", color: "#111", fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Request Ten-Month Flagship Package →</button>
          <button onClick={() => openInquiry && openInquiry()} style={{ fontFamily: sans, padding: "14px 32px", background: "transparent", border: "1px solid rgba(0,0,0,.12)", color: "#555", fontSize: 11, fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Request Admissions Information →</button>
        </div>
      </div>

      <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />

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
            { label: "WAVE 1 — JULY", dates: "July 6 – July 18, 2026", left: summerLeft[0], items: [["Schedule", "Mon–Fri · 9:30 AM – 3:30 PM"], ["Duration", "9 days + Field Trip"], ["Guest Speakers", "Daily · every session"], ["Finale", "Shark Tank · July 18"]] },
            { label: "WAVE 2 — AUGUST", dates: "Aug 3 – Aug 15, 2026", left: summerLeft[1], items: [["Schedule", "Mon–Fri · 9:30 AM – 3:30 PM"], ["Duration", "9 days + Field Trip"], ["Guest Speakers", "Daily · every session"], ["Finale", "Shark Tank · Aug 15"]] },
          ].map((t, i) => {
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
            { label: "WEEKDAY TRACK", schedule: "Tuesday & Thursday · 4:00–6:15 PM", left: flagshipLeft[0], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Tue & Thu evenings"], ["Ends", "June 2027 · Academy Gala & Graduation Day"], ["Price", "$1,900 / month"], ["Seats", "20 per cohort"]] },
            { label: "SATURDAY TRACK", schedule: "Every Saturday · 10:30 AM–3:00 PM", left: flagshipLeft[1], items: [["Starts", "September 2026"], ["Duration", "10 Months"], ["Sessions", "Full-day Saturdays"], ["Ends", "June 2027 · Academy Gala & Graduation Day"], ["Price", "$1,900 / month"], ["Seats", "20 per cohort"]] },
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

      {/* SIX-WEEK  -  wave sub-tabs */}
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
  const hasFacultyPage = ["Alexander Milstein", "Chip Pankow", "Bill Morris", "Erik Dostal", "Christopher Sanders", "Amina Abdulaeva"].includes(c.name);

  return (
    <div style={{ background: "#080808", borderTop: i === 0 ? `2px solid ${gold}` : "2px solid rgba(199,171,117,.1)", overflow: "hidden" }}>
      {/* Photo  -  full portrait, same as faculty page */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <button
              onClick={() => setPage(`faculty:${c.name.toLowerCase().replace(/ /g, "-")}`)}
              style={{ fontFamily: sans, fontSize: 11, color: gold, background: "transparent", border: "none", cursor: "pointer", padding: 0, letterSpacing: "0.08em", fontWeight: 600 }}
            >
              Read Full Profile →
            </button>
            {c.linkedin && (
              <a href={c.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontFamily: sans, fontSize: 11, color: "rgba(199,171,117,.6)", letterSpacing: "0.08em", fontWeight: 600, textDecoration: "none" }}>LinkedIn ↗</a>
            )}
          </div>
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
  React.useEffect(() => { setActiveMod(isMobile ? null : 0); }, [isMobile]);
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
          {isMobile ? <>SUMMER INTENSIVE · JULY 6–18 & AUG 3–15 · MON–FRI · 20 STUDENTS PER WAVE · <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setPage("apply")}>Apply Now</span></> : <>✦ &nbsp; Summer Intensive &nbsp;·&nbsp; July 6–18 &amp; August 3–15 &nbsp;·&nbsp; Mon–Fri &nbsp;·&nbsp; 20 Students Per Wave &nbsp;·&nbsp; <span style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }} onClick={() => setPage("apply")}>Apply Now</span> &nbsp; ✦</>}
        </p>
      </div>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: isMobile ? "80px 24px 60px" : "60px 80px", position: "relative", overflow: "hidden", background: "#000" }}>

        {/* Faint EXCALIBUR wordmark  -  gallery watermark */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
          <span style={{ fontFamily: "'Forum', serif", fontSize: "clamp(80px,14vw,180px)", color: "rgba(199,171,117,.03)", letterSpacing: "0.3em", textTransform: "uppercase", userSelect: "none", whiteSpace: "nowrap" }}>EXCALIBUR</span>
        </div>

        {/* CONTENT */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 820 }}>

          <Fade>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.5em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 32 }}>
              Founding Class &nbsp;·&nbsp; Orange County &nbsp;·&nbsp; 2026
            </p>
          </Fade>

          <Fade d={.08}>
            <img
              src="https://i.ibb.co/rKSp526b/upsclae-logo.png"
              alt="Excalibur Academy"
              style={{ width: isMobile ? 240 : 360, height: "auto", objectFit: "contain", marginBottom: 36, opacity: 0.95 }}
              onError={e => e.target.style.display = "none"}
            />
          </Fade>

          <Fade d={.14}>
            <p style={{ fontFamily: "'Forum', 'Copperplate', Georgia, serif", fontWeight: 400, fontSize: isMobile ? "clamp(28px,6vw,40px)" : "clamp(36px,4vw,58px)", letterSpacing: "0.26em", color: "#FBF7EE", textTransform: "uppercase", marginBottom: 6, lineHeight: 1.1 }}>
              Excalibur Academy
            </p>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 17 : 16, letterSpacing: "0.18em", color: gold, fontStyle: "italic", marginBottom: 40, opacity: 0.9 }}>
              Forging the Leaders of Tomorrow
            </p>
          </Fade>

          {/* Divider with diamond */}
          <Fade d={.18}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, width: "100%" }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(199,171,117,.3))" }} />
              <span style={{ fontFamily: serif, fontSize: 14, color: "#C7AB75" }}>✦</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(270deg, transparent, rgba(199,171,117,.3))" }} />
            </div>
          </Fade>

          <Fade d={.22}>
            <h1 style={{ fontFamily: serif, fontStyle: "italic", fontSize: isMobile ? "clamp(20px,4.5vw,30px)" : "clamp(22px,2.2vw,34px)", fontWeight: 300, lineHeight: 1.4, color: "#FBF7EE", maxWidth: 660, marginBottom: 10 }}>
              The Future Belongs to Those Who Build It.
            </h1>
            <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(22px,5vw,34px)" : "clamp(26px,2.6vw,40px)", fontWeight: 600, lineHeight: 1.25, color: gold, maxWidth: 660, marginBottom: 36 }}>
              Become Who You Are.
            </h1>
          </Fade>

          <Fade d={.28}>
            <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 16, lineHeight: 1.85, color: "#FBF7EE", maxWidth: 580, marginBottom: 44, fontWeight: 300 }}>A premier institute where Fortune 100 executives, real entrepreneurs, investors, and distinguished professors teach the next generation to lead the world — not follow it.</p>
          </Fade>

          <Fade d={.34}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row", alignItems: "center", marginBottom: 36 }}>
              <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "14px 44px", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>Join the Founding Class</button>
              <button onClick={() => setPage("programs")} style={{ fontFamily: sans, border: `1px solid rgba(199,171,117,.35)`, color: gold, padding: "14px 32px", fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", background: "transparent", cursor: "pointer" }}>Explore Programs</button>
            </div>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, color: gold, letterSpacing: "0.3em", textTransform: "uppercase" }}>Ages 15–18 &nbsp;·&nbsp; 20 Students Per Cohort &nbsp;·&nbsp; Orange County, CA</p>
          </Fade>

        </div>
      </section>

      {/* STATS  -  chessboard scatter */}
      <section style={{ background: "#050504", borderTop: "1px solid rgba(199,171,117,.10)", borderBottom: "1px solid rgba(199,171,117,.10)", overflow: "hidden" }}>
        {isMobile ? (
          <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[["10", " Months", "academic year program"], ["6", " Weeks", "intensive track"], ["20", "", "students per cohort"], ["10", "", "curriculum modules"], ["30+", "", "guest speakers / year"], ["2", "", "summer waves"]].map(([num, suf, l], i) => (
              <div key={i} style={{ padding: "28px 16px", textAlign: "center", borderLeft: i % 2 === 1 ? "1px solid rgba(199,171,117,.10)" : "none", borderTop: i >= 2 ? "1px solid rgba(199,171,117,.10)" : "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 16, height: 1, background: "rgba(199,171,117,.35)", marginBottom: 12 }} />
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 44, fontWeight: 300, color: "#FBF7EE", lineHeight: 1 }}>
                  <StatCounter num={num} suf={suf} label="" inView={statsInView} lightMode={false} />
                </div>
                <div style={{ width: 20, height: "1px", background: "linear-gradient(90deg, transparent, rgba(199,171,117,.5), transparent)", margin: "10px auto 8px" }} />
                <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 8, letterSpacing: "0.22em", color: "rgba(199,171,117,.55)", textTransform: "uppercase" }}>{l}</p>
              </div>
            ))}
          </div>
        ) : (
          <div ref={statsRef} style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6, 1fr)" }}>
            {[["10", " Months", "academic year program"], ["6", " Weeks", "intensive track"], ["20", "", "students per cohort"], ["10", "", "curriculum modules"], ["30+", "", "guest speakers / year"], ["2", "", "summer waves"]].map(([num, suf, l], i) => {
              const isHigh = i % 2 === 0;
              return (
                <div key={i} style={{
                  padding: isHigh ? "44px 20px 20px" : "20px 20px 44px",
                  textAlign: "center",
                  borderLeft: i === 0 ? "none" : "1px solid rgba(199,171,117,.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: isHigh ? "rgba(255,255,255,.013)" : "transparent",
                  borderBottom: isHigh ? "1px solid rgba(199,171,117,.08)" : "none",
                }}>
                  <div style={{ width: 16, height: 1, background: "rgba(199,171,117,.35)", marginBottom: 14 }} />
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(36px,3.2vw,48px)", fontWeight: 300, color: "#FBF7EE", lineHeight: 1, letterSpacing: "-0.01em" }}>
                    <StatCounter num={num} suf={suf} label="" inView={statsInView} lightMode={false} />
                  </div>
                  <div style={{ width: 22, height: "1px", background: "linear-gradient(90deg, transparent, rgba(199,171,117,.5), transparent)", margin: "12px auto 10px" }} />
                  <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 8, letterSpacing: "0.26em", color: "rgba(199,171,117,.50)", textTransform: "uppercase", lineHeight: 1.7 }}>{l}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* LEAD FACULTY  -  postcard after hero */}
      <section style={{ background: "#000", borderBottom: `1px solid rgba(199,171,117,.1)`, padding: isMobile ? "40px 24px" : "52px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ background: "#080808", border: `1px solid rgba(199,171,117,.25)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
            <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: `1px solid rgba(199,171,117,.4)`, borderLeft: `1px solid rgba(199,171,117,.4)` }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: `1px solid rgba(199,171,117,.4)`, borderRight: `1px solid rgba(199,171,117,.4)` }} />
            <p style={{ fontFamily: sans, fontSize: 11, letterSpacing: "0.35em", color: "#FBF7EE", fontWeight: 600, textTransform: "uppercase", padding: "20px 28px 0", textAlign: "center" }}>Top Leaders — Your Mentors</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", padding: isMobile ? "16px 24px 24px" : "20px 40px 28px", gap: isMobile ? 20 : 0 }}>
              <div style={{ padding: isMobile ? "0" : "0 36px 0 0" }}>
                <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
                <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>A CEO who built the world's first autonomous racing series, directed the Formula BMW programme — developing multiple Formula 1 World Champions — and oversaw a $13 billion NASDAQ listing. Secured over $100M in institutional funding. Guinness World Record holder. Professional Auto & Rally Racer.</p>
              </div>
              {!isMobile && <div style={{ background: "rgba(199,171,117,.12)" }} />}
              <div style={{ padding: isMobile ? "0" : "0 0 0 36px" }}>
                <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 12 }} />
                <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>A former Citigroup Managing Director with 100+ M&A transactions and 600+ CEO advisory engagements. EVP and CFO of two NYSE-listed companies. Georgetown MBA Professor and TEDx speaker. Has spoken at institutions from West Point to Stanford.</p>
              </div>
            </div>
            <div style={{ textAlign: "center", paddingBottom: 16 }}>
              <span style={{ fontFamily: serif, fontSize: 16, color: "rgba(199,171,117,.25)", letterSpacing: "0.3em" }}>✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMER ENROLLMENT BANNER  -  luxury editorial */}
      <section style={{ background: "#0A0A0A", position: "relative", overflow: "hidden", padding: isMobile ? "72px 24px" : "100px 80px" }}>

        {/* Background watermark numeral */}
        <div style={{ position: "absolute", right: isMobile ? -20 : 40, top: "50%", transform: "translateY(-50%)", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(200px,28vw,380px)", fontWeight: 300, color: "rgba(199,171,117,.03)", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em" }}>2026</div>

        {/* Top gold rule */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Fade>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 400px", gap: isMobile ? 48 : 64, alignItems: "stretch" }}>

              {/* LEFT  -  content */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {/* Eyebrow */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 32, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)` }} />
                  <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 700, textTransform: "uppercase" }}>Enrollment Now Open · Summer 2026</span>
                </div>

                {/* Heading */}
                <h2 style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 38 : 56, fontWeight: 300, fontStyle: "italic", color: "#FBF7EE", lineHeight: 1.0, marginBottom: 6, letterSpacing: "0.01em" }}>
                  Summer Intensive 2026
                </h2>
                <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 18 : 22, fontWeight: 300, color: gold, fontStyle: "italic", marginBottom: 28, letterSpacing: "0.04em" }}>
                  July &amp; August Waves
                </p>

                {/* Body copy */}
                <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>
                  Offered in two waves — July and August — this full-day, Monday-through-Friday intensive is led by senior faculty, former Fortune 100 executives, accomplished leaders, top industry specialists, and distinguished guest speakers. Designed specifically for high school students ages 15–18 who are ready to turn ambition into discipline and action. Students move from idea to venture concept: researching the market, shaping the business model, building the pitch, practicing executive communication, and learning how to defend their thinking under pressure. The program culminates in the Shark Tank Inspired Excalibur Venture Finale, where teams present before real investors and invited judges.
                </p>

              </div>

              {/* RIGHT  -  details panel */}
              <div style={{ border: `1px solid rgba(199,171,117,.15)`, borderTop: `2px solid ${gold}`, display: "flex", flexDirection: "column" }}>
                {/* "You Asked. We Listened."  -  bold statement block */}
                <div style={{ background: gold, padding: isMobile ? "20px 18px" : "22px 22px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 80, fontWeight: 300, color: "rgba(0,0,0,.08)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>✦</div>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.38em", color: "rgba(0,0,0,.55)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8, position: "relative", zIndex: 1 }}>You Asked. We Listened.</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 18 : 21, fontWeight: 600, color: "#000", lineHeight: 1.25, marginBottom: 0, letterSpacing: "0.01em", position: "relative", zIndex: 1 }}>Due to high demand and our commitment to keeping cohort sizes small — and experience for each student personalized — <em>we are introducing a second two-week intensive wave in August 2026.</em></p>
                </div>
                {/* Panel header */}
                <div style={{ padding: "12px 22px", borderBottom: `1px solid rgba(199,171,117,.1)`, borderTop: `1px solid rgba(199,171,117,.1)` }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, color: "#FBF7EE", fontStyle: "italic", fontWeight: 300, margin: 0 }}>Program Details</p>
                </div>
                <div style={{ padding: "0 22px", flex: 1 }}>
                  {[
                    ["Sessions", "9:30 AM – 3:30 PM · Mon–Fri"],
                    ["Wave 1", "July 6 – 18, 2026"],
                    ["Wave 2", "August 3 – 15, 2026"],
                    ["Finale", "Excalibur Venture Finale · Real investors"],
                    ["Guest Speakers", "Distinguished speaker rotating daily"],
                    ["Eligibility", "Ages 15–18 · 20 students per wave"],
                  ].map(([k, v], i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "82px 1fr", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(199,171,117,.07)", alignItems: "flex-start" }}>
                      <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.14em", color: gold, textTransform: "uppercase", paddingTop: 2, flexShrink: 0, fontWeight: 600 }}>{k}</span>
                      <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.55 }}>{v}</span>
                    </div>
                  ))}
                </div>
                {/* Tuition */}
                <div style={{ padding: "16px 22px", borderTop: `1px solid rgba(199,171,117,.1)` }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 300, color: "#FBF7EE", lineHeight: 1, marginBottom: 3 }}>$4,500<span style={{ fontSize: 14 }}> / wave</span></p>
                  <p style={{ fontFamily: sans, fontSize: 10, color: gold, fontWeight: 300 }}>$410 per full day</p>
                </div>
                {/* CTA buttons */}
                <div style={{ padding: "14px 22px", borderTop: `1px solid rgba(199,171,117,.1)`, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => openInquiry && openInquiry("summer")} style={{ fontFamily: sans, padding: "11px 20px", background: gold, border: "none", color: "#000", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", flex: 1 }}>APPLY NOW →</button>
                  <button onClick={() => setPage("summer-detail")} style={{ fontFamily: sans, padding: "11px 16px", background: "transparent", border: `1px solid rgba(199,171,117,.35)`, color: gold, fontSize: 10, fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", cursor: "pointer", flex: 1 }}>LEARN MORE →</button>
                </div>
              </div>

            </div>
          </Fade>
        </div>

        {/* Bottom gold rule */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, rgba(199,171,117,.25), transparent)` }} />
      </section>


      <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />

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

      {/* ACADEMY ABOUT  -  luxury editorial layout */}
      <section style={{ background: "#F5F3EE", padding: 0 }}>
        <Fade>
        {/* Full-width photo strip with text overlay */}
        <div style={{ position: "relative", height: isMobile ? 260 : 440, overflow: "hidden" }}>
          <img src="https://i.imgur.com/bBYXZXX.jpeg" alt="Orange County estate" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,.75) 0%, rgba(0,0,0,.2) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 55%)" }} />
          <div style={{ position: "absolute", bottom: isMobile ? 28 : 52, left: isMobile ? 28 : 72, maxWidth: 540 }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>About the Academy</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(28px,6vw,38px)" : "clamp(36px,4vw,54px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 14 }}>The Academy</h2>
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)` }} />
          </div>

        </div>

        {/* Main content  -  asymmetric grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1px 1fr", background: "#F5F3EE" }}>

          {/* Left panel  -  founding statement + session model */}
          <div style={{ padding: isMobile ? "48px 28px" : "64px 72px" }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 17 : 19, lineHeight: 1.85, color: "#111", fontWeight: 400, marginBottom: 28, fontStyle: "italic", borderLeft: `2px solid rgba(199,171,117,.5)`, paddingLeft: 20 }}>
              Excalibur Leadership Academy is a premier institute for entrepreneurship and leadership for ambitious teenagers aged 15–18 in Orange County, California. We are building the institution we wish had existed when we were young — one where students are mentored by accomplished adults who have built companies, led teams, and operated under real stakes.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 20 }}>
              Our sessions &amp; events take place across South Orange County, in historic and business venues inspired by the traditions of European elite education and American spirit of leadership and excellence.
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

          {/* Right panel  -  outcomes + Why This Matters */}
          <div style={{ padding: isMobile ? "0 28px 48px" : "64px 72px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 24 }}>
              Our faculty are not simply career academics. They are entrepreneurs, Fortune 100 executives, investors, Wall Street "sharks" and professionals who teach from lived experience. Students learn public speaking, financial literacy &amp; trading, business strategy, sales and marketing, leadership, technology and AI, and the social arts through live case studies, startup simulations, consulting projects, and competitive pitch forums.
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 40 }}>
              By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, launched a micro venture, worked in teams under pressure, and competed in Shark Tank-style finals before real investors. In our flagship program, students launch in teams a real micro-venture and graduate with a bound portfolio of work that sets them apart for university admissions — and beyond.
            </p>

            {/* WHY THIS MATTERS NOW */}
            <div style={{ borderTop: `1px solid rgba(0,0,0,.1)`, paddingTop: 32, marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 28, height: 1, background: "#8B6914", flexShrink: 0 }} />
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 20 : 24, fontWeight: 600, color: "#000", letterSpacing: "0.02em" }}>Character is Destiny. Become Who You Are.</h3>
              </div>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 16 }}>
                The skills that determine success — public speaking, strategic thinking, financial judgment, leadership, and the ability to persuade are largely absent from traditional education. At the same time, AI is rapidly reshaping industries and dissolving career paths once considered secure.
              </p>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 16 }}>
                What cannot be replaced are human capacities: confidence under pressure, ownership of outcomes, the courage to keep going, regroup or the judgement to know when to stop, the art of class manners, the ability to lead people through the unknown. Entrepreneurs have powered business revolutions, built modern industry, and are now shaping the age of AI.
              </p>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 17, color: "#8B6914", fontStyle: "italic", lineHeight: 1.5 }}>
                Excalibur Academy forges students with the confidence, discipline, and courage to lead what comes next.
              </p>
            </div>

            <div style={{ marginTop: "auto" }}>
              <button onClick={() => setPage("programs")} style={{ fontFamily: sans, background: "transparent", border: `1px solid rgba(0,0,0,.35)`, color: "#000", padding: "11px 26px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Explore Programs →</button>
            </div>
          </div>
        </div>

        {/* Quote  -  warm white */}
        <div style={{ background: "#EDEAE3", padding: isMobile ? "48px 24px" : "64px 80px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 24, color: "#111", fontStyle: "italic", lineHeight: 1.7 }}>
              "By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, launched a micro venture, worked in teams under pressure, and competed in Shark Tank-style finals before real investors."
            </p>
          </div>
        </div>
        </Fade>
      </section>

      {/* THREE PROGRAMS */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>THREE PATHS INTO EXCALIBUR</Eyebrow><SectionTitle center>Choose Your Entry Point</SectionTitle><Sub center>From two-week summer intensives and six-week sprint programmes to a ten-month Flagship — weekday and weekend tracks, designed around your schedule.<br /><br />Three paths into Excalibur.</Sub></div></Fade>

          {/* SUMMER  -  full width on top */}
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
                  ["Sessions", "9:30 AM – 3:30 PM · Mon–Fri"],
                  ["Wave 1", "July 6 – 18, 2026"],
                  ["Wave 2", "August 3 – 15, 2026"],
                  ["Guest Speakers", "Distinguished speaker rotating daily"],
                  ["Finale", "Shark Tank–inspired with real investors and judges"],
                  ["Eligibility", "Ages 15–18 (rising juniors and seniors) · 20 students per wave"],
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
                  <div style={{ fontFamily: serif, fontSize: 38, color: "#FBF7EE", fontWeight: 600, lineHeight: 1, marginBottom: 2 }}>$410<span style={{ fontSize: 18, fontWeight: 300 }}> / full day</span></div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: gold, fontWeight: 300, marginBottom: 8 }}>$4,500 per wave</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, marginBottom: 28 }}>Per two-week wave · includes catered lunches from local restaurants, distinguished guest speakers, and a Shark Tank-inspired live startup pitch finale before families, investors, entrepreneurs, and invited judges.</div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => setPage("apply")} style={{ fontFamily: sans, padding: "13px 28px", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW →</button>
                <button onClick={() => setPage("summer-detail")} style={{ fontFamily: sans, padding: "13px 24px", background: "transparent", border: `1px solid rgba(199,171,117,.35)`, color: gold, fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>LEARN MORE →</button>
              </div>
              </div>
            </div>
          </Fade>

          {/* INTENSIVE + FLAGSHIP  -  side by side below */}
          <Fade d={.1}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>

              {/* INTENSIVE */}
              <div style={{ background: "#080808", padding: isMobile ? "40px 28px" : "52px 48px", borderTop: "2px solid rgba(199,171,117,.2)" }}>
                <Eyebrow>INTENSIVE TRACK · THE IGNITION</Eyebrow>
                <h3 style={{ fontFamily: serif, fontSize: 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1, marginBottom: 6 }}>Six-Week Intensive</h3>
                <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 20 }}>Four waves per year · Spring, Summer, Fall, Winter</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: 24 }}>Offered in four waves annually, the Six-Week Intensive distills the complete Excalibur curriculum into a focused, high‑impact experience. Six weeks in duration. One core discipline per week. Every session follows the same consistent three-block model used across all Excalibur programs: public speaking, specialist block and applied workshop with startup simulations, case studies and team exercises.</p>
                <div style={{ height: 1, background: "rgba(199,171,117,.08)", marginBottom: 20 }} />
                {["A limited version of Excalibur’s curriculum", "Flexible weekday evening or Sunday half-day format", "Guest speakers from leading national companies and various industry sectors", "Public speaking training in every class", "Team-based micro-venture project with faculty guidance", "Judged Shark Tank–inspired Finale before invited guests, families, and professionals", "Access to the Excalibur alumni network", "Priority consideration for the Ten-Month Flagship Program"].map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 12, marginBottom: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 14, height: 1, background: "rgba(199,171,117,.4)", marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 32, display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontFamily: serif, fontSize: 32, color: "#FBF7EE", fontWeight: 600 }}>$3,900</span>
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
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: 24 }}>The Full Formation is Excalibur’s ten-month flagship — a deep, immersive course of study for students ready for complete entrepreneurial, intellectual, and personal formation across all modules, ten industry sectors, and real-world applied engagements.</p>
                <div style={{ height: 1, background: "rgba(199,171,117,.12)", marginBottom: 20 }} />
                {["Full ten-month curriculum across all ten curriculum modules", "All ten industry sectors with guest leaders", "Junior Consultant Program — real local business engagement", "Apprentice Externship — 4–6 weeks inside a real company", "Micro-business launch in teams with a dedicated mentor", "Monthly Pitch Night and Competitions", "Bound graduation portfolio of all academic and professional work", "Selective Day and Weekend Field Trips (Daytona, SpaceX Launch, Silicon Valley Incubators & Accelerators, TED Talks, LA & SF Tech Weeks, Yosemite Summit)", "Eligibility for London and Geneva international summer school 2027 programs"].map((f, j) => (
                  <div key={j} style={{ display: "flex", gap: 12, marginBottom: 11, alignItems: "flex-start" }}>
                    <div style={{ width: 14, height: 1, background: gold, marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 32, display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                  <span style={{ fontFamily: serif, fontSize: 32, color: "#FBF7EE", fontWeight: 600 }}>$1,900</span>
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
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}><Eyebrow>THE CURRICULUM</Eyebrow><SectionTitle center>Inside the Classroom</SectionTitle><Sub center>Ten disciplines — taught by executive business leaders, distinguished keynote speakers, and professors from leading universities.</Sub></div></Fade>
          <Fade d={.08}>
            {isMobile ? (
              /* MOBILE: accordion — all closed initially */
              <div style={{ border: "1px solid #151515" }}>
                {currMods.map((m, i) => (
                  <div key={i} style={{ borderBottom: "1px solid #0E0E0E" }}>
                    <div onClick={() => setActiveMod(activeMod === i ? null : i)} style={{ padding: "18px 20px", cursor: "pointer", borderLeft: `3px solid ${activeMod === i ? gold : "transparent"}`, background: activeMod === i ? "rgba(199,171,117,.04)" : "#060606", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s" }}>
                      <div style={{ fontFamily: serif, fontSize: 19, fontWeight: activeMod === i ? 600 : 400, color: activeMod === i ? gold : "#D8D0C8", lineHeight: 1.3 }}>{m.title}</div>
                      <div style={{ fontFamily: sans, fontSize: 16, color: activeMod === i ? gold : "#FBF7EE", transition: "transform .25s", transform: activeMod === i ? "rotate(45deg)" : "none", lineHeight: 1 }}>+</div>
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
              <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300 }}>All modules, field trips and The Arena Beyond Classroom experiences covered only in the Flagship Ten-Month Program.</span>
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

      {/* FACULTY & LEADERSHIP  -  white background strip */}
      <section style={{ background: "#F5F3EE", padding: isMobile ? "60px 16px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#000", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>FACULTY & LEADERSHIP</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 16 }}>The Mentors In the Room.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#111", fontWeight: 300, lineHeight: 1.7, maxWidth: 680, margin: "0 auto" }}>Excalibur faculty come from the arenas where leadership is tested: a CEO who built the world’s first autonomous racing series, directed the Formula BMW program, and oversaw a $13B NASDAQ listing, a former Citigroup Managing Director and Georgetown MBA professor with 100+ M&A transactions, 600+ CEO advisory engagements, EVP/CFO leadership at two NYSE-listed companies, TEDx speaking engagement, and a doctoral candidate serving as an Orange County Sheriff’s Department spokesman. They have led companies, advised CEOs, taught MBA students, spoken on stages from West Point to Ivy League institutions, and now bring that experience directly to Excalibur students.</p>
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
          <Fade d={.12}><div style={{ textAlign: "center", marginTop: 32 }}><button onClick={() => setPage("faculty")} style={{ fontFamily: sans, background: "transparent", border: "1px solid #000", color: "#000", padding: "11px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Meet Our Faculty →</button></div></Fade>
        </div>
      </section>
      {/* FIELD TRIPS  -  Outside the Classroom */}
      <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <Eyebrow>OUTSIDE THE CLASSROOM</Eyebrow>
              <SectionTitle center>Field Trips & Expeditions</SectionTitle>
              <Sub center>Students step inside the environments where leadership, capital, innovation, and performance are put into practice — meeting the people and institutions shaping the world beyond the classroom.</Sub>
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

            {/* EXCALIBUR IVY PORTFOLIO  -  merged with college admissions */}
      <section style={{ background: "#F5F3EE", padding: 0 }}>

        {/* Photos  -  heading on solid dark block so it is always visible */}
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
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: isMobile ? 14 : 18, color: "#000", fontWeight: 400, lineHeight: 1.75, fontStyle: "italic" }}>Documented components · Verified · Professionally assembled · Submitted with university applications.</p>
          </div>
        </div>

        {/* Interactive 8-component index */}
        <PortfolioIndexWhite isMobile={isMobile} setPage={setPage} />

        {/* College admissions  -  merged below */}
        <div style={{ background: "#EDEAE3", padding: isMobile ? "48px 24px" : "64px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 36 : 80 }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#000", fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>PORTFOLIO THAT SPEAKS FOR ITSELF</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 12 }}>College Admissions Advisor</h2>
              <p style={{ fontFamily: serif, fontSize: 17, color: "#000", fontStyle: "italic", marginBottom: 22, lineHeight: 1.3 }}>Why Excalibur Students Stand Apart</p>
              <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 22 }} />
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300, marginBottom: 16 }}>An Excalibur graduate approaches college admission with proof of applied real-world leadership and work experience. A consulting report. An externship record. A micro-business launch. Competition results. A graduation portfolio. Faculty recommendations written by top executives and professionals who watched them operate, lead, and execute.</p>
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#1a1a1a", fontWeight: 300 }}>Students work with Excalibur’s college advisor on application strategy, personal narrative, portfolio presentation, recommendation preparation, interview readiness, and how their Excalibur experience can strengthen their college applications and future academic goals.</p>
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
          {/* Countdown  -  clean, minimal, no boxes */}
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.3em", color: "#C7AB75", textTransform: "uppercase", marginBottom: 20 }}>Wave 1 starts July 6, 2026</p>
            <CountdownTimer targetDate="2026-07-06T09:30:00" label="Days Until Summer July Wave Begins" />
          </div>
          {/* Three bold statements */}
          <div style={{ maxWidth: 700, margin: "0 auto 60px", display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { n: "I", head: "A Cohort of Twenty", body: "Each wave is limited to twenty students. Student receives direct faculty attention and mentorship, and becomes part of the Excalibur family." },
              { n: "II", head: "A Dedicated Family Coordinator", body: "From first inquiry through graduation, each family is assigned a personal coordinator. One point of contact. Direct communication, guidance and support from first contact." },
              { n: "III", head: "Private Invitation to the May Soirée", body: "An intimate family information evening. Meet the faculty, the leadership team, and the families who will form the summer cohorts. By personal invitation only." },
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

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      <Breadcrumb items={[{label:"The Arena",page:"beyond"}]} setPage={setPage} />

      {/* ── HERO  -  Man in the Arena ── */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: isMobile ? 480 : 640 }}>
        {/* Full-bleed image */}
        <img src="https://i.imgur.com/1QP3p5p.jpeg" alt="Man in the Arena" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.55) 0%, rgba(0,0,0,.75) 50%, rgba(0,0,0,.97) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: isMobile ? 480 : 640, padding: isMobile ? "48px 24px" : "72px 80px" }}>
          <div style={{ maxWidth: 900 }}>
            <Fade>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>The Arena · Excalibur Academy</p>
              <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(40px,8vw,58px)" : "clamp(56px,6vw,84px)", fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, letterSpacing: "0.04em", marginBottom: 12 }}>Man in the Arena</h1>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 20, color: gold, fontStyle: "italic", letterSpacing: "0.04em", marginBottom: 32 }}>Real work. Real pressure. Real outcomes.</p>
              <div style={{ width: 48, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 28 }} />
            </Fade>
          </div>
        </div>
      </div>

      {/* ── ROOSEVELT QUOTE ── */}
      <div style={{ background: "#050505", borderBottom: "1px solid rgba(199,171,117,.12)", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.5em", color: "#C7AB75", fontWeight: 600, textTransform: "uppercase", marginBottom: 24 }}>Theodore Roosevelt · Paris · April 23, 1910</p>
            <blockquote style={{ fontFamily: serif, fontSize: isMobile ? 16 : 20, color: "#FBF7EE", fontWeight: 400, lineHeight: 1.85, textAlign: "left", paddingLeft: isMobile ? 20 : 36, borderLeft: `2px solid ${gold}`, margin: 0 }}>
              "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming; but who does actually strive to do the deeds; who knows great enthusiasms, the great devotions; who spends himself in a worthy cause; who at the best knows in the end the triumph of high achievement, and who at the worst, if he fails, at least fails while daring greatly, so that his place shall never be with those cold and timid souls who neither know victory nor defeat."
            </blockquote>
          </Fade>
        </div>
      </div>

      {/* ── REAL-WORLD ENGAGEMENTS ── */}
      <section style={{ padding: isMobile ? "60px 24px" : "80px 80px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade><div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Real-World Engagement</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 44, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16 }}>Where Theory Meets Reality</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, maxWidth: 660, margin: "0 auto" }}>The curriculum builds the foundation. These engagements give Excalibur its distinctive weight: applied work, public performance, professional feedback, lasting friendships, shared memories, and skills carried for life.</p>
          </div></Fade>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {handson.map((p, i) => (
              <Fade key={i} d={i * .05}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : i % 2 === 0 ? "3fr 2fr" : "2fr 3fr", background: "#111", minHeight: isMobile ? "auto" : 200 }}>
                  {i % 2 !== 0 && !isMobile && (
                    <div style={{ background: "#050504", padding: "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.06)" }}>
                      <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, rgba(199,171,117,.4), transparent)", marginBottom: 18 }} />
                      <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Outcome</p>
                      <p style={{ fontFamily: serif, fontSize: 20, lineHeight: 1.65, color: "#FBF7EE", fontStyle: "italic" }}>{p.outcome}</p>
                    </div>
                  )}
                  <div style={{ background: "#09090B", padding: isMobile ? "40px 24px" : "52px 56px", borderTop: `2px solid ${i < 2 ? gold : "rgba(199,171,117,.18)"}`, position: "relative" }}>
                    <div style={{ position: "absolute", top: 20, right: 20, fontFamily: serif, fontSize: isMobile ? 32 : 52, color: "rgba(199,171,117,.05)", lineHeight: 1, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</div>
                    <Eyebrow>{p.tag}</Eyebrow>
                    <h3 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 34, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 16, marginTop: 8 }}>{p.title}</h3>
                    <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, " + gold + ", transparent)", marginBottom: 18 }} />
                    <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>{p.desc}</p>
                  </div>
                  {(i % 2 === 0 || isMobile) && (
                    <div style={{ background: "#050504", padding: isMobile ? "28px 24px" : "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center", borderTop: "2px solid rgba(199,171,117,.06)" }}>
                      <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, rgba(199,171,117,.4), transparent)", marginBottom: 18 }} />
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

      {/* ── COMPETITIONS ── */}
      <div style={{ background: "#F5F3EE", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Competitions</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 42, fontWeight: 600, color: "#000", lineHeight: 1.0, marginBottom: 0 }}>Performance under genuine pressure.</h2>
            </div>
            <p style={{ fontFamily: sans, fontSize: 13, color: "#444", fontWeight: 300, lineHeight: 1.8, maxWidth: 380 }}>Every competition at Excalibur is evaluated by real professionals — entrepreneurs, investors, and executives who have no obligation to be generous. Students know this. That is precisely the point.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 1, background: "#D8D4CC" }}>
            {[
              { title: "Monthly Pitch Night", tag: "12× per year · All programs", num: "01", desc: "Students present pitches before a panel of guest judges drawn from the local business community, including entrepreneurs, investors, and senior professionals. Pitches are evaluated on clarity of thinking, commercial viability, quality of delivery, and composure under live questioning. Parents are invited to attend." },
              { title: "Shark Tank Finale", tag: "Summer & Six-Week programs", num: "02", desc: "The Shark Tank–inspired pitch forum where student teams present complete business concepts before entrepreneurs, investors, and senior professionals. Judges evaluate each pitch on clarity, commercial viability, originality, delivery, and composure under questioning. Awards are presented for Best Business Concept, Best Pitch, and Most Innovative Venture." },
              { title: "OC City Championship", tag: "Biannual · Flagship students", num: "03", desc: "The Excalibur Championship is a biannual competition for all Flagship students, held at a premium South Orange County venue with judges drawn from the professional community. Students compete individually and in teams. Awards and formal recognition are presented in a ceremony before families and invited guests." },
              { title: "Academy Gala & Graduation Day", tag: "Annual · Flagship capstone", num: "04", desc: "Academy Gala & Graduation Day is the Flagship capstone. Student teams present their micro-businesses before families, mentors, investors, invited guests, and a panel of judges. Every graduate receives a professionally bound Excalibur Portfolio — a documented record of the work, presentations, competitions, and applied experiences completed across the program. The evening marks more than completion. It marks the emergence of young leaders with the confidence, discipline, and presence to carry Excalibur's standard into every arena ahead." },
            ].map((c, i) => (
              <div key={i} style={{ background: "#fff", padding: isMobile ? "32px 24px" : "44px 44px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 24, right: 28, fontFamily: serif, fontSize: 64, fontWeight: 600, color: "rgba(0,0,0,.04)", lineHeight: 1 }}>{c.num}</div>
                <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.3em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>{c.tag}</p>
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: "#000", marginBottom: 16, lineHeight: 1.15 }}>{c.title}</h3>
                <div style={{ width: 28, height: 1, background: "#000", marginBottom: 16 }} />
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#1a1a1a", fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FIELD TRIPS & EXPEDITIONS ── */}
      <div style={{ background: "#07060A", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Outside the Classroom</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 40 }}>Field Trips & Expeditions.</h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
            {fieldTrips.map((f, i) => (
              <div key={i} style={{ background: "#080808", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.12)"}`, overflow: "hidden" }}>
                {f.img && <div style={{ height: 220, overflow: "hidden" }}><img src={f.img} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                <div style={{ padding: "28px 28px" }}>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{f.tag}</p>
                  <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SOIREE & APPLY ── */}
      <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />

      {/* ── APPLY CTA ── */}
      <div style={{ background: "#000", padding: isMobile ? "60px 24px" : "80px 80px", textAlign: "center", borderTop: "1px solid rgba(199,171,117,.12)" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>Enrollment Open · 2026</p>
        <h2 style={{ fontFamily: serif, fontSize: isMobile ? 36 : 54, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 12, letterSpacing: "0.02em" }}>Enter the Arena.</h2>
        <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 19, color: gold, fontStyle: "italic", marginBottom: 40 }}>Twenty students per cohort. Selective. Serious.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => openInquiry && openInquiry()} style={{ fontFamily: sans, padding: "14px 48px", background: gold, border: "none", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW →</button>
          <button onClick={() => setPage("flagship-detail")} style={{ fontFamily: sans, padding: "14px 32px", background: "transparent", border: "1px solid rgba(199,171,117,.35)", color: gold, fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>Explore Flagship →</button>
        </div>
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
    linkedin: "https://www.linkedin.com/in/chip-pankow-a2977536/",
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
    linkedin: "https://www.linkedin.com/in/billmorris1/",
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
      "Has spoken at leading global and national institutions from West Point to Stanford",
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
      "Over nearly three decades, Erik has demonstrated what it means to build an educational institution that operates at genuine scale: generating $4.8M in annual revenues, sustaining 20% year-over-year growth, and closing franchise deals spanning multiple continents, with campuses in Huntington Beach, California and Europe.",
      "He holds an MA in TESOL from the University of Chichester and NILE, an MBA from IDRAC Business School, and a BA in Cultural Anthropology from Chapman University, where he was also a collegiate athlete. A former U.S. Youth National Team soccer player, Erik has channeled his competitive background into youth development, coaching, and the design of high-performance learning environments.",
      "He has authored multiple textbooks and publications on teaching methodology, language acquisition, and business education, and has organized international language symposiums attracting thousands of delegates from around the world. A former advisor to the Czech Ministry of Education and a certified international academic accreditor, his work has received European Small Business Awards recognition across multiple years.",
      "At Excalibur Academy, Erik brings the rare combination of deep pedagogical expertise, proven franchise and systems-building experience, and a practitioner's understanding of what it takes to build educational institutions that last.",
    ],
    credentials: [
      "Founder & CEO — CA Institute: 6,000+ students · 25 international franchises",
      "Campuses in Huntington Beach, CA and Europe",
      "Former advisor to the Czech Ministry of Education",
      "Published textbook author · International academic accreditor",
      "European Small Business Awards recognition",
      "U.S. Youth National Soccer Team player",
    ],
  },
  "christopher-sanders": {
    name: "Christopher Sanders",
    role: "Senior Public Speaking Instructor",
    img: "https://i.imgur.com/EELzLmn.jpeg",
    tags: ["Public Speaking", "Leadership Development", "Mindset Coaching", "Criminal Justice", "MBA", "Doctoral Candidate"],
    linkedin: "https://www.linkedin.com/in/christopher-sanders-abd-mba-dre-97a85332/",
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
    linkedin: "https://www.linkedin.com/in/amina-abdulaeva-a2a68729a/",
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
  "alexander-milstein": {
    name: "Alexander Milstein",
    role: "Founder & CEO",
    img: "https://i.imgur.com/placeholder.jpeg",
    tags: ["Entrepreneurship", "Leadership", "Education Design", "Cultural History", "Art & Intellectual Society"],
    headline: "Built the institution from first principles. Every element by design.",
    linkedin: "https://www.linkedin.com/in/alexander-milstein",
    paras: [
      "Alexander Milstein is the Founder and CEO of Excalibur Academy. Born in New York City and Russian by heritage, his worldview was shaped by St. Petersburg, Paris, London, and the wider European cultural tradition. At twelve, he left for boarding school outside London — an experience that built independence early and exposed him to a more global understanding of education, discipline, class, culture, and ambition.",
      "Alexander later earned his bachelor’s degree from Tufts University, double majoring in History and Political Science. His intellectual interests have always lived at the intersection of history, power, art, leadership, and human character — from ancient Greek civilization and classical art to political debate, philosophy, literature, and conversations that move beyond the surface.",
      "Alexander began building ventures in college, founding a youth political debate and leadership club, and later a cultural company that produced immersive History of Art lecture salons in St. Petersburg. Hosted in historic venues, these salons brought together museum curators, collectors, historians, academics, speakers, and cultural figures — reviving the spirit of intellectual society around art, history, and serious conversation.",
      "With Excalibur Academy, Alexander is building the institution where students are not simply taught information, but formed through public speaking, business judgment, intellectual depth, leadership, entrepreneurship, and real-world experience. Excalibur is built for students ready to build and lead their own path — through clear thinking, strong communication, real work, and the courage to begin.",
    ],
    credentials: [
      "Founder & CEO — Excalibur Academy, Orange County, California",
      "Bachelor’s degree — Tufts University, History & Political Science (double major)",
      "Educated from age 12 at British private boarding school outside London",
      "Founded youth political debate and leadership club",
      "Founder — immersive History of Art lecture salon series, St. Petersburg",
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

      {/* Hero  -  photo beside info, no crop */}
      <div style={{ background: "#07060A", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
        <button onClick={() => setPage("faculty")} style={{ display: "block", padding: isMobile ? "16px 20px" : "20px 60px", fontFamily: sans, background: "transparent", border: "none", color: "#C7AB75", fontSize: 11, cursor: "pointer", letterSpacing: "0.15em" }}>← OUR FACULTY</button>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "360px 1fr", maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 0 40px" : "0 40px 64px", gap: isMobile ? 28 : 64, alignItems: "start" }}>
          {/* Photo  -  full show, no crop */}
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

        {/* Bio  -  left */}
        <div style={{ background: "#080808", padding: isMobile ? "48px 28px" : "72px 72px" }}>
          <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 36 }} />
          {f.paras.map((para, i) => (
            <p key={i} style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 22 }}>{para}</p>
          ))}
          <div style={{ marginTop: 48 }}>
            {f.linkedin ? (
              <a href={f.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontFamily: sans, background: "transparent", color: gold, padding: "13px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", borderBottom: `1px solid ${gold}` }}>Connect on LinkedIn →</a>
            ) : (
              <button onClick={() => setPage("apply")} style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>Apply to Study Under {f.name.split(" ")[0]} →</button>
            )}
          </div>
        </div>

        {/* Credentials sidebar  -  right */}
        <div style={{ background: "#07060A", padding: isMobile ? "40px 28px" : "72px 40px" }}>
          {!f.linkedin && (<>
          <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.35em", color: "#9A9290", fontWeight: 600, textTransform: "uppercase", marginBottom: 24 }}>Credentials</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {f.credentials.map((cr, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(0,0,0,.07)", alignItems: "flex-start" }}>
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
          </>)}
          <div style={{ marginTop: f.linkedin ? 0 : 40, paddingTop: f.linkedin ? 0 : 32, borderTop: f.linkedin ? "none" : "1px solid rgba(199,171,117,.08)" }}>
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
  // breadcrumb marker
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
      role: "Senior Public Speaking Instructor",
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
          <Eyebrow>FACULTY &amp; LEADERSHIP</Eyebrow>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(32px,7vw,48px)" : "clamp(44px,5vw,64px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16 }}>
            The Mentors<br /><span style={{ color: gold }}>In the Room.</span>
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, maxWidth: 680 }}>
            Excalibur faculty come from the arenas where leadership is tested: a CEO who built the world's first autonomous racing series, directed the Formula BMW program, and oversaw a $13B NASDAQ listing, a former Citigroup Managing Director and Georgetown MBA professor with 100+ M&amp;A transactions, 600+ CEO advisory engagements, EVP/CFO leadership at two NYSE-listed companies, TEDx speaking engagement, and a doctoral candidate serving as an Orange County Sheriff's Department spokesman. They have led companies, advised CEOs, taught MBA students, spoken on stages from West Point to Ivy League institutions, and now bring that experience directly to Excalibur students.
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

      {/* HERO  -  H7T1wmI background, main heading */}
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

      {/* THE ACADEMY  -  white background block */}
      <Fade>
        <div style={{ background: "#FAFAF8", padding: isMobile ? "56px 24px" : "80px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 80, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#111", fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Academy</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 28 }}>Forging the leaders of tomorrow</h2>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 18 }}>Excalibur Leadership Academy is a premier institute for entrepreneurship, business, and leadership for ambitious teenagers aged 15–18 in Orange County, California. We are building the institution we wish had existed when we were young — one where students are mentored by accomplished adults who have built companies, led teams, and operated under real stakes.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 18 }}>Our sessions &amp; events take place across South Orange County, in historic and business venues inspired by the traditions of European elite education and American spirit of leadership and excellence.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 18 }}>Every session follows a rigorous three-block format: rhetoric and public speaking with a speaking coach, real-world business analysis and applied workshops led by senior faculty, and deep domain instruction from rotating specialists for every industry. No filler. No theory divorced from practice — only formation that builds confidence, judgment, and mental fortitude.</p>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300 }}>Our faculty are not simply career academics. They are entrepreneurs, Fortune 100 executives, investors, Wall Street "sharks" and professionals who teach from lived experience. Students learn public speaking, financial literacy &amp; trading, business strategy, sales and marketing, leadership, technology and AI, and the social arts through live case studies, startup simulations, consulting projects, and competitive pitch forums.</p>
            </div>
            <div>
              <div style={{ height: isMobile ? 300 : 460, overflow: "hidden", border: "1px solid rgba(0,0,0,.08)", marginBottom: 28 }}>
                <img src="https://i.imgur.com/PGjUc7X.jpeg" alt="Excalibur Academy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} onError={e => e.target.style.display="none"} />
              </div>
              <div style={{ borderLeft: "3px solid #C7AB75", paddingLeft: 20 }}>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300 }}>By the end of the program, every student will have pitched before live audiences, analyzed and advised real businesses, launched a micro venture, worked in teams under pressure, and competed in Shark Tank-style finals before real investors. In our flagship program, students launch in teams a real micro-venture and graduate with a bound portfolio of work that sets them apart for university admissions — and beyond.</p>
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* Photo between sections */}
      <div style={{ overflow: "hidden", position: "relative", background: "#000" }}>
        <img src="https://i.imgur.com/5lWMfOb.jpeg" alt="Excalibur Academy" style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} onError={e => e.target.style.display="none"} />
      </div>

      {/* WHY THIS MATTERS NOW  -  dark block */}
      <Fade>
        <div style={{ background: "#080608", padding: isMobile ? "56px 24px" : "80px 80px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Why This Matters Now</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 40, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 36 }}>Character is Destiny. Become Who You Are.</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 28 : 52 }}>
              <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>The skills that determine success — public speaking, strategic thinking, financial judgment, leadership, and the ability to persuade are largely absent from traditional education. At the same time, AI is rapidly reshaping industries and dissolving career paths once considered secure.</p>
              <div>
                <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>What cannot be replaced are human capacities: confidence under pressure, ownership of outcomes, the courage to keep going, regroup or the judgement to know when to stop, the art of class manners, the ability to lead people through the unknown. Entrepreneurs have powered business revolutions, built modern industry, and are now shaping the age of AI.</p>
                <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, color: gold, fontStyle: "italic", lineHeight: 1.5 }}>Excalibur Academy forges students with the confidence, discipline, and courage to lead what comes next.</p>
              </div>
            </div>
          </div>
        </div>

        {/* WHAT IS BEHIND A NAME  -  luxury editorial */}
        <div style={{ background: "#07060A", position: "relative", overflow: "hidden", padding: isMobile ? "64px 24px" : "88px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* Gold rule top */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 52 }}>
              <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, transparent, rgba(199,171,117,.4))` }} />
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, color: gold, opacity: 0.7 }}>✦</span>
              <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(199,171,117,.4), transparent)` }} />
            </div>

            {/* Two-column: text left, photo right (desktop) */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 400px", gap: isMobile ? 40 : 80, alignItems: "center" }}>

              {/* LEFT  -  text */}
              <div>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 18, opacity: 0.8 }}>What is Behind a Name?</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', 'Didot', 'Bodoni MT', Georgia, serif", fontSize: isMobile ? 36 : 58, fontWeight: 300, fontStyle: "italic", color: "#FBF7EE", lineHeight: 1.05, letterSpacing: "0.01em", marginBottom: 32 }}>The Meaning<br />of Excalibur.</h2>
                <div style={{ width: 56, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 32 }} />
                <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.0, color: "rgba(251,247,238,0.75)", fontWeight: 300, marginBottom: 24 }}>
                  In Arthurian legend, Excalibur is more than a sword or power. It is a symbol of leadership and excellence. It represents the right to lead — earned through judgment, courage, responsibility, and character. At Excalibur Academy, leadership is treated the same way. It is not about being the loudest in the room or holding the highest title. It is about becoming the kind of person others can trust to think clearly, act responsibly, and emerge as a natural leader under toughest conditions.
                </p>
                <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.0, color: "rgba(251,247,238,0.75)", fontWeight: 300, marginBottom: 40 }}>
                  The Knights of the Round Table represent more than strength in battle, but courage joined with judgment, debate joined with loyalty, and ambition governed by honor. At Excalibur, that ideal becomes an educational model. Students are trained not for one narrow skill, but for the range of capacities true leadership requires.
                </p>
                <div style={{ borderTop: "1px solid rgba(199,171,117,.12)", paddingTop: 32 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 20 : 28, fontWeight: 300, fontStyle: "italic", color: gold, lineHeight: 1.4, letterSpacing: "0.02em" }}>
                    "That is our model."
                  </p>
                </div>
              </div>

              {/* RIGHT  -  photo (desktop only as side column; stacks above on mobile) */}
              {isMobile ? (
                <div style={{ position: "relative" }}>
                  <img src="https://i.imgur.com/QNW043y.jpeg" alt="King Arthur — Excalibur" style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                </div>
              ) : (
                <div style={{ position: "relative", alignSelf: "center" }}>
                  <img src="https://i.imgur.com/QNW043y.jpeg" alt="King Arthur — Excalibur" style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to bottom, transparent, #07060A)" }} />
                </div>
              )}

            </div>
          </div>
        </div>
      </Fade>

      {/* OUR PHILOSOPHY  -  ivory luxury editorial */}
      <Fade>
        <div style={{ background: "#FAFAF8", padding: isMobile ? "72px 24px" : "110px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <div style={{ width: 36, height: "1px", background: "rgba(0,0,0,.2)" }} />
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>Our Philosophy</p>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Didot', 'Bodoni MT', Georgia, serif", fontSize: isMobile ? 34 : 56, fontWeight: 300, fontStyle: "italic", color: "#0A0A0A", lineHeight: 1.1, letterSpacing: "0.01em", marginBottom: 52 }}>Classical formation.<br />Modern ambition.</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 80, marginBottom: 64 }}>
              <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.1, color: "#2a2a2a", fontWeight: 300 }}>Excalibur Academy exists to restore a form of education that once formed statesmen, aristocrats, generals, pioneers, and innovators — while equipping it for the demands of the modern world. Our foundation is European in character: classical formation, intellectual depth, discipline of mind, and cultivated presence, while equally driven by the American spirit of leadership: action, innovation, independence, ambition, and the courage to forge new paths.</p>
              <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.1, color: "#2a2a2a", fontWeight: 300 }}>For centuries, European education focused not only on knowledge, but on formation of character — the shaping of judgment, taste, class and natural authority. From Ancient Greek warriors trained in rhetoric and philosophy, to Roman senators schooled in governance and persuasion, to Renaissance leaders educated across art, politics, and commerce, excellence was understood as multidimensional. Excalibur returns to this tradition while extending it into the modern age — where leadership now requires command of technology, entrepreneurship, rapid change and global complexity.</p>
            </div>
            {/* Two photos  -  refined border treatment */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 3 : 3 }}>
              <div style={{ height: isMobile ? 260 : 420, overflow: "hidden", position: "relative" }}>
                <img src="https://i.imgur.com/LZ29Hjy.jpeg" alt="Ancient Greece — classical tradition" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .8s cubic-bezier(.25,.46,.45,.94)" }} onError={e => e.target.style.display = "none"} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.08)" }} />
              </div>
              <div style={{ height: isMobile ? 260 : 420, overflow: "hidden", position: "relative" }}>
                <img src="https://i.imgur.com/DhYCwhg.jpeg" alt="European heritage" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .8s cubic-bezier(.25,.46,.45,.94)" }} onError={e => e.target.style.display = "none"} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.08)" }} />
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* A MULTIDIMENSIONAL LEADER  -  dark luxury block */}
      <Fade>
        <div style={{ background: "#07060A", padding: isMobile ? "72px 24px" : "110px 80px", borderTop: "1px solid rgba(199,171,117,.08)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <div style={{ width: 36, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)` }} />
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", margin: 0 }}>A Multidimensional Leader</p>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', 'Didot', 'Bodoni MT', Georgia, serif", fontSize: isMobile ? 34 : 58, fontWeight: 300, fontStyle: "italic", color: "#FBF7EE", lineHeight: 1.05, letterSpacing: "0.01em", marginBottom: 52 }}>Ownership<br />and Excellence.</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80 }}>
              <div>
                <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.1, color: "rgba(251,247,238,0.75)", fontWeight: 300, marginBottom: 28 }}>Excalibur students are forged to lead commanding respect, to speak with precision, to think with depth, to take risks intelligently, and to remain composed under scrutiny. They study public speaking and executive communication alongside financial reasoning and strategy. They learn the art of class and presence alongside risk management, ownership of outcomes, and modern innovation in AI and emerging technology. They are trained to take responsibility not only for success, but also failure — to learn decisively from both, and own the next step through resilience and will.</p>
                <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.1, color: "rgba(251,247,238,0.75)", fontWeight: 300 }}>This is a type of a leader forged by Excalibur Academy — a leader of range and depth. One who is credible from every angle. Intellectual without being abstract. Decisive without being reckless. Cultured without being performative. When such a student enters a room — whether a boardroom, an art gallery, an intimate gala event, or a stage — the authority is natural and leadership is evident.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {/* Real stakes  -  refined luxury list */}
                <div style={{ borderTop: `1px solid ${gold}`, borderBottom: `1px solid ${gold}`, padding: isMobile ? "32px 0" : "44px 0" }}>
                  {["Real Responsibilities.", "Real Decisions.", "Real Stakes.", "Real Mistakes.", "Real Lessons.", "Real Successes."].map((line, i) => (
                    <p key={i} style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 22 : 30, color: i % 2 === 0 ? "#F0E8E0" : gold, fontWeight: i % 2 === 0 ? 500 : 300, lineHeight: 1.5, fontStyle: i % 2 !== 0 ? "italic" : "normal", letterSpacing: "0.01em" }}>{line}</p>
                  ))}
                </div>
                <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.1, color: "rgba(251,247,238,0.75)", fontWeight: 300 }}>At Excalibur Academy, students do not learn theory alone. They are placed in situations that require responsibility, judgment, teamwork, and decision-making under pressure. Through applied leadership, public speaking, venture development, and real-world engagements, students learn by doing — building the confidence to speak clearly, dream boldly, act responsibly, and improve through feedback. They experience global perspective through international programs and summer immersions in places such as London and Geneva, learning to operate across cultures with confidence and respect.</p>
              </div>
            </div>
          </div>
        </div>
      </Fade>

      {/* CLOSING STATEMENT  -  full bleed black luxury */}
      <Fade>
        <div style={{ background: "#F5F3EE", padding: isMobile ? "56px 24px" : "80px 80px", textAlign: "center" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <p style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.9, color: "#111", fontWeight: 300, marginBottom: 20 }}>Excalibur students graduate with the confidence to address a room, the judgment to defend an idea, the maturity to take responsibility for the choices they make, and forged to be ready for whatever arena they step into next.</p>
            <div style={{ height: 1, background: "rgba(199,171,117,.4)", margin: "32px auto", maxWidth: 120 }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 28, color: "#000", fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>This is not an education designed to avoid difficulty.</p>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 28, color: "#111", fontWeight: 600, lineHeight: 1.4, marginBottom: 0 }}>It is an education designed to form leaders.</p>
          </div>
        </div>
      </Fade>

      {/* STATEMENT  -  full bleed black, gold lines */}
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
        {[["15–18", "Age range"], ["20", "Students per cohort"], ["10", "Months flagship"], ["10", "Curriculum modules"]].map(([v, l], i) => (
          <div key={i} style={{ background: "#080808", padding: "36px 20px", textAlign: "center", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.1)"}` }}>
            <div style={{ fontFamily: serif, fontSize: 44, fontWeight: 600, color: gold, lineHeight: 1 }}>{v}</div>
            <div style={{ fontFamily: sans, color: "#FBF7EE", fontSize: 13, marginTop: 10, letterSpacing: "0.05em" }}>{l}</div>
          </div>
        ))}
      </div>

      <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />
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

      {/* Background  -  pure black with subtle gold glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(199,171,117,.04) 0%, transparent 65%)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "48px 24px" : "80px 40px", textAlign: "center" }}>

        {/* Logo */}
        <img src={LOGO_URL} alt="Excalibur Academy" style={{ width: isMobile ? 200 : 320, height: "auto", objectFit: "contain", marginBottom: 28, filter: "drop-shadow(0 0 60px rgba(199,171,117,.18))" }} onError={e => e.target.style.display = "none"} />

        {/* Eyebrow */}
        <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20, borderBottom: "1px solid rgba(199,171,117,.3)", paddingBottom: 8, display: "inline-block" }}>
          Waitlist Now Open for Summer Intensive July & August Waves 2026 &nbsp;·&nbsp; Apply Now &nbsp;·&nbsp; Limited Cohort &nbsp;·&nbsp; 20 Students Only
        </p>

        {/* Title  -  uniform uppercase via textTransform to match homepage */}
        <h1 style={{ fontFamily: "'Forum', Georgia, serif", fontSize: isMobile ? "clamp(22px,5vw,32px)" : "clamp(28px,3.5vw,44px)", fontWeight: 400, color: "#FBF7EE", lineHeight: 1.05, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 12 }}>
          Excalibur Academy
        </h1>
        <p style={{ fontFamily: sans, fontSize: isMobile ? 12 : 14, letterSpacing: "0.22em", color: gold, textTransform: "uppercase", marginBottom: 16, opacity: 0.85 }}>
          Forging the leaders of tomorrow
        </p>

        {/* Tagline from homepage */}
        <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 16, color: "#FBF7EE", lineHeight: 1.75, maxWidth: 640, marginBottom: 40, fontWeight: 300 }}>
          A premier institute where Fortune 100 executives, real entrepreneurs, investors, and distinguished professors teach the next generation to lead the world — not follow it.
        </p>

        {/* Status banner */}
        <div style={{ background: "rgba(199,171,117,.05)", border: "1px solid rgba(199,171,117,.18)", padding: isMobile ? "20px 24px" : "24px 48px", marginBottom: 44, maxWidth: 660 }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 10, letterSpacing: "0.4em", color: "#4DB87A", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>● Admissions Opening Soon</p>
          <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 15, color: "#FBF7EE", lineHeight: 1.75, fontWeight: 300 }}>For junior and high school seniors.</p>
          <p style={{ fontFamily: sans, fontSize: isMobile ? 13 : 15, color: "#FBF7EE", lineHeight: 1.75, fontWeight: 300, marginTop: 4 }}>Enrollment limited to 20 students per cohort.</p>
        </div>

        {/* Program cards  -  all gold */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111", marginBottom: 52, width: "100%", maxWidth: 880 }}>
          {[
            { label: "SUMMER INTENSIVE", dates: "July & August 2026", detail: "Mon–Fri · 9:30 AM–3:30 PM · $410/day · $4,500 per wave" },
            { label: "TEN-MONTH FLAGSHIP", dates: "September 2026 – June 2027", detail: "Weekday or Weekend Track · $1,900 / month", flagship: true },
            { label: "SIX-WEEK INTENSIVE", dates: "Four waves · 2026", detail: "Mon & Wed evenings or Saturdays · $3,900 / wave" },
          ].map((p, i) => (
            <div key={i} style={{ background: "#080808", padding: "24px 22px", borderTop: `2px solid ${p.flagship ? gold : "rgba(199,171,117,.2)"}` }}>
              <p style={{ fontFamily: sans, fontSize: 10, letterSpacing: "0.4em", color: gold, fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>{p.label}</p>
              <p style={{ fontFamily: serif, fontSize: 15, color: "#FBF7EE", marginBottom: 6 }}>{p.dates}</p>
              <p style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", fontWeight: 300 }}>{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Faculty credentials  -  refined split panels */}
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

        {/* Email capture  -  invitation card */}
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
                Academy Launch and Family Information Soirée<br />at Laguna Niguel City Hall Ballroom
              </p>
              <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "0 auto 20px" }} />
              <p style={{ fontFamily: sans, fontSize: isMobile ? 12 : 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, maxWidth: 520, margin: "0 auto 18px" }}>
                An intimate evening for a select number of families to meet the faculty, learn about the programs, and experience the standard of the Academy firsthand.
              </p>
              <p style={{ fontFamily: serif, fontSize: 18, color: gold, letterSpacing: "0.18em", marginBottom: 32, textTransform: "uppercase" }}>By Personal Invitation Only</p>
              <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row", maxWidth: 520, margin: "0 auto" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={async e => { if (e.key === "Enter" && email) { await sendEmail({ "Email": email, "Type": "Soirée Invitation Request", "Message": "Soirée invitation request from: " + email }); setSubmitted(true); }}}
                  placeholder="Your email address"
                  style={{ flex: 1, padding: "13px 18px", background: "#000", border: "1px solid rgba(199,171,117,.25)", color: "#FBF7EE", fontFamily: sans, fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = gold}
                  onBlur={e => e.target.style.borderColor = "rgba(199,171,117,.25)"}
                />
                <button
                  onClick={async () => { if (!email) return; await sendEmail({ "Email": email, "Type": "Soirée Invitation Request", "Message": "Soirée invitation request from: " + email }); setSubmitted(true); }}
                  style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 22px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: "none", cursor: "pointer", flexShrink: 0 }}
                >
                  Request Invitation
                </button>
              </div>
              <p style={{ fontFamily: sans, fontSize: 10, color: "#FBF7EE", marginTop: 14, letterSpacing: "0.06em" }}>A member of our admissions team will be in touch within 24 hours with next steps.</p>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 880, marginBottom: 48 }}>
            <div style={{ background: "#08080A", border: "1px solid rgba(199,171,117,.2)", padding: "44px 52px", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
              <span style={{ fontFamily: serif, fontSize: 28, color: gold, display: "block", marginBottom: 16 }}>✦</span>
              <p style={{ fontFamily: serif, fontSize: 22, color: "#FBF7EE", marginBottom: 12 }}>Thank you.</p>
              <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8 }}>Our admissions team will follow up personally with details for the May 27 evening. We would be honored to welcome your family.</p>
            </div>
          </div>
        )}

        {/* Password access */}
        {!showPass ? (
          <button onClick={() => setShowPass(true)} style={{ fontFamily: sans, background: "transparent", border: "none", color: "#FBF7EE", fontSize: 11, cursor: "pointer", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: 3 }}>
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
    tracks: [],
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

  const toggleTrack = (t) => {
    const cur = form.tracks;
    set("tracks", cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]);
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
  const tracks = ["Weekday (Tue & Thu, 4–7pm)", "Saturday (9am–3pm)", "Either / No Preference"];
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
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1 }}>
                {submitted ? "Thank You." : "Please Fill out Quick Information Form"}
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
              {/* Address  -  city + zip required, street optional */}
              <div>
                <Label>City <span style={{ color: gold }}>*</span></Label>
                <input className={inputClass} style={{ ...inputStyle, marginBottom: 8 }} value={form.city} onChange={e=>set("city",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="City" required />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 8, marginBottom: 8 }}>
                  <input className={inputClass} style={inputStyle} value={form.state} onChange={e=>set("state",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="State" />
                  <input className={inputClass} style={inputStyle} value={form.zip} onChange={e=>set("zip",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="ZIP *" required />
                </div>
                <Label style={{ marginTop: 8 }}>Home Address <span style={{ fontWeight: 300, letterSpacing: "0.1em", textTransform: "none", fontSize: 9, color: "#C7AB75" }}>(optional)</span></Label>
                <input style={{ ...inputStyle }} value={form.address} onChange={e=>set("address",e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Street address (optional)" />
              </div>

              {/* Program Interest */}
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
              {/* Schedule Track */}
              <div>
                <Label>Schedule Track (select all that apply)</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tracks.map(t => (
                    <button key={t} onClick={() => toggleTrack(t)} style={{
                      fontFamily: sans, fontSize: 13, padding: "14px 20px", cursor: "pointer", textAlign: "left",
                      background: form.tracks.includes(t) ? "rgba(199,171,117,.08)" : "transparent",
                      color: form.tracks.includes(t) ? gold : "#FBF7EE",
                      border: `1px solid ${form.tracks.includes(t) ? gold : "rgba(199,171,117,.18)"}`,
                      transition: "all .2s", fontWeight: form.tracks.includes(t) ? 500 : 300,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      {t}
                      {form.tracks.includes(t) && <span style={{ fontSize: 14 }}>✦</span>}
                    </button>
                  ))}
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
                <button onClick={addStudent} style={{ fontFamily: sans, background: "transparent", border: "1px dashed rgba(199,171,117,.25)", color: "#C7AB75", padding: "12px", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", cursor: "pointer", textAlign: "center" }}>+ Add Another Student</button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Private invitation + package */}
              <div>
                <Label>Admissions Package & Private Invitation</Label>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>Would you like to receive your private invitation to the May 27 family evening and admissions package by post?</p>
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
              <button
                onClick={async () => {
                  const ok = await sendEmail({
                    subject: "New Excalibur Inquiry — " + form.parentFirst + " " + form.parentLast,
                    name: form.parentFirst + " " + form.parentLast,
                    email: form.email,
                    phone: form.phone,
                    city: form.city + (form.state ? ", " + form.state : ""),
                    contact_method: form.contactMethod,
                    contact_time: form.contactTime,
                    programs: form.programs.join(", "),
                    schedule_track: (form.tracks||[]).join(", "),
                    send_package: form.sendPackage,
                    heard_about: form.hearAbout,
                    students: form.students.map(s => s.firstName + " " + s.lastName + " | Grade: " + s.grade + " | Age: " + s.age).join(" / "),
                    message: "Programs: " + form.programs.join(", ") + " | Track: " + (form.tracks||[]).join(", "),
                  });
                  setSubmitted(true);
                }}
                style={{ fontFamily: sans, background: gold, color: "#000", padding: "13px 36px", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", border: "none", cursor: "pointer", textTransform: "uppercase" }}
              >Submit — We'll Be in Touch Within 24 Hours</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: FLAGSHIP DETAIL
// ─────────────────────────────────────────────

function FlagshipModulesBlock({ isMobile, setPage, modules }) {
  const [activeMod, setActiveMod] = useState(0);
  React.useEffect(() => { setActiveMod(isMobile ? null : 0); }, [isMobile]);
  return (
    <section style={{ padding: isMobile ? "60px 16px" : "80px 40px", background: "#000" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>THE CURRICULUM</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 42, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 12 }}>Inside the Classroom</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>Ten disciplines — taught by executive business leaders, distinguished keynote speakers, and professors from leading universities.</p>
        </div>
        {isMobile ? (
          <div style={{ border: "1px solid #151515" }}>
            {modules.map((m, i) => (
              <div key={i} style={{ borderBottom: "1px solid #0E0E0E" }}>
                <div onClick={() => setActiveMod(activeMod === i ? null : i)} style={{ padding: "18px 20px", cursor: "pointer", borderLeft: `3px solid ${activeMod === i ? gold : "transparent"}`, background: activeMod === i ? "rgba(199,171,117,.04)" : "#060606", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s" }}>
                  <div style={{ fontFamily: serif, fontSize: 19, fontWeight: activeMod === i ? 600 : 400, color: activeMod === i ? gold : "#D8D0C8", lineHeight: 1.3 }}>{m.title}</div>
                  <div style={{ fontFamily: sans, fontSize: 16, color: activeMod === i ? gold : "#FBF7EE", transition: "transform .25s", transform: activeMod === i ? "rotate(45deg)" : "none", lineHeight: 1 }}>+</div>
                </div>
                {activeMod === i && (
                  <div style={{ background: "#080808", padding: "24px 20px 28px" }}>
                    <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", marginBottom: 14 }}>{m.tagline}</p>
                    <div style={{ marginBottom: 18 }}>{(m.body || m.desc || "").split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>{para}</p>))}</div>
                    <button onClick={() => setPage(`module:${m.slug}`)} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.15em", fontWeight: 700, border: `1px solid rgba(199,171,117,.3)`, padding: "9px 16px", background: "transparent", cursor: "pointer", textTransform: "uppercase" }}>Explore Module</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", border: "1px solid #151515", overflow: "hidden" }}>
            <div style={{ background: "#060606", borderRight: "1px solid #151515" }}>
              {modules.map((m, i) => (
                <div key={i} onClick={() => setActiveMod(i)} style={{ padding: "20px 28px", cursor: "pointer", borderBottom: "1px solid #0E0E0E", borderLeft: `3px solid ${activeMod === i ? gold : "transparent"}`, background: activeMod === i ? "rgba(199,171,117,.05)" : "transparent", transition: "all .25s" }}>
                  <div style={{ fontFamily: serif, fontSize: activeMod === i ? 21 : 19, fontWeight: activeMod === i ? 600 : 400, color: activeMod === i ? gold : "#D8D0C8", lineHeight: 1.3 }}>{m.title}</div>
                  <div style={{ fontFamily: sans, fontSize: 10, color: activeMod === i ? "rgba(199,171,117,.5)" : "#706860", marginTop: 3, letterSpacing: 1 }}>{m.months || m.phase}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#080808" }}>
              <div key={activeMod} className="mod-content" style={{ padding: "36px 44px 44px" }}>
                {activeMod !== null && <p style={{ fontFamily: sans, color: gold, fontSize: 10, letterSpacing: "0.3em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>{modules[activeMod].months || modules[activeMod].phase}</p>}
                {activeMod !== null && <h3 style={{ fontFamily: serif, fontSize: "clamp(26px,3vw,36px)", fontWeight: 600, color: "#FBF7EE", marginBottom: 8, lineHeight: 1.15 }}>{modules[activeMod].title}</h3>}
                {activeMod !== null && <p style={{ fontFamily: serif, fontSize: 19, color: gold, fontStyle: "italic", marginBottom: 20 }}>{modules[activeMod].tagline}</p>}
                {activeMod !== null && <div style={{ marginBottom: 24 }}>{(modules[activeMod].body || modules[activeMod].desc || "").split("\n\n").map((para, pi) => (<p key={pi} style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>{para}</p>))}</div>}
                {activeMod !== null && <button onClick={() => setPage(`module:${modules[activeMod].slug}`)} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.2em", fontWeight: 700, border: `1px solid rgba(199,171,117,.3)`, padding: "9px 18px", background: "transparent", cursor: "pointer", textTransform: "uppercase" }}>Explore This Module</button>}
              </div>
            </div>
          </div>
        )}
        <div style={{ marginTop: 2, background: "#060606", border: "1px solid #111", borderTop: "none", padding: "17px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300 }}>All modules, field trips and The Arena Beyond Classroom experiences covered only in the Flagship Ten-Month Program.</span>
          <button onClick={() => setPage("curriculum")} style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: 2, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>VIEW ALL MODULES</button>
        </div>
      </div>
    </section>
  );
}

function FlagshipScheduleInteractive({ isMobile }) {
  const [activeTab, setActiveTab] = useState("flagship-wd");
  const [activeBlock, setActiveBlock] = useState(null);
  const tabs = [
    { id: "flagship-wd", label: "Weekday Track", sched: flagshipWeekdaySchedule, subtitle: "Tuesday & Thursday \u00b7 4:00\u20136:30 PM" },
    { id: "flagship-sat", label: "Saturday Track", sched: flagshipSaturdaySchedule, subtitle: "Every Saturday \u00b7 10:30 AM\u20133:40 PM" },
  ];
  const current = tabs.find(t => t.id === activeTab) || tabs[0];
  return (
    <div style={{ marginTop: 0 }}>
      {/* Tab selector + subtitle  -  header strip matching DailyScheduleBlock */}
      <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,.08)", borderBottom: "none", padding: isMobile ? "16px 20px 14px" : "24px 36px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Schedule</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: isMobile ? 14 : 17, color: "#222", fontWeight: 400 }}>{current.subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setActiveBlock(null); }} style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", padding: "7px 16px", background: activeTab === t.id ? "#111" : "transparent", border: `1px solid ${activeTab === t.id ? "#111" : "rgba(0,0,0,.15)"}`, color: activeTab === t.id ? "#fff" : "#555", fontSize: 10, cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: activeTab === t.id ? 600 : 400, transition: "all .2s" }}>{t.label}</button>
          ))}
        </div>
      </div>
      {/* Schedule grid matching DailyScheduleBlock */}
      <div style={{ background: "#FAF8F4", border: "1px solid rgba(0,0,0,.08)" }}>
        {isMobile ? (
          <div>
            {current.sched.map((block, i) => {
              const isActive = activeBlock === i;
              const isBreak = !block.instructor;
              return (
                <div key={i}>
                  <div onClick={() => setActiveBlock(isActive ? null : i)} style={{ padding: "14px 20px", cursor: "pointer", borderLeft: `3px solid ${isActive ? "#8B6914" : "transparent"}`, background: isActive ? "rgba(139,105,20,.04)" : "#FAF8F4", borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", gap: 12, alignItems: "flex-start", transition: "all .2s", opacity: isBreak ? 0.6 : 1 }}>
                    <div style={{ flexShrink: 0, minWidth: 52 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, color: isActive ? "#8B6914" : "#555", fontWeight: 600, lineHeight: 1 }}>{block.time}</div>
                      {block.dur && block.dur !== "—" && <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: "#555", marginTop: 2 }}>{block.dur}</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{block.block ? block.block.replace(/^Block [0-9]+[ab]? — /, "").replace(/^Block [0-9]+[ab]? – /, "") : ""}</div>
                      {block.instructor && <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: isActive ? "#8B6914" : "#999", marginTop: 2 }}>{block.instructor}</div>}
                    </div>
                    <span style={{ color: isActive ? "#8B6914" : "#bbb", fontSize: 16, transition: "transform .2s", transform: isActive ? "rotate(45deg)" : "none", display: "inline-block", flexShrink: 0 }}>+</span>
                  </div>
                  {isActive && <ScheduleDetail block={block} />}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr" }}>
            <div style={{ borderRight: "1px solid rgba(0,0,0,.07)", background: "#fff" }}>
              {current.sched.map((block, i) => {
                const isActive = activeBlock === i;
                const isBreak = !block.instructor;
                return (
                  <div key={i} onClick={() => setActiveBlock(isActive ? null : i)} style={{ padding: "14px 24px", cursor: "pointer", borderLeft: `3px solid ${isActive ? "#8B6914" : "transparent"}`, background: isActive ? "rgba(139,105,20,.05)" : "transparent", borderBottom: "1px solid rgba(0,0,0,.05)", transition: "all .2s", display: "flex", gap: 12, alignItems: "flex-start", opacity: isBreak ? 0.55 : 1 }}>
                    <div style={{ flexShrink: 0, paddingTop: 2 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, color: isActive ? "#8B6914" : "#555", fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap" }}>{block.time}</div>
                      {block.dur && block.dur !== "—" && <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: "#555", marginTop: 3 }}>{block.dur}</div>}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{block.block ? block.block.replace(/^Block [0-9]+[ab]? — /, "").replace(/^Block [0-9]+[ab]? – /, "") : ""}</div>
                      {block.instructor && <div style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, color: isActive ? "#8B6914" : "#999", marginTop: 2, letterSpacing: "0.06em" }}>{block.instructor}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#FAF8F4" }}>
              {activeBlock !== null && current.sched[activeBlock] ? (
                <div key={activeBlock} style={{ minHeight: 320 }}>
                  <ScheduleDetail block={current.sched[activeBlock]} />
                </div>
              ) : (
                <div style={{ padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "rgba(0,0,0,.08)" }}>✦</span>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "rgba(0,0,0,.25)", fontStyle: "italic", textAlign: "center" }}>Select a time block<br />to see what happens in that session</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlagshipEnrollSelector({ openInquiry, isMobile }) {
  const [prog, setProg] = React.useState(null);
  const [track, setTrack] = React.useState(null);

  const programs = [
    { id: "full", label: "TEN-MONTH FLAGSHIP", title: "Ten-Month Program", price: "From $1,900 / month", desc: "The complete Excalibur formation. All ten modules, real-world engagements, and the Academy Gala & Graduation Day capstone." },
    { id: "intensive", label: "SIX-WEEK INTENSIVE", title: "Six-Week Intensive", price: "$2,500 / wave", desc: "Full curriculum in six weeks. One discipline per week, Shark Tank–style Finale." },
    { id: "summer", label: "SUMMER INTENSIVE", title: "Summer Intensive", price: "$410 / full day · $4,500 per wave", desc: "Two weeks. Full Days. Students move from idea to venture concept: researching the market, shaping the business model, building the pitch, and learning to present with clarity and confidence before the Shark Tank-inspired — Excalibur Venture Finale." },
  ];
  const tracks = [
    { id: "weekday", label: "WEEKDAY TRACK", title: "Tuesday & Thursday", sub: "4:00–6:30 PM", detail: "Evening sessions. Fits any weekend schedule." },
    { id: "saturday", label: "SATURDAY TRACK", title: "Every Saturday", sub: "10:30 AM–3:40 PM", detail: "Full-day immersion. Deeper workshops and extended speaker time." },
  ];

  return (
    <div>
      {/* Step 1 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 30, height: 30, background: prog ? gold : "#111", border: `1px solid ${prog ? gold : "rgba(199,171,117,.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 12, fontWeight: 700, color: prog ? "#000" : "#FBF7EE", flexShrink: 0 }}>1</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 24, fontWeight: 600, color: "#FBF7EE" }}>Choose Your Program</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
          {programs.map(p => (
            <div key={p.id} onClick={() => { setProg(p.id); setTrack(null); }} style={{ background: prog === p.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${prog === p.id ? gold : "transparent"}`, transition: "all .25s" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>{p.label}</p>
              <h4 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, fontWeight: 600, color: "#FBF7EE", marginBottom: 6, lineHeight: 1.2 }}>{p.title}</h4>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: gold, marginBottom: 10 }}>{p.price}</p>
              <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{p.desc}</p>
              {prog === p.id && <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 10, color: gold, letterSpacing: "0.18em", marginTop: 14 }}>✓ SELECTED</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2 */}
      {prog && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 30, height: 30, background: track ? gold : "#111", border: `1px solid ${track ? gold : "rgba(199,171,117,.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 12, fontWeight: 700, color: track ? "#000" : "#FBF7EE", flexShrink: 0 }}>2</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 24, fontWeight: 600, color: "#FBF7EE" }}>Choose Your Track</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
            {tracks.map(t => (
              <div key={t.id} onClick={() => setTrack(t.id)} style={{ background: track === t.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${track === t.id ? gold : "transparent"}`, transition: "all .25s" }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>{t.label}</p>
                <h4 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 22, fontWeight: 600, color: "#FBF7EE", marginBottom: 4 }}>{t.title}</h4>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: gold, marginBottom: 10 }}>{t.sub}</p>
                <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>{t.detail}</p>
                {track === t.id && <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 10, color: gold, letterSpacing: "0.18em", marginTop: 14 }}>✓ SELECTED</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {prog && track && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 30, height: 30, background: gold, border: `1px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 12, fontWeight: 700, color: "#000", flexShrink: 0 }}>3</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 24, fontWeight: 600, color: "#FBF7EE" }}>Your Information</h3>
          </div>
          <div style={{ background: "#080808", borderTop: `2px solid ${gold}`, padding: "36px 32px" }}>
            <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.75, marginBottom: 28 }}>Fill in your details and our Enrollment Coordinator will be in touch within 48 hours with your full information package and next steps.</p>
            {/* Parent info */}
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.25em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Parent / Guardian</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["First Name", "text"], ["Last Name", "text"]].map(([ph, type]) => (
                <input key={ph} type={type} placeholder={ph} className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[["Email Address", "email"], ["Phone Number", "tel"]].map(([ph, type]) => (
                <input key={ph} type={type} placeholder={ph} className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 80px", gap: 10, marginBottom: 24 }}>
              <input type="text" placeholder="City *" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} required />
              <input type="text" placeholder="State" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              <input type="text" placeholder="ZIP *" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} required />
            </div>
            {/* Student info */}
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.25em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Student</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["First Name", "text"], ["Last Name", "text"]].map(([ph, type]) => (
                <input key={ph} type={type} placeholder={ph} className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 24 }}>
              <input type="text" placeholder="Age" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              <input type="text" placeholder="Current Grade / Year" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
            </div>
            <input type="text" placeholder="How did you hear about Excalibur?" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%", marginBottom: 24 }} />
            <div style={{ background: "#000", padding: "16px 20px", marginBottom: 28, borderLeft: `2px solid ${gold}` }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.2em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Your Selection</p>
              <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>{programs.find(p2 => p2.id === prog)?.title} · {tracks.find(t2 => t2.id === track)?.title}</p>
            </div>
            <button onClick={() => openInquiry && openInquiry(prog)} style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", padding: "15px 40px", background: gold, border: "none", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>SUBMIT — WE'LL BE IN TOUCH WITHIN 24 HOURS</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlagshipDetailPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  const hasBreadcrumb = true;

  const modules = [
    { n: "01", title: "Public Speaking & Rhetoric", tagline: "Presence. Persuasion. Command.", slug: "public-speaking", phase: "Phase 1 — Foundations", desc: "Every session opens with speaking. Voice mechanics, impromptu drills, rhetorical strategy, Aristotelian persuasion. By graduation, students will have completed 120+ individual speaking reps." },
    { n: "02", title: "Financial Literacy & Business Acumen", tagline: "Understand money. Think like an owner.", slug: "financial-literacy", phase: "Phase 1 — Foundations", desc: "Reading a P&L, unit economics, pricing strategy, equity structures, and investor-grade financial analysis of real companies." },
    { n: "03", title: "Business Model Analysis", tagline: "Break down any business. Find the logic.", slug: "business-models", phase: "Phase 1 — Foundations", desc: "The eight business model archetypes, competitive advantage mapping, vulnerability analysis, and live deconstruction of real companies." },
    { n: "04", title: "The Art of Selling & Marketing", tagline: "Persuasion with integrity. Influence with purpose.", slug: "art-of-selling", phase: "Phase 2 — Skills", desc: "Consultative selling, Cialdini's principles, objection handling, brand strategy, and live roleplay with recorded feedback." },
    { n: "05", title: "Stocks, Crypto & Market Literacy", tagline: "Understanding capital, risk, and market behavior.", slug: "stocks-crypto-trading", phase: "Phase 2 — Skills", desc: "How equity markets work, how to read a stock, crypto fundamentals, risk management, trading psychology, and a live paper trading simulation before a real investor panel." },
    { n: "06", title: "AI, Technology & Innovation", tagline: "Wield the tools reshaping every work process.", slug: "ai-technology", phase: "Phase 2 — Skills", desc: "AI as a working instrument across research, modeling, and strategy. Prompt engineering, no-code tools, and critical evaluation of AI output." },
    { n: "07", title: "Leadership, Ownership & Influence", tagline: "Lead with earned authority, not borrowed title.", slug: "leadership", phase: "Phase 2 — Skills", desc: "The five forms of power, emotional intelligence, crisis communication, team dynamics, and a live CEO crisis simulation." },
    { n: "08", title: "Intellectual Depth & The Art of Class", tagline: "Think deeply. Move effortlessly among ideas.", slug: "intellectual-depth", phase: "Phase 3 — Application", desc: "Classical philosophy applied to modern leadership, social fluency, cultural literacy, and the habits of the most accomplished people." },
    { n: "09", title: "Industry Sectors Rotation", tagline: "Know every industry. Own any room.", slug: "industry-sectors", phase: "Phase 4 — Mastery", desc: "Twelve industries across ten months — technology, finance, real estate, healthcare, media, luxury, and more. One dedicated guest speaker per sector." },
    { n: "10", title: "College Admissions & Personal Development", tagline: "Start forging your own path. Dig Deeper. Ignite your true passions.", slug: "college-admissions", phase: "Phase 4 — Mastery", desc: "Application strategy, personal narrative, portfolio presentation, interview readiness, and monthly 1:1 personal development sessions." },
  ];

  const tracks = [
    { label: "WEEKDAY TRACK — GROUP B", days: "Tuesday & Thursday", time: "4:00–6:30 PM", block1: "4:00–4:40 PM · Public Speaking Instructor", block2: "4:55–5:35 PM · Specialist / Academy Dean", block3: "5:50–6:30 PM · Lead Instructor — War Room" },
    { label: "SATURDAY TRACK — GROUP A", days: "Every Saturday", time: "10:30 AM–3:45 PM", block1: "10:30–11:10 AM & 11:25 AM–12:05 PM · Speaking Coach", block2: "12:35–1:55 PM · Specialist / Academy Dean", block3: "2:10–2:50 PM & 3:00–3:40 PM · Lead Instructor — War Room" },
  ];

  const engagements = [
    { n: "I", title: "The Junior Consultant Program", tag: "TEAMS OF 4 · REAL BUSINESS CONSULTING", desc: "Student teams are paired with a real local business. Over three weeks, each team conducts a structured professional engagement: on-site observation, customer interviews, competitive analysis, SWOT assessment, and marketing strategy. The program culminates in a Boardroom Finale — a formal presentation of the consultant reports to the business owner and the executive team.", outcome: "A client-facing consulting report, a formal presentation, and a documented example of applied business judgment." },
    { n: "II", title: "Apprentice Externship", tag: "WORK EXPERIENCE · REAL COMPANY", desc: "Students complete a 4–6 week externship embedded within a company in their chosen industry sector, sourced from the Academy's network. They observe, contribute, build professional references, and produce a written reflection included in the graduation portfolio.", outcome: "Professional references, externship documentation, and direct industry experience." },
    { n: "III", title: "Micro-Business Launch", tag: "TEAMS · SEED-FUNDED · MENTORED", desc: "In the Flagship's penultimate program month, student teams build and launch micro-ventures designed to reach actual customers and aimed to generate revenue. Each team receives faculty guidance, structured accountability, and access to seed support through the Excalibur network of business owners, investors, mentors, and allies. The goal is not to simulate entrepreneurship, but to experience the discipline of building something that is tested outside the room — in the real world with real constraints and realities.", outcome: "A micro-business brought from idea to launch — with mentor support, market pressure, real customers, and the lasting understanding that hard work, passion and discipline can turn a dream into reality." },
  ];

  return (
    <div style={{ background: "#000", paddingTop: 0 }}>

      {/* HERO  -  photo full bleed */}
      {isMobile ? (
        <div style={{ background: "#000" }}>
          <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
            <img src="https://i.imgur.com/eyeb9rX.jpeg" alt="Ten-Month Flagship" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <button onClick={() => setPage("programs")} style={{ fontFamily: sans, background: "rgba(0,0,0,.5)", border: "1px solid rgba(199,171,117,.3)", color: gold, padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase" }}>← OUR PROGRAMS</button>
            </div>
          </div>
          <div style={{ background: "#000", padding: "28px 24px 20px" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>Ten-Month Flagship · September 2026 – June 2027</p>
            <h1 style={{ fontFamily: serif, fontSize: "clamp(32px,7vw,44px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 10 }}>The Complete Academy Experience.</h1>
            <p style={{ fontFamily: serif, fontSize: 15, color: gold, fontStyle: "italic", lineHeight: 1.4 }}>An after-school full year program of applied leadership, business, communication, and real-world experience.</p>
          </div>
        </div>
      ) : (
      <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
        <img src="https://i.imgur.com/eyeb9rX.jpeg" alt="Ten-Month Flagship" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,.3) 60%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 52, left: 72, maxWidth: 640 }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>Ten-Month Flagship · September 2026 – June 2027</p>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(44px,5vw,64px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 10 }}>The Complete Academy Experience.</h1>
          <p style={{ fontFamily: serif, fontSize: 18, color: gold, fontStyle: "italic", lineHeight: 1.4 }}>An after-school full year program of applied leadership, business, communication, and real-world experience.</p>
        </div>
        <div style={{ position: "absolute", top: 24, left: 24 }}>
          <button onClick={() => setPage("programs")} style={{ fontFamily: sans, background: "rgba(0,0,0,.5)", border: "1px solid rgba(199,171,117,.3)", color: gold, padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase" }}>← OUR PROGRAMS</button>
        </div>
      </div>
      )}


      {/* ── STATS STRIP ── */}
      <div style={{ background: "#000", borderBottom: "1px solid rgba(199,171,117,.10)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", borderLeft: "1px solid rgba(199,171,117,.10)" }}>
          {[["Sep 2026", "Program Starts"], ["June 2027", "Academy Gala & Graduation Day"], ["20 Students", "Per Track · Founding Class"], ["$1,900 / mo", "Annual & Monthly Plans Available"]].map(([val, lbl]) => (
            <div key={lbl} style={{ padding: isMobile ? "28px 20px" : "36px 40px", borderRight: "1px solid rgba(199,171,117,.10)", borderBottom: isMobile ? "1px solid rgba(199,171,117,.10)" : "none" }}>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 7 }}>{val}</p>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.25em", color: gold, textTransform: "uppercase", fontWeight: 600 }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      <Breadcrumb items={[{label:"Our Programs",page:"programs"},{label:"Ten-Month Flagship",page:"flagship-detail"}]} setPage={setPage} />
      {/* ── OVERVIEW HEADING + PROGRAM DETAILS ── */}
      <div style={{ background: "#000" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", minHeight: 0 }}>

          {/* LEFT  -  heading + copy */}
          <div style={{ padding: isMobile ? "52px 24px 40px" : "72px 80px 64px 80px", borderRight: isMobile ? "none" : "1px solid rgba(199,171,117,.08)" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: "#FBF7EE", fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Program Overview</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 30 : 44, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 32, maxWidth: 520 }}>Ten months. Ten disciplines. Real-world applied experience.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>The Excalibur Ten-Month Flagship is the Academy’s primary program — a complete, ten-month course of formation for ambitious high school seniors and juniors in Orange County, California, running from September–June.</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>Offered in two parallel tracks — Weekday (Tuesday &amp; Thursday evenings) and Saturday (morning) — both deliver identical curriculum, the same faculty, and the same standard of instruction. Classes are held across distinctive South Orange County settings, from historic villas and private venues for events &amp; forums inspired by the traditions of European education, to business club, and professional space for regular seminars and workshops.</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 18 }}>Across ten months, students progress through all ten core disciplines: Public Speaking &amp; Rhetoric, Financial Literacy, Business Model Analysis, The Art of Selling &amp; Marketing, Stocks, Crypto &amp; Market Literacy, AI &amp; Technology, Leadership &amp; Influence, Intellectual Depth &amp; The Art of Class, Industry Sectors Rotation, and College Admissions &amp; Personal Development.</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>Each month, a dedicated specialist — a working executive, investor, entrepreneur, or senior practitioner — leads the core curriculum block.</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>The Lead Instructor runs the War Room, where students apply what they learn through case studies, simulations, strategy exercises, and team-based challenges.</p>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>The Public Speaking Instructor opens every class with drills, debates, elevator pitches, and speaking exercises designed to build confidence, presence, rhetoric, and communication under pressure.</p>
          </div>

          {/* RIGHT  -  program details on black */}
          <div style={{ padding: isMobile ? "0 24px 52px" : "72px 80px 64px 64px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: "#FBF7EE", fontWeight: 600, textTransform: "uppercase", marginBottom: 28 }}>Program Details</p>
            <div style={{ borderTop: "1px solid rgba(199,171,117,.15)" }}>
              <div style={{ padding: "18px 0", borderBottom: "1px solid rgba(199,171,117,.08)", display: "grid", gridTemplateColumns: "1fr", gap: 4 }}>
                <p style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#FBF7EE" }}>Ten-Month Flagship</p>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.22em", color: gold, textTransform: "uppercase" }}>Inaugural Class &#183; September 2026</p>
              </div>
              {[["Dates", "September 2026 &#8211; June 2027"], ["Weekday Track", "Tue &amp; Thu &#183; 4:00&#8211;6:30 PM"], ["Saturday Track", "Saturday &#183; 10:30 AM&#8211;3:45 PM"], ["Class Size", "20 students per track"], ["Eligibility", "Ages 15&#8211;18 &#183; Juniors &amp; Seniors"]].map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 16, padding: "14px 0", borderBottom: "1px solid rgba(199,171,117,.07)" }}>
                  <span style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.2em", color: gold, textTransform: "uppercase", paddingTop: 3, fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: k }} />
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: v }} />
                </div>
              ))}
              <div style={{ paddingTop: 28 }}>
                {/* WHAT'S INCLUDED */}
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 18 }}>The Formation — What's Included</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
                  {[
                    ["01", "All 10 core modules at full depth across a structured 4-phase arc"],
                    ["02", "12 industry sector rotations — one dedicated guest professional per month"],
                    ["03", "Three-block session model: Speaking Coach + Specialist + Applied Workshops & Simulations"],
                    ["04", "Junior Consultant Program — 3-week advisory team engagement with a real local business"],
                    ["05", "Apprentice Externship — 4–6 weeks embedded inside a company in your chosen industry"],
                    ["06", "Micro-Business Launch — from concept to customers: mentored venture development with market testing, customer discovery, and potential seed support for selected projects."],
                    ["07", "Monthly Pitch Night before live judges, investors, and parents"],
                    ["09", "OC Championship (biannual) — competitive pitch event at a premium venue"],
                    ["09", "Bound Excalibur Portfolio — every analysis, report, resumé and competition result, professionally compiled"],
                    ["10", "Faculty letters of recommendation from lead executives and practitioners"],
                    ["11", "College admissions support and portfolio review with a dedicated advisor"],
                    ["12", "Alumni network access — graduates, faculty, mentors, and guest speakers"],
                    ["13", "Weekend & day trips — local businesses, Silicon Valley, SpaceX launch, LA & SF Tech Weeks, Daytona NASCAR Racing, Yosemite Summit"],
                  ].map(([n, text]) => (
                    <div key={n} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
                      <span style={{ fontFamily: serif, fontSize: 11, color: "#C7AB75", fontWeight: 300, flexShrink: 0, paddingTop: 1, minWidth: 18 }}>{n}</span>
                      <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{text}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => openInquiry && openInquiry("full-program")} style={{ fontFamily: sans, padding: "13px 0", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>APPLY &#8212; FLAGSHIP &#8594;</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── THREE-BLOCK SESSION MODEL ── */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>The Session Model</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 8 }}>Every session. Every program.</h2>
          <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300, marginBottom: 36, maxWidth: 680 }}>Every session at Excalibur follows the same three-block structure, regardless of the program or the week.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
            {[
              { n: "BLOCK 1", title: "Public Speaking Instructor", sub: "Opens every session", desc: "Speaking warm-up, impromptu drills, pitch practice, debate exercises, rhetoric training. The Speaking Coach sets the energy for the entire session. By graduation, students will have completed 120+ individual speaking reps across structured and unstructured exercises." },
              { n: "BLOCK 2", title: "Specialist Instructor", sub: "The month's module", desc: "The monthly specialist delivers their core module content — Finance, AI & tech, Sales, Leadership, Crypto & Trading, Intellectual Depth & Art of Networking, Business Models, or Industry Sectors. Each specialist is a practitioner with real-world experience in the discipline they teach." },
              { n: "BLOCK 3", title: "Lead Instructor — The War Room", sub: "The real world, every week", desc: "Rotates weekly between: (1) current events and business news analysis, (2) start-up simulations, risk management & weekly case study deconstruction — approximately 30–40 companies by graduation, (3) guest industry speaker once per month, and (4) applied workshop where students immediately apply the specialist's content." },
            ].map((b, i) => (
              <div key={i} style={{ background: "#080808", padding: "36px 30px", borderTop: `2px solid ${gold}` }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.25em", color: gold, marginBottom: 10, fontWeight: 700 }}>{b.n}</div>
                <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#FBF7EE", marginBottom: 4, lineHeight: 1.2 }}>{b.title}</h3>
                <p style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.1em", marginBottom: 16 }}>{b.sub}</p>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SESSION STRUCTURE ── */}
      <div style={{ padding: isMobile ? "52px 24px" : "72px 80px", background: "#FAF8F4", borderTop: "1px solid rgba(0,0,0,.07)", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>A Day at Excalibur</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#111", lineHeight: 1.1, marginBottom: 8 }}>What a real session looks like.</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#444", fontWeight: 300, lineHeight: 1.8, marginBottom: 32, maxWidth: 560 }}>Two tracks — weekday and Saturday. Click any block to see exactly what happens in that session.</p>
          <FlagshipScheduleInteractive isMobile={isMobile} />
        </div>
      </div>

      {/* ── EIGHT MODULES ── */}
      <FlagshipModulesBlock isMobile={isMobile} setPage={setPage} modules={currMods} />
      {/* MEET FACULTY CTA */}
      <div style={{ background: "#000", padding: isMobile ? "36px 24px" : "48px 80px", textAlign: "center", borderTop: "1px solid rgba(199,171,117,.08)" }}>
        <button onClick={() => setPage("faculty")} style={{ fontFamily: sans, padding: "13px 36px", background: "transparent", border: `1px solid rgba(199,171,117,.35)`, color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Meet Our Faculty →</button>
      </div>

      {/* ── GUEST SPEAKERS ── */}
      <div style={{ background: "#FAF8F4", padding: 0, borderTop: "1px solid rgba(0,0,0,.07)" }}>
        {/* Header bar */}
        <div style={{ borderBottom: "1px solid rgba(0,0,0,.07)", padding: isMobile ? "40px 24px" : "60px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 80, alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.5em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>From Every Industry</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 34 : 52, fontWeight: 300, color: "#111", lineHeight: 1.0, marginBottom: 0, letterSpacing: "0.02em" }}>Monthly Guest Speakers</h2>
            </div>
            <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.95, color: "#333", fontWeight: 300, textAlign: "justify" }}>Every month, a distinguished guest speaker joins the program — an executive, investor, entrepreneur, athlete, artist, or senior practitioner with serious experience in the field they represent.<br /><br />The format is direct and personal. Students prepare questions, hear the real story behind the résumé, and learn what leadership looks like when it involves pressure, risk, failure, discipline, and responsibility — from someone willing to sit across from them and speak honestly.</p>
          </div>
        </div>

        {/* Four pillars  -  white, black text */}
        <div style={{ maxWidth: 1100, margin: "0 auto", borderLeft: "1px solid rgba(0,0,0,.06)", borderRight: "1px solid rgba(0,0,0,.06)" }}>
          {[
            { n: "I", title: "Real Executives & Investors", sub: "The people behind companies, capital, leadership, and execution.", body: "CEOs, founders, venture capitalists, and operators who have built companies, managed capital, and faced decisions most students have only read about. These sessions are not performances. They are candid conversations about what leadership actually requires." },
            { n: "II", title: "Monthly Industry Rotation", sub: "A different world each month.", body: "Each speaker represents a different sector — technology, finance, real estate, media, luxury, healthcare, and more. By graduation, students have sat across from professionals in every major industry and understand each world from the inside." },
            { n: "III", title: "Direct Access", sub: "Limited Cohort. One guest.", body: "The small cohort model gives every student the opportunity to ask questions, engage directly, and build genuine connections with guest speakers. These are not auditorium lectures. They are intimate conversations where thoughtful questions lead to meaningful answers." },
            { n: "IV", title: "Post-Session Debrief", sub: "Not just what was said — what it meant.", body: "Every guest session is followed by a faculty-led debrief. Students are pushed to extract the principles beneath the story, connect the speaker's experience to current curriculum, and identify the one thing they will carry forward." },
          ].map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "60px 1fr 1fr", borderBottom: "1px solid rgba(0,0,0,.06)", padding: isMobile ? "28px 24px" : "40px 48px", gap: isMobile ? 14 : 40, alignItems: "start" }}>
              <span style={{ fontFamily: serif, fontSize: isMobile ? 28 : 40, fontWeight: 300, color: "rgba(0,0,0,.12)", lineHeight: 1 }}>{p.n}</span>
              <div style={{ borderRight: isMobile ? "none" : "1px solid rgba(0,0,0,.06)", paddingRight: isMobile ? 0 : 40 }}>
                <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, fontWeight: 600, color: "#111", lineHeight: 1.15, marginBottom: 6 }}>{p.title}</p>
                <p style={{ fontFamily: serif, fontSize: 13, color: "#555", fontStyle: "italic" }}>{p.sub}</p>
              </div>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#333", fontWeight: 300 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 10-MONTH ARC ── */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>The Ten-Month Arc</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 8 }}>What a year looks like.</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 48, maxWidth: 640 }}>Ten months, structured across four phases. Every month builds on the last.</p>

          {[
            {
              phase: "Phase 1",
              label: "Foundations",
              span: "Months 1 – 2",
              desc: "Voice, mindset, and the first principles of business.",
              color: "rgba(199,171,117,.25)",
              months: [
                { m: "Month 1", t: "Public Speaking I", items: ["Voice mechanics & posture", "Impromptu drills", "First pitch night", "Mindset & identity"] },
                { m: "Month 2", t: "Financial Literacy", items: ["Reading a P&L", "Unit economics", "Pricing strategy", "Guest: Finance professional"] },
              ],
            },
            {
              phase: "Phase 2",
              label: "Core Disciplines",
              span: "Months 3 – 5",
              desc: "The full business curriculum. Each discipline taught by a practitioner.",
              color: "rgba(199,171,117,.4)",
              months: [
                { m: "Month 3", t: "Business Model Analysis", items: ["How companies create value", "Model archetypes", "Live case deconstructions", "Competitive moats"] },
                { m: "Month 4", t: "Sales & Marketing", items: ["Consultative selling", "Psychology of persuasion", "Objection handling", "Live roleplay"] },
                { m: "Month 5", t: "Stocks, Crypto & Market Literacy", items: ["How markets work", "Stock & crypto analysis", "Risk management", "Trading simulation"] },
              ],
            },
            {
              phase: "Phase 3",
              label: "Application",
              span: "Months 6 – 8",
              desc: "Disciplines applied to real engagements. The Junior Consultant Program begins.",
              color: "rgba(199,171,117,.6)",
              months: [
                { m: "Month 6", t: "AI & Technology", items: ["How AI works", "AI tools for business", "AI-powered research", "Build a workflow"] },
                { m: "Month 7", t: "Leadership & Influence", items: ["Five forms of power", "Emotional intelligence", "CEO crisis simulation", "Conflict resolution"] },
                { m: "Month 7–8", t: "Junior Consultant Program", items: ["Assigned to real local business", "On-site observation", "Customer research", "Boardroom Finale"] },
              ],
            },
            {
              phase: "Phase 4",
              label: "Mastery & Launch",
              span: "Months 9 – 10",
              desc: "Intellectual depth, the micro-business launch, and Academy Gala & Graduation.",
              color: gold,
              months: [
                { m: "Month 8", t: "Intellectual Depth & The Art of Class", items: ["Philosophy applied to leadership", "Cultural intelligence", "Social arts", "Writing with precision"] },
                { m: "Month 9", t: "College Admissions & Personal Development", items: ["Application strategy", "Personal narrative", "Portfolio presentation", "1:1 advisor sessions"] },
                { m: "Month 10", t: "Micro-Business Launch & Graduation", items: ["Mentor-led venture development", "Market testing & customer discovery", "Academy Gala & Graduation", "Bound Excalibur Portfolio"] },
              ],
            },
          ].map((phase, pi) => (
            <div key={pi} style={{ marginBottom: 3 }}>
              {/* Phase header */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "200px 1fr", gap: 0, background: "#111", borderLeft: `3px solid ${gold}`, marginBottom: 2 }}>
                <div style={{ padding: isMobile ? "16px 20px" : "20px 28px", borderRight: "1px solid rgba(199,171,117,.08)" }}>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.3em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{phase.phase}</p>
                  <p style={{ fontFamily: serif, fontSize: isMobile ? 17 : 20, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 2 }}>{phase.label}</p>
                  <p style={{ fontFamily: sans, fontSize: 10, color: gold, fontWeight: 300, letterSpacing: "0.05em" }}>{phase.span}</p>
                </div>
                <div style={{ padding: isMobile ? "10px 20px 16px" : "20px 32px", display: "flex", alignItems: "center" }}>
                  <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, fontStyle: "italic" }}>{phase.desc}</p>
                </div>
              </div>
              {/* Phase months */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${phase.months.length}, 1fr)`, gap: 2, background: "#111" }}>
                {phase.months.map((row, i) => (
                  <div key={i} style={{ background: "#080808", padding: "20px 20px", borderTop: `1px solid rgba(199,171,117,.08)` }}>
                    <p style={{ fontFamily: sans, fontSize: 9, letterSpacing: "0.18em", color: gold, marginBottom: 5, fontWeight: 600 }}>{row.m}</p>
                    <h4 style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#FBF7EE", marginBottom: 10, lineHeight: 1.2 }}>{row.t}</h4>
                    {row.items.map((item, j) => <div key={j} style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", marginBottom: 4, fontWeight: 300 }}>— {item}</div>)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INDUSTRY SECTORS ROTATION ── */}
      <div style={{ background: "#07060A", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Industry Sectors Rotation</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 80, marginBottom: 44 }}>
            <div>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 38, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 16 }}>Know every industry. Own any room.</h2>
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300, marginBottom: 14 }}>Each month features a dedicated guest speaker from a different industry, a sector-specific case study, and an analytical exercise. Over ten months, students explore major sectors of modern commerce and study major industries, learning how each one operates, competes, grows, and adapts.</p>
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.9, color: "#FBF7EE", fontWeight: 300 }}>By graduation, every student completes a personal Sector Journal — a record of the industries they explored, the leaders they learned from, and the strategic insights they developed along the way. At the end of the program, students also identify the industries that resonate most with them personally, ultimately selecting a field of interest for their externship experience, organized by the Academy and gaining direct exposure to the professional world they are most drawn toward.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, justifyContent: "center" }}>
              {["Technology & AI", "Finance & Venture Capital", "Real Estate", "Food & Hospitality", "E-Commerce & Retail", "Healthcare & Biotech", "Media & Entertainment", "Automotive & Sports", "Manufacturing & Supply Chain", "Energy & Sustainability", "Luxury & Premium Brands"].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(199,171,117,.07)" }}>
                  <span style={{ fontFamily: serif, fontSize: 11, color: gold, fontStyle: "italic", flexShrink: 0, minWidth: 22 }}>{String(i+1).padStart(2,"0")}</span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 2, background: "#111" }}>
            {sectors.map((s, i) => (
              <div key={i} style={{ background: "#080808", padding: "22px 20px", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.06)"}` }}>
                <p style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.2em", color: gold, fontWeight: 600, marginBottom: 8 }}>{s.n}</p>
                <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 8 }}>{s.name}</p>
                <p style={{ fontFamily: sans, fontSize: 11, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── THE ARENA ── */}
      <section style={{ padding: isMobile ? "60px 24px" : "80px 80px", background: "#050505" }}>
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

      <Hr />

      <div style={{ background: "#F5F3EE", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 52, flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Competitions</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 42, fontWeight: 600, color: "#000", lineHeight: 1.0, marginBottom: 0 }}>Performance under genuine pressure.</h2>
            </div>
            <p style={{ fontFamily: sans, fontSize: 13, color: "#444", fontWeight: 300, lineHeight: 1.8, maxWidth: 380 }}>Every competition at Excalibur is evaluated by real professionals — entrepreneurs, investors, and executives who have no obligation to be generous. Students know this. That is precisely the point.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 1, background: "#D8D4CC" }}>
            {[
              { title: "Monthly Pitch Night", tag: "12\u00d7 per year \u00b7 All programs", num: "01", desc: "Students present pitches before a panel of guest judges drawn from the local business community, including entrepreneurs, investors, and senior professionals. Pitches are evaluated on clarity of thinking, commercial viability, quality of delivery, and composure under live questioning. Parents are invited to attend." },
              { title: "Shark Tank Finale", tag: "Summer & Six-Week programs", num: "02", desc: "The Shark Tank\u2013inspired pitch forum where student teams present complete business concepts before entrepreneurs, investors, and senior professionals. Judges evaluate each pitch on clarity, commercial viability, originality, delivery, and composure under questioning. Awards are presented for Best Business Concept, Best Pitch, and Most Innovative Venture." },
              { title: "OC City Championship", tag: "Biannual \u00b7 Flagship students", num: "03", desc: "The Excalibur Championship is a biannual competition for all Flagship students, held at a premium South Orange County venue with judges drawn from the professional community. Students compete individually and in teams. Awards and formal recognition are presented in a ceremony before families and invited guests." },
              { title: "Academy Gala & Graduation Day", tag: "Annual \u00b7 Flagship capstone", num: "04", desc: "The culminating event. Each team delivers a ten-minute pitch of its micro-business concept before an audience of parents, mentors, investors, and members of the press. Every graduate receives a professionally bound portfolio and formal alumni status. The transformation is evident to everyone in the room." },
            ].map((c, i) => (
              <div key={i} style={{ background: "#fff", padding: isMobile ? "32px 24px" : "44px 44px", borderTop: "none", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 24, right: 28, fontFamily: serif, fontSize: 64, fontWeight: 600, color: "rgba(0,0,0,.04)", lineHeight: 1 }}>{c.num}</div>
                <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.3em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>{c.tag}</p>
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 22 : 28, fontWeight: 600, color: "#000", marginBottom: 16, lineHeight: 1.15 }}>{c.title}</h3>
                <div style={{ width: 28, height: 1, background: "#000", marginBottom: 16 }} />
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#1a1a1a", fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FIELD TRIPS & EXPEDITIONS ── */}
      <div style={{ background: "#07060A", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Outside the Classroom</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 40 }}>Field Trips & Expeditions.</h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
            {fieldTrips.map((f, i) => (
              <div key={i} style={{ background: "#080808", borderTop: `2px solid ${i === 0 ? gold : "rgba(199,171,117,.12)"}`, overflow: "hidden" }}>
                {f.img && <div style={{ height: 220, overflow: "hidden" }}><img src={f.img} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                <div style={{ padding: "28px 28px" }}>
                  <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>{f.tag}</p>
                  <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GALA & GRADUATION ── */}
      <section style={{ background: "#000", padding: 0 }}>

        {/* Full-bleed photo */}
        <div style={{ position: "relative", height: isMobile ? 480 : 640, overflow: "hidden" }}>
          <img src="https://i.imgur.com/d7mP4Sy.jpeg" alt="Excalibur Academy Gala & Graduation Day" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.97) 0%, rgba(0,0,0,.5) 45%, rgba(0,0,0,.1) 100%)" }} />
          <div style={{ position: "absolute", top: isMobile ? 28 : 48, left: "50%", transform: "translateX(-50%)" }}>
            <div style={{ display: "inline-block", border: "1px solid rgba(199,171,117,.4)", padding: "7px 24px" }}>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>The Capstone \u00b7 June 2027</p>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: isMobile ? 40 : 72, left: 0, right: 0, textAlign: "center", padding: "0 24px" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.5em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 18 }}>Excalibur Academy</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(36px,8vw,54px)" : "clamp(52px,6vw,88px)", fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 16, letterSpacing: "0.03em" }}>Academy Gala &amp; Graduation Day</h2>
            <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "0 auto 18px" }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 15 : 20, color: gold, fontStyle: "italic", letterSpacing: "0.06em" }}>South Orange County \u00b7 June 2027</p>
          </div>
        </div>

        {/* Description strip */}
        <div style={{ borderTop: "1px solid rgba(199,171,117,.15)", borderBottom: "1px solid rgba(199,171,117,.15)" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: isMobile ? "48px 24px" : "64px 40px", textAlign: "center" }}>
            <p style={{ fontFamily: sans, fontSize: isMobile ? 15 : 17, lineHeight: 2.0, color: "#FBF7EE", fontWeight: 300, marginBottom: 24 }}>Academy Gala &amp; Graduation Day is the Flagship capstone. Student teams present their micro-businesses before families, mentors, investors, invited guests, and a panel of judges. Every graduate receives a professionally bound Excalibur Portfolio — a documented record of the work, presentations, competitions, and applied experiences completed across the program. The evening marks more than completion. It marks the emergence of young leaders with the confidence, discipline, and presence to carry Excalibur's standard into every arena ahead.</p>
            <p style={{ fontFamily: serif, fontSize: isMobile ? 17 : 21, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.75 }}>The program is not only measured in documents. Students leave with lasting friendships, shared memories, stronger judgment, greater confidence, and skills that will matter in every arena ahead — college, career, business, leadership, and life.</p>
          </div>
        </div>

        {/* Four pillars */}
        <div style={{ maxWidth: 1100, margin: "0 auto", borderLeft: "1px solid rgba(199,171,117,.08)", borderRight: "1px solid rgba(199,171,117,.08)" }}>
          {[
            { n: "I", title: "Venture Presentations", sub: "Live. Judged. Consequential.", body: "Student teams present original business concepts before a panel of real entrepreneurs, investors, and senior professionals. Pitches are evaluated on commercial viability, clarity, originality, delivery, and composure under questioning. This is not a school presentation. It is a genuine performance before people with genuine stakes." },
            { n: "II", title: "Awards & Distinctions", sub: "Excellence recognised. Publicly.", body: "Standout projects receive awards ranging from business technology tools to potential seed funding for early venture development. Results are verified, documented, and included in the Excalibur Portfolio — a permanent record of achievement." },
            { n: "III", title: "Bound Graduation Portfolio", sub: "The complete record. Professionally assembled.", body: "Every graduate receives a professionally bound Excalibur Portfolio: every analysis, presentation, report, competition result, and applied engagement — compiled into a single coherent record that supports university applications and speaks with a voice most students cannot match." },
            { n: "IV", title: "Family, Faculty & Guests", sub: "An evening to remember.", body: "Families, mentors, faculty, and invited guests gather to witness ten months of formation made visible. The transformation is evident to everyone in the room. Our students are not the same people who walked in — and everyone present can see it." },
          ].map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "80px 1fr 1fr", borderBottom: "1px solid rgba(199,171,117,.08)", padding: isMobile ? "32px 24px" : "44px 48px", gap: isMobile ? 16 : 48, alignItems: "start" }}>
              <div>
                <span style={{ fontFamily: serif, fontSize: isMobile ? 32 : 48, fontWeight: 300, color: "rgba(199,171,117,.22)", lineHeight: 1 }}>{p.n}</span>
              </div>
              <div style={{ borderRight: isMobile ? "none" : "1px solid rgba(199,171,117,.08)", paddingRight: isMobile ? 0 : 48 }}>
                <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.15, marginBottom: 8 }}>{p.title}</p>
                <p style={{ fontFamily: serif, fontSize: 14, color: gold, fontStyle: "italic" }}>{p.sub}</p>
              </div>
              <div>
                <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.85, color: "#FBF7EE", fontWeight: 300 }}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── PORTFOLIO  -  Excalibur Ivy (copied from homepage) ── */}
      <section style={{ background: "#F5F3EE", padding: 0 }}>
        {!isMobile ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: 420 }}>
            <div style={{ overflow: "hidden", position: "relative" }}>
              <img src="https://i.imgur.com/f87iq9i.jpeg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", padding: "28px 36px" }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>The Excalibur Graduate</p>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,3vw,42px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 8 }}>Excalibur "Ivy" Portfolio</h2>
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
              <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 6 }}>Excalibur "Ivy" Portfolio</h2>
              <p style={{ fontFamily: serif, fontSize: 14, color: gold, fontStyle: "italic" }}>A record that speaks for itself.</p>
            </div>
          </div>
        )}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "36px 24px 0" : "52px 80px 0", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 80 }}>
          <div>
            <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, #000, transparent)", marginBottom: 16 }} />
            <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 1.85, color: "#1a1a1a", fontWeight: 300 }}>Every Excalibur student graduates with a portfolio of documented, verifiable work — one that no other programme in the country offers. This portfolio reflects sustained performance, leadership under pressure, and accountability for outcomes.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 24, height: 1, background: "#000" }} />
            <p style={{ fontFamily: serif, fontSize: isMobile ? 14 : 18, color: "#000", fontWeight: 400, lineHeight: 1.75, fontStyle: "italic" }}>Documented components · Verified · Professionally assembled · Submitted with university applications.</p>
          </div>
        </div>
        <PortfolioIndexWhite isMobile={isMobile} setPage={setPage} />
      </section>

      {/* ── TUITION ── */}
      <div style={{ background: "#000", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 80, marginBottom: 56 }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.5em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Tuition</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 34 : 52, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 20, letterSpacing: "0.02em" }}>An investment in formation.</h2>
              <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
              <p style={{ fontFamily: sans, fontSize: 14, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300 }}>Three payment structures. All plans include full access to the program, faculty, curriculum, field trips, competitions, and all events. The program, the people in the room, and the experiences are identical regardless of the plan you choose.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, justifyContent: "center" }}>
              {[["Tuition Includes", "All sessions, faculty, curriculum, and events"], ["Guest Speakers", "Monthly practitioner — no additional cost"], ["Competitions", "All pitch nights and championships included"], ["Externship Placement", "Sourced from the Excalibur network"], ["Graduation Portfolio", "Professionally bound — included at graduation"]].map(([k, v], i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, padding: "13px 0", borderBottom: "1px solid rgba(199,171,117,.08)" }}>
                  <span style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.18em", color: gold, textTransform: "uppercase", paddingTop: 2, fontWeight: 600 }}>{k}</span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.5 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Three plan cards  -  luxury hotel/Cartier style */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 1, background: "rgba(199,171,117,.08)" }}>
            {[
              { label: "MONTHLY", title: "Month to Month", price: "$2,400", per: "per month", saving: null, desc: "Billed monthly. Full flexibility. Cancel with 30 days notice before your next billing cycle. The same program, the same faculty, the same formation.", cta: "Select Monthly" },
              { label: "QUARTERLY", title: "Quarterly", price: "$2,100", per: "per month", saving: "Save $300 per quarter", desc: "Billed every three months. The recommended plan for most families — a considered commitment that reflects the nature of the program.", cta: "Select Quarterly", recommended: true },
              { label: "FULL PROGRAM", title: "Full Year", price: "$1,900", per: "per month", saving: "Save $5,000 over the year", desc: "Full ten-month tuition settled at enrollment. Our most considered plan — and the clearest statement of commitment to the year ahead.", cta: "Select Full Year" },
            ].map((p, i) => (
              <div key={i} style={{ background: "#000", padding: isMobile ? "36px 24px" : "52px 44px", position: "relative", borderTop: `2px solid ${p.recommended ? gold : "rgba(199,171,117,.12)"}` }}>
                {p.recommended && (
                  <div style={{ position: "absolute", top: -1, left: 44, background: gold, padding: "4px 14px" }}>
                    <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.2em", fontWeight: 700, color: "#000", textTransform: "uppercase" }}>Recommended</p>
                  </div>
                )}
                <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.4em", color: p.recommended ? gold : "rgba(199,171,117,.5)", fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>{p.label}</p>
                <h3 style={{ fontFamily: serif, fontSize: isMobile ? 24 : 30, fontWeight: 400, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 24, letterSpacing: "0.02em" }}>{p.title}</h3>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontFamily: serif, fontSize: isMobile ? 42 : 52, fontWeight: 300, color: "#FBF7EE", lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, marginLeft: 8 }}>{p.per}</span>
                </div>
                {p.saving ? (
                  <p style={{ fontFamily: sans, fontSize: 11, color: gold, letterSpacing: "0.08em", marginBottom: 28, fontWeight: 500 }}>{p.saving}</p>
                ) : <div style={{ marginBottom: 28, height: 18 }} />}
                <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 24 }} />
                <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, marginBottom: 32 }}>{p.desc}</p>
                <button onClick={() => openInquiry && openInquiry("full-program")} style={{ fontFamily: sans, padding: "13px 0", background: p.recommended ? gold : "transparent", border: `1px solid ${p.recommended ? gold : "rgba(199,171,117,.3)"}`, color: p.recommended ? "#000" : gold, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ADMISSIONS PROCESS ── */}
      <div style={{ background: "#000" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "52px 24px" : "72px 80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 56 }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Admissions</p>
              <h2 style={{ fontFamily: serif, fontSize: isMobile ? 30 : 44, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 0 }}>Four steps.</h2>
            </div>
            <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, maxWidth: 400 }}>The process is intentionally personal and respectful of each family’s time. Its purpose is to understand the student, answer the family’s questions, and ensure a strong fit for the Excalibur cohort.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: 1, background: "rgba(199,171,117,.08)" }}>
            {[
              { n: "01", title: "Submit Your Application", time: "10–15 minutes", desc: "A short online form covering your background, interests, and what draws you to Excalibur. No essays. No transcripts. Just an honest picture of who your student is.", green: false },
              { n: "02", title: "Committee Review", time: "Within 3 days", desc: "Every application is reviewed by the Excalibur admissions committee — not an algorithm. We read each one carefully, looking for the qualities that define a student who will thrive here.", green: false },
              { n: "03", title: "Admissions Interview", time: "15–20 minutes", desc: "Shortlisted students are invited to a brief, relaxed conversation with a member of our admissions team. This is not a test. It is a chance to understand your student — and for them to understand us.", green: false },
              { n: "04", title: "Decision & Enrollment", time: "Within 5 days total", desc: "Decisions are delivered promptly. Upon acceptance, your seat is held for 72 hours. Enrollment is confirmed with a deposit, and you become part of the founding class.", green: true },
            ].map((s, i) => (
              <div key={i} style={{ background: "#0A0A08", padding: isMobile ? "32px 24px" : "44px 36px", borderTop: `2px solid ${s.green ? "#90D4A0" : i === 0 ? gold : "rgba(199,171,117,.10)"}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 16, right: 20, fontFamily: serif, fontSize: 80, fontWeight: 600, color: "rgba(199,171,117,.04)", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: serif, fontSize: 42, fontWeight: 300, color: s.green ? "#90D4A0" : gold, lineHeight: 1, marginBottom: 20 }}>{s.n}</div>
                <h4 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: "#FBF7EE", marginBottom: 8, lineHeight: 1.2 }}>{s.title}</h4>
                <p style={{ fontFamily: sans, fontSize: 10, color: s.green ? "#90D4A0" : gold, letterSpacing: "0.12em", marginBottom: 16, fontWeight: 600 }}>{s.time}</p>
                <div style={{ width: 24, height: 1, background: s.green ? "#90D4A0" : gold, marginBottom: 16 }} />
                <p style={{ fontFamily: sans, fontSize: 12, lineHeight: 1.8, color: "#FBF7EE", fontWeight: 300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ENROLL FORM ── */}
      <div style={{ background: "#000", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Founding Class · September 2026</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 30 : 44, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 12 }}>Choose your program.</h2>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, maxWidth: 480, margin: "0 auto" }}>Select your program and track, then fill in your details. Our enrollment coordinator will be in touch within 48 hours.</p>
          </div>
          <FlagshipEnrollSelector openInquiry={openInquiry} isMobile={isMobile} />
        </div>
      </div>

      {/* ── MAY 23 SOIREE ── */}
      <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: SUMMER INTENSIVE DETAIL
// ─────────────────────────────────────────────
function SummerModulePage({ slug, setPage }) {
  const isMobile = useIsMobile();
  const mod = summerModules.find(m => m.slug === slug);
  if (!mod) return null;
  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px 0" : "32px 40px 0" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {[["Home", "home"], ["Our Programs", "programs"], ["Summer Intensive", "summer-detail"]].map(([l, p]) => (
            <span key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span onClick={() => setPage(p)} style={{ fontFamily: sans, fontSize: 11, color: "rgba(251,247,238,0.4)", cursor: "pointer", letterSpacing: 1 }} onMouseEnter={e => e.target.style.color = gold} onMouseLeave={e => e.target.style.color = "rgba(251,247,238,0.4)"}>{l}</span>
              <span style={{ color: "#333" }}>/</span>
            </span>
          ))}
          <span style={{ fontFamily: sans, fontSize: 11, color: gold, letterSpacing: 1 }}>{mod.title}</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "40px 16px 52px" : "48px 40px 60px" }}>
        <Fade>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Summer Intensive · Discipline</p>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(30px,6vw,48px)" : "clamp(38px,5vw,64px)", fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 16, maxWidth: 800 }}>{mod.title}</h1>
          <p style={{ fontFamily: serif, fontSize: isMobile ? 18 : 22, color: "#FBF7EE", fontStyle: "italic", lineHeight: 1.6, maxWidth: 680 }}>{mod.tagline}</p>
        </Fade>
      </div>
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(199,171,117,.3), transparent)" }} />

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: isMobile ? 40 : 72, alignItems: "start" }}>
          <div>
            <Fade>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>About This Discipline</p>
              {mod.body.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.95, color: "#FBF7EE", fontWeight: 300, marginBottom: 24 }}>{para}</p>
              ))}
            </Fade>
            <Fade d={.06}>
              <div style={{ marginTop: 52 }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>What You Will Learn</p>
                {mod.whatYouLearn.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "13px 0", borderBottom: "1px solid rgba(199,171,117,.08)" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: gold, flexShrink: 0, marginTop: 8 }} />
                    <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7 }}>{item}</p>
                  </div>
                ))}
              </div>
            </Fade>
            <Fade d={.08}>
              <div style={{ marginTop: 52, borderTop: "1px solid rgba(199,171,117,.1)", paddingTop: 40 }}>
                <p style={{ fontFamily: serif, fontSize: isMobile ? 20 : 26, color: gold, fontStyle: "italic", lineHeight: 1.5 }}>{mod.quote}</p>
              </div>
            </Fade>
          </div>
          <div>
            {/* Outcomes */}
            <div style={{ border: "1px solid rgba(199,171,117,.15)", padding: "28px 24px", marginBottom: 24 }}>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>By the End of This Discipline</p>
              {mod.outcomes.map((o, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: i < mod.outcomes.length - 1 ? "1px solid rgba(199,171,117,.07)" : "none" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: gold, flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.65 }}>{o}</p>
                </div>
              ))}
            </div>
            {/* Other summer disciplines */}
            <div style={{ border: "1px solid rgba(199,171,117,.1)", padding: "24px" }}>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>All Summer Disciplines</p>
              {summerModules.filter(m => m.slug !== slug).map((m, i) => (
                <div key={i} onClick={() => setPage(`summer-module:${m.slug}`)} style={{ padding: "10px 0", borderBottom: "1px solid rgba(199,171,117,.07)", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.color = gold} onMouseLeave={e => e.currentTarget.style.color = "inherit"}>
                  <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.5 }}>{m.title}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setPage("summer-detail")} style={{ fontFamily: sans, marginTop: 20, width: "100%", padding: "13px", background: "transparent", border: "1px solid rgba(199,171,117,.3)", color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>← Back to Summer Intensive</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummerDetailPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();

  const schedule = [
    { time: "9:15 AM", dur: "15 min", block: "Arrival", desc: "Students are welcomed by the Teaching Assistants, settle in with their cohort, and begin the day in an atmosphere that feels lively, polished, and personal. There is time to connect, get comfortable, and step into the rhythm of the program before the first session begins." },
    { time: "9:30 AM", dur: "45 min", block: "Public Speaking & Rhetoric", desc: "Public speaking is a central discipline in every Excalibur program. Students get on their feet, speak to the room, practice eye contact, strengthen their voice, and learn how to communicate with confidence. The work develops from foundational mechanics into rhetoric, debate, impromptu speaking, persuasive delivery, and pitch preparation. With repeated practice and direct feedback, students build the kind of presence that carries into interviews, presentations, leadership roles, and every room ahead." },
    { time: "10:15 AM", dur: "15 min", block: "Snack Break", desc: "A structured pause between sessions, with catered snacks and refreshments provided by the Academy — from light bites and fruit bowls to healthy açaí bowls, smoothies, milkshakes, and seasonal selections. Students recharge, listen to lounge music, and continue conversations informally with classmates, Teaching Assistants, faculty, and instructors. Often, some of the most interesting exchanges of the day happen here — between sessions, in the moments when ideas keep moving." },
    { time: "10:30 AM", dur: "90 min", block: "Specialist Instruction · Core Curriculum", desc: "The Specialist Instructor leads the core academic block, introducing the day’s discipline through serious instruction, professional frameworks, and guided application. Students engage the material immediately through discussion, analysis, exercises, and applied drills. Subjects include business model analysis, financial literacy, stock & trading, AI and technology, sales and persuasion, leadership & risk management, and sector-specific business rotation — taught by practitioners who bring lived experience into the room." },
    { time: "12:00 PM", dur: "30 min", block: "Lunch", desc: "Students enjoy a catered three-course lunch from a rotating selection of local restaurants, with menus that may include Mediterranean mezze and grilled entrées, coastal California salads and seasonal bowls, Italian pastas, French-inspired plates, Japanese bento-style selections, and modern American favorites. Lunch is also a time for conversation — with classmates, Teaching Assistants, faculty, and instructors — in a relaxed but polished setting. Social intelligence is part of the Excalibur experience: listening well, asking thoughtful questions, carrying oneself with ease, and making others feel seen and remembered. Dietary restrictions and allergies are requested before the program begins." },
    { time: "12:30 PM", dur: "60 min", block: "Distinguished Guest Speaker", desc: "Each program day features a senior guest speaker from business, investing, entrepreneurship, technology, leadership, or the arts. Speakers are carefully selected for the substance of their experience: founders who have built companies, investors who understand capital and risk, executives who have led complex organizations, and professionals with serious judgment to share. Students can ask any questions and take part in a live conversation designed to move beyond biography into decisions, mistakes, lessons, and the realities of leadership. By the end of the program, students will have been in the room with leaders across multiple industries — and had the opportunity to ask thoughtful questions directly." },
    { time: "1:30 PM", dur: "15 min", block: "Afternoon Break", desc: "A brief reset before the final session of the day. Students step outside, recharge with a light treat — gelato, smoothies, or freshly pressed juices — and reconnect with classmates, Teaching Assistants, and faculty. With lounge music in the background and the pressure briefly lifted, the break gives students time to reset before the final push." },
    { time: "1:45 PM", dur: "60 min", block: "The War Room", desc: "The War Room is where instruction becomes application. Led by senior faculty, this block places students into structured business scenarios that require analysis, decision-making, communication, and teamwork under pressure, rotating through three formats: (1) What Would You Have Done? — students are placed inside real business moments before knowing the outcome, make the call, defend their reasoning, then learn what actually happened; (2) Your Move — students inherit a company in crisis, build a turnaround strategy, and present their decisions to faculty as if pitching a skeptical investor; (3) Apply It Now — the day’s specialist content is immediately put to work through live exercises, workshops, and team challenges." },
    { time: "2:45 PM", dur: "15 min", block: "Debrief & Close", desc: "Each day ends with a structured debrief: what was learned, what challenged the group, and what ideas can be carried forward. Students leave with one clear takeaway from the day — a concept, question, habit, or standard to apply beyond the classroom." },
  ];

  const modules = summerModules;

  return (
    <div style={{ background: "#000" }}>
      <Breadcrumb items={[{label:"Our Programs",page:"programs"},{label:"Summer Intensive",page:"summer-detail"}]} setPage={setPage} />
      {/* HERO */}
      {isMobile ? (
        <div style={{ background: "#000" }}>
          <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
            <img src="https://i.imgur.com/N4OB8dS.jpeg" alt="Summer Intensive" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <button onClick={() => setPage("programs")} style={{ fontFamily: sans, background: "rgba(0,0,0,.5)", border: "1px solid rgba(199,171,117,.3)", color: gold, padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase" }}>← OUR PROGRAMS</button>
            </div>
          </div>
          <div style={{ background: "#000", padding: "28px 24px 20px" }}>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.42em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Summer Intensive · July & August 2026</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: 30, fontWeight: 300, fontStyle: "italic", color: "#FBF7EE", lineHeight: 1.1, marginBottom: 6, letterSpacing: "0.01em" }}>Two-Weeks. Full Day Immersion.</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: 20, color: gold, fontStyle: "italic", fontWeight: 300, letterSpacing: "0.02em" }}>Elite Mentorship. Real Momentum.</p>
          </div>
        </div>
      ) : (
      <div style={{ position: "relative", background: "#000", overflow: "hidden", height: 460 }}>
        <img src="https://i.imgur.com/N4OB8dS.jpeg" alt="Summer Intensive" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.15) 60%)" }} />
        <div style={{ position: "absolute", bottom: 56, left: 72 }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.42em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>Summer Intensive · July & August 2026</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: 52, fontWeight: 300, fontStyle: "italic", color: "#FBF7EE", lineHeight: 1.1, marginBottom: 6, letterSpacing: "0.01em" }}>Two-Weeks. Full Day Immersion.</h1>
          <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: 32, color: gold, fontStyle: "italic", fontWeight: 300, letterSpacing: "0.02em" }}>Elite Mentorship. Real Momentum.</p>
        </div>
        <div style={{ position: "absolute", top: 24, left: 24 }}>
          <button onClick={() => setPage("programs")} style={{ fontFamily: sans, background: "rgba(0,0,0,.5)", border: "1px solid rgba(199,171,117,.3)", color: gold, padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em", cursor: "pointer", textTransform: "uppercase" }}>← OUR PROGRAMS</button>
        </div>
      </div>
      )}

      {/* OVERVIEW  -  ivory luxury editorial */}
      <div style={{ background: "#F5F3EE" }}>

        {/* TOP  -  heading + intro + detail table */}
        <div style={{ padding: isMobile ? "52px 24px 40px" : "80px 80px 56px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 32, height: "1px", background: "rgba(139,105,20,.4)" }} />
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>Program Overview</p>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 32 : 52, fontWeight: 300, fontStyle: "italic", color: "#000", lineHeight: 1.05, letterSpacing: "0.01em", marginBottom: 40 }}>Excalibur’s Leadership<br />and Venture Launchpad.</h2>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? 32 : 64, alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.0, color: "#1a1a1a", fontWeight: 300, marginBottom: 18 }}>The Summer Intensive is a two-week, full-day program offered in July and August for high school students ages 15–18 who are ready to turn ambition into discipline and action.</p>
              <p style={{ fontFamily: sans, fontSize: isMobile ? 14 : 15, lineHeight: 2.0, color: "#1a1a1a", fontWeight: 300 }}>Students move from idea to venture concept: researching the market, shaping the business model, building the pitch, practicing executive communication, and learning how to defend their thinking under pressure.</p>
            </div>
            <div>
              {[["Waves", "Wave I: July 6–18, 2026\nWave II: August 3–15, 2026"], ["Schedule", "Monday–Friday · 9:30 AM–3:30 PM"], ["Class Size", "Limited to 20 students per wave"], ["Tuition", "$410 / full day · $4,500 per wave"], ["Eligibility", "Ages 15–18 · Rising juniors and seniors"], ["Location", "South Orange County, CA"]].map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.08)" }}>
                  <span style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.2em", color: "#8B6914", textTransform: "uppercase", paddingTop: 2 }}>{k}</span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#1a1a1a", fontWeight: 300, lineHeight: 1.6, whiteSpace: "pre-line" }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 24 }}>
                <button onClick={() => openInquiry && openInquiry("summer")} style={{ fontFamily: sans, padding: "12px 28px", background: "#000", border: "none", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW →</button>
              </div>
            </div>
          </div>
        </div>

        {/* GOLD RULE */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0 24px" : "0 80px" }}>
          <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(139,105,20,.4), rgba(139,105,20,.1), transparent)" }} />
        </div>

        {/* 3-COLUMN PROGRAM PILLARS */}
        <div style={{ padding: isMobile ? "40px 24px" : "56px 80px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 28 : 48 }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, color: "#8B6914", fontStyle: "italic", letterSpacing: "0.06em", marginBottom: 10 }}>Daily Foundation</p>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#2a2a2a", fontWeight: 300 }}>Every day begins with public speaking and executive communication training. Students are on their feet from the first morning — practicing voice, presence, eye contact, persuasion, and composure under pressure.</p>
            </div>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, color: "#8B6914", fontStyle: "italic", letterSpacing: "0.06em", marginBottom: 10 }}>The Core Work</p>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#2a2a2a", fontWeight: 300 }}>Venture development is the engine of the Intensive. Working in teams, students research a market, identify a real problem, define their customer, study the competition, build a marketing strategy, and structure a business plan.</p>
            </div>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, color: "#8B6914", fontStyle: "italic", letterSpacing: "0.06em", marginBottom: 10 }}>Applied & Expert</p>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "#2a2a2a", fontWeight: 300 }}>Applied workshops, AI tool sessions, and daily guest speakers from business and entrepreneurship support the venture work throughout the two weeks, helping students turn an idea into a pitch-ready concept.</p>
            </div>
          </div>
        </div>

        {/* VENTURE FINALE  -  dark accent strip */}
        <div style={{ background: "#0A0A0A", padding: isMobile ? "40px 24px" : "52px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 64, alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 14 }}>The Culmination</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 26 : 38, fontWeight: 300, fontStyle: "italic", color: "#FBF7EE", lineHeight: 1.1, marginBottom: 0 }}>Shark Tank Inspired —<br />Excalibur Venture Finale.</h3>
            </div>
            <div>
              <p style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.9, color: "rgba(251,247,238,0.75)", fontWeight: 300, marginBottom: 14 }}>A live pitch competition where student teams present their business plans before investors, entrepreneurs, executives, and invited judges. Teams are evaluated on concept strength, market research, customer insight, marketing strategy, business logic, and composure under questioning.</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 14, color: gold, fontStyle: "italic", lineHeight: 1.6 }}>Awards range from premium business accessories to custom surfboards, scooters, event tickets, and cash prizes.</p>
            </div>
          </div>
        </div>

      </div>

      {/* SUMMER FACULTY  -  filtered: Bill, Chip, Erik, Christopher */}
      <div style={{ background: "#FAFAF8", padding: isMobile ? "56px 24px" : "80px 80px", borderTop: "1px solid rgba(0,0,0,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ width: 32, height: "1px", background: "rgba(0,0,0,.2)" }} />
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>FACULTY &amp; LEADERSHIP</p>
          </div>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#000", lineHeight: 1.1, marginBottom: 8 }}>The Mentors In the Room.</h2>
          <p style={{ fontFamily: sans, fontSize: 13, color: "#444", fontWeight: 300, lineHeight: 1.7, maxWidth: 680, marginBottom: 48 }}>Excalibur faculty come from the arenas where leadership is tested: a CEO who built the world's first autonomous racing series, directed the Formula BMW program, and oversaw a $13B NASDAQ listing, a former Citigroup Managing Director and Georgetown MBA professor with 100+ M&amp;A transactions, 600+ CEO advisory engagements, EVP/CFO leadership at two NYSE-listed companies, TEDx speaking engagement, and a doctoral candidate serving as an Orange County Sheriff's Department spokesman. They have led companies, advised CEOs, taught MBA students, spoken on stages from West Point to Ivy League institutions, and now bring that experience directly to Excalibur students.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? 24 : 32 }}>
            {coaches.filter(c => ["Bill Morris", "Chip Pankow", "Erik Dostal", "Christopher Sanders"].includes(c.name)).map((co, i) => (
              <CoachCard key={i} c={co} i={i} setPage={setPage} light={true} />
            ))}
          </div>
        </div>
      </div>

      {/* MEET FACULTY CTA */}
      <div style={{ background: "#050505", padding: isMobile ? "36px 24px" : "48px 80px", textAlign: "center", borderTop: "1px solid rgba(199,171,117,.08)" }}>
        <button onClick={() => setPage("faculty")} style={{ fontFamily: sans, padding: "13px 36px", background: "transparent", border: `1px solid rgba(199,171,117,.35)`, color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Meet Our Faculty →</button>
      </div>


      {/* TUITION & ADMISSIONS */}
      <div style={{ background: "#000", padding: isMobile ? "52px 24px" : "72px 80px", borderTop: "1px solid rgba(199,171,117,.1)", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80 }}>

          {/* LEFT  -  Tuition */}
          <div>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Tuition</p>
            <div style={{ fontFamily: serif, fontSize: isMobile ? 48 : 64, fontWeight: 300, color: "#FBF7EE", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>$410<span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 300 }}> / full day</span></div>
            <div style={{ fontFamily: sans, fontSize: 14, color: gold, fontWeight: 300, marginBottom: 24 }}>$4,500 per wave</div>
            <div style={{ height: "1px", background: "rgba(199,171,117,.15)", marginBottom: 24 }} />
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.35em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>What's Included</p>
            {[
              "Daily public speaking and executive communication training",
              "Venture development — market research, competitor analysis, business planning",
              "Marketing strategy, branding, and customer psychology",
              "AI tools for business research, analysis, and presentation",
              "Sales, persuasion, and pitch training",
              "Distinguished guest speakers from different industry sectors, business and entrepreneurship daily",
              "Excalibur Venture Finale — live Shark Tank-inspired pitch before real investors, entrepreneurs, and executives",
              "Bound Certificate of Completion and Graduate Portfolio",
              "Catered daily lunches, snacks, smoothies and refreshments",
              "Priority consideration for the Ten-Month Flagship Program",
              "Daily Academy Shuttle for pick up/drop off (for South OC students)",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
                <span style={{ fontFamily: serif, fontSize: 10, color: "#C7AB75", flexShrink: 0, paddingTop: 1 }}>—</span>
                <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
            <div style={{ marginTop: 28 }}>
              <button onClick={() => openInquiry && openInquiry("summer")} style={{ fontFamily: sans, padding: "14px 36px", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW →</button>
            </div>
          </div>

          {/* RIGHT  -  Admissions */}
          <div>
            <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Admissions</p>
            <h3 style={{ fontFamily: serif, fontSize: isMobile ? 24 : 30, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 16 }}>Who This Program Is For</h3>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, marginBottom: 20 }}>The Summer Intensive is built for ambitious students ages 15–18 ready to think like founders, work in teams, take initiative, and turn ambition into discipline and action. Excalibur looks for curiosity, drive, maturity, and the willingness to learn not only about business, but about oneself.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, marginBottom: 20 }}>This is not a traditional summer camp or passive enrichment program. It is a focused, immersive environment where students are challenged to think deeply, dream boldly, speak clearly, take initiative, make mistakes, build resilience, and grow through challenge.</p>
            <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85 }}>We are not looking for the most polished resume. We look for curiosity, maturity, and a genuine interest in business, leadership, and how the world actually works. The student who leans forward. The one who asks questions, is ready to make mistakes, learn to step outside the comfort zone and rise to a higher standard.</p>
          </div>

        </div>
      </div>



      {/* DAILY SCHEDULE */}
      <div style={{ padding: isMobile ? "52px 24px" : "72px 80px", background: "#FAF8F4", borderTop: "1px solid rgba(0,0,0,.07)", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "#8B6914", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>A Day at Excalibur</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#111", lineHeight: 1.1, marginBottom: 8 }}>What a summer session looks like.</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#444", fontWeight: 300, lineHeight: 1.8, marginBottom: 32, maxWidth: 560 }}>Monday through Friday. 9:30 AM to 3:30 PM. July 6–18 & August 3–15, 2026.</p>
          <DailyScheduleBlock schedule={schedule} title="SUMMER INTENSIVE" subtitle="Monday – Friday · 9:30 AM – 3:30 PM · July 6–18 & Aug 3–15, 2026" />
        </div>
      </div>

      {/* EIGHT MODULES */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Curriculum</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 36, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 8 }}>Six disciplines. Two weeks. One mission.</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 40, maxWidth: 540 }}>The Summer Intensive runs its own focused curriculum — built around venture launchpad, executive communication, and the Shark Tank-inspired Venture Finale. Click any discipline to read more.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {modules.map((m, i) => (
              <div key={i} onClick={() => setPage(`summer-module:${m.slug}`)} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "48px 1fr 100px", gap: isMobile ? 8 : 24, padding: isMobile ? "18px 0" : "22px 0", borderBottom: "1px solid rgba(199,171,117,.07)", cursor: "pointer", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(199,171,117,.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontFamily: serif, fontSize: 13, color: "rgba(199,171,117,.3)", fontStyle: "italic" }}>{m.n}</span>
                <div>
                  <p style={{ fontFamily: serif, fontSize: isMobile ? 17 : 20, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 4 }}>{m.title}</p>
                  <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{m.desc}</p>
                </div>
                {!isMobile && <span style={{ fontFamily: sans, fontSize: 10, color: gold, letterSpacing: "0.12em", textAlign: "right" }}>READ MORE →</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SOIREE POSTCARD */}
      <div style={{ background: "#000", padding: isMobile ? "40px 24px" : "52px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />
        </div>
      </div>

      {/* HOW TO APPLY  -  full width horizontal luxury steps */}
      <div style={{ background: "#FAFAF8", padding: isMobile ? "52px 24px" : "72px 80px", borderTop: "1px solid rgba(0,0,0,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.45em", color: "#8B6914", fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Admissions Process</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 38, fontWeight: 600, color: "#000", lineHeight: 1.05, marginBottom: 52 }}>How to Apply</h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", position: "relative", marginBottom: 0 }}>
            {!isMobile && (
              <div style={{ position: "absolute", top: 22, left: 44, right: 44, height: "1px", background: "linear-gradient(90deg, rgba(0,0,0,.04), rgba(0,0,0,.15), rgba(0,0,0,.04))", zIndex: 0 }} />
            )}
            {[
              { n: "01", title: "Submit Application", desc: "Please begin by submitting a brief application for admissions review following the form below. Excalibur Summer is selective, and each applicant is considered individually." },
              { n: "02", title: "Admissions Consultation", desc: "A member of the admissions team will contact the family within 24 hours to answer questions, discuss the student’s interests, and review availability for the selected wave." },
              { n: "03", title: "Enrollment Confirmation", desc: "Upon acceptance, enrollment is confirmed by deposit. Each wave is limited to 20 students to preserve the quality of instruction, discussion, mentorship, and direct feedback." },
            ].map((step, i) => (
              <div key={i} style={{ padding: isMobile ? "28px 0" : "0 28px 0 0", borderTop: isMobile ? "1px solid rgba(199,171,117,.1)" : "none", borderLeft: !isMobile && i > 0 ? "1px solid rgba(199,171,117,.1)" : "none", paddingLeft: !isMobile && i > 0 ? 28 : 0, position: "relative", zIndex: 1 }}>
                <div style={{ width: 44, height: 44, border: "1px solid rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, background: "#FAFAF8" }}>
                  <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 300, color: "#8B6914" }}>{step.n}</span>
                </div>
                <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 17, fontWeight: 600, color: "#000", lineHeight: 1.25, marginBottom: 12 }}>{step.title}</p>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#333", fontWeight: 300, lineHeight: 1.8 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Step 04  -  full width below the 3-column grid */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,.1)", marginTop: 40, paddingTop: 36, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "56px 1fr", gap: isMobile ? 20 : 36, alignItems: "start" }}>
            <div style={{ width: 44, height: 44, border: "1px solid rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF8", flexShrink: 0 }}>
              <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 300, color: "#8B6914" }}>04</span>
            </div>
            <div>
              <p style={{ fontFamily: serif, fontSize: isMobile ? 16 : 17, fontWeight: 600, color: "#000", lineHeight: 1.25, marginBottom: 16 }}>Family Onboarding &amp; Orientation</p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 14 : 52 }}>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#333", fontWeight: 300, lineHeight: 1.9 }}>Accepted families receive formal onboarding materials, including the welcome packet, program overview, schedule details, full menu information &amp; dietary preference form, student and family portal access, and information regarding Academy shuttle transportation for South Orange County students.</p>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#333", fontWeight: 300, lineHeight: 1.9 }}>Prior to the beginning of each wave, families are invited to a Family Orientation Session to meet with Lead faculty, Teaching Assistants, and the operations team — an opportunity to become fully acquainted with the Academy environment, review expectations and logistics, and get fully onboarded.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHOOSE YOUR WAVE  -  enrollment selector */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px", borderTop: "1px solid rgba(199,171,117,.1)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Enrollment</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 40, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 8 }}>Choose Your Wave</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 40, maxWidth: 580 }}>Select your wave and complete your program application. Our Enrollment Coordinator will be in touch within 24 hours.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111", marginBottom: 2 }}>
            {[
              { label: "WAVE 1 — JULY", wave: "Wave 1", dates: "July 6 – 18, 2026", days: "Monday – Friday · 9:30 AM – 3:30 PM", tag: "● Enrollment Open", tagColor: "#4DB87A" },
              { label: "WAVE 2 — AUGUST", wave: "Wave 2", dates: "August 3 – 15, 2026", days: "Monday – Friday · 9:30 AM – 3:30 PM", tag: "● Enrollment Open", tagColor: "#4DB87A" },
            ].map((w, i) => (
              <div key={i} style={{ background: "#080808", padding: isMobile ? "36px 24px" : "48px 44px", borderTop: `2px solid ${gold}` }}>
                <p style={{ fontFamily: eyebrow_font, fontSize: 8, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>{w.label}</p>
                <h3 style={{ fontFamily: serif, fontSize: 28, fontWeight: 600, color: "#FBF7EE", marginBottom: 6, lineHeight: 1 }}>{w.wave}</h3>
                <p style={{ fontFamily: serif, fontSize: 16, color: gold, fontStyle: "italic", marginBottom: 20 }}>{w.dates}</p>
                <div style={{ height: "1px", background: "rgba(199,171,117,.1)", marginBottom: 20 }} />
                {[["Schedule", w.label === "WAVE 1 — JULY" ? "Mon–Fri 9:30 AM–3:30 PM · July 18 Saturday Venture Finale" : "Mon–Fri 9:30 AM–3:30 PM · Aug 15 Saturday Venture Finale"], ["Duration", "Two Weeks"], ["Class Size", "Limited to 20 students"], ["Tuition", "$410 / full day · $4,500 per wave"], ["Includes", "Catered lunches · Guest speakers · Workshops · Start-up simulations · Shark Tank-inspired Finale"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 16, padding: "9px 0", borderBottom: "1px solid rgba(199,171,117,.06)", alignItems: "flex-start" }}>
                    <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.2em", color: gold, textTransform: "uppercase", minWidth: 72, flexShrink: 0, paddingTop: 1 }}>{k}</span>
                    <span style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6 }}>{v}</span>
                  </div>
                ))}
                <p style={{ fontFamily: eyebrow_font, fontSize: 9, color: w.tagColor, letterSpacing: "0.14em", fontWeight: 600, marginTop: 20, marginBottom: 20 }}>{w.tag}</p>
                <button onClick={() => openInquiry && openInquiry("summer")} style={{ fontFamily: sans, padding: "13px 0", background: gold, border: "none", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>COMPLETE APPLICATION →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* YOUR INFORMATION FORM */}
      <div style={{ background: "#000", padding: isMobile ? "52px 24px" : "72px 80px", borderTop: "1px solid rgba(199,171,117,.1)" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Request a Consultation</p>
          <h2 style={{ fontFamily: serif, fontSize: isMobile ? 28 : 40, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 8 }}>Schedule a Family Consultation</h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8, marginBottom: 36, maxWidth: 580 }}>Submit your information to schedule a private admissions consultation. A dedicated Enrollment Coordinator will guide your family through program options, admissions steps, availability, and next steps.</p>
          <div style={{ background: "#080808", borderTop: `2px solid ${gold}`, padding: "36px 32px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.25em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Parent / Guardian</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["First Name", "text"], ["Last Name", "text"]].map(([ph, type]) => (
                <input key={ph} type={type} placeholder={ph} className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["Email Address", "email"], ["Phone Number", "tel"]].map(([ph, type]) => (
                <input key={ph} type={type} placeholder={ph} className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 80px", gap: 10, marginBottom: 24 }}>
              <input type="text" placeholder="City *" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} required />
              <input type="text" placeholder="State" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              <input type="text" placeholder="ZIP *" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} required />
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.25em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Student</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["First Name", "text"], ["Last Name", "text"]].map(([ph, type]) => (
                <input key={ph} type={type} placeholder={ph} className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <input type="text" placeholder="Age" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
              <input type="text" placeholder="Current Grade / Year" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
            </div>
            <input type="text" placeholder="Preferred Wave (July or August)" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%", marginBottom: 24 }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.25em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>Consultation Preferences</p>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <select className="inquiry-input" defaultValue="" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%", appearance: "none" }}>
                <option value="" disabled>Preferred Contact Method</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
                <option value="either">Either</option>
              </select>
              <input type="text" placeholder="Preferred Consultation Dates" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%" }} />
            </div>
            <input type="text" placeholder="Preferred Times (e.g. mornings, evenings, weekends)" className="inquiry-input" style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%", marginBottom: 10 }} />
            <textarea placeholder="Additional notes or questions (optional)" className="inquiry-input" rows={4} style={{ background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, fontWeight: 300, outline: "none", width: "100%", marginBottom: 28, resize: "vertical" }} />
            <button onClick={() => openInquiry && openInquiry("summer")} style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", padding: "15px 40px", background: gold, border: "none", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>REQUEST CONSULTATION — WE'LL BE IN TOUCH WITHIN 24 HOURS</button>
          </div>
        </div>
      </div>

            {/* APPLY */}
      <div style={{ background: "#000", padding: isMobile ? "60px 24px" : "80px 80px", textAlign: "center" }}>
        <p style={{ fontFamily: eyebrow_font, fontSize: 9, letterSpacing: "0.4em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 20 }}>Enrollment Open · Summer 2026</p>
        <h2 style={{ fontFamily: serif, fontSize: isMobile ? 36 : 52, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.0, marginBottom: 12 }}>Twenty students per wave.</h2>
        <p style={{ fontFamily: serif, fontSize: 18, color: gold, fontStyle: "italic", marginBottom: 40 }}>Two weeks that change everything.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => openInquiry && openInquiry("summer")} style={{ fontFamily: sans, padding: "14px 44px", background: gold, border: "none", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>APPLY NOW →</button>
          <button onClick={() => setPage("programs")} style={{ fontFamily: sans, padding: "14px 32px", background: "transparent", border: `1px solid rgba(199,171,117,.3)`, color: gold, fontSize: 11, fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>← Back to Programs</button>
        </div>
      </div>

    </div>
  );
}

// ── EVENTS PAGE ──
function EventsPage({ setPage, openInquiry }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: "#000", paddingTop: 0 }}>
      <Breadcrumb items={[{label:"Events",page:"events"}]} setPage={setPage} />

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden", height: isMobile ? 400 : 560 }}>
        <img src="https://i.imgur.com/SjLpa14.jpeg" alt="Excalibur Events" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.3) 0%, rgba(0,0,0,.95) 100%)" }} />
        <div style={{ position: "absolute", bottom: isMobile ? 36 : 64, left: isMobile ? 24 : 72, maxWidth: 680 }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>Excalibur Academy · 2026</p>
            <h1 style={{ fontFamily: serif, fontSize: isMobile ? "clamp(36px,7vw,52px)" : "clamp(52px,6vw,80px)", fontWeight: 300, color: "#FBF7EE", lineHeight: 1.0, letterSpacing: "0.03em", marginBottom: 14 }}>Events</h1>
            <div style={{ width: 48, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)` }} />
          </Fade>
        </div>
      </div>

      {/* ── FEATURED EVENT ── */}
      <div style={{ background: "#000", padding: isMobile ? "60px 24px" : "80px 80px", borderBottom: "1px solid rgba(199,171,117,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 48 }}>Featured Event · By Invitation Only</p>
          </Fade>

          {/* Event block  -  editorial two-column on black */}
          <div style={{ borderTop: `2px solid ${gold}`, paddingTop: 48 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 48 : 80, alignItems: "start" }}>

              {/* Left  -  date, details */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4DB87A", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.22em", color: "#4DB87A", fontWeight: 700, textTransform: "uppercase" }}>Registration Open</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.45em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>Academy Launch & Family Information Soirée</p>
                {/* Date  -  monumental */}
                <div style={{ fontFamily: serif, fontSize: isMobile ? 80 : 112, fontWeight: 300, color: "#FBF7EE", lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 8 }}>May 27</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 14, height: "1px", background: `linear-gradient(90deg, transparent, ${gold})` }} />
                  <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif", fontSize: isMobile ? 15 : 18, color: gold, fontStyle: "italic", fontWeight: 600, letterSpacing: "0.1em", margin: 0 }}>Wednesday &nbsp;·&nbsp; 2026 &nbsp;·&nbsp; 6:00 – 8:00 PM</p>
                  <div style={{ width: 14, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)` }} />
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', 'Didot', 'Bodoni MT', Georgia, serif", fontSize: isMobile ? 24 : 36, color: "#FBF7EE", lineHeight: 1.1, marginBottom: 6, fontWeight: 300, fontStyle: "italic", letterSpacing: "0.04em" }}>Laguna Niguel City Hall Ballroom</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
                  <div style={{ width: 22, height: "1px", background: "rgba(199,171,117,0.4)" }} />
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: gold, letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 600, margin: 0 }}>Laguna Niguel · California</p>
                  <div style={{ width: 22, height: "1px", background: "rgba(199,171,117,0.4)" }} />
                </div>
                <div style={{ width: 40, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 32 }} />
                {/* Details table */}
                {[
                  ["Location", "Laguna Niguel City Hall Ballroom, Laguna Niguel, CA"],
                  ["Format", "Private Evening Reception"],
                  ["Time", "6:00 – 8:00 PM"],
                  ["Dress Code", "Black Tie"],
                  ["Access", "By Personal Invitation Only"],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 16, padding: "12px 0", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", color: gold, fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
                    <span style={{ fontFamily: sans, fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>{value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 36 }}>
                  <button onClick={() => openInquiry && openInquiry()} style={{ fontFamily: sans, padding: "14px 36px", background: gold, border: "none", color: "#000", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Request Invitation →</button>
                </div>
              </div>

              {/* Right  -  description */}
              <div>
                <h2 style={{ fontFamily: serif, fontSize: isMobile ? 24 : 36, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 28 }}>The official launch of Excalibur Academy — and a personal introduction to the people, programs, and standards behind it.</h2>
                <div style={{ width: 36, height: "1px", background: `linear-gradient(90deg, ${gold}, transparent)`, marginBottom: 28 }} />
                <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>Before the first program begins, Excalibur is hosting a private evening reception for a carefully selected number of families at Laguna Niguel City Hall Ballroom. This is the Academy's official launch event and Family Information Session — combined into one intimate, memorable evening.</p>
                <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 16 }}>The evening includes candid conversations with the Academy's lead faculty and founding team, a full overview of Excalibur's programs, structure, expectations, and logistics — and a chance for families and prospective students to experience the standard of the Academy before enrollment opens.</p>
                <p style={{ fontFamily: sans, fontSize: 14, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 28 }}>Prospective students attending the evening will be asked one question: <span style={{ fontFamily: serif, fontStyle: "italic", color: gold }}>"What is your dream?"</span></p>
                <div style={{ borderTop: "1px solid rgba(199,171,117,.12)", paddingTop: 24 }}>
                  <p style={{ fontFamily: serif, fontSize: 16, color: gold, letterSpacing: "0.1em", marginBottom: 12, fontStyle: "italic" }}>By Personal Invitation Only</p>
                  <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.8 }}>Invitations are extended personally by the Excalibur team. Families may request an invitation. We will be in touch personally with event details and next steps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHAT TO EXPECT ── */}
      <div style={{ background: "#050505", padding: isMobile ? "52px 24px" : "72px 80px", borderBottom: "1px solid rgba(199,171,117,.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Fade>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, letterSpacing: "0.55em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>The Evening</p>
            <h2 style={{ fontFamily: serif, fontSize: isMobile ? 26 : 38, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 48 }}>What to Expect</h2>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: 0 }}>
            {[
              { n: "01", title: "Welcome Reception", desc: "An intimate welcome on the estate grounds. Families are introduced to the Excalibur team, faculty, and one another in a relaxed, private setting." },
              { n: "02", title: "Program Overview", desc: "A candid walk through Excalibur's programs, structure, curriculum, faculty model, and student experience — led by the Academy's founding team." },
              { n: "03", title: "Faculty Introductions", desc: "A personal introduction to Excalibur's lead faculty and visiting practitioners. An opportunity to ask questions directly and understand who will be in the room." },
              { n: "04", title: "Student Moment", desc: "Prospective students will be asked to reflect on one question: \u201cWhat is your dream?\u201d \u2014 the first step in understanding what kind of student is right for Excalibur." },
            ].map((item, i) => (
              <div key={i} style={{ padding: isMobile ? "28px 0" : "0 32px", borderLeft: !isMobile && i > 0 ? "1px solid rgba(199,171,117,.1)" : "none", borderTop: isMobile && i > 0 ? "1px solid rgba(199,171,117,.1)" : "none" }}>
                <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, color: gold, display: "block", marginBottom: 16 }}>{item.n}</span>
                <h4 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: "#FBF7EE", lineHeight: 1.2, marginBottom: 12 }}>{item.title}</h4>
                <p style={{ fontFamily: sans, fontSize: 12, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SOIREE POSTCARD  -  unchanged ── */}
      <SoireeInviteBlock openInquiry={openInquiry} setPage={setPage} />

    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE: APPLICATION
// ─────────────────────────────────────────────
function ApplicationPage({ setPage, defaultProgram }) {
  const isMobile = useIsMobile();
  const [prog, setProg] = React.useState(defaultProgram || null);
  const [wave, setWave] = React.useState(null);
  const [track, setTrack] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [students, setStudents] = React.useState([{ firstName: "", lastName: "", age: "", grade: "" }]);
  const [form, setForm] = React.useState({
    parentFirst: "", parentLast: "", email: "", phone: "",
    city: "", state: "", zip: "",
    contactMethod: "", contactTime: "",
    sendPackage: "", hearAbout: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addStudent = () => { if (students.length < 5) setStudents(s => [...s, { firstName: "", lastName: "", age: "", grade: "" }]); };
  const updateStudent = (i, k, v) => { const s = [...students]; s[i] = { ...s[i], [k]: v }; setStudents(s); };

  const programs = [
    { id: "summer", label: "SUMMER INTENSIVE", title: "Summer Intensive", price: "$410 / full day · $4,500 per wave", desc: "Two weeks, full days, Mon–Fri. For students aged 15–18 (rising juniors and seniors). Public speaking, business, AI, sales and a Shark Tank–style Venture Court finale. 20 students per wave.", page: "summer-detail" },
    { id: "six-week", label: "SIX-WEEK INTENSIVE", title: "Six-Week Intensive", price: "$3,900 / wave", desc: "Full curriculum in six concentrated weeks. Weekday evening or Sunday half-day formats. Judged Academy Gala & Graduation Day finale.", page: "intensive" },
    { id: "flagship", label: "TEN-MONTH FLAGSHIP", title: "Ten-Month Program", price: "From $1,990 / month", desc: "All nine disciplines, real-world engagements, competitions, field trips, and the Excalibur Academy Portfolio. September–June.", page: "flagship-detail" },
  ];
  const waves = [
    { id: "wave1", label: "WAVE 1", title: "July 6–18, 2026", sub: "Monday through Friday", detail: "Two weeks. Full days. Limited to 20 students." },
    { id: "wave2", label: "WAVE 2", title: "August 3–15, 2026", sub: "Monday through Friday", detail: "Identical structure to Wave 1. August availability." },
  ];
  const tracks = [
    { id: "weekday", label: "WEEKDAY TRACK", title: "Tuesday & Thursday", sub: "4:00 – 7:00 PM", detail: "Evening sessions. Fits any weekend schedule." },
    { id: "saturday", label: "SATURDAY TRACK", title: "Every Saturday", sub: "9:00 AM – 3:00 PM", detail: "Full-day immersion. Deeper workshops and extended speaker time." },
    { id: "either", label: "NO PREFERENCE", title: "Either Track", sub: "", detail: "The admissions team will confirm availability with you." },
  ];
  const grades = ["9th Grade", "10th Grade", "11th Grade", "12th Grade"];
  const contactMethods = ["Phone Call", "Email", "Text Message", "WhatsApp"];
  const contactTimes = ["Morning (9–12)", "Afternoon (12–5)", "Evening (5–8)", "Weekends"];

  const isSummer = prog === "summer";
  const needsWave = isSummer;
  const needsTrack = prog === "six-week" || prog === "flagship";
  const readyToFill = prog && (needsWave ? wave : true) && (needsTrack ? track : true);

  const iStyle = { background: "#000", border: "1px solid rgba(199,171,117,.2)", color: "#FBF7EE", padding: "13px 16px", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, fontWeight: 300, outline: "none", width: "100%" };
  const focus = e => e.target.style.borderColor = gold;
  const blur  = e => e.target.style.borderColor = "rgba(199,171,117,.2)";

  const StepNum = ({ n, done }) => (
    <div style={{ width: 30, height: 30, background: done ? gold : "#111", border: `1px solid ${done ? gold : "rgba(199,171,117,.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 12, fontWeight: 700, color: done ? "#000" : "#FBF7EE", flexShrink: 0 }}>{n}</div>
  );
  const SectionHead = ({ n, done, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
      <StepNum n={n} done={done} />
      <h3 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 24, fontWeight: 600, color: "#FBF7EE" }}>{label}</h3>
    </div>
  );
  const Label = ({ children }) => (
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: "0.22em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>{children}</p>
  );
  const Chip = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, padding: "11px 20px", cursor: "pointer", background: active ? gold : "transparent", color: active ? "#000" : "#FBF7EE", border: `1px solid ${active ? gold : "rgba(199,171,117,.2)"}`, transition: "all .2s", fontWeight: active ? 700 : 300, whiteSpace: "nowrap" }}>{label}</button>
  );

  const handleSubmit = async () => {
    if (!form.email || !form.city) return;
    setSending(true);
    const p = programs.find(x => x.id === prog);
    const w = waves.find(x => x.id === wave);
    const t = tracks.find(x => x.id === track);
    await sendEmail({
      subject: "New Application — " + form.parentFirst + " " + form.parentLast,
      name: form.parentFirst + " " + form.parentLast,
      email: form.email,
      phone: form.phone,
      city: form.city + (form.state ? ", " + form.state : "") + (form.zip ? " " + form.zip : ""),
      program: p ? p.title : "",
      wave: w ? w.title : "",
      track: t ? t.label + " · " + t.title : "",
      contact_method: form.contactMethod,
      contact_time: form.contactTime,
      send_package: form.sendPackage,
      heard_about: form.hearAbout,
      students: students.map(s => s.firstName + " " + s.lastName + " | Grade: " + s.grade + " | Age: " + s.age).join(" / "),
      message: "Program: " + (p ? p.title : "") + (w ? " · " + w.title : "") + (t ? " · " + t.label : ""),
    });
    setSending(false);
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Admissions", page: "admissions" }]} setPage={setPage} />

      {/* HEADER */}
      <div style={{ padding: isMobile ? "48px 24px 36px" : "64px 80px 48px", borderBottom: "1px solid rgba(199,171,117,.1)" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: "0.5em", color: gold, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Excalibur Academy · 2026</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: isMobile ? 28 : 44, fontWeight: 300, color: "#FBF7EE", lineHeight: 1.05, marginBottom: 14, letterSpacing: "0.02em" }}>Request Program Information &amp; Admissions Package</h1>
        <div style={{ width: 48, height: "1px", background: "linear-gradient(90deg," + gold + ",transparent)", marginBottom: 16 }} />
        <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.85, maxWidth: 660 }}>Please choose your program and preferred schedule, then complete the application for admissions review. A dedicated Enrollment Coordinator will follow up within 24 hours with a personalized program information and admissions package, answer any questions, and guide your family through the next stage of the admissions process.</p>
      </div>

      {submitted ? (
        <div style={{ padding: isMobile ? "60px 24px" : "80px 80px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 56, color: gold, marginBottom: 24 }}>✦</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 32 : 44, fontWeight: 300, color: "#FBF7EE", marginBottom: 14 }}>Thank You.</h2>
          <div style={{ width: 48, height: "1px", background: "linear-gradient(90deg,transparent," + gold + ",transparent)", margin: "0 auto 20px" }} />
          <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.9, marginBottom: 36 }}>Your application has been received. A member of our admissions team will be in touch within 24 hours. We look forward to welcoming your family to Excalibur Academy.</p>
          <button onClick={() => setPage("home")} style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", padding: "13px 36px", background: "transparent", border: "1px solid rgba(199,171,117,.35)", color: gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>Return Home →</button>
        </div>
      ) : (
        <div style={{ padding: isMobile ? "36px 24px 80px" : "56px 80px 100px" }}>

          {/* STEP 1  -  PROGRAM */}
          <div style={{ marginBottom: 40 }}>
            <SectionHead n="1" done={!!prog} label="Choose Your Program" />
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
              {programs.map(p => (
                <div key={p.id} onClick={() => { setProg(p.id); setWave(null); setTrack(null); }} style={{ background: prog === p.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${prog === p.id ? gold : "transparent"}`, transition: "all .25s" }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>{p.label}</p>
                  <h4 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, fontWeight: 600, color: "#FBF7EE", marginBottom: 6, lineHeight: 1.2 }}>{p.title}</h4>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: gold, marginBottom: 10 }}>{p.price}</p>
                  <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</p>
                  <button onClick={e => { e.stopPropagation(); setPage(p.page); }} style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 9, letterSpacing: "0.16em", color: gold, background: "transparent", border: "none", cursor: "pointer", padding: 0, textTransform: "uppercase" }}>Explore Program →</button>
                  {prog === p.id && <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 10, color: gold, letterSpacing: "0.18em", marginTop: 10 }}>✓ SELECTED</p>}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2  -  WAVE (summer only) */}
          {prog && needsWave && (
            <div style={{ marginBottom: 40 }}>
              <SectionHead n="2" done={!!wave} label="Choose Your Wave" />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2, background: "#111" }}>
                {waves.map(w => (
                  <div key={w.id} onClick={() => setWave(w.id)} style={{ background: wave === w.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${wave === w.id ? gold : "transparent"}`, transition: "all .25s" }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>{w.label}</p>
                    <h4 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 22, fontWeight: 600, color: "#FBF7EE", marginBottom: 4 }}>{w.title}</h4>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: gold, marginBottom: 10 }}>{w.sub}</p>
                    <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300 }}>{w.detail}</p>
                    {wave === w.id && <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 10, color: gold, letterSpacing: "0.18em", marginTop: 14 }}>✓ SELECTED</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2/3  -  TRACK (six-week & flagship) */}
          {prog && needsTrack && (
            <div style={{ marginBottom: 40 }}>
              <SectionHead n="2" done={!!track} label="Choose Your Track" />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 2, background: "#111" }}>
                {tracks.map(t => (
                  <div key={t.id} onClick={() => setTrack(t.id)} style={{ background: track === t.id ? "#0C0C0A" : "#080808", padding: "28px 24px", cursor: "pointer", borderTop: `2px solid ${track === t.id ? gold : "transparent"}`, transition: "all .25s" }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 8, letterSpacing: "0.3em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>{t.label}</p>
                    <h4 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 22, fontWeight: 600, color: "#FBF7EE", marginBottom: 4 }}>{t.title}</h4>
                    {t.sub && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: gold, marginBottom: 10 }}>{t.sub}</p>}
                    <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300 }}>{t.detail}</p>
                    {track === t.id && <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 10, color: gold, letterSpacing: "0.18em", marginTop: 14 }}>✓ SELECTED</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3  -  FORM */}
          {readyToFill && (
            <div style={{ marginBottom: 40 }}>
              <SectionHead n={needsWave || needsTrack ? "3" : "2"} done={false} label="Your Information" />
              <div style={{ background: "#080808", borderTop: `2px solid ${gold}`, padding: isMobile ? "28px 22px" : "36px 40px" }}>
                <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.75, marginBottom: 32 }}>Fill in your details and our admissions team will be in touch within 24 hours with your full information package and next steps.</p>

                {/* Selection summary */}
                <div style={{ background: "#000", padding: "14px 20px", marginBottom: 28, borderLeft: `2px solid ${gold}` }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.2em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Your Selection</p>
                  <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 13, color: "#FBF7EE", fontWeight: 300 }}>
                    {programs.find(x => x.id === prog)?.title}
                    {wave ? " · " + waves.find(x => x.id === wave)?.title : ""}
                    {track ? " · " + tracks.find(x => x.id === track)?.title : ""}
                  </p>
                </div>

                {/* Parent */}
                <Label>Parent / Guardian</Label>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input placeholder="First Name *" className="inquiry-input" style={iStyle} value={form.parentFirst} onChange={e => set("parentFirst", e.target.value)} onFocus={focus} onBlur={blur} />
                  <input placeholder="Last Name" className="inquiry-input" style={iStyle} value={form.parentLast} onChange={e => set("parentLast", e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 24 }}>
                  <input type="email" placeholder="Email Address *" className="inquiry-input" style={iStyle} value={form.email} onChange={e => set("email", e.target.value)} onFocus={focus} onBlur={blur} />
                  <input type="tel" placeholder="Phone Number" className="inquiry-input" style={iStyle} value={form.phone} onChange={e => set("phone", e.target.value)} onFocus={focus} onBlur={blur} />
                </div>

                {/* City */}
                <Label>Location</Label>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 80px", gap: 10, marginBottom: 24 }}>
                  <input placeholder="City *" className="inquiry-input" style={iStyle} value={form.city} onChange={e => set("city", e.target.value)} onFocus={focus} onBlur={blur} />
                  <input placeholder="State" className="inquiry-input" style={iStyle} value={form.state} onChange={e => set("state", e.target.value)} onFocus={focus} onBlur={blur} />
                  <input placeholder="ZIP" className="inquiry-input" style={iStyle} value={form.zip} onChange={e => set("zip", e.target.value)} onFocus={focus} onBlur={blur} />
                </div>

                {/* Contact */}
                <Label>Preferred Method of Contact</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  {contactMethods.map(m => <Chip key={m} label={m} active={form.contactMethod === m} onClick={() => set("contactMethod", m)} />)}
                </div>
                <Label>Best Time to Reach You</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                  {contactTimes.map(t => <Chip key={t} label={t} active={form.contactTime === t} onClick={() => set("contactTime", t)} />)}
                </div>

                {/* Students */}
                <Label>Student Information</Label>
                {students.map((s, i) => (
                  <div key={i} style={{ background: "#000", border: "1px solid rgba(199,171,117,.15)", padding: "20px 20px", marginBottom: 10 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: "0.22em", color: gold, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Student {i + 1}</p>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <input placeholder="First Name" className="inquiry-input" style={iStyle} value={s.firstName} onChange={e => updateStudent(i, "firstName", e.target.value)} onFocus={focus} onBlur={blur} />
                      <input placeholder="Last Name" className="inquiry-input" style={iStyle} value={s.lastName} onChange={e => updateStudent(i, "lastName", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "80px 1fr", gap: 10 }}>
                      <input type="number" min="14" max="19" placeholder="Age" className="inquiry-input" style={iStyle} value={s.age} onChange={e => updateStudent(i, "age", e.target.value)} onFocus={focus} onBlur={blur} />
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {grades.map(g => <Chip key={g} label={g} active={s.grade === g} onClick={() => updateStudent(i, "grade", g)} />)}
                      </div>
                    </div>
                  </div>
                ))}
                {students.length < 5 && (
                  <button onClick={addStudent} style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", background: "transparent", border: "1px dashed rgba(199,171,117,.25)", color: gold, padding: "12px", fontSize: 15, fontWeight: 500, letterSpacing: "0.1em", cursor: "pointer", textAlign: "center", width: "100%", marginBottom: 28 }}>+ Add Another Student</button>
                )}

                {/* Package */}
                <Label>Admissions Package & Private Invitation</Label>
                <p style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", fontSize: 15, color: "#FBF7EE", fontWeight: 300, lineHeight: 1.7, marginBottom: 12 }}>Would you like to receive your private invitation to the May 27 family evening and admissions package by post?</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                  {["Yes — send by post", "Email only"].map(opt => <Chip key={opt} label={opt} active={form.sendPackage === opt} onClick={() => set("sendPackage", opt)} />)}
                </div>

                {/* Heard about */}
                <Label>How Did You Hear About Excalibur?</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
                  {["Referral", "Social Media", "Search", "Event", "Press / Media", "Other"].map(h => <Chip key={h} label={h} active={form.hearAbout === h} onClick={() => set("hearAbout", h)} />)}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={sending || !form.email || !form.city}
                  style={{ fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif", padding: "15px 40px", background: (!form.email || !form.city) ? "rgba(199,171,117,.4)" : gold, border: "none", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", cursor: (!form.email || !form.city) ? "not-allowed" : "pointer", width: "100%", transition: "all .2s" }}
                >{sending ? "Submitting..." : "REQUEST PROGRAM INFORMATION & ADMISSIONS PACKAGE"}</button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}


export default function ExcaliburApp() {
  const [page, setPageRaw] = useState("home");
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryProgram, setInquiryProgram] = useState("");

  const openInquiry = useCallback((program = "") => {
    setInquiryProgram(program);
    setPageRaw("apply-now");
    window.scrollTo(0, 0);
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
    if (p === "apply") { setPageRaw("apply-now"); window.scrollTo(0,0); return; }
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
    if (page === "events") return <EventsPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "faculty") return <FacultyPage setPage={setPage} openInquiry={openInquiry} />;
    if (page.startsWith("faculty:")) return <FacultyProfilePage slug={page.replace("faculty:", "")} setPage={setPage} />;
    if (page === "apply") return <ApplyPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "admissions") return <ApplyPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "apply-now") return <ApplicationPage setPage={setPage} defaultProgram={inquiryProgram} />;
    if (page === "flagship-detail") return <FlagshipDetailPage setPage={setPage} openInquiry={openInquiry} />;
    if (page === "summer-detail") return <SummerDetailPage setPage={setPage} openInquiry={openInquiry} />;
    if (page.startsWith("module:")) return <ModulePage slug={page.replace("module:", "")} setPage={setPage} />;
    if (page.startsWith("summer-module:")) return <SummerModulePage slug={page.replace("summer-module:", "")} setPage={setPage} />;
    return <HomePage setPage={setPage} openInquiry={openInquiry} />;
  };

  return (
    <div style={{ background: "#000", color: "#FBF7EE", minHeight: "100vh", fontFamily: "'Avenir', 'Avenir Next', 'Century Gothic', sans-serif" }}>
      <ScrollProgress />
      <ShimmerStyle />
      <StickyMobileCTA setPage={setPage} openInquiry={openInquiry} />
      <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Forum&display=swap" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <style>{`*{margin:0;padding:0;box-sizing:border-box}::selection{background:rgba(199,171,117,.2);color:#fff}html{scroll-behavior:smooth}body{overflow-x:hidden}button{cursor:pointer;font-family:'Lato',sans-serif}img{max-width:100%}.inquiry-input::placeholder{color:rgba(255,255,255,1)!important}.application-input::placeholder{color:rgba(255,255,255,1)!important}.inquiry-input{color:#FBF7EE!important}input::placeholder{color:#FBF7EE!important}textarea::placeholder{color:#FBF7EE!important}`}</style>
      <Nav page={page} setPage={setPage} />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} defaultProgram={inquiryProgram} />
      {renderPage()}
      <Footer setPage={setPage} />
    </div>
  );
}
