import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!city) {
    return NextResponse.json(
      { error: 'City parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Build backend URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const url = new URL(`${backendUrl}/weather/`);
    url.searchParams.set('city', city);
    if (lat) url.searchParams.set('lat', lat);
    if (lon) url.searchParams.set('lon', lon);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Backend responded ${response.status}` }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
