import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Search endpoint with x402 payment support
// Uses Firecrawl's search API that combines web search with scraping

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit, sources, scrapeOptions } = body;

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check for Firecrawl API key
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      return NextResponse.json(
        { error: 'Firecrawl API key not configured' },
        { status: 500 }
      );
    }

    // Check for x402 payment header
    const paymentHeader = request.headers.get('X-PAYMENT');

    // Log the payment header if present (for debugging)
    if (paymentHeader) {
      console.log('Payment header received, forwarding to Firecrawl');
      console.log('X-PAYMENT header (first 200 chars):', paymentHeader.substring(0, 200));

      // Decode and log the payment details
      try {
        const decoded = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
        console.log('Decoded payment:', JSON.stringify(decoded, null, 2));

        // Payment validation logging
        console.log('═══ PAYMENT VALIDATION ═══');
        console.log('x402 Version:', decoded.x402Version);
        console.log('Payment Scheme:', decoded.scheme);
        console.log('Network:', decoded.network);
        console.log('From Address:', decoded.payload?.authorization?.from);
        console.log('To Address (Recipient):', decoded.payload?.authorization?.to);
        console.log('Payment Value:', decoded.payload?.authorization?.value, 'units');
        console.log('Payment Value (USDC):', (parseInt(decoded.payload?.authorization?.value) / 1e6).toFixed(6), 'USDC');
        console.log('Payment Nonce:', decoded.payload?.authorization?.nonce);
        console.log('Valid After:', decoded.payload?.authorization?.validAfter, '(', new Date(parseInt(decoded.payload?.authorization?.validAfter) * 1000).toISOString(), ')');
        console.log('Valid Before:', decoded.payload?.authorization?.validBefore, '(', new Date(parseInt(decoded.payload?.authorization?.validBefore) * 1000).toISOString(), ')');
        console.log('Current Time:', Math.floor(Date.now() / 1000), '(', new Date().toISOString(), ')');
        console.log('Signature:', decoded.payload?.signature);

        // Validate network matches env
        const expectedNetwork = process.env.NEXT_PUBLIC_NETWORK || 'base';
        if (decoded.network !== expectedNetwork) {
          console.warn(`⚠️  WARNING: Payment network (${decoded.network}) doesn't match expected network (${expectedNetwork})`);
        }

        const expectedUSDC = process.env.USDC_CONTRACT_ADDRESS;
        console.log('Expected USDC Contract:', expectedUSDC);
        console.log('═══ END PAYMENT VALIDATION ═══');
      } catch (e) {
        console.log('Could not decode payment header as base64 JSON');
      }
    } else {
      console.log('No payment header, Firecrawl will return 402');
    }

    // Prepare Firecrawl headers
    const firecrawlHeaders: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firecrawlApiKey}`,
    };

    // Forward the X-PAYMENT header if provided
    if (paymentHeader) {
      firecrawlHeaders['X-PAYMENT'] = paymentHeader;
    }

    const firecrawlEndpoint = process.env.FIRECRAWL_API_BASE_URL || 'https://api.firecrawl.dev/v2/x402/search';
    console.log('Calling Firecrawl x402 search endpoint:', firecrawlEndpoint);
    console.log('Search query:', query);

    // Build search options matching Firecrawl's search API
    const searchOptions = {
      query,
      limit: Math.min(limit || 10, 30), // Cap at 30
      sources: sources || ['web'], // Default to web search
      ...(scrapeOptions && {
        scrapeOptions: {
          onlyMainContent: scrapeOptions.onlyMainContent !== undefined ? scrapeOptions.onlyMainContent : true,
          ...(scrapeOptions.maxAge && { maxAge: scrapeOptions.maxAge })
        }
      })
    };

    console.log('Search options:', JSON.stringify(searchOptions, null, 2));

    // Call Firecrawl's x402 search endpoint
    let firecrawlResponse;
    try {
      firecrawlResponse = await axios.post(
        firecrawlEndpoint,
        searchOptions,
        {
          headers: firecrawlHeaders,
          validateStatus: (status) => status === 200 || status === 402 || status === 500,
        }
      );
    } catch (verificationError: any) {
      console.error('═══ FACILITATOR VERIFICATION ERROR ═══');
      console.error('Failed to verify payment with Firecrawl facilitator');
      console.error('Error type:', verificationError?.name || typeof verificationError);
      console.error('Error message:', verificationError?.message || String(verificationError));
      console.error('Facilitator URL:', firecrawlEndpoint);

      if (verificationError?.code) {
        console.error('Error code:', verificationError.code);
      }

      if (verificationError?.code === 'ECONNABORTED' || verificationError?.message?.includes('timeout')) {
        console.error('⚠️  This appears to be a timeout error');
      }

      if (verificationError?.stack) {
        console.error('Stack trace:', verificationError.stack);
      }

      console.error('═══ END FACILITATOR ERROR ═══');

      return NextResponse.json(
        {
          error: 'Facilitator verification failed',
          message: `Payment verification failed: ${verificationError?.message || 'Unknown error'}`,
          errorType: verificationError?.name || 'UnknownError',
          facilitatorUrl: firecrawlEndpoint
        },
        { status: 500 }
      );
    }

    // Handle Firecrawl's response
    if (firecrawlResponse.status === 402) {
      // Payment required
      const is_verification_failure = firecrawlResponse.data.error &&
                                      firecrawlResponse.data.error.toLowerCase().includes('verification');

      if (is_verification_failure) {
        console.error('═══ PAYMENT VERIFICATION FAILED ═══');
        console.error('Firecrawl rejected the payment:');
        console.error('Error:', firecrawlResponse.data.error);
        console.error('Network:', firecrawlResponse.data.accepts?.[0]?.network);
        console.error('Expected asset:', firecrawlResponse.data.accepts?.[0]?.asset);
        console.error('Expected recipient:', firecrawlResponse.data.accepts?.[0]?.payTo);
        console.error('Max amount:', firecrawlResponse.data.accepts?.[0]?.maxAmountRequired);

        if (paymentHeader) {
          try {
            const decoded = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
            console.error('Payment we sent:');
            console.error('  Network:', decoded.network);
            console.error('  From:', decoded.payload?.authorization?.from);
            console.error('  To:', decoded.payload?.authorization?.to);
            console.error('  Value:', decoded.payload?.authorization?.value);
          } catch (e) {
            console.error('Could not decode sent payment for comparison');
          }
        }
        console.error('═══ END VERIFICATION FAILURE ═══');
      } else {
        console.log('Firecrawl returned 402 Payment Required:', firecrawlResponse.data);
        console.log('Payment requirements:', firecrawlResponse.data.accepts?.[0]);
      }

      return NextResponse.json(
        firecrawlResponse.data,
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else if (firecrawlResponse.status === 200) {
      // Success - Firecrawl returned the search results
      console.log('Firecrawl returned search results');
      console.log('Response status:', firecrawlResponse.status);
      console.log('Results found:', firecrawlResponse.data?.data?.web?.length || 0);

      // Check for and log X-PAYMENT-RESPONSE header (transaction confirmation)
      const paymentResponseHeader = firecrawlResponse.headers['x-payment-response'];
      if (paymentResponseHeader) {
        console.log('═══ PAYMENT CONFIRMATION ═══');
        console.log('Raw X-PAYMENT-RESPONSE header:', paymentResponseHeader);

        try {
          const decoded = JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString());
          console.log('Decoded payment response:', JSON.stringify(decoded, null, 2));

          if (decoded.transaction) {
            console.log('✅ Payment transaction hash:', decoded.transaction);
            console.log('View on BaseScan:', `https://basescan.org/tx/${decoded.transaction}`);
          }
        } catch (e) {
          console.error('Could not decode X-PAYMENT-RESPONSE:', e);
        }

        console.log('═══ END PAYMENT CONFIRMATION ═══');
      } else {
        console.log('Note: No X-PAYMENT-RESPONSE header (payment may not have been required)');
      }

      const response = NextResponse.json(firecrawlResponse.data);

      // Forward the X-PAYMENT-RESPONSE header to client
      if (paymentResponseHeader) {
        response.headers.set('X-PAYMENT-RESPONSE', paymentResponseHeader);
        response.headers.set('Access-Control-Expose-Headers', 'X-PAYMENT-RESPONSE');
      }

      return response;
    } else if (firecrawlResponse.status === 500) {
      // Server error from Firecrawl
      console.error('═══ FIRECRAWL 500 ERROR DETAILS ═══');
      console.error('Status:', firecrawlResponse.status);
      console.error('Status Text:', firecrawlResponse.statusText);
      console.error('Response Data:', firecrawlResponse.data);

      return NextResponse.json(
        {
          error: 'Firecrawl server error',
          message: 'Firecrawl API returned 500 Internal Server Error.',
          status: 500,
          details: firecrawlResponse.data,
        },
        { status: 500 }
      );
    } else {
      // Unexpected response
      console.error('Unexpected response from Firecrawl:', firecrawlResponse.status, firecrawlResponse.data);
      return NextResponse.json(
        { error: 'Unexpected response from Firecrawl', status: firecrawlResponse.status },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Search error:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;

      return NextResponse.json(
        {
          error: 'Firecrawl API error',
          message: message,
          status: status
        },
        { status: status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search', message: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
