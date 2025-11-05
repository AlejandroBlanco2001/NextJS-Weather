const REST_COUNTRIES_API_URL = "https://restcountries.com/v3.1";

import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const country = params?.name;

    if (!country) {
        return NextResponse.json({ error: "Country name is required" }, { status: 400 });
    }

    const contryNormalized = country.toLowerCase().trim();

    const response = await fetch(`${REST_COUNTRIES_API_URL}/name/${contryNormalized}`);
    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch country" }, { status: 500 });
    }

    if (data.status === 404) {
        return NextResponse.json({ error: "Country not found" }, { status: 404 }); 
    }

    return NextResponse.json(data);
}