import { NextRequest, NextResponse } from "next/server";

const NEWS_API_URL = "https://newsdata.io/api/1/";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '';
    const country = searchParams.get('country') || '';

    if (!id) {
        return NextResponse.json({ error: "Country ID is required" }, { status: 400 });
    }

    try {
        let newsUrl = `${NEWS_API_URL}latest?apikey=${process.env.NEWS_API_KEY}&q=${encodeURIComponent(id)}&country=${encodeURIComponent(country)}`;
        
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

