// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "#251b52",  // Fondo en modo claro
          dark: "#818CF8",      // Fondo en modo oscuro
        },
        foreground: "#ffffff",  // Color de las letras: blanco para un contraste óptimo
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        vibrant: {
          primary: "#3B82F6",   // Blue 500
          secondary: "#6366F1", // Indigo 500
          accent: "#818CF8",    // Indigo 400
          warning: "#93C5FD",   // Blue 300
          error: "#4338CA",     // Indigo 700
        },
        
        // Colores personalizados para estados utilizando la paleta Blue e Indigo:
        status: {
          rechazado: "#EEF2FF",       // Indigo 50: pastel para 'Rechazado' en modo claro
          rechazadoDark: "#312E81",   // Indigo 900: tono profundo para 'Rechazado' en modo oscuro
          enBusqueda: "#EFF6FF",      // Blue 50: pastel para 'En Búsqueda' en modo claro
          enBusquedaDark: "#1E3A8A",  // Blue 900: tono intenso para 'En Búsqueda' en modo oscuro
          pendiente: "#E0E7FF",       // Indigo 100: suave para 'Pendiente' en modo claro
          pendienteDark: "#3730A3",   // Indigo 800: tono sólido para 'Pendiente' en modo oscuro
          finalizado: "#DBEAFE",      // Blue 100: sutil para 'Finalizado' en modo claro
          finalizadoDark: "#1E40AF",  // Blue 800: robusto para 'Finalizado' en modo oscuro
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        "soft-xl": "0 20px 27px 0 rgba(0, 0, 0, 0.05)",
        "soft-md": "0 4px 7px -1px rgba(0, 0, 0, 0.11), 0 2px 4px -1px rgba(0, 0, 0, 0.07)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
