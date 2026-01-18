import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkServiceArea, formatPostcode } from '@/lib/pricing';

// Postcode check request schema
const postcodeCheckSchema = z.object({
  postcode: z.string().min(2, 'Postcode is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const parseResult = postcodeCheckSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid postcode',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { postcode } = parseResult.data;
    
    // Check service area
    const result = checkServiceArea(postcode);
    
    // Return service area result
    return NextResponse.json({
      success: true,
      postcode: formatPostcode(postcode),
      ...result,
    });

  } catch (error) {
    console.error('Postcode check API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check postcode',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Please POST with { "postcode": "SM1 1AA" }' },
    { status: 405 }
  );
}
