export interface CountriesResponse extends Country {
    cca2: string,
    region: string,
    subregion: string,
    area: number,
}

export interface Weather {
    temperature: number;
    temperature_2m: number;
    rain: number;
    is_day: boolean;
    precipitation: number;
    temperatureHistory?: {
        dates: string[];
        temperatures: number[];
    };
}

  
export interface NewsArticle {
    article_id: string;
    title: string;
    link: string;
    description?: string;
    pubDate?: string;
    image_url?: string;
    source_id?: string;
    source_name?: string;
  }
  
export interface Country {
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
    weather: Weather;
}