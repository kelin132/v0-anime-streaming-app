"use client";

import Link from "next/link";
import { Clapperboard, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center text-center max-w-xl gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
          <Clapperboard className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Xin<span className="text-primary">verse</span> will be back soon
          </h1>
          <p className="text-base text-muted-foreground text-pretty leading-relaxed">
            We&apos;re making some improvements behind the scenes. Our full catalog of
            anime, movies &amp; series will be back shortly.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          Thanks for your support
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/browse">
            <Button size="lg" className="px-8">
              Browse Content
            </Button>
          </Link>
          <Link href="/watchlist">
            <Button size="lg" variant="secondary" className="px-8">
              My Watchlist
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
