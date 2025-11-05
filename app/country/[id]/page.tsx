"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DisplayCard } from "@/components/ui/display-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface Country {
  name: {
    common: string;
    official: string;
  };
  capital: string[];
  continent: string[];
  currencies: {
    [key: string]: {
      name: string;
      symbol?: string;
    };
  };
  languages: {
    [key: string]: string;
  };
  flag: string;
  population: number;
}

export default function CountryPage() {
  const [country, setCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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

            {/* Capital Cities Card */}
            {country.capital && country.capital.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-l-green-500">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Capital {country.capital.length > 1 ? 'Cities' : 'City'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {country.capital.length} capital{country.capital.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {country.capital.map((capital, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{capital}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continents Card */}
            {country.continent && country.continent.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-l-purple-500">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {country.continent.length > 1 ? 'Continents' : 'Continent'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Geographic Location</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {country.continent.map((cont, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium"
                    >
                      {cont}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
}