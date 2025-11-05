const REST_COUNTRIES_API_URL = "https://restcountries.com/v3.1";
import { NextRequest, NextResponse } from "next/server";
import { CountriesResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
        return NextResponse.json([]);
    }

    const queryNormalized = query.toLowerCase().trim();

    try {
        const response = await fetch(`${REST_COUNTRIES_API_URL}/name/${queryNormalized}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json([]);
            }
            throw new Error('Failed to fetch countries');
        }

        const data = await response.json();
        
        const countries = data.map((country: CountriesResponse) => ({
            value: country.cca2.toLowerCase(),
            label: country.name.common,
            flag: country.flag,
            population: country.population,
            capital: country.capital ? country.capital[0] : null,
            languages: country.languages ? Object.values(country.languages) : [],
            currencies: country.currencies ? Object.keys(country.currencies) : [],
            region: country.region,
            subregion: country.subregion,
            area: country.area,
        }));

        const sortedCountries = countries.sort((a: any, b: any) => {
            const aStartsWith = a.label.toLowerCase().startsWith(queryNormalized);
            const bStartsWith = b.label.toLowerCase().startsWith(queryNormalized);
            
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            
            return a.label.localeCompare(b.label);
        });

        return NextResponse.json(sortedCountries.slice(0, 10));        
    } catch (error) {
        console.error('Error searching countries:', error);
        return NextResponse.json({ error: "Failed to search countries" }, { status: 500 });
    }
}
