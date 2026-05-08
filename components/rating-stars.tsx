"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useUserStore } from "@/lib/store";

interface RatingStarsProps {
  itemId: string;
  itemTitle: string;
  readonly?: boolean;
}

export function RatingStars({ itemId, itemTitle, readonly = false }: RatingStarsProps) {
  const { getRating, rateItem } = useUserStore();
  const currentRating = getRating(itemId);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating ?? currentRating ?? 0;

  const handleClick = (rating: number) => {
    if (readonly) return;
    rateItem(itemId, itemTitle, rating);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(null)}
          className={`transition-transform ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= displayRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
