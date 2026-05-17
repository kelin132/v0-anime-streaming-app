const API_KEY = "Godszeal";
const BASE_URL = "https://api.cinemind.name.ng/api";

// Fetch with caching
const fetchWithCache = async (url: string, cacheTime = 300000) => {
  const res = await fetch(url, {
    next: { revalidate: cacheTime / 1000 },
  });
  return res.json();
};

export interface CastMember {
  name: string;
  character: string;
  avatar: string;
}

export interface MediaItem {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  year?: string;
  rating?: number;
  type: number; // 1 = movie, 2 = series
  genre?: string[];
  synopsis?: string;
  trailer?: string;
  seasons?: Season[];
  episodes?: Episode[];
  downloadLinks?: DownloadLink[];
  streamingServices?: StreamingService[];
  country?: string;
  subtitles?: string;
  detailPath?: string;
  cast?: CastMember[];
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
  resolutions?: number[];
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber?: number;
  title: string;
  synopsis?: string;
  thumbnail?: string;
  downloadLinks?: DownloadLink[];
}

export interface DownloadLink {
  quality: string;
  size: string;
  url: string;
  streamUrl?: string;
  downloadUrl?: string;
  resolution?: number;
}

export interface Caption {
  id: string;
  lan: string;
  lanName: string;
  url: string;
  size?: string;
}

export interface MediaData {
  downloads: DownloadLink[];
  captions: Caption[];
}

export interface SeasonInfo {
  seasonNumber: number;
  maxEpisodes: number;
  resolutions: number[];
}

export interface StreamingService {
  name: string;
  url: string;
  logo: string;
}

export interface HomepageData {
  featured: MediaItem[];
  trending: MediaItem[];
  newReleases: MediaItem[];
  topRated: MediaItem[];
  banners: BannerItem[];
}

export interface BannerItem {
  id: string;
  title: string;
  image: string;
  subjectId: string;
  subjectType: number;
  subject?: MediaItem;
}

export interface SearchResult {
  items: MediaItem[];
  totalPages: number;
  currentPage: number;
}

// Transform API response to our MediaItem format
function transformMediaItem(item: any): MediaItem {
  if (!item) return null as any;
  
  const cover = item.cover || {};
  
  return {
    id: item.subjectId?.toString() || item.id?.toString() || "",
    title: item.title || item.name || item.subjectTitle || "",
    poster: cover.url || item.coverVerticalUrl || item.poster || item.image || "",
    backdrop: item.backdrop || item.coverHorizontalUrl || cover.url || "",
    year: item.releaseDate?.split("-")[0] || item.year || "",
    rating: parseFloat(item.imdbRatingValue) || item.rating || item.score || 0,
    type: item.subjectType || item.type || 1,
    genre: item.genre?.split(",").map((g: string) => g.trim()) || item.genres || [],
    synopsis: item.description || item.synopsis || item.overview || "",
    trailer: item.trailer?.url || item.trailerUrl || "",
    country: item.countryName || "",
    subtitles: item.subtitles || "",
    detailPath: item.detailPath || "",
  };
}

export async function getHomepage(): Promise<HomepageData> {
  try {
    const res = await fetch(`${BASE_URL}/homepage?apikey=${API_KEY}`);
    const data = await res.json();
    
    const apiData = data.data || {};
    const operatingList = apiData.operatingList || [];
    
    const featured: MediaItem[] = [];
    const trending: MediaItem[] = [];
    const newReleases: MediaItem[] = [];
    const topRated: MediaItem[] = [];
    const banners: BannerItem[] = [];

    // Parse operating list (contains different sections)
    operatingList.forEach((section: any) => {
      const sectionType = section.type?.toLowerCase() || "";
      const sectionTitle = (section.title || "").toLowerCase();
      
      // Parse banner items
      if (sectionType === "banner" && section.banner?.items) {
        section.banner.items.forEach((bannerItem: any) => {
          banners.push({
            id: bannerItem.id || "",
            title: bannerItem.title || "",
            image: bannerItem.image?.url || "",
            subjectId: bannerItem.subjectId || "",
            subjectType: bannerItem.subjectType || 2,
            subject: bannerItem.subject ? transformMediaItem(bannerItem.subject) : undefined,
          });
          
          // Also add banner subjects to featured
          if (bannerItem.subject) {
            featured.push(transformMediaItem(bannerItem.subject));
          }
        });
      }
      
      // Parse subject lists
      if (section.subjects && Array.isArray(section.subjects)) {
        const items = section.subjects.map(transformMediaItem).filter(Boolean);
        
        if (sectionTitle.includes("trending") || sectionTitle.includes("popular")) {
          trending.push(...items);
        } else if (sectionTitle.includes("new") || sectionTitle.includes("latest")) {
          newReleases.push(...items);
        } else if (sectionTitle.includes("top") || sectionTitle.includes("rated")) {
          topRated.push(...items);
        } else {
          // Add to appropriate category based on current count
          if (featured.length < 10) featured.push(...items);
          else if (trending.length < 20) trending.push(...items);
          else newReleases.push(...items);
        }
      }
    });

    // Parse top picks
    if (apiData.topPickList && Array.isArray(apiData.topPickList)) {
      const topPicks = apiData.topPickList.map(transformMediaItem).filter(Boolean);
      topRated.push(...topPicks);
    }

    return { featured, trending, newReleases, topRated, banners };
  } catch (error) {
    console.error("Failed to fetch homepage:", error);
    return { featured: [], trending: [], newReleases: [], topRated: [], banners: [] };
  }
}

