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
    return new Intl.NumberFormat('es-ES').format(pop);
  };

  const formatArea = (area: number) => {
    return new Intl.NumberFormat('es-ES').format(area);
  };

  return (
    <Card className="w-full h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-blue-500 cursor-pointer bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          {country.flag && (
            <span className="text-4xl" role="img" aria-label={`${country.label} flag`}>
              {country.flag}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
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
      
      <CardContent className="space-y-3">
        {country.capital && (
          <div className="flex items-start gap-3 text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-700 dark:text-gray-300 block">Capital</span>
              <span className="text-gray-600 dark:text-gray-400">{country.capital}</span>
            </div>
          </div>
        )}
        
        {country.population && (
          <div className="flex items-start gap-3 text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Users className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-700 dark:text-gray-300 block">Population</span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatPopulation(country.population)}
              </span>
            </div>
          </div>
        )}
        
        {country.area && (
          <div className="flex items-start gap-3 text-sm p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Globe className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-700 dark:text-gray-300 block">Area</span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatArea(country.area)} km²
              </span>
            </div>
          </div>
        )}
        
        {country.languages && country.languages.length > 0 && (
          <div className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">Languages</span>
            <div className="flex flex-wrap gap-2">
              {country.languages.slice(0, 3).map((lang, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                >
                  {lang}
                </span>
              ))}
              {country.languages.length > 3 && (
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                  +{country.languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {country.currencies && country.currencies.length > 0 && (
          <div className="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">Currencies</span>
            <div className="flex flex-wrap gap-2">
              {country.currencies.map((currency, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium"
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