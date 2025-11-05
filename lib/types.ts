export interface CountriesResponse {
    name: {
        common: string,
        official: string,
    },
    cca2: string,
    flag: string,
    population: number,
    capital: string | null,
    languages: string[],
    currencies: string[],
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


export interface SingleCountryResponse {
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
