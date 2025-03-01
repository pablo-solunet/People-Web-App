// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
          primary: "#3B82F6",
          secondary: "#10B981",
          accent: "#8B5CF6",
          warning: "#FBBF24",
          error: "#EF4444",
        },
        
        // Aquí se definen los colores personalizados para los estados:
        status : {
          rechazado: "#fee2e2",       // fondo rojo pastel para 'Rechazado' en modo claro
          rechazadoDark: "#8a2a2a",   // fondo rojo oscuro y atenuado para 'Rechazado' en modo oscuro
          enBusqueda: "#FDE68A",      // fondo azul pastel para 'En Búsqueda' en modo claro
          enBusquedaDark: "#D97706",   // tono azul atenuado para 'En Búsqueda' en modo oscuro
          pendiente: "#fce7f3",        // fondo rosa pastel para 'Pendiente' en modo claro
          pendienteDark: "#a66e8f",   // tono rosa oscuro y atenuado para 'Pendiente' en modo oscuro
          finalizado: "#d1fae5",       // fondo verde pastel para 'Finalizado' en modo claro
          finalizadoDark: "#2f855a",   // tono verde atenuado para 'Finalizado' en modo oscuro
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
