"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Trophy, Globe, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  gradient: string;
}

interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  strTimestamp: string;
  strTime: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  strLeague: string;
  strVenue?: string;
  strProgress?: string;
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
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeagueMatches = async (leagueId: string) => {
    setIsLoading(true);
    try {
      // Fetch today's events for the league
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&l=${leagueId}`
      );
      const data = await res.json();
      
      if (data.events && Array.isArray(data.events)) {
        setMatches(data.events);
      } else {
        setMatches([]);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league);
    fetchLeagueMatches(league.id);
  };

  const handleRefresh = () => {
    if (selectedLeague) {
      fetchLeagueMatches(selectedLeague.id);
    }
  };

  const getMatchStatus = (match: Match) => {
    const status = match.strStatus?.toLowerCase() || "";
    const progress = match.strProgress?.toLowerCase() || "";
    
    if (status.includes("live") || progress.includes("live") || status.includes("in progress")) {
      return "live";
    }
    if (status.includes("ft") || status.includes("finished") || status.includes("ended") || match.intHomeScore !== null) {
      return "finished";
    }
    return "upcoming";
  };

  const formatMatchTime = (match: Match) => {
    if (match.strTime) {
      return match.strTime.slice(0, 5);
    }
    if (match.strTimestamp) {
      const date = new Date(match.strTimestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return "TBD";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950/40 via-background to-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(34, 197, 94) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
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
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2l1.5 4.5L17 5l-1 4 4 1-4.5 1.5L17 15l-4-1-1 4.5L10.5 15 7 17l1-4-4.5-1.5L7 10l-1-4 4.5 1.5L12 2z" fill="white" stroke="none" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Live Soccer Scores
              </h1>
              <p className="text-muted-foreground">
                Select a league to view live scores and upcoming matches
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!selectedLeague ? (
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
                    onSelect={() => handleLeagueSelect(league)}
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
                    onSelect={() => handleLeagueSelect(league)}
                  />
                ))}
              </div>
            </section>

            {/* Coming Soon */}
            <section className="text-center py-8 bg-secondary/30 rounded-2xl">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">More Leagues Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We&apos;re working on adding more leagues and competitions. Stay tuned!
              </p>
            </section>
          </div>
        ) : (
          /* League Scores View */
          <div className="space-y-6">
            {/* League Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedLeague(null)}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative">
                    <Image
                      src={selectedLeague.logo}
                      alt={selectedLeague.name}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedLeague.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedLeague.country}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Matches */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            ) : matches.length > 0 ? (
              <div className="grid gap-4">
                {matches.map((match) => (
                  <MatchCard key={match.idEvent} match={match} getStatus={getMatchStatus} formatTime={formatMatchTime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/30 rounded-2xl">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Matches Today</h3>
                <p className="text-sm text-muted-foreground">
                  There are no scheduled matches for {selectedLeague.name} today.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
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
        <div
          className={`absolute inset-0 bg-gradient-to-br ${league.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
        />
      </div>
    </button>
  );
}

function MatchCard({
  match,
  getStatus,
  formatTime,
}: {
  match: Match;
  getStatus: (match: Match) => string;
  formatTime: (match: Match) => string;
}) {
  const status = getStatus(match);
  const isLive = status === "live";
  const isFinished = status === "finished";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all ${
        isLive
          ? "border-green-500/50 bg-gradient-to-r from-green-950/30 to-emerald-950/30"
          : "border-border bg-card"
      }`}
    >
      {isLive && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        </div>
      )}

      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-3 justify-end">
            <span className="font-semibold text-sm sm:text-base text-right">
              {match.strHomeTeam}
            </span>
            {match.strHomeTeamBadge && (
              <div className="w-10 h-10 relative shrink-0">
                <Image
                  src={match.strHomeTeamBadge}
                  alt={match.strHomeTeam}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
            )}
          </div>

          {/* Score / Time */}
          <div className="shrink-0 text-center min-w-[80px]">
            {isLive || isFinished ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold">
                  {match.intHomeScore ?? 0}
                </span>
                <span className="text-muted-foreground">-</span>
                <span className="text-2xl sm:text-3xl font-bold">
                  {match.intAwayScore ?? 0}
                </span>
              </div>
            ) : (
              <div className="text-lg font-medium text-muted-foreground">
                {formatTime(match)}
              </div>
            )}
            {isFinished && (
              <span className="text-xs text-muted-foreground mt-1 block">FT</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center gap-3">
            {match.strAwayTeamBadge && (
              <div className="w-10 h-10 relative shrink-0">
                <Image
                  src={match.strAwayTeamBadge}
                  alt={match.strAwayTeam}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
            )}
            <span className="font-semibold text-sm sm:text-base">
              {match.strAwayTeam}
            </span>
          </div>
        </div>

        {/* Venue */}
        {match.strVenue && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            {match.strVenue}
          </p>
        )}
      </div>
    </div>
  );
}
