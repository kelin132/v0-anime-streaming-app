"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, Film, Tv, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, ratings } = useUserStore();

  const sortedWatchlist = [...watchlist].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            My Watchlist
          </h1>
          <p className="text-muted-foreground mt-1">
            {watchlist.length} item{watchlist.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Empty State */}
      {watchlist.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start adding movies and series to keep track of what you want to watch
          </p>
          <Link href="/browse">
            <Button size="lg">Browse Content</Button>
          </Link>
        </div>
      )}

      {/* Watchlist Grid */}
      {watchlist.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedWatchlist.map((item) => {
            const TypeIcon = item.type === 2 ? Tv : Film;
            const userRating = ratings.find((r) => r.id === item.id);

            return (
              <div
                key={item.id}
                className="group relative flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                {/* Poster */}
                <Link
                  href={`/watch/${item.id}?type=${item.type}`}
                  className="shrink-0"
                >
                  <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
                    {item.poster ? (
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TypeIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link href={`/watch/${item.id}?type=${item.type}`}>
                      <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TypeIcon className="w-3 h-3" />
                        {item.type === 2 ? "Series" : "Movie"}
                      </span>
                      {userRating && (
                        <span className="text-xs text-yellow-400">
                          Rated {userRating.rating}/5
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Link href={`/watch/${item.id}?type=${item.type}`}>
                      <Button size="sm" variant="secondary" className="gap-1">
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromWatchlist(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ratings Section */}
      {ratings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Your Ratings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ratings
              .sort((a, b) => b.ratedAt - a.ratedAt)
              .slice(0, 8)
              .map((rating) => (
                <div
                  key={rating.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < rating.rating ? "opacity-100" : "opacity-30"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm truncate flex-1">{rating.title}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