export async function getTrending(type: string = "all", page: number = 1): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending?apikey=${API_KEY}&type=${type}&page=${page}`);
    const data = await res.json();
    
    // API returns data.subjectList
    const subjectList = data.data?.subjectList || [];
    
    if (!Array.isArray(subjectList)) {
      console.error("Trending subjectList is not an array:", typeof subjectList);
      return [];
    }
    
    return subjectList.map(transformMediaItem).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch trending:", error);
    return [];
  }
}

export async function searchMedia(
  query: string,
  subjectType: string = "ALL",
  page: number = 1,
  perPage: number = 24
): Promise<SearchResult> {
  try {
    const res = await fetch(
      `${BASE_URL}/search?apikey=${API_KEY}&query=${encodeURIComponent(query)}&subjectType=${subjectType}&page=${page}&perPage=${perPage}`
    );
    const data = await res.json();
    
    // API returns data.items for search results
    const itemsList = data.data?.items || data.data?.subjectList || [];
    const pager = data.data?.pager || {};
    
    const items = Array.isArray(itemsList) 
      ? itemsList.map(transformMediaItem).filter(Boolean)
      : [];
    
    const totalCount = pager.totalCount || items.length;
    const totalPages = Math.ceil(totalCount / perPage);
    
    return {
      items,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to search:", error);
    return { items: [], totalPages: 0, currentPage: page };
  }
}

export async function getItemDetails(id: string, type?: number): Promise<MediaItem | null> {
  try {
    // Try with subjectId parameter first (correct API format)
    let url = `${BASE_URL}/item-details?apikey=${API_KEY}&subjectId=${id}`;
    if (type !== undefined) {
      url += `&type=${type}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.status === "error") {
      // Fallback to old format
      const fallbackRes = await fetch(`${BASE_URL}/item-details?apikey=${API_KEY}&id=${id}&type=${type || 2}`);
      const fallbackData = await fallbackRes.json();
      if (fallbackData.status === "error") return null;
      return processItemDetails(fallbackData, id, type || 2);
    }
    
    return processItemDetails(data, id, type || data.data?.subject?.subjectType || 2);
  } catch (error) {
    console.error("Failed to fetch item details:", error);
    return null;
  }
}

function processItemDetails(data: any, id: string, type: number): MediaItem | null {
  const apiData = data.data || data;
  const subject = apiData.subject || apiData;
  const resource = apiData.resource || {};
  
  const mediaItem = transformMediaItem(subject);
  if (!mediaItem) return null;
  
  // Store detailPath for streaming API
  mediaItem.detailPath = subject.detailPath || "";
  
  // Parse trailer
  if (subject.trailer?.videoAddress?.url) {
    mediaItem.trailer = subject.trailer.videoAddress.url;
  }
  
  // Parse seasons from resource data for series
  if (type === 2 && resource.seasons && Array.isArray(resource.seasons)) {
    const seasons: Season[] = resource.seasons.map((s: any) => {
      const episodes: Episode[] = [];
      const maxEp = s.maxEp || 1;
      
      for (let i = 1; i <= maxEp; i++) {
        episodes.push({
          id: `${id}-s${s.se}-e${i}`,
          episodeNumber: i,
          seasonNumber: s.se,
          title: `Episode ${i}`,
          synopsis: "",
          thumbnail: "",
          downloadLinks: [],
        });
      }
      
      return {
        seasonNumber: s.se,
        episodes,
        resolutions: (s.resolutions || []).map((r: any) => r.resolution),
      };
    });
    
    mediaItem.seasons = seasons.sort((a, b) => a.seasonNumber - b.seasonNumber);
  }
  
  // Add streaming services
  mediaItem.streamingServices = getStreamingServices(mediaItem.title);
  
  // Add cast info
  if (apiData.stars && Array.isArray(apiData.stars)) {
    mediaItem.cast = apiData.stars.slice(0, 10).map((star: any) => ({
      name: star.name || "",
      character: star.character || "",
      avatar: star.avatarUrl || "",
    }));
  }
  
  return mediaItem;
}

