"use client";

import { ExternalLink, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StreamingService } from "@/lib/api";

interface StreamingLinksProps {
  services?: StreamingService[];
  title: string;
}

const SERVICE_COLORS: Record<string, string> = {
  Crunchyroll: "bg-orange-500 hover:bg-orange-600",
  Netflix: "bg-red-600 hover:bg-red-700",
  HiDive: "bg-blue-600 hover:bg-blue-700",
  "Amazon Prime": "bg-cyan-600 hover:bg-cyan-700",
  Hulu: "bg-green-500 hover:bg-green-600",
};

const SERVICE_ICONS: Record<string, string> = {
  Crunchyroll: "CR",
  Netflix: "N",
  HiDive: "HD",
  "Amazon Prime": "P",
  Hulu: "H",
};

export function StreamingLinks({ services, title }: StreamingLinksProps) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <Tv className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">
          Streaming availability information not available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Watch {title} on:</h3>
        <p className="text-sm text-muted-foreground">
          Click a streaming service to search for this title on their platform
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <a
            key={service.name}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div
              className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all ${
                SERVICE_COLORS[service.name] || "hover:bg-secondary"
              } text-white`}
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 font-bold text-lg">
                {SERVICE_ICONS[service.name] || service.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm opacity-80">Search for this title</p>
              </div>
              <ExternalLink className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Availability may vary by region. Click the links
          above to check if this title is available in your area.
        </p>
      </div>
    </div>
  );
}
