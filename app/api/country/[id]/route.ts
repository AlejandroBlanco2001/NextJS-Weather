import { NextRequest, NextResponse } from "next/server";
import { Country, Weather } from "@/lib/types";

const REST_COUNTRIES_API_URL = "https://restcountries.com/v3.1";
const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast"
const OPEN_SEARCH = "https://geocoding-api.open-meteo.com/v1"
const FIELDS_TO_SEND_IN_REST_COUNTRIES_API = "name,capital,continents,currencies,languages,flag,population";


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

    const countryIdNormalized = id.toUpperCase().trim();

    let response: Response | null = null;
    
    try {
        response = await fetch(`${REST_COUNTRIES_API_URL}/alpha/${countryIdNormalized}?fields=${FIELDS_TO_SEND_IN_REST_COUNTRIES_API}`);
    } catch (error) {
        console.error('Error fetching country:', error);
        return NextResponse.json({ error: "Failed to fetch country data" }, { status: 500 });
    }
    

    if (!response || !response.ok) {
        return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    const data = await response.json();
    
    const countryData = Array.isArray(data) ? data[0] : data;

    if (!countryData) {
        return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    let capitalWeather: Weather | null = null;

    try {
        const capital_coordinates = await getCapitalCoordinates(countryData.capital[0]);    

        if (!capital_coordinates) {
            return NextResponse.json({ error: "Failed to fetch capital coordinates" }, { status: 500 });
        }

        const weather = await getCapitalWeather(capital_coordinates.latitude, capital_coordinates.longitude);


        if (!weather) {
            return NextResponse.json({ error: "Failed to fetch capital weather" }, { status: 500 });
        }

        capitalWeather = weather.current as Weather;
    } catch (error) {
        console.error('Error fetching capital weather:', error);
        return NextResponse.json({ error: "Failed to fetch capital weather" }, { status: 500 });
    }

    const transformedCountry: Country = {
        name: countryData.name,
        capital: countryData.capital || [''],
        continent: countryData.continents || [''],
        currencies: countryData.currencies,
        languages: countryData.languages,
        flag: countryData.flag,
        population: countryData.population,
        weather: capitalWeather,
    };

    return NextResponse.json(transformedCountry);
}


async function getCapitalCoordinates(capital: string): Promise<{ latitude: string; longitude: string } | null> {
    try{
        const response = await fetch(`${OPEN_SEARCH}/search?name=${capital}`);

        if (!response.ok) {
            throw new Error('Failed to fetch capital coordinates');
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return null;
        }

        if (!data.results[0].latitude || !data.results[0].longitude) {
            return null;
        }

        return {
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude,
        };
    } catch (error) {
        console.error('Error fetching capital coordinates:', error);
        return null;
    }
}

async function getCapitalWeather(latitude: string, longitude: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    let response: Response | null = null;
    try{
        response = await fetch(
            `${OPEN_METEO_API_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain,precipitation&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&timezone=auto`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch capital weather');
        }
    } catch (error) {
        console.error('Error fetching capital weather:', error);
        return null;
    }

    const data = await response.json();
    
    const hourlyData = data.hourly;
    const temperatures = hourlyData.temperature_2m;
    const times = hourlyData.time;
    const rain = hourlyData.rain;
    const precipitation = hourlyData.precipitation;

    // Get the last valid temperature reading
    const lastIndex = temperatures.length - 1;
    let lastTemperature = temperatures[lastIndex];
    let tempIndex = lastIndex;
    while (lastTemperature === null && tempIndex > 0) {
        tempIndex--;
        lastTemperature = temperatures[tempIndex];
    }

    const dailyTemperatures = calculateDailyAverages(temperatures, times);
    
    return {
        current: {
            temperature: lastTemperature,
            temperature_2m: lastTemperature,
            rain: rain[tempIndex] || 0,
            precipitation: precipitation[tempIndex] || 0,
            is_day: true,
            temperatureHistory: {
                dates: dailyTemperatures.map(d => d.date),
                temperatures: dailyTemperatures.map(d => d.temp)
            }
        }
    };
}

function calculateDailyAverages(
    items: (number | null)[], 
    times: string[]
): { date: string; temp: number }[] {
    const dailyData: { [key: string]: number[] } = {};
    
    const grouped = Object.groupBy(
        times
            .map((time, i) => ({ date: time.split('T')[0], value: items[i] }))
            .filter(entry => entry.value !== null),
        ({ date }) => date
    );


    Object.assign(dailyData, grouped);
    
    // Calculate averages and sort by date
    return Object.keys(dailyData)
        .sort()
        .map(date => {
            const values = dailyData[date];
            const avg = values.reduce((sum, val: any) => sum + val.value, 0) / values.length;
            return { 
                date, 
                temp: Math.round(avg * 10) / 10 
            };
        });
}
