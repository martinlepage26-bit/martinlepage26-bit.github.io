/* InstitutionalSection — Dark Governance design
   Stats cards + 4 methods grid */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { number: "4", label: "Governance records", desc: "Operational governance structures with explicit decision-rights and control logic." },
  { number: "16", label: "Publication records", desc: "Published research records with bounded claims and source visibility." },
  { number: "5", label: "Writing records", desc: "Public argument and institutional interpretation in accessible, reviewable form." },
];

const methods = [
  {
    id: "01",
    title: "Claim boundary discipline",
    desc: "Separate verified evidence, structured inference, and unresolved uncertainty.",
  },
  {
    id: "02",
    title: "Relational analysis",
    desc: "Read technical systems together with policy language and institutional constraints.",
  },
  {
    id: "03",
    title: "Escalation mapping",
    desc: "Define accountability transfer points before high-pressure decisions are required.",
  },
  {
    id: "04",
    title: "Consequence tracing",
    desc: "Track who bears costs when governance categories and controls fail.",
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

export default function InstitutionalSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="analysis"
      style={{
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        background: "oklch(0.13 0.012 255)",
      }}
    >
      <div className="section-shell">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <p className="eyebrow">Institutional Framing</p>
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
            Research architecture for governance decisions that must hold under scrutiny.
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
            The work follows an institutional-research logic: bounded claims, explicit method, traceable evidence, and selective routes for high-consequence readers.
          </p>
        </motion.div>

        {/* Stats */}
        <div
          style={{
            marginTop: "2.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {stats.map((stat, i) => (
            <AnimatedCard key={stat.label} delay={i * 0.1}>
              <div className="gov-card">
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    fontSize: "2.8rem",
                    color: "oklch(0.72 0.09 65)",
                    lineHeight: 1,
                  }}
                >
                  {stat.number}
                </div>
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "oklch(0.85 0.008 65)",
                  }}
                >
                  {stat.label}
                </div>
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.8rem",
                    lineHeight: 1.6,
                    color: "oklch(0.55 0.015 255)",
                  }}
                >
                  {stat.desc}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Copper divider */}
        <div className="copper-line" style={{ margin: "3rem 0" }} />

        {/* Methods */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {methods.map((method, i) => (
            <AnimatedCard key={method.id} delay={i * 0.08}>
              <div className="gov-card" style={{ height: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.6rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "oklch(0.72 0.09 65)",
                    }}
                  >
                    Method {method.id}
                  </span>
                  <span className="diamond" style={{ width: "5px", height: "5px" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    color: "oklch(0.88 0.008 65)",
                    lineHeight: 1.25,
                  }}
                >
                  {method.title}
                </h3>
                <p
                  style={{
                    marginTop: "0.625rem",
                    fontSize: "0.8rem",
                    lineHeight: 1.65,
                    color: "oklch(0.55 0.015 255)",
                  }}
                >
                  {method.desc}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
