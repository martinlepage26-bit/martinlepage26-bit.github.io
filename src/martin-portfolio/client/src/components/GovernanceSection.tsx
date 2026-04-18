/* GovernanceSection — Dark Governance design
   Practice areas + selected governance projects */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink } from "lucide-react";

const GOVERNANCE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663476813471/hqNg7wPGV6AtcQN7HWroT7/governance-architecture-HsGX3GpWvmGv6Dt66xBT9Y.webp";

const practiceAreas = [
  {
    title: "Governance architecture and decision rights",
    desc: "Map who decides what, on what grounds, and under which escalation rules so authority remains explicit rather than assumed.",
  },
  {
    title: "Evidence design and traceability",
    desc: "Structure records, approvals, and source chains so consequential claims can be inspected, challenged, and defended.",
  },
  {
    title: "Policy translation into operations",
    desc: "Turn standards and principles into concrete procedures teams can execute under deadline without losing accountability.",
  },
  {
    title: "Strategic interpretation and public clarity",
    desc: "Produce briefs, essays, and explanatory texts that connect governance choices to institutional legitimacy and social consequence.",
  },
];

const projects = [
  {
    status: "App in Development",
    year: "2026",
    title: "CompassAI",
    subtitle: "Governance intake and review app in development",
    role: "Creator",
    desc: "A governance intake, assessment, and output generation app in development built around directional clarity, structured review, and decision support.",
    href: "https://martin.govern-ai.ca/projects/compassai-governance-engine/",
  },
  {
    status: "Active Governance Framework Project",
    year: "2026",
    title: "AI Governance Constitutional Framework",
    subtitle: "Oversight Infrastructure and Constraint Design",
    role: "Governance analyst, writer, and builder",
    desc: "A governance project focused on making AI use legible, reviewable, and defensible through documentation, decision pathways, and accountability design.",
    href: "https://martin.govern-ai.ca/projects/ai-governance/",
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

export default function GovernanceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="governance"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        background: "oklch(0.11 0.012 255)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "45%",
        backgroundImage: `url(${GOVERNANCE_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.18,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, oklch(0.11 0.012 255 / 70%) 0%, oklch(0.11 0.012 255 / 40%) 30%, transparent 100%)",
          zIndex: 1,
        }}
      />

      <div className="section-shell" style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "4rem",
          }}
          className="lg:grid-cols-2"
        >
          {/* Left: Practice areas */}
          <div>
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55 }}
            >
              <p className="eyebrow">Governance / Advisory</p>
              <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                color: "oklch(0.93 0.008 65)",
                marginTop: "1rem",
                lineHeight: 1.15,
                textShadow: "0 2px 6px oklch(0 0 0 / 30%)",
              }}
              >
                Governance as power made operational.
              </h2>
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "oklch(0.58 0.018 255)",
                }}
              >
                Decision rights, evidence pathways, and accountability controls that stay legible under audit, procurement, and public challenge.
              </p>
            </motion.div>

            <div
              style={{
                marginTop: "2rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {practiceAreas.map((area, i) => (
                <AnimatedCard key={area.title} delay={i * 0.1}>
                  <div
                    className="gov-card"
                    style={{ height: "100%" }}
                  >
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
                      Practice Area
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: "oklch(0.85 0.008 65)",
                        lineHeight: 1.3,
                      }}
                    >
                      {area.title}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.75rem",
                        lineHeight: 1.6,
                        color: "oklch(0.52 0.015 255)",
                      }}
                    >
                      {area.desc}
                    </p>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            <AnimatedCard delay={0.4}>
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a href="https://martin.govern-ai.ca/governance/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Open Governance Practice
                </a>
                <a href="https://martin.govern-ai.ca/contact/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Discuss an Engagement
                </a>
              </div>
            </AnimatedCard>
          </div>

          {/* Right: Selected projects */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <p className="eyebrow">Selected Governance Work</p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)",
                  color: "oklch(0.91 0.008 65)",
                  marginTop: "1rem",
                  lineHeight: 1.2,
                }}
              >
                Evidence before slogans.
              </h2>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  color: "oklch(0.58 0.018 255)",
                }}
              >
                Working structures: readable, testable, contestable.
              </p>
            </motion.div>

            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {projects.map((project, i) => (
                <AnimatedCard key={project.title} delay={0.3 + i * 0.12}>
                  <div
                    className="gov-card"
                    style={{
                      borderLeft: "2px solid oklch(0.72 0.09 65 / 40%)",
                      paddingLeft: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                      <span className="status-active">{project.status}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.6rem",
                          color: "oklch(0.52 0.015 255)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {project.year}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontSize: "1.2rem",
                        color: "oklch(0.88 0.008 65)",
                        lineHeight: 1.25,
                      }}
                    >
                      {project.title}
                    </h3>
                    <p
                      style={{
                        marginTop: "0.25rem",
                        fontSize: "0.75rem",
                        color: "oklch(0.62 0.09 65)",
                        fontStyle: "italic",
                      }}
                    >
                      {project.subtitle}
                    </p>
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.75rem",
                        color: "oklch(0.52 0.015 255)",
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {project.role}
                    </p>
                    <p
                      style={{
                        marginTop: "0.625rem",
                        fontSize: "0.8rem",
                        lineHeight: 1.65,
                        color: "oklch(0.58 0.015 255)",
                      }}
                    >
                      {project.desc}
                    </p>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        marginTop: "1rem",
                        fontSize: "0.72rem",
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
                      View project <ExternalLink size={11} />
                    </a>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
