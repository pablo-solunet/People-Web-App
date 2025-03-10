// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "2rem",
        sm: "1.5rem",  // para pantallas pequeñas
        md: "2rem",
        lg: "2rem",
        xl: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
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
        yellow: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        "yellow-dark": {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        blue: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Paleta Blue para modo oscuro
        "blue-dark": {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Paleta Indigo para modo claro
        indigo: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        // Paleta Indigo para modo oscuro
        "indigo-dark": {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        // Colores personalizados para estados:
        status: {
          rechazado: "#fee2e2",       // fondo rojo pastel para 'Rechazado' en modo claro
          rechazadoDark: "#8a2a2a",    // fondo rojo oscuro y atenuado para 'Rechazado' en modo oscuro
          enBusqueda: "#FDE68A",       // fondo azul pastel para 'En Búsqueda' en modo claro
          enBusquedaDark: "#D97706",   // tono azul atenuado para 'En Búsqueda' en modo oscuro
          pendiente: "#fce7f3",        // fondo rosa pastel para 'Pendiente' en modo claro
          pendienteDark: "#a66e8f",    // tono rosa oscuro y atenuado para 'Pendiente' en modo oscuro
          finalizado: "#d1fae5",       // fondo verde pastel para 'Finalizado' en modo claro
          finalizadoDark: "#2f855a",   // tono verde atenuado para 'Finalizado' en modo oscuro
        },
        // Colores suaves para botones
         button: {
          // Colores para modo claro
          approve: {
            bg: "#d1fae5", // Verde pastel suave
            hover: "#a7f3d0", // Verde pastel más intenso al hover
            text: "#065f46", // Texto verde oscuro para contraste
          },
          reject: {
            bg: "#fee2e2", // Rojo pastel suave
            hover: "#fecaca", // Rojo pastel más intenso al hover
            text: "#7f1d1d", // Texto rojo oscuro para contraste
          },
          search: {
            bg: "#fef3c7", // Amarillo pastel suave
            hover: "#fde68a", // Amarillo pastel más intenso al hover
            text: "#92400e", // Texto ámbar oscuro para contraste
          },
          confirm: {
            bg: "#dbeafe", // Azul pastel suave
            hover: "#bfdbfe", // Azul pastel más intenso al hover
            text: "#1e40af", // Texto azul oscuro para contraste
          },
          // Colores para modo oscuro
          dark: {
            approve: {
              bg: "#065f46", // Verde oscuro suave
              hover: "#047857", // Verde oscuro más intenso al hover
              text: "#ecfdf5", // Texto verde claro para contraste
            },
            reject: {
              bg: "#7f1d1d", // Rojo oscuro suave
              hover: "#991b1b", // Rojo oscuro más intenso al hover
              text: "#fee2e2", // Texto rojo claro para contraste
            },
            search: {
              bg: "#92400e", // Ámbar oscuro suave
              hover: "#b45309", // Ámbar oscuro más intenso al hover
              text: "#fef3c7", // Texto amarillo claro para contraste
            },
            confirm: {
              bg: "#1e40af", // Azul oscuro suave
              hover: "#1e3a8a", // Azul oscuro más intenso al hover
              text: "#dbeafe", // Texto azul claro para contraste
            },
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        // Agregamos un tamaño máximo para los mensajes
        'mensaje': '28rem',  // ajusta este valor según lo que necesites
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
        "soft-md":
          "0 4px 7px -1px rgba(0, 0, 0, 0.11), 0 2px 4px -1px rgba(0, 0, 0, 0.07)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
