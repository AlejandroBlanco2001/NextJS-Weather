const REST_COUNTRIES_API_URL = "https://restcountries.com/v3.1";
const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast"
const OPEN_SEARCH = "https://geocoding-api.open-meteo.com/v1"
const FIELDS_TO_SEND_IN_REST_COUNTRIES_API = "name,capital,continents,currencies,languages,flag,population";


interface Weather {
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

        const transformedCountry: SingleCountryResponse = {
            name: countryData.name,
            capital: countryData.capital || [],
            continent: countryData.continents || [],
            currencies: countryData.currencies || {},
            languages: countryData.languages || {},
            flag: countryData.flag || '',
            population: countryData.population || 0,
            weather: capitalWeather.current as Weather,
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
        // Get current date and date from 7 days ago
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        const response = await fetch(
            `${OPEN_METEO_API_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain,precipitation&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&timezone=auto`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch capital weather');
        }

        const data = await response.json();
        
        // Get the last temperature_2m value from the 7-day period
        const hourlyData = data.hourly;
        const lastIndex = hourlyData.temperature_2m.length - 1;
        
        // Find the last valid temperature reading (not null)
        let lastTemperature = hourlyData.temperature_2m[lastIndex];
        let tempIndex = lastIndex;
        while (lastTemperature === null && tempIndex > 0) {
            tempIndex--;
            lastTemperature = hourlyData.temperature_2m[tempIndex];
        }
        
        // Prepare daily average temperatures for the graph (one value per day)
        const dailyTemperatures: { date: string; temp: number }[] = [];
        const temps = hourlyData.temperature_2m;
        const times = hourlyData.time;
        
        // Group by date and calculate daily average
        const dailyData: { [key: string]: number[] } = {};
        for (let i = 0; i < temps.length; i++) {
            if (temps[i] !== null) {
                const date = times[i].split('T')[0];
                if (!dailyData[date]) {
                    dailyData[date] = [];
                }
                dailyData[date].push(temps[i]);
            }
        }
        
        // Calculate averages and sort by date
        Object.keys(dailyData).sort().forEach(date => {
            const values = dailyData[date];
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            dailyTemperatures.push({ date, temp: Math.round(avg * 10) / 10 });
        });
        
        return {
            current: {
                temperature_2m: lastTemperature,
                rain: hourlyData.rain[tempIndex] || 0,
                precipitation: hourlyData.precipitation[tempIndex] || 0,
                is_day: true, // Default since we can't determine from historical data
                temperatureHistory: {
                    dates: dailyTemperatures.map(d => d.date),
                    temperatures: dailyTemperatures.map(d => d.temp)
                }
            }
        };
    } catch (error) {
        console.error('Error fetching capital weather:', error);
        return null;
    }
}
