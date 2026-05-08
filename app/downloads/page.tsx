"use client";

import Link from "next/link";
import {
  Download,
  Trash2,
  Film,
  Tv,
  HardDrive,
  ExternalLink,
  FolderOpen,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";

export default function DownloadsPage() {
  const { downloadQueue, removeFromDownloadQueue, clearDownloadQueue } =
    useUserStore();

  const sortedDownloads = [...downloadQueue].reverse();

  const getQualityIcon = (quality: string) => {
    if (quality.includes("4K") || quality.includes("2160")) {
      return <Zap className="w-4 h-4 text-yellow-400" />;
    }
    return <HardDrive className="w-4 h-4 text-muted-foreground" />;
  };

  const handleDownload = (url: string) => {
    if (url && url !== "#") {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Download className="w-8 h-8 text-primary" />
            Download Queue
          </h1>
          <p className="text-muted-foreground mt-1">
            {downloadQueue.length} item{downloadQueue.length !== 1 ? "s" : ""} in
            queue
          </p>
        </div>
        {downloadQueue.length > 0 && (
          <Button
            variant="destructive"
            onClick={clearDownloadQueue}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Empty State */}
      {downloadQueue.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No downloads yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Browse movies and series and click the download button to add items
            to your queue
          </p>
          <Link href="/browse">
            <Button size="lg">Browse Content</Button>
          </Link>
        </div>
      )}

      {/* Downloads List */}
      {downloadQueue.length > 0 && (
        <div className="space-y-3">
          {sortedDownloads.map((item, index) => {
            const TypeIcon = item.type === "episode" ? Tv : Film;

            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                {/* Type Icon */}
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <TypeIcon className="w-6 h-6 text-muted-foreground" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-sm">
                      {getQualityIcon(item.quality)}
                      {item.quality}
                    </span>
                    {item.type === "episode" && (
                      <span className="text-sm text-muted-foreground">
                        S{item.seasonNumber}E{item.episodeNumber}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary capitalize">
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownload(item.url)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeFromDownloadQueue(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 p-6 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-3">Download Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">1.</span>
            Click the Download button to open the download link in a new tab
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">2.</span>
            For series, you can select multiple episodes for bulk download
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">3.</span>
            Higher quality (4K, 1080p) files will be larger in size
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">4.</span>
            Your download queue is saved locally for convenience
          </li>
        </ul>
      </div>
    </div>
  );
}
