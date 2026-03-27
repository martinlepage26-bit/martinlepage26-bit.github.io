/* AboutSection — Dark Governance design
   Bio + Timeline + Research interests */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Photo from the About page (using Unsplash as placeholder since we can't access the original)
const PHOTO_URL = "https://martin.govern-ai.ca/about/";

const timeline = [
  { year: "2007", title: "B.A. in Literary Studies", desc: "Université Laval — textual analysis and interpretive method." },
  { year: "2009", title: "M.A. in Literary Studies", desc: "Université Laval — symbolic and archetypal representation in narrative forms." },
  { year: "2010–2017", title: "Research and Teaching Assistant", desc: "UQAM — sociology, sexology, and religious studies." },
  { year: "2017", title: "PhD in Religious Sciences", desc: "UQAM — queer ritual negotiations in Montreal neopagan communities." },
  { year: "2019–2021", title: "National Film Board of Canada", desc: "Preservation workflows, archival control, classification, and retrieval discipline." },
  { year: "2022", title: "Lead Quality Evaluator", desc: "AI-assisted customer service systems — escalation quality and judgment consistency." },
  { year: "2023–2025", title: "Clinical and Academic Research Coordination", desc: "Clinique médicale L'Actuel — research-support and documentation workflows." },
  { year: "2025–2026", title: "Clinical Trial Coordination and Governance Practice", desc: "High-compliance trial operations integrated with governance design and risk framing." },
];

const interests = [
  "AI governance, accountability design, and decision traceability",
  "Legitimacy, authority, and institutional narrative",
  "Digital culture, platform ritual, and symbolic systems",
  "Queer theory, gender, and category critique",
  "Media interpretation, rhetoric, and public persuasion",
  "Method design for recursive and cross-domain analysis",
];

function AnimatedItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="about"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        background: "oklch(0.13 0.012 255)",
      }}
    >
      <div className="section-shell">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "4rem",
            alignItems: "start",
          }}
          className="lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          {/* Left: Bio + Timeline */}
          <div>
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55 }}
            >
              <p className="eyebrow">About</p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  color: "oklch(0.91 0.008 65)",
                  marginTop: "1rem",
                  lineHeight: 1.15,
                }}
              >
                A scholar's method applied to institutional reality.
              </h2>
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  maxWidth: "40rem",
                }}
              >
                <p style={{ fontSize: "0.92rem", lineHeight: 1.75, color: "oklch(0.72 0.012 255)" }}>
                  Martin Lepage is a Montreal-based institutional analyst, AI governance strategist, and writer working where institutional design, public meaning, and operational accountability meet.
                </p>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.75, color: "oklch(0.62 0.015 255)" }}>
                  His academic formation spans ritual studies, queer theory, media analysis, digital culture, and contemporary spiritualities. He completed a PhD in Religious Sciences at Université du Québec à Montréal after earlier degrees in literary studies at Université Laval. That trajectory trained close reading, conceptual discipline, and sensitivity to how categories shape what institutions can see.
                </p>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.75, color: "oklch(0.62 0.015 255)" }}>
                  He has also worked in research operations, archives, AI-assisted quality evaluation, and clinical trial coordination. These roles demanded audit-ready documentation, multi-stakeholder judgment under pressure, and defensible decision pathways. The governance practice is grounded in that operational reality, not in abstract policy language alone.
                </p>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.75, color: "oklch(0.62 0.015 255)" }}>
                  The through-line is legitimacy: how authority becomes credible, how systems distribute consequence, and how language can either clarify or conceal responsibility.
                </p>
              </div>
            </motion.div>

            {/* Timeline */}
            <div style={{ marginTop: "3rem" }}>
              <AnimatedItem>
                <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>How the work became this practice</p>
              </AnimatedItem>
              <div style={{ position: "relative" }}>
                {/* Vertical line */}
                <div
                  style={{
                    position: "absolute",
                    left: "4.5rem",
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    background: "linear-gradient(180deg, oklch(0.72 0.09 65 / 30%), oklch(0.72 0.09 65 / 5%))",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {timeline.map((item, i) => (
                    <AnimatedItem key={item.year} delay={i * 0.06}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "5rem 1fr",
                          gap: "1.5rem",
                          paddingBottom: "1.5rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.62rem",
                            fontWeight: 500,
                            color: "oklch(0.72 0.09 65)",
                            letterSpacing: "0.04em",
                            textAlign: "right",
                            paddingTop: "0.15rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.year}
                        </div>
                        <div style={{ position: "relative", paddingLeft: "1.25rem" }}>
                          {/* Dot */}
                          <div
                            style={{
                              position: "absolute",
                              left: "-0.3rem",
                              top: "0.35rem",
                              width: "7px",
                              height: "7px",
                              background: "oklch(0.72 0.09 65)",
                              transform: "rotate(45deg)",
                              flexShrink: 0,
                            }}
                          />
                          <h3
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontWeight: 600,
                              fontSize: "1rem",
                              color: "oklch(0.85 0.008 65)",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.title}
                          </h3>
                          <p
                            style={{
                              marginTop: "0.25rem",
                              fontSize: "0.78rem",
                              lineHeight: 1.6,
                              color: "oklch(0.52 0.015 255)",
                            }}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interests + Links */}
          <div>
            <AnimatedItem delay={0.2}>
              <div className="veil-panel">
                <p className="eyebrow">Research & Practice Interests</p>
                <ul
                  style={{
                    marginTop: "1.25rem",
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0",
                  }}
                >
                  {interests.map((interest, i) => (
                    <li
                      key={interest}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.625rem",
                        borderTop: "1px solid oklch(1 0 0 / 8%)",
                        paddingTop: "0.75rem",
                        paddingBottom: "0.75rem",
                        fontSize: "0.82rem",
                        lineHeight: 1.5,
                        color: "oklch(0.65 0.015 255)",
                      }}
                    >
                      <span className="diamond" style={{ marginTop: "0.35rem", flexShrink: 0 }} />
                      {interest}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={0.3}>
              <div className="veil-panel" style={{ marginTop: "1rem" }}>
                <p className="eyebrow">Current Focus</p>
                <p
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "0.85rem",
                    lineHeight: 1.65,
                    color: "oklch(0.62 0.015 255)",
                  }}
                >
                  Institutional analysis, AI governance systems, public writing, and autodidact app development for decision traceability and documentation workflows.
                </p>
                <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <a href="https://martin.govern-ai.ca/governance/" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    Start with governance practice
                  </a>
                  <a href="https://martin.govern-ai.ca/papers/" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    Read publications
                  </a>
                  <a href="https://martin.govern-ai.ca/resume/" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center", fontSize: "0.72rem" }}>
                    Open resume and CV
                  </a>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={0.4}>
              <div className="veil-panel" style={{ marginTop: "1rem" }}>
                <p className="eyebrow">Elsewhere</p>
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    { label: "LinkedIn", href: "https://linkedin.com/in/martin-lepage-ai" },
                    { label: "GitHub", href: "https://github.com/martinlepage26-bit/" },
                    { label: "Academia.edu", href: "https://independent.academia.edu/MartinLepage2" },
                    { label: "ORCID", href: "https://orcid.org/0009-0006-4320-6254" },
                    { label: "HEXA (Substack)", href: "https://substack.com/@hexadecimalproject" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid oklch(1 0 0 / 6%)",
                        fontSize: "0.82rem",
                        color: "oklch(0.65 0.015 255)",
                        textDecoration: "none",
                        transition: "color 200ms",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.72 0.09 65)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.65 0.015 255)")}
                    >
                      {link.label}
                      <span style={{ fontSize: "0.65rem", opacity: 0.5 }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>
    </section>
  );
}
