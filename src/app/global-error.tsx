"use client";

import Link from "next/link";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f0e8",
          fontFamily: "Jost, system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            width: "100%",
            background: "#fffdf8",
            borderRadius: "16px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(61, 43, 31, 0.08)",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              background: "#e8dcc8",
              margin: "0 auto 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              color: "#d4731a",
            }}
          >
            !
          </div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontWeight: 600,
              color: "#3f5123",
              fontSize: "1.5rem",
              margin: "0 0 0.5rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontWeight: 300,
              color: "rgba(61, 43, 31, 0.6)",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              margin: "0 0 2rem",
            }}
          >
            A critical error occurred. Please try again or return to the home page.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                border: "none",
                background: "#d4731a",
                color: "#fffdf8",
                fontFamily: "Jost, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <Link
              href="/"
              style={{
                display: "block",
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                border: "1px solid rgba(61, 43, 31, 0.15)",
                background: "transparent",
                color: "#3d2b1f",
                fontFamily: "Jost, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
