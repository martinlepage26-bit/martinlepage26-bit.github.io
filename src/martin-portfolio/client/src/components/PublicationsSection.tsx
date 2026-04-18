/* PublicationsSection — Dark Governance design
   Paper line + genealogies + recent writing */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, BookOpen, FileText } from "lucide-react";

const WRITING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663476813471/hqNg7wPGV6AtcQN7HWroT7/research-papers-EHTscpowsHACF8nBNz4mjZ.webp";

const paperHighlights = [
  {
    type: "Journal Article",
    status: "Published journal article",
    year: "2014",
    title: "A Lokian Family: Queer and Pagan Agency in Montreal",
    venue: "The Pomegranate: The International Journal of Pagan Studies",
    desc: "One of the earliest published anchors in the archive: queer and pagan agency in Montreal, ritual negotiation, and the first legible statement of the fieldwork line.",
    href: "https://martin.govern-ai.ca/papers/a-lokian-family/",
  },
  {
    type: "Journal Article",
    status: "Published journal article",
    year: "2017",
    title: "Queerness and Transgender Identity: Negotiations in the Pagan Community of Montreal",
    venue: "Studies in Religion / Sciences Religieuses",
    desc: "A key paper in the Montreal ritual genealogy, tracing gender, community negotiation, and the social work required to make identity legible.",
    href: "https://martin.govern-ai.ca/papers/queerness-and-transgender-identity-montreal/",
  },
  {
    type: "Book Chapter",
    status: "Published book chapter",
    year: "2020",
    title: "\"Things I do are manifestations of love\": queer religiosities and secular spirituality among Montreal Pagans",
    venue: "Secular Societies, Spiritual Selves? The Gendered Triangle of Religion, Secularity and Spirituality",
    desc: "A later ritual-line chapter that stays with queer religiosity, secular spirituality, and the everyday social grammar of attachment and practice.",
    href: "https://martin.govern-ai.ca/papers/things-i-do-are-manifestations-of-love/",
  },
  {
    type: "Book Chapter",
    status: "Published book chapter",
    year: "2023",
    title: "The Avatar Animated Series: A Queer Reading of Embodied Power",
    venue: "Anime, Philosophy and Religion",
    desc: "A queer reading of Avatar that foregrounds embodied power, identity struggle, and the political arc of Korra as the archive turns more directly toward media analysis.",
    href: "https://martin.govern-ai.ca/papers/the-avatar-animated-series-a-queer-reading-of-embodied-power/",
  },
  {
    type: "Journal Article",
    status: "Published journal article",
    year: "2025",
    title: "Every Hair a Battle Scar: Buffy Summers' Hair as Narrative Engine, Cultural Icon, and Postfeminist Text",
    venue: "Slayage: The Journal of the Whedon Studies Association",
    desc: "A media-analysis line that reads hair as serialized visual text, linking embodiment, branding, crisis, and postfeminist recovery through a pop-cultural object.",
    href: "https://martin.govern-ai.ca/papers/every-hair-a-battle-scar/",
  },
  {
    type: "Article Manuscript",
    status: "Manuscript in circulation",
    year: "2026",
    title: "Magic After Legitimacy: Witchcraft, Sisterhood, and the Work of Power in Charmed",
    venue: "Current manuscript record",
    desc: "A current manuscript that carries the archive's move into media, sisterhood, legitimacy, and the later governance-facing questions of how power gets staged and read.",
    href: "https://martin.govern-ai.ca/projects/magic-after-legitimacy-charmed/",
  },
];

const writings = [
  {
    date: "March 4, 2026",
    readTime: "1 min read",
    title: "What Governance Needs from Ritual Theory",
    desc: "A short bridge essay arguing that governance often fails when it ignores ceremony, recognition, and symbolic thresholds in institutional life.",
    href: "https://martin.govern-ai.ca/writing/what-governance-needs-from-ritual/",
  },
  {
    date: "February 20, 2026",
    readTime: "1 min read",
    title: "Notes from Hex A. Decimal",
    desc: "A short essay on the writing atmosphere behind the Hex A. Decimal Substack profile: glitch-born essays, haunted systems, and a refusal of empty optimization.",
    href: "https://martin.govern-ai.ca/writing/notes-from-hexadecimal-project/",
  },
];

