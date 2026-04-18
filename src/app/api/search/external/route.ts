import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://api.semanticscholar.org/graph/v1';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!q) return NextResponse.json({ error: 'query required' }, { status: 400 });

  try {
    const fields = 'paperId,title,authors,year,abstract,venue,openAccessPdf,citationCount,publicationTypes,externalIds';
    const url = `${BASE}/paper/search?query=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&fields=${fields}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'JagoIlmiah/1.0 (academic-platform)',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      throw new Error(`Semantic Scholar returned ${res.status}`);
    }

    const data = await res.json();

    // Normalize to our format
    const papers = (data.data || []).map((p: any) => ({
      id: p.paperId,
      title: p.title || 'Tanpa Judul',
      authors: (p.authors || []).map((a: any) => a.name).join(', ') || 'Anonim',
      year: p.year,
      abstract: p.abstract || '',
      venue: p.venue || '',
      citationCount: p.citationCount || 0,
      isOpenAccess: !!p.openAccessPdf,
      pdfUrl: p.openAccessPdf?.url || null,
      doi: p.externalIds?.DOI || null,
      types: p.publicationTypes || [],
      source: 'semantic_scholar',
    }));

    return NextResponse.json({
      total: data.total || 0,
      offset,
      limit,
      papers,
    });
  } catch (err: any) {
    console.error('Semantic Scholar error:', err.message);
    return NextResponse.json({ error: 'Gagal mengambil data dari Semantic Scholar', papers: [], total: 0 }, { status: 200 });
  }
}
