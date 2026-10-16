import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // var(--font-sans) / var(--font-heading) are set by next/font in
        // app/layout.tsx (self-hosted Source Sans 3 + Lato).
        sans: [
          "var(--font-sans)",
          '"Source Sans Pro"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        // Newsreader (display serif) — headings, numbers, pull quotes. The
        // film "Full Circle" uses the same editorial serif with gold italics.
        heading: [
          "var(--font-heading)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "serif",
        ],
        display: [
          "var(--font-heading)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      boxShadow: {
        soft: "0 24px 60px -32px rgba(11, 42, 33, 0.35)",
        lift: "0 32px 80px -36px rgba(11, 42, 33, 0.45)",
        glow: "0 0 0 1px rgba(155, 230, 205, 0.18), 0 18px 60px -24px rgba(63, 191, 152, 0.45)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // "Rooted" palette — see docs/design-system.md.
        evergreen: {
          50: "#EEF5F1",
          100: "#D7E8DF",
          200: "#B0D1C1",
          300: "#7FB39C",
          400: "#4F8F75",
          500: "#2F6F57",
          600: "#1F5A45",
          700: "#164838",
          800: "#10382C",
          900: "#0B2A21",
          950: "#061A14",
        },
        cream: {
          50: "#FDFBF7",
          100: "#F8F4EC",
          200: "#EFE8DA",
          300: "#E3D9C4",
          400: "#CFC0A2",
        },
        gold: {
          200: "#F3E0B0",
          300: "#EBCB83",
          400: "#E0B65E",
          500: "#C99A3E",
          600: "#A87C2A",
          700: "#7F5C1C",
        },
        mint: {
          200: "#C9F2E4",
          300: "#9BE6CD",
          400: "#6FD6B5",
          500: "#3FBF98",
        },
        ink: {
          DEFAULT: "#14231D",
          soft: "#3B4A43",
          muted: "#5C6A63",
        },
        pumpkin: {
          300: "#FFB473",
          400: "#FF9440",
          500: "#F2761F",
          600: "#D45F10",
        },
        candle: "#FFD98A",
        night: "#140F1F",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
