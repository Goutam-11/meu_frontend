// app/api/exchange/[id]/route.ts
import { NextResponse } from "next/server";
import { getExchangeData } from "@/lib/config";

export const runtime = "nodejs";

type ExchangeData = {
  positions: unknown[]; // until you define structure
  trades: unknown[];
  balance: Record<string, unknown>;
  positionsError: string | null;
  tradesError: string | null;
  balanceError: string | null;
};

interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  timestamp: string;
}

interface SuccessResponse {
  positions: unknown[];
  trades: unknown[];
  balance: Record<string, unknown>;
  warnings?: string[];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ErrorResponse | SuccessResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Parse and validate request parameters
    let exchangeId: string;
    try {
      const resolvedParams = await params;
      exchangeId = resolvedParams?.id;

      if (
        !exchangeId ||
        typeof exchangeId !== "string" ||
        exchangeId.trim() === ""
      ) {
        console.warn(
          `[Exchange API] Invalid ID parameter received: ${exchangeId}`,
        );
        return NextResponse.json(
          {
            error: "Invalid exchange ID provided",
            code: "INVALID_ID",
            details: "Exchange ID must be a non-empty string",
            timestamp,
          },
          { status: 400 },
        );
      }
    } catch (paramErr) {
      console.error("[Exchange API] Error extracting parameters:", paramErr);
      return NextResponse.json(
        {
          error: "Failed to parse request parameters",
          code: "PARAM_PARSE_ERROR",
          details: "Unable to extract exchange ID from request",
          timestamp,
        },
        { status: 400 },
      );
    }

    // Fetch exchange data with timeout protection
    let data:ExchangeData | null = null;
    try {
      const timeoutPromise: Promise<ExchangeData> = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Exchange API request timeout")),
          30000,
        ),
      );

      data = await Promise.race([getExchangeData(exchangeId), timeoutPromise]);
    } catch (fetchErr) {
      const errorMessage =
        fetchErr instanceof Error ? fetchErr.message : "Unknown error";

      // Log the error with context
      console.error(
        `[Exchange API] Failed to fetch exchange data for ID: ${exchangeId}`,
        {
          error: errorMessage,
          timestamp,
        },
      );

      // Handle specific error cases
      if (errorMessage.includes("not found")) {
        return NextResponse.json(
          {
            error: `Exchange with ID "${exchangeId}" not found`,
            code: "EXCHANGE_NOT_FOUND",
            timestamp,
          },
          { status: 404 },
        );
      }

      if (
        errorMessage.includes("credentials") ||
        errorMessage.includes("API")
      ) {
        return NextResponse.json(
          {
            error: "Failed to authenticate with exchange API",
            code: "AUTH_ERROR",
            details: "Check that API credentials are valid and not expired",
            timestamp,
          },
          { status: 503 },
        );
      }

      if (errorMessage.includes("timeout")) {
        return NextResponse.json(
          {
            error: "Exchange API request timed out",
            code: "TIMEOUT",
            details: "The exchange took too long to respond. Please try again.",
            timestamp,
          },
          { status: 504 },
        );
      }

      if (errorMessage.includes("Unsupported exchange")) {
        return NextResponse.json(
          {
            error: "Unsupported exchange type",
            code: "UNSUPPORTED_EXCHANGE",
            details: errorMessage,
            timestamp,
          },
          { status: 400 },
        );
      }

      // Generic API error
      return NextResponse.json(
        {
          error: "Failed to fetch exchange data",
          code: "EXCHANGE_API_ERROR",
          details: errorMessage,
          timestamp,
        },
        { status: 503 },
      );
    }

    // Validate and sanitize response data
    if (!data || typeof data !== "object") {
      console.error("[Exchange API] Invalid response data structure:", data);
      return NextResponse.json(
        {
          error: "Invalid data received from exchange",
          code: "INVALID_DATA",
          timestamp,
        },
        { status: 500 },
      );
    }

    // Collect any warnings from partial failures
    const warnings: string[] = [];

    if (data.positionsError) {
      warnings.push(`Positions fetch failed: ${data.positionsError}`);
    }
    if (data.tradesError) {
      warnings.push(`Trades fetch failed: ${data.tradesError}`);
    }
    if (data.balanceError) {
      warnings.push(`Balance fetch failed: ${data.balanceError}`);
    }

    // If all data fetches failed, return error
    if (warnings.length === 3) {
      console.error(
        "[Exchange API] All data fetches failed for exchange:",
        exchangeId,
      );
      return NextResponse.json(
        {
          error: "Unable to retrieve any data from the exchange",
          code: "ALL_FETCHES_FAILED",
          details:
            "Failed to fetch positions, trades, and balance. Check your API credentials and network connection.",
          timestamp,
        },
        { status: 503 },
      );
    }

    // Build success response
    const response: SuccessResponse = {
      positions: Array.isArray(data.positions) ? data.positions : [],
      trades: Array.isArray(data.trades) ? data.trades : [],
      balance:
        data.balance && typeof data.balance === "object" ? data.balance : {},
      ...(warnings.length > 0 && { warnings }),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    // Catch-all for any unexpected errors
    console.error("[Exchange API] Unexpected error in GET handler:", err);

    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your request",
        code: "INTERNAL_ERROR",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
        timestamp,
      },
      { status: 500 },
    );
  }
}
