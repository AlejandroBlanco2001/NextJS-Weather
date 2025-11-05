import { NextRequest, NextResponse } from "next/server";

const NEWS_API_URL = "https://newsdata.io/api/1/";

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '';

    if (!id) {
        return NextResponse.json({ error: "Country ID is required" }, { status: 400 });
    }

    try {
        // Fetch country name first to get news
        const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${id.toUpperCase()}?fields=name`);
        
        if (!countryResponse.ok) {
            return NextResponse.json({ error: "Country not found" }, { status: 404 });
        }

        const countryData = await countryResponse.json();
        const countryName = countryData.name.common;

        // Fetch news with pagination
        let newsUrl = `${NEWS_API_URL}latest?apikey=${process.env.NEWS_API_KEY}&q=${encodeURIComponent(countryName)}`;
        
        if (page) {
            newsUrl += `&page=${page}`;
        }

        const newsResponse = await fetch(newsUrl);
        
        if (!newsResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
        }

        const newsData = await newsResponse.json();
        
        return NextResponse.json({
            results: newsData.results || [],
            nextPage: newsData.nextPage || null,
            totalResults: newsData.totalResults || 0
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: "Failed to fetch news data" }, { status: 500 });
    }
}

