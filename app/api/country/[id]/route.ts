const REST_COUNTRIES_API_URL = "https://restcountries.com/v3.1";
const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";

const FIELDS_TO_SEND_IN_REST_COUNTRIES_API = "name,capital,continents,currencies,languages,flag,population";


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

        const transformedCountry: SingleCountryResponse = {
            name: countryData.name,
            capital: countryData.capital || [],
            continent: countryData.continents || [],
            currencies: countryData.currencies || {},
            languages: countryData.languages || {},
            flag: countryData.flag || '',
            population: countryData.population || 0,
        };

        return NextResponse.json(transformedCountry);

    } catch (error) {
        console.error('Error fetching country:', error);
        return NextResponse.json({ error: "Failed to fetch country data" }, { status: 500 });
    }
}
