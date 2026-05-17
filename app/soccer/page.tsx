"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Play, Clock, Trophy, Globe, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoccerLiveScores } from "@/components/soccer-live-scores";

interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  gradient: string;
}

const popularLeagues: League[] = [
  {
    id: "4328",
    name: "English Premier League",
    country: "England",
    logo: "https://www.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png",
    gradient: "from-purple-600 to-blue-600",
  },
  {
    id: "4335",
    name: "La Liga",
    country: "Spain",
    logo: "https://www.thesportsdb.com/images/media/league/badge/7onmyv1534768460.png",
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "4331",
    name: "Bundesliga",
    country: "Germany",
    logo: "https://www.thesportsdb.com/images/media/league/badge/0j55yv1534764799.png",
    gradient: "from-red-600 to-black",
  },
  {
    id: "4332",
    name: "Serie A",
    country: "Italy",
    logo: "https://www.thesportsdb.com/images/media/league/badge/ocy2fe1566216901.png",
    gradient: "from-blue-600 to-green-500",
  },
  {
    id: "4334",
    name: "Ligue 1",
    country: "France",
    logo: "https://www.thesportsdb.com/images/media/league/badge/8f5jmf1516458074.png",
    gradient: "from-blue-700 to-red-500",
  },
  {
    id: "4346",
    name: "MLS",
    country: "USA",
    logo: "https://www.thesportsdb.com/images/media/league/badge/dqo6r91549878326.png",
    gradient: "from-blue-500 to-red-500",
  },
  {
    id: "4480",
    name: "Champions League",
    country: "Europe",
    logo: "https://www.thesportsdb.com/images/media/league/badge/qi00ov1534591940.png",
    gradient: "from-blue-900 to-slate-900",
  },
  {
    id: "4481",
    name: "Europa League",
    country: "Europe",
    logo: "https://www.thesportsdb.com/images/media/league/badge/t41hxx1534591072.png",
    gradient: "from-orange-500 to-yellow-500",
  },
];

const otherLeagues: League[] = [
  {
    id: "4344",
    name: "Primeira Liga",
    country: "Portugal",
    logo: "https://www.thesportsdb.com/images/media/league/badge/fv7quu1534769358.png",
    gradient: "from-green-600 to-red-600",
  },
  {
    id: "4337",
    name: "Eredivisie",
    country: "Netherlands",
    logo: "https://www.thesportsdb.com/images/media/league/badge/d6n5zy1534765862.png",
    gradient: "from-orange-500 to-orange-700",
  },
  {
    id: "4359",
    name: "Brazilian Serie A",
    country: "Brazil",
    logo: "https://www.thesportsdb.com/images/media/league/badge/xrwyup1468233667.png",
    gradient: "from-green-500 to-yellow-400",
  },
  {
    id: "4351",
    name: "Scottish Premiership",
    country: "Scotland",
    logo: "https://www.thesportsdb.com/images/media/league/badge/vj63go1535214204.png",
    gradient: "from-blue-700 to-white",
  },
];

export default function SoccerPage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [activeTab, setActiveTab] = useState<"leagues" | "live">("leagues");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950/30 via-background to-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(34, 197, 94) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-8 relative">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" opacity="0.3"/>
                <polygon points="12,7 14.5,11 12,15 9.5,11" fill="currentColor"/>
                <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Live Soccer
              </h1>
              <p className="text-muted-foreground">
                Watch live matches and stream your favorite leagues
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("leagues")}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === "leagues"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Leagues
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === "live"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Play className="w-4 h-4 inline mr-2" />
              Live Scores
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "leagues" ? (
          <div className="space-y-10">
            {/* Popular Leagues */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Popular Leagues</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {popularLeagues.map((league) => (
                  <LeagueCard
                    key={league.id}
                    league={league}
                    onSelect={() => setSelectedLeague(league)}
                  />
                ))}
              </div>
            </section>

            {/* Other Leagues */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">More Leagues</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {otherLeagues.map((league) => (
                  <LeagueCard
                    key={league.id}
                    league={league}
                    onSelect={() => setSelectedLeague(league)}
                  />
                ))}
              </div>
            </section>

            {/* Coming Soon */}
            <section className="text-center py-8 bg-secondary/30 rounded-2xl">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">More Leagues Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We&apos;re working on adding more leagues and competitions. Stay tuned for updates!
              </p>
            </section>
          </div>
        ) : (
          <SoccerLiveScores />
        )}
      </div>

      {/* League Stream Modal */}
      {selectedLeague && (
        <LeagueStreamModal
          league={selectedLeague}
          onClose={() => setSelectedLeague(null)}
        />
      )}
    </div>
  );
}

function LeagueCard({
  league,
  onSelect,
}: {
  league: League;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${league.gradient} p-[1px] transition-all hover:scale-105 hover:shadow-xl`}
    >
      <div className="relative h-full bg-card/95 backdrop-blur rounded-xl p-4 flex flex-col items-center gap-3">
        <div className="w-16 h-16 relative">
          <Image
            src={league.logo}
            alt={league.name}
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-sm line-clamp-1">{league.name}</h3>
          <p className="text-xs text-muted-foreground">{league.country}</p>
        </div>
        <div className={`absolute inset-0 bg-gradient-to-br ${league.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
      </div>
    </button>
  );
}

function LeagueStreamModal({
  league,
  onClose,
}: {
  league: League;
  onClose: () => void;
}) {
  const streamOptions = [
    { name: "Stream 1 (HD)", quality: "1080p", delay: "Low" },
    { name: "Stream 2 (HD)", quality: "720p", delay: "Medium" },
    { name: "Stream 3 (SD)", quality: "480p", delay: "Low" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`relative bg-gradient-to-br ${league.gradient} p-6`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl p-2 backdrop-blur">
              <div className="relative w-full h-full">
                <Image
                  src={league.logo}
                  alt={league.name}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{league.name}</h2>
              <p className="text-white/80 text-sm">{league.country}</p>
            </div>
          </div>
        </div>

        {/* Stream Options */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Tv className="w-5 h-5 text-green-500" />
            Select Stream
          </h3>
          <div className="space-y-3">
            {streamOptions.map((option, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors group"
                onClick={() => {
                  // Open stream in new tab (placeholder URL)
                  window.open(`https://example.com/stream/${league.id}?quality=${option.quality}`, "_blank");
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{option.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.quality} • {option.delay} delay
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <Play className="w-4 h-4 text-green-500 group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Streams are provided by third-party services. Quality may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
