"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  ArrowLeft,
  Trophy,
  Play,
  Calendar,
  Clock,
} from "lucide-react";

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
  strProgress: string;
  dateEvent: string;
  strTime: string;
  strThumb: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  strLeague: string;
  strVenue: string;
}

interface Standing {
  intRank: string;
  strTeam: string;
  strTeamBadge: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
}

interface Highlight {
  title: string;
  embed: string;
  url: string;
  thumbnail: string;
  date: string;
  competition: string;
}

const POPULAR_LEAGUES: League[] = [
  {
    id: "4328",
    name: "Premier League",
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
    gradient: "from-blue-600 to-green-600",
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
    logo: "https://www.thesportsdb.com/images/media/league/badge/1f3xwo1521120790.png",
    gradient: "from-blue-900 to-blue-500",
  },
  {
    id: "4481",
    name: "Europa League",
    country: "Europe",
    logo: "https://www.thesportsdb.com/images/media/league/badge/b6pqs71617949452.png",
    gradient: "from-orange-500 to-yellow-500",
  },
];

export default function SoccerPage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<"yesterday" | "today" | "tomorrow">("today");
  const [activeTab, setActiveTab] = useState("scores");

  const getDateString = (day: "yesterday" | "today" | "tomorrow") => {
    const date = new Date();
    if (day === "yesterday") date.setDate(date.getDate() - 1);
    if (day === "tomorrow") date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const fetchLeagueData = async (leagueId: string, day: "yesterday" | "today" | "tomorrow") => {
    setIsLoading(true);
    try {
      const dateStr = getDateString(day);
      
      // Fetch matches
      const matchesRes = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&l=${leagueId}`
      );
      const matchesData = await matchesRes.json();
      
      if (matchesData.events && Array.isArray(matchesData.events)) {
        const sorted = matchesData.events.sort((a: Match, b: Match) => {
          const statusA = getMatchStatus(a);
          const statusB = getMatchStatus(b);
          const order = { live: 0, upcoming: 1, finished: 2 };
          return order[statusA] - order[statusB];
        });
        setMatches(sorted);
      } else {
        setMatches([]);
      }

      // Fetch standings
      const standingsRes = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${leagueId}&s=2024-2025`
      );
      const standingsData = await standingsRes.json();
      if (standingsData.table && Array.isArray(standingsData.table)) {
        setStandings(standingsData.table);
      } else {
        setStandings([]);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch league data:", error);
      setMatches([]);
      setStandings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league);
    fetchLeagueData(league.id, selectedDay);
  };

  const handleDayChange = (day: "yesterday" | "today" | "tomorrow") => {
    setSelectedDay(day);
    if (selectedLeague) {
      fetchLeagueData(selectedLeague.id, day);
    }
  };

  const handleRefresh = () => {
    if (selectedLeague) {
      fetchLeagueData(selectedLeague.id, selectedDay);
    }
  };

  const getMatchStatus = (match: Match): "live" | "upcoming" | "finished" => {
    const status = match.strStatus?.toLowerCase() || "";
    const progress = match.strProgress?.toLowerCase() || "";
    
    if (status.includes("live") || progress.includes("live") || status.includes("in progress") || status.match(/^\d+['′]?$/)) {
      return "live";
    }
    if (status.includes("ft") || status.includes("finished") || status.includes("ended") || (match.intHomeScore !== null && match.intAwayScore !== null && status !== "ns")) {
      return "finished";
    }
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950/30 via-background to-background">
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
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative">
                <Image
                  src="/soccer-ball.jpg"
                  alt="Soccer"
                  fill
                  className="object-cover rounded-full"
                  sizes="48px"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Live Soccer
                </h1>
                <p className="text-muted-foreground text-sm">
                  Scores, Standings & Highlights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!selectedLeague ? (
          /* League Selection View */
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Popular Leagues
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {POPULAR_LEAGUES.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => handleLeagueSelect(league)}
                    className="group relative overflow-hidden rounded-xl aspect-square transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${league.gradient}`} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-[80px] max-h-[80px]">
                        <Image
                          src={league.logo}
                          alt={league.name}
                          fill
                          className="object-contain drop-shadow-lg"
                          sizes="80px"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <h3 className="font-semibold text-sm text-white line-clamp-1">
                        {league.name}
                      </h3>
                      <p className="text-xs text-white/70">{league.country}</p>
                    </div>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* League Detail View */
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
                    <p className="text-sm text-muted-foreground">
                      {selectedLeague.country}
                    </p>
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-secondary">
                <TabsTrigger value="scores" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Scores
                </TabsTrigger>
                <TabsTrigger value="standings" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Standings
                </TabsTrigger>
              </TabsList>

              {/* Scores Tab */}
              <TabsContent value="scores" className="space-y-4">
                {/* Day Selector */}
                <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-lg w-fit">
                  {(["yesterday", "today", "tomorrow"] as const).map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDayChange(day)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                        selectedDay === day
                          ? "bg-green-600 text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Matches */}
                {isLoading ? (
                  <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-full" />
                            <div className="h-4 w-24 bg-secondary rounded" />
                          </div>
                          <div className="h-6 w-16 bg-secondary rounded" />
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-24 bg-secondary rounded" />
                            <div className="w-10 h-10 bg-secondary rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : matches.length > 0 ? (
                  <div className="grid gap-3">
                    {matches.map((match) => {
                      const status = getMatchStatus(match);
                      return (
                        <div
                          key={match.idEvent}
                          className={`relative bg-card rounded-xl p-4 border transition-all ${
                            status === "live"
                              ? "border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10"
                              : "border-border hover:border-border/80"
                          }`}
                        >
                          {status === "live" && (
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                                LIVE
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            {/* Home Team */}
                            <div className="flex items-center gap-3 flex-1">
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
                              <span className="font-medium text-sm line-clamp-1">
                                {match.strHomeTeam}
                              </span>
                            </div>

                            {/* Score / Time */}
                            <div className="px-4 text-center shrink-0">
                              {status === "finished" || status === "live" ? (
                                <div className="text-xl font-bold">
                                  {match.intHomeScore ?? 0} - {match.intAwayScore ?? 0}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                                  <span className="text-sm text-muted-foreground">
                                    {match.strTime?.slice(0, 5) || "TBD"}
                                  </span>
                                </div>
                              )}
                              {status === "finished" && (
                                <span className="text-xs text-muted-foreground">FT</span>
                              )}
                              {status === "live" && match.strProgress && (
                                <span className="text-xs text-green-400">
                                  {match.strProgress}
                                </span>
                              )}
                            </div>

                            {/* Away Team */}
                            <div className="flex items-center gap-3 flex-1 justify-end">
                              <span className="font-medium text-sm line-clamp-1 text-right">
                                {match.strAwayTeam}
                              </span>
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
                            </div>
                          </div>

                          {match.strVenue && (
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              {match.strVenue}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No matches scheduled for this day</p>
                  </div>
                )}
              </TabsContent>

              {/* Standings Tab */}
              <TabsContent value="standings">
                {standings.length > 0 ? (
                  <div className="bg-card rounded-xl overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-secondary/50">
                            <th className="text-left p-3 font-medium">#</th>
                            <th className="text-left p-3 font-medium">Team</th>
                            <th className="text-center p-3 font-medium">P</th>
                            <th className="text-center p-3 font-medium">W</th>
                            <th className="text-center p-3 font-medium">D</th>
                            <th className="text-center p-3 font-medium">L</th>
                            <th className="text-center p-3 font-medium">GD</th>
                            <th className="text-center p-3 font-medium">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((team, idx) => (
                            <tr
                              key={team.strTeam}
                              className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                                idx < 4 ? "bg-green-500/5" : idx >= standings.length - 3 ? "bg-red-500/5" : ""
                              }`}
                            >
                              <td className="p-3 font-medium">{team.intRank}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {team.strTeamBadge && (
                                    <div className="w-6 h-6 relative shrink-0">
                                      <Image
                                        src={team.strTeamBadge}
                                        alt={team.strTeam}
                                        fill
                                        className="object-contain"
                                        sizes="24px"
                                      />
                                    </div>
                                  )}
                                  <span className="font-medium line-clamp-1">
                                    {team.strTeam}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-center text-muted-foreground">
                                {team.intPlayed}
                              </td>
                              <td className="p-3 text-center text-green-500">
                                {team.intWin}
                              </td>
                              <td className="p-3 text-center text-muted-foreground">
                                {team.intDraw}
                              </td>
                              <td className="p-3 text-center text-red-500">
                                {team.intLoss}
                              </td>
                              <td className="p-3 text-center">
                                {parseInt(team.intGoalDifference) > 0 ? "+" : ""}
                                {team.intGoalDifference}
                              </td>
                              <td className="p-3 text-center font-bold">
                                {team.intPoints}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Standings not available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
