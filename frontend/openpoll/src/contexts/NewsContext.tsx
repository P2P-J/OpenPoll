import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { newsApi } from "@/api";
import type { NewsArticle } from "@/types/api.types";

const POLLING_INTERVAL_MS = 10 * 60 * 1000; // 10분

interface NewsContextValue {
    articles: NewsArticle[];
    isLoading: boolean;
    error: string | null;
    fetchedAt: Date | null;
}

const NewsContext = createContext<NewsContextValue>({
    articles: [],
    isLoading: true,
    error: null,
    fetchedAt: null,
});

export function NewsProvider({ children }: { children: ReactNode }) {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

    const fetchArticles = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) setIsLoading(true);
            const data = await newsApi.getArticles();
            setArticles(data);
            setFetchedAt(new Date());
            setError(null);
        } catch {
            setError("뉴스를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // 최초 로드
        fetchArticles(true);

        // 10분 간격 폴링
        const intervalId = setInterval(() => {
            fetchArticles(false);
        }, POLLING_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [fetchArticles]);

    return (
        <NewsContext.Provider value={{ articles, isLoading, error, fetchedAt }}>
            {children}
        </NewsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNewsContext(): NewsContextValue {
    return useContext(NewsContext);
}
