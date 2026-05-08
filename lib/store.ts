"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaItem, Episode } from "./api";

export interface WatchlistItem {
  id: string;
  title: string;
  poster: string;
  type: number;
  addedAt: number;
}

export interface RatingItem {
  id: string;
  title: string;
  rating: number;
  ratedAt: number;
}

export interface DownloadQueueItem {
  id: string;
  title: string;
  quality: string;
  url: string;
  type: "movie" | "episode";
  seasonNumber?: number;
  episodeNumber?: number;
}

interface UserStore {
  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;

  // Ratings
  ratings: RatingItem[];
  rateItem: (id: string, title: string, rating: number) => void;
  getRating: (id: string) => number | null;

  // Download Queue
  downloadQueue: DownloadQueueItem[];
  addToDownloadQueue: (item: DownloadQueueItem) => void;
  removeFromDownloadQueue: (id: string) => void;
  clearDownloadQueue: () => void;
  addBulkToDownloadQueue: (items: DownloadQueueItem[]) => void;

  // Selected episodes for bulk download
  selectedEpisodes: Map<string, Episode[]>;
  selectEpisode: (mediaId: string, episode: Episode) => void;
  deselectEpisode: (mediaId: string, episodeId: string) => void;
  selectAllEpisodes: (mediaId: string, episodes: Episode[]) => void;
  clearSelectedEpisodes: (mediaId: string) => void;
  getSelectedEpisodes: (mediaId: string) => Episode[];
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Watchlist
      watchlist: [],
      addToWatchlist: (item) =>
        set((state) => ({
          watchlist: [
            ...state.watchlist,
            {
              id: item.id,
              title: item.title,
              poster: item.poster,
              type: item.type,
              addedAt: Date.now(),
            },
          ],
        })),
      removeFromWatchlist: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== id),
        })),
      isInWatchlist: (id) => get().watchlist.some((item) => item.id === id),

      // Ratings
      ratings: [],
      rateItem: (id, title, rating) =>
        set((state) => {
          const existingIndex = state.ratings.findIndex((r) => r.id === id);
          if (existingIndex >= 0) {
            const newRatings = [...state.ratings];
            newRatings[existingIndex] = { id, title, rating, ratedAt: Date.now() };
            return { ratings: newRatings };
          }
          return {
            ratings: [...state.ratings, { id, title, rating, ratedAt: Date.now() }],
          };
        }),
      getRating: (id) => {
        const rating = get().ratings.find((r) => r.id === id);
        return rating?.rating ?? null;
      },

      // Download Queue
      downloadQueue: [],
      addToDownloadQueue: (item) =>
        set((state) => ({
          downloadQueue: [...state.downloadQueue, item],
        })),
      removeFromDownloadQueue: (id) =>
        set((state) => ({
          downloadQueue: state.downloadQueue.filter((item) => item.id !== id),
        })),
      clearDownloadQueue: () => set({ downloadQueue: [] }),
      addBulkToDownloadQueue: (items) =>
        set((state) => ({
          downloadQueue: [...state.downloadQueue, ...items],
        })),

      // Selected episodes
      selectedEpisodes: new Map(),
      selectEpisode: (mediaId, episode) =>
        set((state) => {
          const newMap = new Map(state.selectedEpisodes);
          const current = newMap.get(mediaId) || [];
          if (!current.find((e) => e.id === episode.id)) {
            newMap.set(mediaId, [...current, episode]);
          }
          return { selectedEpisodes: newMap };
        }),
      deselectEpisode: (mediaId, episodeId) =>
        set((state) => {
          const newMap = new Map(state.selectedEpisodes);
          const current = newMap.get(mediaId) || [];
          newMap.set(
            mediaId,
            current.filter((e) => e.id !== episodeId)
          );
          return { selectedEpisodes: newMap };
        }),
      selectAllEpisodes: (mediaId, episodes) =>
        set((state) => {
          const newMap = new Map(state.selectedEpisodes);
          newMap.set(mediaId, episodes);
          return { selectedEpisodes: newMap };
        }),
      clearSelectedEpisodes: (mediaId) =>
        set((state) => {
          const newMap = new Map(state.selectedEpisodes);
          newMap.delete(mediaId);
          return { selectedEpisodes: newMap };
        }),
      getSelectedEpisodes: (mediaId) => get().selectedEpisodes.get(mediaId) || [],
    }),
    {
      name: "cinemind-user-store",
      partialize: (state) => ({
        watchlist: state.watchlist,
        ratings: state.ratings,
        downloadQueue: state.downloadQueue,
      }),
    }
  )
);
