"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Calendar, Newspaper } from "lucide-react";
import { Country,NewsArticle } from "@/lib/types";
import TemperatureChart from "@/components/ui/temperature-chart";


export default function CountryPage() {
  const [country, setCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsPage, setNewsPage] = useState<string | null>(null);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCountry = async () => {
      if (!id) {
        setError('No country ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/country/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Country not found');
        }

        const data = await response.json();
        setCountry(data);
      } catch (err) {
        console.error('Error fetching country:', err);
        setError(err instanceof Error ? err.message : 'Failed to load country details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountry();
  }, [id]);

  const fetchNews = useCallback(async (page: string | null = null) => {
    if (!id || isLoadingNews) return;

    try {
      setIsLoadingNews(true);
      const url = page 
        ? `/api/country/${id}/news?page=${page}`
        : `/api/country/${id}/news`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      
      setNewsArticles(prev => [...prev, ...(data.results || [])]);
      setNewsPage(data.nextPage);
      setHasMoreNews(!!data.nextPage);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setIsLoadingNews(false);
    }
  }, [id, isLoadingNews]);

  useEffect(() => {
    if (country && newsArticles.length === 0) {
      fetchNews();
    }
  }, [country, fetchNews, newsArticles.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreNews && !isLoadingNews) {
          fetchNews(newsPage);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreNews, isLoadingNews, newsPage, fetchNews]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-gray-600"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
                Loading country details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Country Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || "The country you're looking for doesn't exist."}
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              {country.flag && (
                <span className="text-6xl" role="img" aria-label={`${country.name.common} flag`}>
                  {country.flag}
                </span>
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {country.name.common}
                </h1>
                {country.name.official && country.name.official !== country.name.common && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {country.name.official}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Country Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-l-blue-500">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                  <span className="text-2xl">{country.flag}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Country Details</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Common Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{country.name.common}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Official Name</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{country.name.official}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Population</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat().format(country.population)}
                  </p>
                </div>
              </div>
            </div>

            {/* Geographic Information Card */}
            {((country.capital && country.capital.length > 0) || (country.continent && country.continent.length > 0)) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-l-green-500">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Geographic Information
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location Details</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Capital Cities */}
                  {country.capital && country.capital.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Capital {country.capital.length > 1 ? 'Cities' : 'City'}
                      </p>
                      <div className="space-y-2">
                        {country.capital.map((capital, index) => (
                          <div key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            <p className="text-base font-medium text-gray-900 dark:text-white">{capital}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Continents */}
                  {country.continent && country.continent.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        {country.continent.length > 1 ? 'Continents' : 'Continent'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {country.continent.map((cont, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium"
                          >
                            {cont}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Temperature Chart Card */}
            {country.weather && <TemperatureChart weather={country.weather} />}
          </div>

          {/* Languages and Currencies Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Languages Card */}
            {country.languages && Object.keys(country.languages).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                    <span className="text-3xl">🗣️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Languages
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Object.keys(country.languages).length} language{Object.keys(country.languages).length > 1 ? 's' : ''} spoken
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(country.languages).map(([code, name]) => (
                    <div key={code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{code}</p>
                      </div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Currencies Card */}
            {country.currencies && Object.keys(country.currencies).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
                    <span className="text-3xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Currencies
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Object.keys(country.currencies).length} currenc{Object.keys(country.currencies).length > 1 ? 'ies' : 'y'} used
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(country.currencies).map(([code, currencyInfo]) => (
                    <div key={code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{currencyInfo.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-mono">{code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {currencyInfo.symbol && (
                          <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                            {currencyInfo.symbol}
                          </span>
                        )}
                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-bold">
                          {code}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* News Section with Infinite Scroll */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg mr-4">
                  <Newspaper className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Latest News
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recent news articles about {country.name.common}
                  </p>
                </div>
              </div>

              {newsArticles.length === 0 && !isLoadingNews ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📰</div>
                  <p className="text-gray-600 dark:text-gray-400">No news articles available at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newsArticles.map((article) => (
                    <a
                      key={article.article_id}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start gap-4">
                          {article.image_url && (
                            <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                              <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {article.title}
                              </h4>
                              <ExternalLink className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            {article.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                {article.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-500">
                              {article.pubDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {article.source_name && (
                                <div className="flex items-center">
                                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                    {article.source_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}

                  {/* Infinite Scroll Observer Target */}
                  <div ref={observerTarget} className="h-4" />

                  {/* Loading Indicator */}
                  {isLoadingNews && (
                    <div className="flex justify-center py-8">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-200 dark:border-gray-600"></div>
                          <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-600 dark:border-orange-400 border-t-transparent absolute top-0 left-0"></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading more news...</p>
                      </div>
                    </div>
                  )}

                  {/* End of News Indicator */}
                  {!hasMoreNews && newsArticles.length > 0 && (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">You've reached the end</p>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}