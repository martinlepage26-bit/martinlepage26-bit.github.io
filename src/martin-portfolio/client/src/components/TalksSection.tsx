/* TalksSection — Dark Governance design */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink } from "lucide-react";

const TALKS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663476813471/hqNg7wPGV6AtcQN7HWroT7/institutional-power-YRDUuuCiFcFSDScrLkvmPo.webp";

const talks = [
  {
    year: "2023",
    title: "Queer Ritual Negotiations in Montreal Neopagan Communities",
    event: "Academic Conference",
    type: "Research Presentation",
    desc: "Presentation drawing from PhD fieldwork on how queer practitioners negotiate identity, belonging, and ritual authority in neopagan spaces.",
  },
  {
    year: "2022",
    title: "Institutional Legitimacy and AI-Assisted Decision Systems",
    event: "Governance Workshop",
    type: "Workshop",
    desc: "A workshop session on how AI-assisted systems create new accountability gaps and how governance design can address them.",
  },
  {
    year: "2021",
    title: "Archival Classification and Institutional Memory",
    event: "National Film Board Symposium",
    type: "Internal Presentation",
    desc: "A presentation on classification discipline, retrieval logic, and how archival decisions shape institutional memory and access.",
  },
];

const topics = [
  "AI governance, accountability, and decision traceability",
  "Institutional legitimacy, authority, and narrative",
  "Queer theory, identity, and category critique",
  "Media analysis, platform culture, and symbolic systems",
  "Governance design for high-consequence environments",
  "Research method and interpretive discipline",
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

export default function TalksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="talks"
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
          width: "45%",
          backgroundImage: `url(${TALKS_IMG})`,
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
          background: "linear-gradient(90deg, oklch(0.13 0.012 255 / 70%) 0%, oklch(0.13 0.012 255 / 40%) 30%, transparent 100%)",
          zIndex: 1,
        }}
      />
      <div className="section-shell" style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
          }}
          className="lg:grid-cols-[1fr_300px]"
        >
          {/* Left: Talks */}
          <div>
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55 }}
            >
              <p className="eyebrow">Talks / Events</p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  color: "oklch(0.91 0.008 65)",
                  marginTop: "1rem",
                  maxWidth: "36rem",
                  lineHeight: 1.15,
                }}
              >
                Talks, workshops, and public argument.
              </h2>
              <p
                style={{
                  marginTop: "1rem",
                  maxWidth: "36rem",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "oklch(0.58 0.018 255)",
                }}
              >
                The same method, spoken: bounded claims, explicit evidence, practical consequence.
              </p>
            </motion.div>

            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {talks.map((talk, i) => (
                <AnimatedCard key={talk.title} delay={i * 0.1}>
                  <div
                    className="gov-card"
                    style={{
                      borderLeft: "2px solid oklch(0.72 0.09 65 / 30%)",
                      paddingLeft: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      <span className="tag-badge">{talk.type}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                          color: "oklch(0.52 0.015 255)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {talk.year}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontSize: "1.15rem",
                        color: "oklch(0.88 0.008 65)",
                        lineHeight: 1.3,
                      }}
                    >
                      {talk.title}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.2rem",
                        fontSize: "0.72rem",
                        color: "oklch(0.55 0.015 255)",
                        fontStyle: "italic",
                      }}
                    >
                      {talk.event}
                    </p>
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.8rem",
                        lineHeight: 1.65,
                        color: "oklch(0.52 0.015 255)",
                      }}
                    >
                      {talk.desc}
                    </p>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            <AnimatedCard delay={0.4}>
              <div style={{ marginTop: "1.5rem" }}>
                <a href="https://martin.govern-ai.ca/talks/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  View all talks <ExternalLink size={12} />
                </a>
              </div>
            </AnimatedCard>
          </div>

          {/* Right: Topics + Speaking */}
          <div>
            <AnimatedCard delay={0.2}>
              <div className="veil-panel">
                <p className="eyebrow">Speaking Topics</p>
                <ul
                  style={{
                    marginTop: "1rem",
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0",
                  }}
                >
                  {topics.map((topic) => (
                    <li
                      key={topic}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        borderTop: "1px solid oklch(1 0 0 / 8%)",
                        paddingTop: "0.625rem",
                        paddingBottom: "0.625rem",
                        fontSize: "0.8rem",
                        lineHeight: 1.5,
                        color: "oklch(0.62 0.015 255)",
                      }}
                    >
                      <span className="diamond" style={{ marginTop: "0.3rem", flexShrink: 0 }} />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <div className="veil-panel" style={{ marginTop: "1rem" }}>
                <p className="eyebrow">Invite Martin to Speak</p>
                <p
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "0.82rem",
                    lineHeight: 1.65,
                    color: "oklch(0.58 0.015 255)",
                  }}
                >
                  For conferences, panels, workshops, and guest lectures. Include your event context, format, and timeline in your first message.
                </p>
                <div style={{ marginTop: "1.25rem" }}>
                  <a
                    href="mailto:martinlepage.ai@gmail.com?subject=Speaking%20inquiry"
                    className="btn-primary"
                    style={{ justifyContent: "center", fontSize: "0.72rem", display: "flex" }}
                  >
                    Invite Martin to speak
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
