import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, MapPin, Users } from "lucide-react";

interface CountryData {
  value: string;
  label: string;
  flag?: string;
  population?: number;
  capital?: string;
  region?: string;
  subregion?: string;
  area?: number;
  languages?: string[];
  currencies?: string[];
}

interface DisplayCardProps {
  country: CountryData;
}

export function DisplayCard({ country }: DisplayCardProps) {
  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M`;
    } else if (pop >= 1000) {
      return `${(pop / 1000).toFixed(0)}K`;
    }
    return pop.toString();
  };

  const formatArea = (area: number) => {
    return new Intl.NumberFormat().format(area);
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {country.flag && (
            <span className="text-3xl" role="img" aria-label={`${country.label} flag`}>
              {country.flag}
            </span>
          )}
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {country.label}
            </CardTitle>
            {country.region && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {country.subregion ? `${country.subregion}, ${country.region}` : country.region}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {country.capital && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Capital:</span>
            <span className="text-gray-600 dark:text-gray-400">{country.capital}</span>
          </div>
        )}
        
        {country.population && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Population:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {formatPopulation(country.population)}
            </span>
          </div>
        )}
        
        {country.area && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Area:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {formatArea(country.area)} km²
            </span>
          </div>
        )}
        
        {country.languages && country.languages.length > 0 && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Languages:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {country.languages.slice(0, 3).map((lang, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                >
                  {lang}
                </span>
              ))}
              {country.languages.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                  +{country.languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {country.currencies && country.currencies.length > 0 && (
          <div className="text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Currencies:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {country.currencies.map((currency, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs"
                >
                  {currency}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}