/* Footer — Dark Governance design */

import { ExternalLink } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "Institutional Analysis", href: "https://martin.govern-ai.ca/papers/" },
    { label: "AI Governance", href: "https://martin.govern-ai.ca/governance/" },
    { label: "Public Writing", href: "https://martin.govern-ai.ca/writing/" },
    { label: "Apps", href: "https://martin.govern-ai.ca/projects/" },
    { label: "Talks", href: "https://martin.govern-ai.ca/talks/" },
    { label: "About", href: "https://martin.govern-ai.ca/about/" },
    { label: "Resume and CV", href: "https://martin.govern-ai.ca/resume/" },
  ],
  elsewhere: [
    { label: "martinlepage.ai@gmail.com", href: "mailto:martinlepage.ai@gmail.com" },
    { label: "LinkedIn", href: "https://linkedin.com/in/martin-lepage-ai" },
    { label: "GitHub", href: "https://github.com/martinlepage26-bit/" },
    { label: "ORCID", href: "https://orcid.org/0009-0006-4320-6254" },
    { label: "Academia.edu", href: "https://independent.academia.edu/MartinLepage2" },
    { label: "HEXA", href: "https://substack.com/@hexadecimalproject" },
  ],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "oklch(0.09 0.01 255)",
        borderTop: "1px solid oklch(1 0 0 / 8%)",
      }}
    >
      <div className="section-shell" style={{ paddingTop: "3rem", paddingBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2.5rem",
          }}
          className="lg:grid-cols-[1fr_auto_auto]"
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  background: "linear-gradient(145deg, oklch(0.22 0.018 255), oklch(0.15 0.012 255))",
                  border: "1px solid oklch(0.72 0.09 65 / 30%)",
                  borderRadius: "0.375rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "oklch(0.72 0.09 65)",
                  }}
                >
                  ML
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "oklch(0.85 0.008 65)",
                  }}
                >
                  Martin Lepage, PhD
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.55rem",
                    color: "oklch(0.45 0.015 255)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Governance · Analysis · Writing
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                lineHeight: 1.65,
                color: "oklch(0.45 0.015 255)",
                maxWidth: "22rem",
              }}
            >
              The site links governance practice, publications, writing, and talks as one continuous record of how institutions make claims, justify decisions, and distribute consequence.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="https://martin.govern-ai.ca/contact/" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize: "0.68rem", padding: "0.45rem 0.875rem" }}>
                Start a conversation
              </a>
              <a href="https://martin.govern-ai.ca/governance/" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "0.68rem", padding: "0.45rem 0.875rem" }}>
                Open governance practice
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "oklch(0.72 0.09 65)",
                marginBottom: "1rem",
              }}
            >
              Explore
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.8rem",
                      color: "oklch(0.52 0.015 255)",
                      textDecoration: "none",
                      transition: "color 200ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.75 0.015 65)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.52 0.015 255)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Elsewhere */}
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.6rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "oklch(0.72 0.09 65)",
                marginBottom: "1rem",
              }}
            >
              Elsewhere
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {footerLinks.elsewhere.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.8rem",
                      color: "oklch(0.52 0.015 255)",
                      textDecoration: "none",
                      transition: "color 200ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.75 0.015 65)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.52 0.015 255)")}
                  >
                    {link.label}
                    {!link.href.startsWith("mailto:") && <ExternalLink size={9} style={{ opacity: 0.5 }} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid oklch(1 0 0 / 6%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.62rem",
              color: "oklch(0.38 0.012 255)",
              letterSpacing: "0.04em",
            }}
          >
            © 2026 Martin Lepage, PhD. Montreal-based governance, research, and writing.
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.6rem",
              color: "oklch(0.38 0.012 255)",
              letterSpacing: "0.06em",
              fontStyle: "italic",
            }}
          >
            Precise claims. Reviewable method. Serious collaboration.
          </span>
        </div>
      </div>
    </footer>
  );
}
