"use client";

import {
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Bot,
  Database,
  FileText,
  Globe2,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Navbar from "@/components/layout/Navbar";
import {
  askEconIQ,
  type RagResponse,
  type RAGSource,
} from "@/lib/api";

type Message = {
  id: number;
  question: string;
  response: RagResponse;
};

const questions = [
  {
    label: "Inflation",
    question: "What were the main drivers of inflation in Kenya in July 2026?",
  },
  {
    label: "Food prices",
    question: "Which food prices contributed most to inflation in Kenya?",
  },
  {
    label: "GDP",
    question: "How has Kenya's GDP growth changed over time?",
  },
  {
    label: "Employment",
    question: "What is Kenya's unemployment rate?",
  },
];

const research = [
  {
    source: "KNBS",
    type: "Consumer prices",
    title: "Kenya Consumer Price Index & Inflation",
    date: "July 2026",
    description:
      "Inflation, food prices, transport costs and household expenditure movements.",
    icon: FileText,
  },
  {
    source: "CBK",
    type: "Monetary policy",
    title: "Kenya monetary developments",
    date: "2026",
    description:
      "Interest rates, exchange rates, liquidity and financial conditions.",
    icon: BarChart3,
  },
  {
    source: "World Bank",
    type: "Economic outlook",
    title: "Kenya economic outlook",
    date: "2026",
    description:
      "Growth, macroeconomic conditions and structural economic developments.",
    icon: TrendingUp,
  },
];

export default function ExplorePage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentMessage =
    messages.length > 0
      ? messages[messages.length - 1]
      : null;

  async function askQuestion(value?: string) {
    const query = (value ?? question).trim();

    if (!query || loading) {
      return;
    }

    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await askEconIQ(query, 7);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now(),
          question: query,
          response,
        },
      ]);
    } catch (err) {
      console.error("ECONIQ RAG error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "ECONIQ could not process your question.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askQuestion();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loading && question.trim()) {
        void askQuestion();
      }
    }
  }

  function clearConversation() {
    setMessages([]);
    setQuestion("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar />

        <section className="relative overflow-hidden pb-14 pt-20">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/[0.055] blur-[130px]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                Economic research
              </span>
            </div>

            <h1 className="text-5xl font-medium tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Explore the
              <span className="block text-white/35">
                economy.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
              Ask questions, investigate economic developments and
              discover evidence from Kenya's economic data and reports.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-9 max-w-3xl"
            >
              <div className="rounded-2xl border border-white/[0.1] bg-white/[0.035] p-2 shadow-2xl shadow-black/30 transition focus-within:border-white/[0.18] focus-within:bg-white/[0.05]">
                <div className="flex items-end gap-3">
                  <Search
                    size={18}
                    className="mb-4 ml-3 shrink-0 text-white/25"
                  />

                  <textarea
                    value={question}
                    onChange={(event) =>
                      setQuestion(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    rows={2}
                    placeholder="Ask EconIQ about Kenya's economy..."
                    className="min-h-[58px] flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !question.trim()
                    }
                    className="mb-2 flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-20"
                  >
                    {loading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Searching
                      </>
                    ) : (
                      <>
                        Ask EconIQ
                        <ArrowUp size={14} />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                    <Globe2 size={12} />
                    Kenya
                  </div>

                  <span className="hidden text-[10px] text-white/15 sm:block">
                    Enter to ask · Shift + Enter for new line
                  </span>
                </div>
              </div>
            </form>
          </div>
        </section>

        {error && (
          <div className="mx-auto max-w-4xl rounded-xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs leading-6 text-red-300/70">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-white/30 transition hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {!currentMessage && !loading && (
          <>
            <section className="mx-auto max-w-4xl">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles
                  size={13}
                  className="text-white/25"
                />

                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                  Start exploring
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {questions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      void askQuestion(item.question)
                    }
                    className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.04]"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                      {item.label}
                    </p>

                    <p className="mt-3 text-xs leading-5 text-white/45 group-hover:text-white/65">
                      {item.question}
                    </p>

                    <ArrowUpRight
                      size={13}
                      className="mt-5 text-white/20 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/50"
                    />
                  </button>
                ))}
              </div>
            </section>

            <section className="mx-auto mt-16 max-w-6xl">
              <div className="flex items-end justify-between border-b border-white/[0.06] pb-5">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                    Economic signals
                  </p>

                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
                    Kenya at a glance
                  </h2>
                </div>

                <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20 sm:flex">
                  <Database size={12} />
                  EconIQ data
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Signal
                  label="Inflation"
                  value="6.5%"
                  detail="July 2026"
                />

                <Signal
                  label="Food inflation"
                  value="9.0%"
                  detail="July 2026"
                />

                <Signal
                  label="GDP growth"
                  value="4.63%"
                  detail="2025"
                />

                <Signal
                  label="KES / USD"
                  value="129.30"
                  detail="Latest observation"
                />
              </div>
            </section>

            <section className="mx-auto mt-16 max-w-6xl">
              <div className="flex items-end justify-between border-b border-white/[0.06] pb-5">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                    Research
                  </p>

                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
                    Economic intelligence
                  </h2>
                </div>

                <span className="text-xs text-white/20">
                  Trusted sources
                </span>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {research.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.035]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
                          <Icon
                            size={15}
                            className="text-white/45"
                          />
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="text-white/20 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/55"
                        />
                      </div>

                      <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.16em] text-white/20">
                        {item.type}
                      </p>

                      <h3 className="mt-3 text-lg font-medium tracking-[-0.025em]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-white/35">
                        {item.description}
                      </p>

                      <div className="mt-7 flex items-center justify-between border-t border-white/[0.06] pt-4">
                        <span className="text-xs text-white/35">
                          {item.source}
                        </span>

                        <span className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                          {item.date}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {loading && (
          <section className="mx-auto mt-14 max-w-4xl">
            <div className="flex items-center gap-4 border-y border-white/[0.06] py-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Bot size={15} className="text-white/50" />
              </div>

              <div>
                <p className="text-sm text-white/55">
                  EconIQ is researching your question
                </p>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </section>
        )}

        {currentMessage && !loading && (
          <section className="mx-auto max-w-4xl pb-16">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={14}
                  className="text-blue-300/50"
                />

                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/25">
                  EconIQ intelligence
                </span>
              </div>

              <button
                type="button"
                onClick={clearConversation}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20 transition hover:text-white/55"
              >
                <X size={12} />
                New question
              </button>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/20">
                Your question
              </p>

              <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em] sm:text-3xl">
                {currentMessage.question}
              </h2>
            </div>

            <div className="mt-10 flex items-start gap-4">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Bot size={15} className="text-white/55" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="prose prose-invert max-w-none text-sm leading-7 text-white/65 sm:text-base">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-5 last:mb-0">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white/90">
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-5 list-disc space-y-2 pl-6">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-5 list-decimal space-y-2 pl-6">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li>{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-4 mt-7 text-xl font-semibold text-white">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-3 mt-7 text-lg font-semibold text-white">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-2 mt-6 text-base font-semibold text-white">
                          {children}
                        </h3>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="my-5 border-l border-white/20 pl-4 text-white/45">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-xs text-white/70">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {currentMessage.response.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <Sources
              sources={currentMessage.response.sources}
            />

            <FollowUpQuestions
              question={currentMessage.question}
              onAsk={(followUp) =>
                void askQuestion(followUp)
              }
              disabled={loading}
            />
          </section>
        )}
      </div>
    </main>
  );
}

function Signal({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>

      <p className="mt-4 text-2xl font-medium tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-2 text-[11px] text-white/20">
        {detail}
      </p>
    </div>
  );
}

function Sources({
  sources,
}: {
  sources: RAGSource[];
}) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-white/[0.06] pt-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20">
            Retrieved evidence
          </p>

          <p className="mt-2 text-xs text-white/30">
            {sources.length} source
            {sources.length === 1 ? "" : "s"} used by EconIQ.
          </p>
        </div>

        <Database size={14} className="text-white/20" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {sources.map((source, index) => (
          <div
            key={`${source.document_id}-${source.chunk_id}-${index}`}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.12] hover:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText
                  size={13}
                  className="text-white/30"
                />

                <span className="text-xs text-white/45">
                  Economic document
                </span>
              </div>

              <span className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                Evidence {index + 1}
              </span>
            </div>

            <p className="mt-4 text-xs text-white/30">
              Page {source.page_number}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FollowUpQuestions({
  question,
  onAsk,
  disabled,
}: {
  question: string;
  onAsk: (question: string) => void;
  disabled: boolean;
}) {
  const followUps = getFollowUps(question);

  return (
    <section className="mt-10 border-t border-white/[0.06] pt-7">
      <div className="flex items-center gap-2">
        <TrendingUp
          size={13}
          className="text-white/25"
        />

        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/20">
          Continue exploring
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {followUps.map((followUp) => (
          <button
            key={followUp}
            type="button"
            disabled={disabled}
            onClick={() => onAsk(followUp)}
            className="rounded-full border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-xs text-white/35 transition duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/70 disabled:pointer-events-none disabled:opacity-30"
          >
            {followUp}
          </button>
        ))}
      </div>
    </section>
  );
}

function getFollowUps(question: string): string[] {
  const normalized = question.toLowerCase();

  if (
    normalized.includes("inflation") ||
    normalized.includes("cpi") ||
    normalized.includes("consumer price")
  ) {
    return [
      "How did inflation change between June and July 2026?",
      "Which food prices contributed most to inflation?",
      "What was the contribution of food inflation?",
      "What is the outlook for Kenya's inflation?",
    ];
  }

  if (
    normalized.includes("unemployment") ||
    normalized.includes("employment") ||
    normalized.includes("labour") ||
    normalized.includes("labor")
  ) {
    return [
      "How has unemployment changed over time?",
      "What factors are associated with unemployment?",
      "How does unemployment compare with GDP growth?",
      "What does the evidence say about Kenya's labour market?",
    ];
  }

  if (
    normalized.includes("gdp") ||
    normalized.includes("growth") ||
    normalized.includes("economy")
  ) {
    return [
      "What are the main risks to Kenya's economic growth?",
      "Which sectors are driving Kenya's growth?",
      "How has Kenya's growth changed over time?",
      "What is the economic outlook for Kenya?",
    ];
  }

  if (
    normalized.includes("interest") ||
    normalized.includes("rate") ||
    normalized.includes("cbk") ||
    normalized.includes("monetary")
  ) {
    return [
      "How have interest rates changed recently?",
      "Why did the Central Bank change its policy stance?",
      "How could interest rates affect inflation?",
      "What are the implications for businesses?",
    ];
  }

  return [
    "What evidence supports this conclusion?",
    "How has this changed over time?",
    "What are the main risks?",
    "What should we expect next?",
  ];
}
