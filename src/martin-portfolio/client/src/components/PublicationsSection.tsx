/* PublicationsSection — Dark Governance design
   Publications + Writings + Frameworks */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, BookOpen, FileText } from "lucide-react";

const WRITING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663476813471/hqNg7wPGV6AtcQN7HWroT7/research-papers-EHTscpowsHACF8nBNz4mjZ.webp";

const publications = [
  {
    type: "Journal Article",
    year: "2025",
    title: "Every Hair a Battle Scar: Buffy Summers' Hair as Narrative Engine, Cultural Icon, and Postfeminist Text",
    venue: "Slayage: The Journal of the Whedon Studies Association",
    status: "Published Journal Article",
    desc: "An article that reads Buffy Summers' hair as a serialized visual text linking crisis, recovery, branding, embodiment, and postfeminist agency.",
    href: "https://martin.govern-ai.ca/papers/every-hair-a-battle-scar/",
  },
  {
    type: "Book Chapter",
    year: "2023",
    title: "The Avatar Animated Series: A Queer Reading of Embodied Power",
    venue: "Anime, Philosophy and Religion",
    status: "Published Book Chapter",
    desc: "A queer reading of Avatar: The Last Airbender and The Legend of Korra that foregrounds embodied power, identity struggle, and the political arc of Korra.",
    href: "https://martin.govern-ai.ca/papers/the-avatar-animated-series-a-queer-reading-of-embodied-power/",
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

const frameworks = [
  { id: "01", title: "Claim Boundary Ledger" },
  { id: "02", title: "Policy-to-Control Trace Map" },
  { id: "03", title: "Escalation Accountability Matrix" },
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
      id="writing"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        background: "oklch(0.13 0.012 255)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
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
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <p className="eyebrow">Research / Publications</p>
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
            Publication, writing, and method records in one coherent line.
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
            The archive remains selective on the homepage so institutional readers can orient quickly without losing conceptual precision.
          </p>
        </motion.div>

        <div
          style={{
            marginTop: "3rem",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
          }}
          className="lg:grid-cols-[1fr_1fr_280px]"
        >
          {/* Publications */}
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
                    Publications
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
                  Read all <ExternalLink size={10} />
                </a>
              </div>
            </AnimatedCard>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {publications.map((pub, i) => (
                <AnimatedCard key={pub.title} delay={i * 0.1}>
                  <div className="gov-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span className="tag-badge">{pub.type}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                          color: "oklch(0.52 0.015 255)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {pub.year}
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
                      {pub.title}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.25rem",
                        fontSize: "0.72rem",
                        color: "oklch(0.55 0.015 255)",
                        fontStyle: "italic",
                      }}
                    >
                      {pub.venue}
                    </p>
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.78rem",
                        lineHeight: 1.6,
                        color: "oklch(0.52 0.015 255)",
                      }}
                    >
                      {pub.desc}
                    </p>
                    <a
                      href={pub.href}
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

          {/* Writings */}
          <div>
            <AnimatedCard delay={0.1}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
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
                    Writings
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
            </AnimatedCard>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {writings.map((writing, i) => (
                <AnimatedCard key={writing.title} delay={0.15 + i * 0.1}>
                  <div className="gov-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                          color: "oklch(0.52 0.015 255)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {writing.date}
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.58rem",
                          color: "oklch(0.45 0.015 255)",
                        }}
                      >
                        {writing.readTime}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: "oklch(0.88 0.008 65)",
                        lineHeight: 1.3,
                      }}
                    >
                      {writing.title}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.78rem",
                        lineHeight: 1.6,
                        color: "oklch(0.52 0.015 255)",
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
                      Read writing <ExternalLink size={10} />
                    </a>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* Frameworks sidebar */}
          <div>
            <AnimatedCard delay={0.2}>
              <div className="veil-panel">
                <p className="eyebrow">Selected Frameworks</p>
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
                  Reusable governance structures.
                </h3>
                <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0" }}>
                  {frameworks.map((fw, i) => (
                    <div
                      key={fw.id}
                      style={{
                        borderTop: "1px solid oklch(1 0 0 / 8%)",
                        paddingTop: "0.875rem",
                        paddingBottom: "0.875rem",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                          color: "oklch(0.72 0.09 65)",
                          letterSpacing: "0.08em",
                          flexShrink: 0,
                          paddingTop: "0.15rem",
                        }}
                      >
                        {fw.id}
                      </span>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.82rem",
                          color: "oklch(0.72 0.015 255)",
                          lineHeight: 1.4,
                        }}
                      >
                        {fw.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>

            {/* Route by reader type */}
            <AnimatedCard delay={0.3}>
              <div className="veil-panel" style={{ marginTop: "1rem" }}>
                <p className="eyebrow">Route by Reader</p>
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "Institutional analysis & publication trajectory", href: "https://martin.govern-ai.ca/papers/" },
                    { label: "Decision systems, accountability design & governance", href: "https://martin.govern-ai.ca/governance/" },
                    { label: "Essays, books, and institutional public argument", href: "https://martin.govern-ai.ca/writing/" },
                    { label: "Governance and writing tools built in practice", href: "https://martin.govern-ai.ca/projects/" },
                  ].map((route) => (
                    <a
                      key={route.label}
                      href={route.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        fontSize: "0.78rem",
                        color: "oklch(0.62 0.015 255)",
                        textDecoration: "none",
                        lineHeight: 1.4,
                        transition: "color 200ms",
                        paddingBottom: "0.75rem",
                        borderBottom: "1px solid oklch(1 0 0 / 6%)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.72 0.09 65)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.62 0.015 255)")}
                    >
                      <span className="diamond" style={{ marginTop: "0.3rem", flexShrink: 0 }} />
                      {route.label}
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </section>
  );
}
