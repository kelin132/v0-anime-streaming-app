"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Star, Heart, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserStore } from "@/lib/store";
import type { MediaItem } from "@/lib/api";

interface MediaCardProps {
  item: MediaItem;
  size?: "sm" | "md" | "lg";
}

export function MediaCard({ item, size = "md" }: MediaCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserStore();
  const inWatchlist = isInWatchlist(item.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  const sizeClasses = {
    sm: "w-32 sm:w-36",
    md: "w-40 sm:w-44",
    lg: "w-48 sm:w-56",
  };

  const aspectClasses = {
    sm: "aspect-[2/3]",
    md: "aspect-[2/3]",
    lg: "aspect-[2/3]",
  };

  const typeLabel = item.type === 2 ? "Series" : "Movie";
  const TypeIcon = item.type === 2 ? Tv : Film;

  return (
    <Link href={`/watch/${item.id}?type=${item.type}`}>
      <Card
        className={`${sizeClasses[size]} group relative overflow-hidden bg-card border-0 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20`}
      >
        <div className={`relative ${aspectClasses[size]} overflow-hidden`}>
          {item.poster ? (
            <Image
              src={item.poster}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 176px"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <TypeIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
            </div>
          </div>

          {/* Watchlist button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity ${
              inWatchlist ? "text-red-500" : "text-white"
            }`}
            onClick={handleWatchlistToggle}
          >
            <Heart className={`w-4 h-4 ${inWatchlist ? "fill-current" : ""}`} />
          </Button>

          {/* Type badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary/80 text-primary-foreground text-xs font-medium flex items-center gap-1">
            <TypeIcon className="w-3 h-3" />
            {typeLabel}
          </div>

          {/* Rating */}
          {item.rating && item.rating > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-white text-xs">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {item.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="p-2">
          <h3 className="font-medium text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.year && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.year}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
