/* HeroSection — Dark Governance design
   Asymmetric layout: copy left (60%), sidebar right (40%)
   Background: generated hero image with overlay */

import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663476813471/hqNg7wPGV6AtcQN7HWroT7/hero-bg-XxXP9t9UAiWxYBNwU7fkN6.webp";

const apps = [
  { name: "LOTUS", href: "https://martin.govern-ai.ca/lotus/" },
  { name: "ECHO", href: "https://martin.govern-ai.ca/echo/" },
  { name: "SCRIPTO", href: "https://martin.govern-ai.ca/scripto/" },
  { name: "GAIA", href: "https://martin.govern-ai.ca/gaia/" },
  { name: "Dr.Sort", href: "https://martin.govern-ai.ca/dr-sort/" },
];

const routes = [
  { label: "Full paper list & research genealogies", href: "https://martin.govern-ai.ca/papers/" },
  { label: "Governance practice", href: "https://martin.govern-ai.ca/governance/" },
  { label: "Public writing & books", href: "https://martin.govern-ai.ca/writing/" },
  { label: "Five public app surfaces", href: "https://martin.govern-ai.ca/projects/" },
];

const facts = [
  "24 paper records across ritual, media, and governance lines",
  "16 published articles, chapters, reviews, editorials, and dissertation records",
  "5 public apps shaped by workflow pressure",
  "English and French research and public writing",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid oklch(1 0 0 / 8%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background image with overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
        opacity: 0.35,
          zIndex: 0,
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, oklch(0.11 0.012 255 / 60%) 0%, oklch(0.11 0.012 255 / 40%) 50%, oklch(0.11 0.012 255 / 55%) 100%)",
          zIndex: 1,
        }}
      />
      {/* Subtle grid lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `
            linear-gradient(oklch(1 0 0 / 1%) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 1%) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="section-shell relative" style={{ zIndex: 2, paddingTop: "8rem", paddingBottom: "5rem", width: "100%", position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            alignItems: "start",
          }}
          className="lg:grid-cols-[minmax(0,1.15fr)_22rem]"
        >
          {/* Left: Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p variants={itemVariants} className="eyebrow">
              Martin Lepage
            </motion.p>

            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                lineHeight: 1.02,
                color: "oklch(0.96 0.008 65)",
                marginTop: "1.25rem",
                maxWidth: "46rem",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 8px oklch(0 0 0 / 40%)",
              }}
            >
              Institutional analysis.{" "}
              <span style={{ color: "oklch(0.72 0.09 65)", fontStyle: "italic" }}>
                AI governance.
              </span>{" "}
              Public writing.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              style={{
                marginTop: "1.5rem",
                maxWidth: "38rem",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "oklch(0.75 0.012 255)",
              }}
            >
              Martin Lepage reads institutions, ritual worlds, media objects, and decision systems for legitimacy,
              failure points, and consequence, then turns that reading into governance design, paper records, and
              public writing.
            </motion.p>

            <motion.p
              variants={itemVariants}
              style={{
                marginTop: "1rem",
                maxWidth: "38rem",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                color: "oklch(0.58 0.018 255)",
              }}
            >
              The site keeps the fuller paper line in view, names the research genealogies that connect queer ritual
              studies to media analysis and recursive governance, and gives each of the five public apps a distinct
              role.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
            >
              <a href="https://martin.govern-ai.ca/papers/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Open full paper list
                <ArrowRight size={14} />
              </a>
              <a href="https://martin.govern-ai.ca/projects/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Browse the five apps
              </a>
            </motion.div>

            {/* App quick links */}
            <motion.div
              variants={itemVariants}
              style={{ marginTop: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
            >
              {apps.map((app) => (
                <a
                  key={app.name}
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-tag"
                >
                  {app.name}
                </a>
              ))}
            </motion.div>

            {/* Bullet facts */}
            <motion.ul
              variants={itemVariants}
              style={{
                marginTop: "2rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem 2rem",
                listStyle: "none",
                padding: 0,
                maxWidth: "38rem",
              }}
              className="sm:grid-cols-2 grid-cols-1"
            >
              {facts.map((fact) => (
                <li
                  key={fact}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    fontSize: "0.8rem",
                    color: "oklch(0.62 0.015 255)",
                    lineHeight: 1.5,
                  }}
                >
                  <span className="diamond" style={{ marginTop: "0.35rem" }} />
                  {fact}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right: Veil panel */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="veil-panel"
            style={{ marginTop: "0" }}
          >
            <p className="eyebrow">Start Here</p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "1.3rem",
                color: "oklch(0.91 0.008 65)",
                marginTop: "1rem",
                lineHeight: 1.3,
              }}
            >
              Choose an entry point.
            </h2>
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.85rem",
                lineHeight: 1.65,
                color: "oklch(0.62 0.015 255)",
              }}
            >
              Different routes for governance partners, researchers, editors, and first-time readers.
            </p>
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
              {routes.map((route, i) => (
                <li
                  key={route.label}
                  style={{
                    borderTop: "1px solid oklch(1 0 0 / 8%)",
                    paddingTop: i === 0 ? "0.75rem" : "0.75rem",
                    paddingBottom: "0.75rem",
                  }}
                >
                  <a
                    href={route.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      color: "oklch(0.72 0.015 255)",
                      textDecoration: "none",
                      transition: "color 200ms",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.72 0.09 65)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.72 0.015 255)")}
                  >
                    {route.label}
                    <ExternalLink size={11} style={{ flexShrink: 0, opacity: 0.5 }} />
                  </a>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