const genealogies = [
  {
    span: "2014-2020",
    title: "Queer ritual, pagan Montreal, and legitimacy",
    desc: "Fieldwork, gender performance, authenticity, and queer religiosity form the first major line of the archive.",
  },
  {
    span: "2023-2026",
    title: "Media, embodiment, and cultural power",
    desc: "Avatar, Buffy, Charmed, and related media become test sites for authority, desire, representation, and postfeminist pressure.",
  },
  {
    span: "2026-",
    title: "Recursive governance, methods, and public tooling",
    desc: "The later turn translates earlier interpretive training into governance method, recursive infrastructure, and app-linked public surfaces.",
  },
];

const archiveFacts = [
  {
    value: "24",
    label: "paper records",
    desc: "Full on-site paper line across published work, manuscripts in circulation, and development-stage records.",
  },
  {
    value: "16",
    label: "published records",
    desc: "Verified articles, chapters, reviews, editorials, and dissertation records.",
  },
  {
    value: "8",
    label: "working or pending records",
    desc: "In-development, circulating, or confirmation-stage items kept public with explicit status.",
  },
];

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function PublicationsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="papers"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        background: "oklch(0.13 0.012 255)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "40%",
          backgroundImage: `url(${WRITING_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(270deg, oklch(0.13 0.012 255 / 70%) 0%, oklch(0.13 0.012 255 / 40%) 30%, transparent 100%)",
          zIndex: 1,
        }}
      />

      <div className="section-shell" style={{ position: "relative", zIndex: 2 }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <p className="eyebrow">Papers / Genealogies</p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              color: "oklch(0.93 0.008 65)",
              marginTop: "1rem",
              maxWidth: "40rem",
              lineHeight: 1.15,
              textShadow: "0 2px 6px oklch(0 0 0 / 30%)",
            }}
          >
            A fuller paper line, organized by genealogy.
          </h2>
          <p
            style={{
              marginTop: "1rem",
              maxWidth: "38rem",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              color: "oklch(0.58 0.018 255)",
            }}
          >
            The archive now keeps the full paper line in view: queer ritual studies in Montreal, later media and
            cultural analysis, and the governance-method turn that grows out of them.
          </p>
        </motion.div>

        <div
          style={{
            marginTop: "2.5rem",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1rem",
          }}
          className="md:grid-cols-3"
        >
          {archiveFacts.map((fact, i) => (
            <AnimatedCard key={fact.label} delay={i * 0.08}>
              <div className="gov-card" style={{ height: "100%" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    fontSize: "2.2rem",
                    color: "oklch(0.72 0.09 65)",
                    lineHeight: 1,
                  }}
                >
                  {fact.value}
                </div>
                <p
                  style={{
                    marginTop: "0.45rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.6rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "oklch(0.72 0.09 65)",
                  }}
                >
                  {fact.label}
                </p>
                <p
                  style={{
                    marginTop: "0.6rem",
                    fontSize: "0.78rem",
                    lineHeight: 1.6,
                    color: "oklch(0.55 0.015 255)",
                  }}
                >
                  {fact.desc}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div
          style={{
            marginTop: "3rem",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
          }}
          className="lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]"
        >
          <div>
            <AnimatedCard>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BookOpen size={14} style={{ color: "oklch(0.72 0.09 65)" }} />
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.62rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "oklch(0.72 0.09 65)",
                    }}
                  >
                    Paper highlights
                  </span>
                </div>
                <a
                  href="https://martin.govern-ai.ca/papers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.7rem",
                    color: "oklch(0.55 0.015 255)",
                    textDecoration: "none",
                    transition: "color 200ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.72 0.09 65)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.55 0.015 255)")}
                >
                  Open full paper list <ExternalLink size={10} />
                </a>
              </div>
            </AnimatedCard>

            <div style={{ display: "grid", gap: "0.75rem" }} className="md:grid-cols-2">
              {paperHighlights.map((paper, i) => (
                <AnimatedCard key={paper.title} delay={i * 0.08}>
                  <div className="gov-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span className="tag-badge">{paper.type}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                          color: "oklch(0.52 0.015 255)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {paper.year}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        color: "oklch(0.88 0.008 65)",
                        lineHeight: 1.3,
                      }}
                    >
                      {paper.title}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.25rem",
                        fontSize: "0.72rem",
                        color: "oklch(0.55 0.015 255)",
                        fontStyle: "italic",
                      }}
                    >
                      {paper.venue}
                    </p>
                    <p
                      style={{
                        marginTop: "0.4rem",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.58rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "oklch(0.72 0.09 65 / 78%)",
                      }}
                    >
                      {paper.status}
                    </p>
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.78rem",
                        lineHeight: 1.6,
                        color: "oklch(0.52 0.015 255)",
                      }}
                    >
                      {paper.desc}
                    </p>
                    <a
                      href={paper.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        marginTop: "0.75rem",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "oklch(0.72 0.09 65)",
                        textDecoration: "none",
                        transition: "opacity 200ms",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      Open record <ExternalLink size={10} />
                    </a>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>

          <div>
            <AnimatedCard delay={0.1}>
              <div className="veil-panel">
                <p className="eyebrow">Research genealogies</p>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    color: "oklch(0.88 0.008 65)",
                    marginTop: "0.75rem",
                    lineHeight: 1.3,
                  }}
                >
                  Three lines keep the archive continuous.
                </h3>
                <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0" }}>
                  {genealogies.map((genealogy) => (
                    <div
                      key={genealogy.title}
                      style={{
                        borderTop: "1px solid oklch(1 0 0 / 8%)",
                        paddingTop: "0.875rem",
                        paddingBottom: "0.875rem",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                          color: "oklch(0.72 0.09 65)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {genealogy.span}
                      </p>
                      <p
                        style={{
                          marginTop: "0.35rem",
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "oklch(0.85 0.008 65)",
                          lineHeight: 1.3,
                        }}
                      >
                        {genealogy.title}
                      </p>
                      <p
                        style={{
                          marginTop: "0.4rem",
                          fontSize: "0.78rem",
                          lineHeight: 1.6,
                          color: "oklch(0.58 0.015 255)",
                        }}
                      >
                        {genealogy.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <div className="veil-panel" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileText size={14} style={{ color: "oklch(0.72 0.09 65)" }} />
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.62rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "oklch(0.72 0.09 65)",
                      }}
                    >
                      Recent writing
                    </span>
                  </div>
                  <a
                    href="https://martin.govern-ai.ca/writing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.7rem",
                      color: "oklch(0.55 0.015 255)",
                      textDecoration: "none",
                      transition: "color 200ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.72 0.09 65)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.55 0.015 255)")}
                  >
                    Open all <ExternalLink size={10} />
                  </a>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {writings.map((writing) => (
                    <div
                      key={writing.title}
                      style={{
                        paddingBottom: "0.8rem",
                        borderBottom: "1px solid oklch(1 0 0 / 6%)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.58rem",
                            color: "oklch(0.52 0.015 255)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {writing.date}
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.56rem",
                            color: "oklch(0.45 0.015 255)",
                          }}
                        >
                          {writing.readTime}
                        </span>
                      </div>
                      <p
                        style={{
                          marginTop: "0.45rem",
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1rem",
                          fontWeight: 600,
                          lineHeight: 1.3,
                          color: "oklch(0.85 0.008 65)",
                        }}
                      >
                        {writing.title}
                      </p>
                      <p
                        style={{
                          marginTop: "0.4rem",
                          fontSize: "0.76rem",
                          lineHeight: 1.6,
                          color: "oklch(0.58 0.015 255)",
                        }}
                      >
                        {writing.desc}
                      </p>
                      <a
                        href={writing.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          marginTop: "0.6rem",
                          fontSize: "0.68rem",
                          fontWeight: 500,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "oklch(0.72 0.09 65)",
                          textDecoration: "none",
                        }}
                      >
                        Read writing <ExternalLink size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.4}>
              <div className="veil-panel" style={{ marginTop: "1rem" }}>
                <p className="eyebrow">Archive routes</p>
                <p
                  style={{
                    marginTop: "0.85rem",
                    fontSize: "0.82rem",
                    lineHeight: 1.65,
                    color: "oklch(0.62 0.015 255)",
                  }}
                >
                  Published records sit under Papers. Working papers stay public under Projects until publication
                  status or bibliographic confirmation changes.
                </p>
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  <a href="https://martin.govern-ai.ca/papers/" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    Open full paper list
                  </a>
                  <a href="https://martin.govern-ai.ca/projects/#unpublished-papers" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    Open working-paper records
                  </a>
                  <a href="https://independent.academia.edu/MartinLepage2" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    Open Academia.edu
                  </a>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </section>
  );
}
