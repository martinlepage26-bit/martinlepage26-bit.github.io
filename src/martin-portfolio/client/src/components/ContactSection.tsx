/* ContactSection — Dark Governance design
   Inquiry paths + direct contact */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, ExternalLink } from "lucide-react";

const inquiryPaths = [
  {
    label: "Governance engagements",
    desc: "For governance architecture, evidence design, escalation pathways, and institutional accountability work.",
    email: "martinlepage.ai@gmail.com",
    subject: "Governance engagement inquiry",
  },
  {
    label: "Speaking and events",
    desc: "For conferences, panels, workshops, and guest lectures on governance, legitimacy, culture, and institutional analysis.",
    email: "martinlepage.ai@gmail.com",
    subject: "Speaking inquiry",
  },
  {
    label: "Editorial and media",
    desc: "For commissioned essays, interviews, book conversations, editorial collaboration, and media requests.",
    email: "martinlepage.ai@gmail.com",
    subject: "Editorial inquiry",
  },
  {
    label: "Academic and research",
    desc: "For publication dialogue, collaborative research, scholarly outreach, and archive-related inquiries.",
    email: "martinlepage.ai@gmail.com",
    subject: "Research inquiry",
  },
];

const bestFits = [
  "Institutional analysis, legitimacy mapping, and consequence tracing",
  "Governance architecture, decision traceability, and review protocols",
  "Public writing, editorial commissions, and media requests",
  "Autodidact app and workflow tool development for governance contexts",
  "Talks, guest lectures, and panel programming",
  "Research collaborations and publication discussions",
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

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        background: "oklch(0.11 0.012 255)",
      }}
    >
      <div className="section-shell">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <p className="eyebrow">Contact</p>
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
            Reach out with context and stakes.
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
            Email is the clearest channel. A concise first message with context, objective, and timeline usually gets the fastest useful reply.
          </p>
        </motion.div>

        <div
          style={{
            marginTop: "3rem",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
          }}
          className="lg:grid-cols-[1fr_320px]"
        >
          {/* Inquiry paths */}
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {inquiryPaths.map((path, i) => (
                <AnimatedCard key={path.label} delay={i * 0.08}>
                  <div className="gov-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.55rem",
                        fontWeight: 500,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "oklch(0.52 0.06 255)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Inquiry Path
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
                      {path.label}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.78rem",
                        lineHeight: 1.6,
                        color: "oklch(0.52 0.015 255)",
                        flex: 1,
                      }}
                    >
                      {path.desc}
                    </p>
                    <a
                      href={`mailto:${path.email}?subject=${encodeURIComponent(path.subject)}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        marginTop: "1rem",
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
                      <Mail size={11} />
                      Start this inquiry
                    </a>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <AnimatedCard delay={0.2}>
              <div className="veil-panel">
                <p className="eyebrow">Best Fits</p>
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
                  {bestFits.map((fit) => (
                    <li
                      key={fit}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                        borderTop: "1px solid oklch(1 0 0 / 8%)",
                        paddingTop: "0.625rem",
                        paddingBottom: "0.625rem",
                        fontSize: "0.78rem",
                        lineHeight: 1.5,
                        color: "oklch(0.58 0.015 255)",
                      }}
                    >
                      <span className="diamond" style={{ marginTop: "0.3rem", flexShrink: 0 }} />
                      {fit}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <div className="veil-panel" style={{ marginTop: "1rem" }}>
                <p className="eyebrow">Direct</p>
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "oklch(0.52 0.015 255)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Location
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "oklch(0.72 0.015 255)" }}>
                      Montreal, Quebec, Canada
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "oklch(0.52 0.015 255)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Email
                    </div>
                    <a
                      href="mailto:martinlepage.ai@gmail.com"
                      className="link-copper"
                      style={{ fontSize: "0.85rem" }}
                    >
                      martinlepage.ai@gmail.com
                    </a>
                  </div>
                </div>
                <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <a href="mailto:martinlepage.ai@gmail.com" className="btn-primary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    <Mail size={13} />
                    Email Martin
                  </a>
                  <a href="https://martin.govern-ai.ca/resume/" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    <ExternalLink size={12} />
                    Open Resume and CV
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
