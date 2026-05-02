/* AppsSection — Dark Governance design
   5 apps with cards and descriptions */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink } from "lucide-react";

const APPS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663476813471/hqNg7wPGV6AtcQN7HWroT7/digital-tools-ZVCR7JNm79DgsjM2555wue.webp";

const apps = [
  {
    name: "LOTUS",
    tagline: "Agency scorer and reflective workbench",
    focus: "Notes, vector passes, and signal-library reading",
    desc: "Local-first note scoring and vector analysis for situations where pressure, support, meaning, and room to move need clearer shape. Works after GAIA grounds the baseline.",
    href: "https://martin.govern-ai.ca/lotus/",
    tag: "Agency",
  },
  {
    name: "GAIA",
    tagline: "Grounded gaialogy reading surface",
    focus: "Sign profiles, glossary, and daily modulation",
    desc: "The public app line built from Breath of the Astral Year, translating sign grammar into grounded seasonal and daily readings. It sets the baseline that LOTUS then measures under pressure.",
    href: "https://martin.govern-ai.ca/gaia/",
    tag: "Gaialogy",
  },
  {
    name: "ECHO",
    tagline: "Browser-native draft listening surface",
    focus: "Cadence checks, revision listening, and bilingual playback",
    desc: "A browser-local reading deck for hearing drafts back through system voices, live word tracking, and delivery presets shaped for revision work.",
    href: "https://martin.govern-ai.ca/echo/",
    tag: "Draft listening",
  },
  {
    name: "SCRIPTO",
    tagline: "Deterministic packet builder",
    focus: "Manuscripts, packet logic, and reviewer-pressure checks",
    desc: "Turns topics, archives, and governance problems into bounded writing packets with claim mapping, recursive checks, control extraction, and export.",
    href: "https://martin.govern-ai.ca/scripto/",
    tag: "Packet builder",
  },
  {
    name: "Dr.Sort",
    tagline: "Document triage and review board",
    focus: "Queues, sorting windows, and decision notes",
    desc: "A darker queue-and-cabinet surface for batching document sets, reserving sorting passes, and keeping review accountability visible while the corpus gets organized.",
    href: "https://martin.govern-ai.ca/dr-sort/",
    tag: "Corpus triage",
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
          <p className="eyebrow">Apps / Tools</p>
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
            Five public app surfaces, each with a different job.
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
            LOTUS, ECHO, SCRIPTO, GAIA, and Dr.Sort stay on the Martin surface as distinct tools for agency scoring,
            draft listening, packet building, grounded gaialogy, and corpus triage.
          </p>
        </motion.div>

        <AnimatedCard delay={0.12}>
          <div
            className="veil-panel"
            style={{
              marginTop: "1.5rem",
              border: "1px solid oklch(0.72 0.09 65 / 18%)",
              background: "linear-gradient(180deg, oklch(0.15 0.015 255 / 92%) 0%, oklch(0.11 0.012 255 / 96%) 100%)",
            }}
          >
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", alignItems: "start" }} className="lg:grid-cols-[minmax(0,1.2fr)_auto]">
              <div>
                <p className="eyebrow">Power pair</p>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "clamp(1.25rem, 2.2vw, 1.7rem)",
                    color: "oklch(0.93 0.008 65)",
                    marginTop: "0.8rem",
                    lineHeight: 1.15,
                    maxWidth: "28rem",
                  }}
                >
                  GAIA sets the baseline. LOTUS measures how much of it gets used under pressure.
                </h3>
                <p
                  style={{
                    marginTop: "0.8rem",
                    maxWidth: "44rem",
                    fontSize: "0.88rem",
                    lineHeight: 1.75,
                    color: "oklch(0.62 0.015 255)",
                  }}
                >
                  Read them as one system with two jobs: GAIA grounds the Earth-bond context and available power, then
                  LOTUS asks how that power is deployed, blocked, or recovered when the situation tightens.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: "13rem" }}>
                <a href="https://martin.govern-ai.ca/gaia/" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ justifyContent: "center" }}>
                  Open GAIA
                </a>
                <a href="https://martin.govern-ai.ca/lotus/" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center" }}>
                  Open LOTUS
                </a>
                <a href="https://martin.govern-ai.ca/projects/gaia-lotus/" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ justifyContent: "center" }}>
                  Open shared hub
                </a>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <div
          style={{
            marginTop: "1.75rem",
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

                <div style={{ marginBottom: "0.6rem" }}>
                  <p
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.56rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "oklch(0.72 0.09 65 / 70%)",
                    }}
                  >
                    Built for
                  </p>
                  <p
                    style={{
                      marginTop: "0.25rem",
                      fontSize: "0.73rem",
                      lineHeight: 1.55,
                      color: "oklch(0.68 0.014 255)",
                    }}
                  >
                    {app.focus}
                  </p>
                </div>

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

        <AnimatedCard delay={0.45}>
          <div className="veil-panel" style={{ marginTop: "1.5rem" }}>
            <p className="eyebrow">Surface boundary</p>
            <p
              style={{
                marginTop: "0.8rem",
                maxWidth: "52rem",
                fontSize: "0.84rem",
                lineHeight: 1.7,
                color: "oklch(0.62 0.015 255)",
              }}
            >
              These five live on Martin&apos;s public surface. GAIA grounds the baseline; LOTUS measures deployment.
              PHAROS, COMPASSai, and AurorA remain on the PHAROS surface, so the app family stays legible instead of
              collapsing into one blurred product story.
            </p>
          </div>
        </AnimatedCard>

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
