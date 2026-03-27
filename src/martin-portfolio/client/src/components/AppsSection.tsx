/* AppsSection — Dark Governance design
   5 apps with cards and descriptions */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink } from "lucide-react";

const APPS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663476813471/hqNg7wPGV6AtcQN7HWroT7/digital-tools-ZVCR7JNm79DgsjM2555wue.webp";

const apps = [
  {
    name: "LOTUS",
    tagline: "Document analysis and governance annotation",
    desc: "A governance-focused document analysis tool for annotating, tagging, and structuring institutional records with traceability.",
    href: "https://martin.govern-ai.ca/lotus/",
    tag: "Document Analysis",
  },
  {
    name: "ECHO",
    tagline: "Institutional voice and response drafting",
    desc: "A drafting assistant for institutional communications that maintains tone consistency and accountability framing across documents.",
    href: "https://martin.govern-ai.ca/echo/",
    tag: "Writing Tool",
  },
  {
    name: "SCRIPTO",
    tagline: "Editorial workflow and manuscript management",
    desc: "A manuscript management interface for editorial workflows, revision tracking, and publication-ready document preparation.",
    href: "https://martin.govern-ai.ca/scripto/",
    tag: "Editorial",
  },
  {
    name: "GAIA",
    tagline: "Governance architecture and decision mapping",
    desc: "A decision mapping tool for governance architecture work — visualizing authority chains, escalation logic, and accountability pathways.",
    href: "https://martin.govern-ai.ca/gaia/",
    tag: "Governance",
  },
  {
    name: "Dr.Sort",
    tagline: "Research classification and evidence sorting",
    desc: "A research classification interface for sorting, tagging, and organizing evidence records for governance and institutional analysis work.",
    href: "https://martin.govern-ai.ca/dr-sort/",
    tag: "Research",
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

export default function AppsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="apps"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        background: "oklch(0.11 0.012 255)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "50%",
        backgroundImage: `url(${APPS_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.16,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, oklch(0.11 0.012 255 / 70%) 0%, oklch(0.11 0.012 255 / 40%) 25%, transparent 100%)",
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
          <p className="eyebrow">Autodidact Apps</p>
          <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                color: "oklch(0.93 0.008 65)",
                marginTop: "1rem",
                maxWidth: "36rem",
                lineHeight: 1.15,
                textShadow: "0 2px 6px oklch(0 0 0 / 30%)",
              }}
          >
            Governance and writing tools built in practice.
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
            Self-built applications and method interfaces developed to support governance work, documentation, and interpretive workflows under real institutional pressure.
          </p>
        </motion.div>

        <div
          style={{
            marginTop: "2.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {apps.map((app, i) => (
            <AnimatedCard key={app.name} delay={i * 0.08}>
              <div
                className="gov-card"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: "oklch(0.72 0.09 65)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {app.name}
                    </div>
                    <span className="tag-badge" style={{ marginTop: "0.35rem", display: "inline-flex" }}>
                      {app.tag}
                    </span>
                  </div>
                  <a
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2rem",
                      height: "2rem",
                      background: "oklch(0.72 0.09 65 / 10%)",
                      border: "1px solid oklch(0.72 0.09 65 / 25%)",
                      borderRadius: "0.375rem",
                      color: "oklch(0.72 0.09 65)",
                      textDecoration: "none",
                      flexShrink: 0,
                      transition: "background 200ms, border-color 200ms",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "oklch(0.72 0.09 65 / 20%)";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "oklch(0.72 0.09 65 / 50%)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "oklch(0.72 0.09 65 / 10%)";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "oklch(0.72 0.09 65 / 25%)";
                    }}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>

                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "oklch(0.75 0.012 255)",
                    lineHeight: 1.4,
                    marginBottom: "0.5rem",
                    fontStyle: "italic",
                  }}
                >
                  {app.tagline}
                </p>

                <p
                  style={{
                    fontSize: "0.78rem",
                    lineHeight: 1.65,
                    color: "oklch(0.52 0.015 255)",
                    flex: 1,
                  }}
                >
                  {app.desc}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <AnimatedCard delay={0.5}>
          <div style={{ marginTop: "2rem" }}>
            <a href="https://martin.govern-ai.ca/projects/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Browse all projects <ExternalLink size={12} />
            </a>
          </div>
        </AnimatedCard>
      </div>
    </section>
  );
}
