const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api/v1";

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("ECONIQ API request:", url);

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error("ECONIQ API error:", {
      url,
      status: response.status,
      data,
    });

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data
    ) {
      throw new Error(
        String(
          (data as { detail: unknown }).detail,
        ),
      );
    }

    throw new Error(
      `ECONIQ API error ${response.status}`,
    );
  }

  return data as T;
}

/* ============================================================
   COUNTRIES
============================================================ */

export interface Country {
  id: number;
  iso_code: string;
  name: string;
  region?: string;
  currency?: string;
}

export async function getCountries() {
  return apiFetch<Country[]>("/countries");
}

/* ============================================================
   INDICATORS
============================================================ */

export interface Indicator {
  id: number;
  code: string;
  name: string;
  description?: string;
  unit?: string;
}

export async function getIndicators() {
  return apiFetch<Indicator[]>("/indicators");
}

/* ============================================================
   OBSERVATIONS
============================================================ */

export interface Observation {
  id?: number;
  country_id?: number;
  indicator_id?: number;
  source_id?: number;

  observation_date: string;
  value: number;

  country?: string;
  country_code?: string;

  indicator?: string;
  indicator_code?: string;

  source?: string;
}

export interface ObservationParams {
  country?: string;
  indicator?: string;
  start_date?: string;
  end_date?: string;
}

export async function getObservations(
  params?: ObservationParams,
) {
  const searchParams = new URLSearchParams();

  if (params?.country) {
    searchParams.set(
      "country",
      params.country,
    );
  }

  if (params?.indicator) {
    searchParams.set(
      "indicator",
      params.indicator,
    );
  }

  if (params?.start_date) {
    searchParams.set(
      "start_date",
      params.start_date,
    );
  }

  if (params?.end_date) {
    searchParams.set(
      "end_date",
      params.end_date,
    );
  }

  const query = searchParams.toString();

  return apiFetch<Observation[]>(
    `/observations${query ? `?${query}` : ""}`,
  );
}

/* ============================================================
   ANALYTICS
============================================================ */

export interface LatestAnalytics {
  country: string;
  country_code: string;

  indicators: Record<
    string,
    {
      value: number;
      date: string;
    }
  >;
}

export async function getLatestAnalytics(
  country = "KE",
) {
  return apiFetch<LatestAnalytics>(
    `/analytics/latest?country=${encodeURIComponent(
      country,
    )}`,
  );
}

export interface HistoricalAnalytics {
  country: string;
  country_code: string;

  indicator: string;
  indicator_code: string;

  observations: {
    date: string;
    value: number;
  }[];
}

export async function getHistoricalAnalytics(
  params: {
    country: string;
    indicator: string;
  },
) {
  const searchParams = new URLSearchParams({
    country: params.country,
    indicator: params.indicator,
  });

  return apiFetch<HistoricalAnalytics>(
    `/analytics/history?${searchParams.toString()}`,
  );
}

/* ============================================================
   RAG
============================================================ */

export interface RAGSource {
  document_id: number;
  chunk_id: number;
  chunk_index: number;
  page_number: number;
  score: number;
}

export interface RagResponse {
  question: string;
  answer: string;
  sources: RAGSource[];
}

export async function askEconIQ(
  question: string,
  limit = 7,
) {
  return apiFetch<RagResponse>(
    "/rag/ask",
    {
      method: "POST",

      body: JSON.stringify({
        question,
        limit,
      }),
    },
  );
}