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
      const detail = (data as { detail: unknown }).detail;

      if (Array.isArray(detail)) {
        const messages = detail
          .map((error) => {
            if (
              typeof error === "object" &&
              error !== null &&
              "loc" in error &&
              "msg" in error
            ) {
              const item = error as {
                loc?: unknown;
                msg?: unknown;
              };

              const location = Array.isArray(item.loc)
                ? item.loc.join(".")
                : "";

              return location
                ? `${location}: ${String(item.msg)}`
                : String(item.msg);
            }

            return String(error);
          })
          .join("; ");

        throw new Error(messages);
      }

      throw new Error(String(detail));
    }

    throw new Error(`ECONIQ API error ${response.status}`);
  }

  return data as T;
}

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

export async function getObservations(params?: ObservationParams) {
  const searchParams = new URLSearchParams();

  if (params?.country) searchParams.set("country", params.country);
  if (params?.indicator) searchParams.set("indicator", params.indicator);
  if (params?.start_date) searchParams.set("start_date", params.start_date);
  if (params?.end_date) searchParams.set("end_date", params.end_date);

  const query = searchParams.toString();

  return apiFetch<Observation[]>(
    `/observations${query ? `?${query}` : ""}`,
  );
}

export interface LatestAnalytics {
  country: string;
  country_code: string;
  indicator: string;
  indicator_code: string;
  value: number;
  date: string;
}

export async function getLatestAnalytics(
  country = "KE",
  indicator = "INFLATION",
) {
  const searchParams = new URLSearchParams({
    country,
    indicator,
  });

  return apiFetch<LatestAnalytics>(
    `/analytics/latest?${searchParams.toString()}`,
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

export async function getHistoricalAnalytics(params: {
  country: string;
  indicator: string;
}) {
  const searchParams = new URLSearchParams({
    country: params.country,
    indicator: params.indicator,
  });

  return apiFetch<HistoricalAnalytics>(
    `/analytics/history?${searchParams.toString()}`,
  );
}

export interface InflationForecast {
  country: string;
  country_code: string;
  indicator: string;
  indicator_code: string;
  forecast_period: string;
  latest_data_date: string;
  current_inflation: number;
  forecast_inflation: number;
  unit: string;
  model: string;
  model_file: string;
}

export async function getInflationForecast() {
  return apiFetch<InflationForecast>("/forecasts/inflation");
}

export interface FoodPriceForecast {
  country: string;
  country_code: string;
  commodity: string;
  latest_model_data_date: string;
  forecast_date: string | null;
  current_price: number;
  forecast_price: number;
  price_change: number;
  percentage_change: number;
  unit: string;
  forecast_period: string;
  data_status: string;
  weather_data_available_through: string;
  model: string;
  model_file: string;
}

export async function getFoodPriceForecast(
  commodity = "Beans (dry)",
) {
  return apiFetch<FoodPriceForecast>(
    `/forecasts/food-prices?commodity=${encodeURIComponent(commodity)}`,
  );
}

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

export async function askEconIQ(question: string, limit = 7) {
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

export interface FoodCommodity {
  commodity: string;
  latest_complete_date: string;
  complete_rows: number;
}

export async function getAvailableFoodCommodities() {
  return apiFetch<FoodCommodity[]>(
    "/forecasts/food-prices/commodities",
  );
}

export async function predictFoodPrice(
  commodity: string,
) {
  return apiFetch<FoodPriceForecast>(
    "/forecasts/food-prices",
    {
      method: "POST",
      body: JSON.stringify({
        commodity,
      }),
    },
  );
}