export async function getMediaDownloads(id?: string): Promise<DownloadLink[]> {
  try {
    const url = id 
      ? `${BASE_URL}/media?apikey=${API_KEY}&id=${id}`
      : `${BASE_URL}/media?apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return parseDownloadLinks(data.data || data.definitions || data || []);
  } catch (error) {
    console.error("Failed to fetch downloads:", error);
    return [];
  }
}

export async function getMediaStreaming(
  subjectId: string,
  detailPath: string,
  season?: number,
  episode?: number
): Promise<MediaData> {
  try {
    let url = `${BASE_URL}/media?apikey=${API_KEY}&subjectId=${subjectId}&detailPath=${detailPath}`;
    if (season !== undefined) url += `&season=${season}`;
    if (episode !== undefined) url += `&episode=${episode}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    const downloadsData = data.data?.downloads?.data?.downloads || [];
    const captionsData = data.data?.downloads?.data?.captions || data.data?.subtitles?.data?.captions || [];
    
    const downloads: DownloadLink[] = downloadsData.map((d: any) => ({
      quality: `${d.resolution}p`,
      size: formatFileSize(parseInt(d.size) || 0),
      url: d.url || "",
      streamUrl: d.streamUrl || "",
      downloadUrl: d.downloadUrl || "",
      resolution: d.resolution || 0,
    }));
    
    const captions: Caption[] = captionsData.map((c: any) => ({
      id: c.id || "",
      lan: c.lan || "",
      lanName: c.lanName || c.lan || "",
      url: c.url || "",
      size: c.size || "",
    }));
    
    return { downloads, captions };
  } catch (error) {
    console.error("Failed to fetch media streaming:", error);
    return { downloads: [], captions: [] };
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "Unknown";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export async function getRecommendations(id: string, type: number): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/recommendations?apikey=${API_KEY}&id=${id}&type=${type}`);
    const data = await res.json();
    
    const subjectList = data.data?.subjectList || data.data || [];
    
    if (!Array.isArray(subjectList)) {
      return [];
    }
    
    return subjectList.map(transformMediaItem).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
}

export async function getHotMoviesSeries(): Promise<{ movies: MediaItem[]; series: MediaItem[] }> {
  try {
    const res = await fetch(`${BASE_URL}/hot-movies-series?apikey=${API_KEY}`);
    const data = await res.json();
    
    // API returns data.movie and data.series as arrays
    const moviesData = data.data?.movie || [];
    const seriesData = data.data?.series || [];
    
    const movies = Array.isArray(moviesData) 
      ? moviesData.map(transformMediaItem).filter(Boolean) 
      : [];
    const series = Array.isArray(seriesData) 
      ? seriesData.map(transformMediaItem).filter(Boolean) 
      : [];
    
    return { movies, series };
  } catch (error) {
    console.error("Failed to fetch hot movies/series:", error);
    return { movies: [], series: [] };
  }
}

export async function getPopularSearches(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/popular-searches?apikey=${API_KEY}`);
    const data = await res.json();
    
    // API returns data.everyoneSearch as array of objects with title
    const everyoneSearch = data.data?.everyoneSearch || [];
    
    if (!Array.isArray(everyoneSearch)) {
      return [];
    }
    
    return everyoneSearch.map((item: any) => item.title || item.keyword || item.query || item.name || "").filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch popular searches:", error);
    return [];
  }
}

function parseDownloadLinks(definitions: any[]): DownloadLink[] {
  if (!Array.isArray(definitions)) return [];
  
  return definitions.map((def: any) => ({
    quality: def.quality || def.code || def.definition || def.name || "720p",
    size: def.size || def.fileSize || "Unknown",
    url: def.url || def.downloadUrl || def.link || "",
  })).filter(link => link.url);
}

function getStreamingServices(title: string): StreamingService[] {
  const encodedTitle = encodeURIComponent(title);
  
  return [
    {
      name: "Crunchyroll",
      url: `https://www.crunchyroll.com/search?q=${encodedTitle}`,
      logo: "/streaming/crunchyroll.svg",
    },
    {
      name: "Netflix",
      url: `https://www.netflix.com/search?q=${encodedTitle}`,
      logo: "/streaming/netflix.svg",
    },
    {
      name: "HiDive",
      url: `https://www.hidive.com/search?q=${encodedTitle}`,
      logo: "/streaming/hidive.svg",
    },
    {
      name: "Amazon Prime",
      url: `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`,
      logo: "/streaming/prime.svg",
    },
    {
      name: "Hulu",
      url: `https://www.hulu.com/search?q=${encodedTitle}`,
      logo: "/streaming/hulu.svg",
    },
  ];
}
