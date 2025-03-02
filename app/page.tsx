import { MultiFormSystem } from '@/components/multi-form-system'
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="container mx-auto p-4 bg-background text-foreground min-h-screen">
        <MultiFormSystem />
      </main>
    </ThemeProvider>
  )
}