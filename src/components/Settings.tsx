
import { MoonIcon, SunIcon, HelpCircleIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTutorial } from "./TutorialProvider";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { setShowTutorial } = useTutorial();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-10 h-10">
          <MoonIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <SunIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-base">Help & Tutorial</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Take an interactive tour of SOCR-QI features and learn how to use the application.
              </p>
              <Button 
                onClick={() => setShowTutorial(true)}
                className="w-full flex items-center gap-2"
              >
                <HelpCircleIcon className="h-4 w-4" />
                Start Interactive Tutorial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
