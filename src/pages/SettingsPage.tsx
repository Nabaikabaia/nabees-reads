import { useSettings } from "@/hooks/useSettings";
import { Moon, Sun, Type, AlignLeft, ArrowLeftRight, ArrowUpDown, Check, Monitor } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const FONT_OPTIONS = [
  { value: "serif" as const, label: "Serif", sample: "Merriweather", className: "font-reading" },
  { value: "sans" as const, label: "Sans-serif", sample: "Inter", className: "font-sans" },
  { value: "mono" as const, label: "Monospace", sample: "JetBrains Mono", className: "font-mono" },
];

const FONT_SIZES = [14, 16, 18, 20, 22, 24];

const THEME_OPTIONS = [
  { value: "auto" as const, label: "Auto", icon: Monitor },
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
];

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold">Settings</h1>

        {/* Theme */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Appearance
          </h2>
          <p className="text-xs text-muted-foreground -mt-2">
            Auto follows your device's system theme.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSettings({ themeMode: value })}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                  settings.themeMode === value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{label}</span>
                {settings.themeMode === value && (
                  <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Font Family */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Reading Font
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {FONT_OPTIONS.map((f) => (
              <motion.button
                key={f.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSettings({ fontFamily: f.value })}
                className={`relative rounded-xl border-2 p-4 text-center transition-colors ${
                  settings.fontFamily === f.value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <span className={`block text-lg mb-1 ${f.className}`}>Aa</span>
                <span className="text-xs text-muted-foreground">{f.label}</span>
                {settings.fontFamily === f.value && (
                  <Check className="h-4 w-4 text-primary absolute top-2 right-2" />
                )}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Font Size */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlignLeft className="h-5 w-5 text-primary" />
            Font Size
          </h2>
          <div className="flex flex-wrap gap-2">
            {FONT_SIZES.map((size) => (
              <motion.button
                key={size}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettings({ fontSize: size })}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  settings.fontSize === size
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                {size}px
              </motion.button>
            ))}
          </div>
          <div
            className="rounded-xl border border-border bg-card p-4 font-reading leading-relaxed"
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            The quick brown fox jumps over the lazy dog. This is a preview of your reading font size.
          </div>
        </section>

        {/* Scroll Direction */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Reader Scroll Direction
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "vertical" as const, label: "Top to Bottom", icon: ArrowUpDown },
              { value: "horizontal" as const, label: "Left to Right", icon: ArrowLeftRight },
            ].map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSettings({ scrollDirection: value })}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                  settings.scrollDirection === value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{label}</span>
                {settings.scrollDirection === value && (
                  <Check className="h-4 w-4 text-primary absolute top-3 right-3" />
                )}
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
