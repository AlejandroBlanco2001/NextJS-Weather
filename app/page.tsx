"use client"

import { DisplayCard } from "@/components/ui/display-card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCountry, setSearchCountry] = useState("");
  
  const debouncedSearchCountry = useDebounce(searchCountry, 500);

  const getCountries = async (query: string) => {
    if (!query || query.length < 2) {
      return [];
    }
    
    const response = await fetch(`/api/countries/search?q=${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    const fetchCountries = async () => {
      if (!debouncedSearchCountry || debouncedSearchCountry.length < 2) {
        setCountries([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getCountries(debouncedSearchCountry);
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setError('Failed to fetch countries. Please try again.');
        setCountries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [debouncedSearchCountry]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🌍 Global Pulse
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Discover countries around the world
          </p>
          
          <div className="w-full max-w-md mx-auto">
            <FieldGroup>
              <Field>
                <FieldLabel>Country</FieldLabel>
                <div className="relative">
                  <input
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                      isLoading 
                        ? 'border-blue-400 focus:ring-blue-400 bg-blue-50 dark:bg-gray-600' 
                        : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                    }`}
                    placeholder="Search for a country (e.g., United States, France...)"
                    type="text"
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}
                  {!isLoading && searchCountry.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-400 dark:text-gray-500">🔍</span>
                    </div>
                  )}
                </div>
                {searchCountry.length > 0 && searchCountry.length < 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Type at least 2 characters to search
                  </p>
                )}
              </Field>
            </FieldGroup>
          </div>
        </div>

        {isLoading && (
          <div className="mt-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-gray-600"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
                  Searching countries...
                </p>
                <div className="flex justify-center mt-2 space-x-1">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-12">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-500 dark:text-red-400 text-lg font-medium">
                {error}
              </p>
            </div>
          </div>
        )}
        
        {countries.length > 0 && (
          <div className="mt-12 animate-in fade-in duration-500">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
              Search Results ({countries.length} countries)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {countries.map((country, index) => (
                <div 
                  key={country.value} 
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <Link href={`/country/${country.label}`}>
                    <DisplayCard country={country} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!isLoading && !error && countries.length === 0 && (
          <div className="text-center mt-12">
            <div className="text-6xl mb-4">🔍</div>
            {searchCountry.length < 2 ? (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  Start typing to search for countries
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Type at least 2 characters to begin searching
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  No countries found for "{searchCountry}"
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
