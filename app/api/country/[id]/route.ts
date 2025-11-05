const REST_COUNTRIES_API_URL = "https://restcountries.com/v3.1";
const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast"
const OPEN_SEARCH = "https://geocoding-api.open-meteo.com/v1"
const NEWS_API_URL = "https://newsdata.io/api/1/"
const FIELDS_TO_SEND_IN_REST_COUNTRIES_API = "name,capital,continents,currencies,languages,flag,population";


interface Weather {
    temperature: number;
    temperature_2m: number;
    rain: number;
    is_day: boolean;
    precipitation: number;
}


interface SingleCountryResponse {
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
    news: any;
}

import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Country ID is required" }, { status: 400 });
    }

    const countryIdNormalized = id.toLowerCase().trim();

    try {
        let response = await fetch(`${REST_COUNTRIES_API_URL}/alpha/${countryIdNormalized.toUpperCase()}?fields=${FIELDS_TO_SEND_IN_REST_COUNTRIES_API}`);
        
        if (!response.ok) {
            return NextResponse.json({ error: "Country not found" }, { status: 404 });
        }

        const data = await response.json();
        
        const countryData = Array.isArray(data) ? data[0] : data;

        if (!countryData) {
            return NextResponse.json({ error: "Country not found" }, { status: 404 });
        }

        const capital_coordinates = await getCapitalCoordinates(countryData.capital[0]);

        if (!capital_coordinates) {
            return NextResponse.json({ error: "Failed to fetch capital coordinates" }, { status: 500 });
        }

        const capitalWeather = await getCapitalWeather(capital_coordinates.latitude, capital_coordinates.longitude);
    
        if (!capitalWeather) {
            return NextResponse.json({ error: "Failed to fetch capital weather" }, { status: 500 });
        }

        const news = await getNews(countryData.name.common);

        if (!news) {
            return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
        }

        const transformedCountry: SingleCountryResponse = {
            name: countryData.name,
            capital: countryData.capital || [],
            continent: countryData.continents || [],
            currencies: countryData.currencies || {},
            languages: countryData.languages || {},
            flag: countryData.flag || '',
            population: countryData.population || 0,
            weather: capitalWeather.current as Weather,
            news: news || [],
        };

        return NextResponse.json(transformedCountry);

    } catch (error) {
        console.error('Error fetching country:', error);
        return NextResponse.json({ error: "Failed to fetch country data" }, { status: 500 });
    }
}


async function getCapitalCoordinates(capital: string) {
    try{
        const response = await fetch(`${OPEN_SEARCH}/search?name=${capital}`);

        if (!response.ok) {
            throw new Error('Failed to fetch capital coordinates');
        }

        const data = await response.json();
        return data.results[0];
    } catch (error) {
        console.error('Error fetching capital coordinates:', error);
        return null;
    }
}

async function getCapitalWeather(latitude: string, longitude: string) {
    try{
        const response = await fetch(`${OPEN_METEO_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,rain,is_day,precipitation&format=json`);

        if (!response.ok) {
            throw new Error('Failed to fetch capital weather');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching capital weather:', error);
        return null;
    }
}

async function getNews(country: string) {
    try{
        const response = await fetch(`${NEWS_API_URL}/latest?apikey=${process.env.NEWS_API_KEY}&country=${country}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching news:', error);
        return null;
    }
}
