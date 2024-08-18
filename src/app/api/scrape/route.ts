import { NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/scraper';
import { analyzeContent } from '@/lib/aiAnalyzer';

export async function POST(req: Request) {
  const { url } = await req.json();
  console.log('Received scrape request for URL:', url);

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendProgress = async (progress: number) => {
    await writer.write(encoder.encode(JSON.stringify({ progress }) + '\n'));
  };

  (async () => {
    try {
      await sendProgress(10);
      const scrapedData = await scrapeWebsite(url);
      console.log('Scraped data:', scrapedData);
      await sendProgress(50);

      const analysis = await analyzeContent(scrapedData);
      console.log('Analysis result:', analysis);
      await sendProgress(90);

      await writer.write(encoder.encode(JSON.stringify({ scrapedData, analysis })));
    } catch (error: unknown) {
      console.error('Error in scrape route:', error);
      await writer.write(encoder.encode(JSON.stringify({ error: 'Failed to scrape or analyze', details: error instanceof Error ? error.message : 'Unknown error' })));
    } finally {
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, {
    headers: { 'Content-Type': 'application/json' },
  });
}