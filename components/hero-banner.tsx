"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";
import type { MediaItem } from "@/lib/api";

interface HeroBannerProps {
  items: MediaItem[];
  isLoading?: boolean;
}

export function HeroBanner({ items, isLoading }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useUserStore();

  const currentItem = items[currentIndex];
  const inWatchlist = currentItem ? isInWatchlist(currentItem.id) : false;

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handleWatchlistToggle = () => {
    if (!currentItem) return;
    if (inWatchlist) {
      removeFromWatchlist(currentItem.id);
    } else {
      addToWatchlist(currentItem);
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-[60vh] sm:h-[70vh] bg-gradient-to-br from-secondary to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse mx-auto" />
          <div className="h-8 w-64 bg-secondary rounded animate-pulse mx-auto" />
          <div className="h-4 w-48 bg-secondary/60 rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  if (!items || items.length === 0 || !currentItem) {
    return (
      <div className="relative h-[60vh] sm:h-[70vh] bg-gradient-to-br from-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Xinverse</h1>
          <p className="text-muted-foreground">Discover your next favorite anime, movie, or series</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {currentItem.backdrop || currentItem.poster ? (
          <Image
            src={currentItem.backdrop || currentItem.poster}
            alt={currentItem.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {/* Type badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">
              {currentItem.type === 2 ? "Series" : "Movie"}
            </span>
            {currentItem.rating && currentItem.rating > 0 && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{currentItem.rating.toFixed(1)}</span>
              </div>
            )}
            {currentItem.year && (
              <span className="text-sm text-muted-foreground">{currentItem.year}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            {currentItem.title}
          </h1>

          {/* Synopsis */}
          {currentItem.synopsis && (
            <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 max-w-xl">
              {currentItem.synopsis}
            </p>
          )}

          {/* Genre tags */}
          {currentItem.genre && currentItem.genre.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentItem.genre.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full bg-secondary/80 text-secondary-foreground text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={`/watch/${currentItem.id}?type=${currentItem.type}`}>
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Link href={`/watch/${currentItem.id}?type=${currentItem.type}`}>
              <Button variant="secondary" size="lg" className="gap-2">
                <Info className="w-5 h-5" />
                More Info
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handleWatchlistToggle}
            >
              <Heart className={`w-5 h-5 ${inWatchlist ? "fill-red-500 text-red-500" : ""}`} />
              {inWatchlist ? "In Watchlist" : "Add to List"}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white"
            onClick={goToNext}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
