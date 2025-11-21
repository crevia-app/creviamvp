import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-4">
      <Label>Theme Preference</Label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={theme === value ? "default" : "outline"}
            className={`h-20 flex-col gap-2 ${
              theme === value 
                ? "bg-bronze hover:bg-bronze-dark text-white" 
                : "hover:border-bronze"
            }`}
            onClick={() => setTheme(value)}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Current theme: <span className="font-medium capitalize">{theme}</span>
      </p>
    </div>
  );
}
