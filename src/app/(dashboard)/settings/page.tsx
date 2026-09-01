"use client";

import {
  CheckIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  LOOK_THEMES,
  useUISettings,
} from "@/components/ui-settings";
import { useBrowserNotificationPermission } from "@/features/notifications/hooks/use-browser-notifications";

function AppearanceCard() {
  const { look, setLook, resetToDefaults } = useUISettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
          Each theme is a complete look — palette, corner style and light/dark
          mode change together. Changes apply instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {LOOK_THEMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setLook(preset.id)}
              aria-pressed={look === preset.id}
              className={cn(
                "group flex items-start gap-3 border-2 bg-card p-3 text-left transition-colors hover:bg-accent",
                look === preset.id
                  ? "border-primary ring-2 ring-ring/40"
                  : "border-border"
              )}
            >
              {/* preview strip: background + accent over mini chrome */}
              <span
                className="mt-0.5 flex h-10 w-14 shrink-0 flex-col justify-end gap-1 border border-border p-1"
                style={{ backgroundColor: preset.swatch[0] }}
              >
                <span
                  className="h-1.5 w-full"
                  style={{ backgroundColor: preset.swatch[1] }}
                />
                <span className="h-1 w-2/3 bg-foreground/30" />
                <span className="h-1 w-4/5 bg-foreground/20" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {preset.label}
                  {preset.mode === "light" ? (
                    <SunIcon className="size-3 text-muted-foreground" />
                  ) : (
                    <MoonIcon className="size-3 text-muted-foreground" />
                  )}
                  {look === preset.id && (
                    <CheckIcon className="size-3.5 text-primary" />
                  )}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {preset.description}
                </span>
              </span>
            </button>
          ))}
        </div>
        <Separator />
        <Button variant="outline" onClick={resetToDefaults}>
          <RotateCcwIcon className="size-4" />
          Reset to defaults
        </Button>
      </CardContent>
    </Card>
  );
}

function NotificationsCard() {
  const { permission, enabled, request, disable } =
    useBrowserNotificationPermission();

  const handleEnable = async () => {
    await request();
  };

  const handleDisable = () => {
    disable();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Get desktop alerts when your agents report events, even when this tab
          is in the background.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Browser notifications</p>
            <p className="text-xs text-muted-foreground">
              Status:{" "}
              <span className="font-mono">
                {permission === "unsupported"
                  ? "not supported in this browser"
                  : permission === "granted" && enabled
                    ? "enabled"
                    : permission === "granted"
                      ? "allowed but off"
                      : permission === "denied"
                        ? "blocked in browser settings"
                        : "not enabled"}
              </span>
            </p>
          </div>
          {permission === "default" && (
            <Button size="sm" onClick={handleEnable}>
              Enable
            </Button>
          )}
          {permission === "granted" && !enabled && (
            <Button size="sm" onClick={handleEnable}>
              Turn on
            </Button>
          )}
          {permission === "granted" && enabled && (
            <Button size="sm" variant="outline" onClick={handleDisable}>
              Turn off
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your appearance, layout and notification preferences.
        </p>
      </div>
      <AppearanceCard />
      <NotificationsCard />
    </div>
  );
}
