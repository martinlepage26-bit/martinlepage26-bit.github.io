/* Navigation — Dark Governance design
   Sticky header with blur, copper accents, mobile drawer */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Analysis", href: "#analysis" },
  { label: "Governance", href: "#governance" },
  { label: "Papers", href: "#papers" },
  { label: "Apps", href: "#apps" },
  { label: "Talks", href: "#talks" },
  { label: "About", href: "#about" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "oklch(0.11 0.012 255 / 92%)"
            : "oklch(0.11 0.012 255 / 70%)",
          backdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid oklch(1 0 0 / 8%)"
            : "1px solid transparent",
        }}
      >
        <div className="section-shell py-0 flex items-center justify-between" style={{ paddingTop: "0.875rem", paddingBottom: "0.875rem" }}>
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-3 group"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                background: "linear-gradient(145deg, oklch(0.22 0.018 255), oklch(0.15 0.012 255))",
                border: "1px solid oklch(0.72 0.09 65 / 30%)",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 16px oklch(0 0 0 / 40%)",
                transition: "border-color 300ms",
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "oklch(0.72 0.09 65)",
                  letterSpacing: "-0.02em",
                }}
              >
                ML
              </span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "oklch(0.91 0.008 65)",
                  letterSpacing: "0.01em",
                }}
              >
                Martin Lepage, PhD
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.55rem",
                  fontWeight: 400,
                  color: "oklch(0.58 0.018 255)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Governance · Analysis · Writing
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.375rem 0.625rem",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "oklch(0.65 0.015 255)",
                  cursor: "pointer",
                  transition: "color 200ms",
                  borderBottom: "2px solid transparent",
                  borderRadius: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.72 0.09 65)";
                  (e.currentTarget as HTMLButtonElement).style.borderBottomColor = "oklch(0.72 0.09 65 / 50%)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.65 0.015 255)";
                  (e.currentTarget as HTMLButtonElement).style.borderBottomColor = "transparent";
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-primary hidden sm:inline-flex"
              style={{ fontSize: "0.7rem", padding: "0.5rem 1rem" }}
            >
              Contact
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden flex items-center justify-center"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                background: "oklch(0.19 0.012 255)",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: "0.375rem",
                color: "oklch(0.75 0.015 65)",
                cursor: "pointer",
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[3.75rem] left-4 right-4 z-40 xl:hidden"
            style={{
              background: "oklch(0.15 0.012 255 / 96%)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 48px oklch(0 0 0 / 50%)",
            }}
          >
            <nav className="grid gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleNavClick(link.href)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "oklch(0.75 0.015 65)",
                    cursor: "pointer",
                    borderRadius: "0.375rem",
                    transition: "background 150ms, color 150ms",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.19 0.012 255)";
                    (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.72 0.09 65)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "none";
                    (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.75 0.015 65)";
                  }}
                >
                  {link.label}
                </motion.button>
              ))}
              <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", marginTop: "0.5rem", paddingTop: "0.75rem" }}>
                <button
                  onClick={() => handleNavClick("#contact")}
                  className="btn-primary w-full justify-center"
                  style={{ fontSize: "0.75rem" }}
                >
                  Contact
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
