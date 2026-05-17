"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  Download,
  ChevronDown,
  Check,
  Tv,
  ListVideo,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DownloadModal } from "./download-modal";
import type { Season, Episode, DownloadLink } from "@/lib/api";

interface EpisodeSelectorProps {
  seasons: Season[];
  title: string;
  mediaId: string;
  detailPath: string;
  downloadLinks?: DownloadLink[];
  onPlayEpisode?: (season: number, episode: number) => void;
  isLoadingStream?: boolean;
}

export function EpisodeSelector({
  seasons,
  title,
  mediaId,
  detailPath,
  poster,
  downloadLinks = [],
  onPlayEpisode,
  isLoadingStream = false,
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(
    seasons[0]?.seasonNumber || 1
  );
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(
    new Set()
  );
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadType, setDownloadType] = useState<"single" | "bulk">("single");
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<{
    season: number;
    episode: number;
  } | null>(null);

  const currentSeason = seasons.find((s) => s.seasonNumber === selectedSeason);
  const episodes = currentSeason?.episodes || [];

  const handleEpisodeSelect = (episodeId: string) => {
    const newSelected = new Set(selectedEpisodes);
    if (newSelected.has(episodeId)) {
      newSelected.delete(episodeId);
    } else {
      newSelected.add(episodeId);
    }
    setSelectedEpisodes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEpisodes.size === episodes.length) {
      setSelectedEpisodes(new Set());
    } else {
      setSelectedEpisodes(new Set(episodes.map((ep) => ep.id)));
    }
  };

  const handleSingleDownload = (episode: Episode) => {
    setCurrentEpisode(episode);
    setDownloadType("single");
    setDownloadModalOpen(true);
  };

  const handleBulkDownload = () => {
    setDownloadType("bulk");
    setDownloadModalOpen(true);
  };

  const handlePlayEpisode = (episode: Episode) => {
    if (onPlayEpisode) {
      setPlayingEpisode({
        season: selectedSeason,
        episode: episode.episodeNumber,
      });
      onPlayEpisode(selectedSeason, episode.episodeNumber);
    }
  };

  const selectedEpisodesForDownload = episodes.filter((ep) =>
    selectedEpisodes.has(ep.id)
  );

  return (
    <div className="space-y-6">
      {/* Season & Bulk Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Season Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="gap-2">
                <ListVideo className="w-4 h-4" />
                Season {selectedSeason}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {seasons.map((season) => (
                <DropdownMenuItem
                  key={season.seasonNumber}
                  onClick={() => {
                    setSelectedSeason(season.seasonNumber);
                    setSelectedEpisodes(new Set());
                  }}
                  className="gap-2"
                >
                  {selectedSeason === season.seasonNumber && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                  <span
                    className={
                      selectedSeason !== season.seasonNumber ? "ml-6" : ""
                    }
                  >
                    Season {season.seasonNumber}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {season.episodes.length} eps
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-sm text-muted-foreground">
            {episodes.length} Episodes
          </span>

          {currentSeason?.resolutions && currentSeason.resolutions.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              Up to {Math.max(...currentSeason.resolutions)}p
            </span>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
          >
            <div
              className={`w-4 h-4 border rounded flex items-center justify-center ${
                episodes.length > 0 && selectedEpisodes.size === episodes.length
                  ? "bg-primary border-primary"
                  : "border-input"
              }`}
            >
              {episodes.length > 0 && selectedEpisodes.size === episodes.length && (
                <Check className="w-3 h-3 text-primary-foreground" />
              )}
            </div>
            {selectedEpisodes.size === episodes.length
              ? "Deselect All"
              : "Select All"}
          </button>

          {selectedEpisodes.size > 0 && (
            <button
              onClick={handleBulkDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              <Download className="w-4 h-4" />
              Download {selectedEpisodes.size} Selected
            </button>
          )}
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid gap-3">
        {episodes.map((episode) => {
          const isCurrentlyPlaying =
            isLoadingStream &&
            playingEpisode?.season === selectedSeason &&
            playingEpisode?.episode === episode.episodeNumber;

          return (
            <div
              key={episode.id}
              className={`group flex gap-4 p-3 rounded-lg border transition-all ${
                selectedEpisodes.has(episode.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-secondary/30"
              }`}
            >
              {/* Checkbox */}
              <div className="flex items-center">
                <Checkbox
                  checked={selectedEpisodes.has(episode.id)}
                  onCheckedChange={() => handleEpisodeSelect(episode.id)}
                />
              </div>

              {/* Thumbnail */}
              <button
                onClick={() => handlePlayEpisode(episode)}
                disabled={isLoadingStream}
                className="relative w-32 sm:w-40 aspect-video rounded-md overflow-hidden shrink-0 bg-secondary cursor-pointer"
              >
                {(episode.thumbnail || poster) ? (
                  <Image
                    src={episode.thumbnail || poster || ""}
                    alt={episode.title}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCurrentlyPlaying ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Play className="w-8 h-8 text-white fill-white" />
                  )}
                </div>
              </button>

              {/* Episode Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                    E{episode.episodeNumber}
                  </span>
                  <h4 className="font-medium text-sm sm:text-base truncate">
                    {episode.title}
                  </h4>
                </div>
                {episode.synopsis && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {episode.synopsis}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 hidden sm:flex"
                  onClick={() => handlePlayEpisode(episode)}
                  disabled={isLoadingStream}
                >
                  {isCurrentlyPlaying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Play
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => handleSingleDownload(episode)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => {
          setDownloadModalOpen(false);
          setCurrentEpisode(null);
        }}
        title={title}
        mediaId={mediaId}
        detailPath={detailPath}
        type="episode"
        seasons={seasons}
        downloadLinks={
          downloadType === "single" && currentEpisode
            ? currentEpisode.downloadLinks || downloadLinks
            : downloadLinks
        }
        episodes={
          downloadType === "bulk" ? selectedEpisodesForDownload : undefined
        }
        seasonNumber={
          downloadType === "single" && currentEpisode
            ? currentEpisode.seasonNumber || selectedSeason
            : selectedSeason
        }
        episodeNumber={
          downloadType === "single" && currentEpisode
            ? currentEpisode.episodeNumber
            : undefined
        }
        isBulkDownload={downloadType === "bulk"}
      />
    </div>
  );
}
