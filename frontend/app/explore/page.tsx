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

import { FormEvent, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Navbar from "@/components/layout/Navbar";
import {
  askEconIQ,
  type RagResponse,
  type RAGSource,
} from "@/lib/api";

/* ============================================================
   TYPES
============================================================ */

type Article = {
  source: string;
  category: string;
  type: string;
  title: string;
  date: string;
  description: string;
};

type Message = {
  id: number;
  question: string;
  response: RagResponse;
};

/* ============================================================
   STATIC DISCOVERY CONTENT
============================================================ */

const articles: Article[] = [
  {
    source: "KNBS",
    category: "Reports",
    type: "Economic Report",
    title: "Kenya Consumer Price Indices and Inflation Rates",
    date: "July 2026",
    description:
      "Consumer prices, inflation movements and major expenditure divisions.",
  },
  {
    source: "Central Bank of Kenya",
    category: "Reports",
    type: "Monetary Policy",
    title: "Kenya monetary and financial developments",
    date: "2026",
    description:
      "Interest rates, monetary conditions and developments across the Kenyan economy.",
  },
  {
    source: "World Bank",
    category: "Reports",
    type: "Economic Outlook",
    title: "Kenya Economic Outlook",
    date: "2026",
    description:
      "Macroeconomic developments, growth expectations and structural trends.",
  },
  {
    source: "KNBS",
    category: "Data",
    type: "Economic Data",
    title: "Kenya economic indicators",
    date: "2026",
    description:
      "Economic indicators covering inflation, growth, employment and household conditions.",
  },
  {
    source: "Central Bank of Kenya",
    category: "Markets",
    type: "Market Intelligence",
    title: "Kenya financial market developments",
    date: "2026",
    description:
      "Interest rates, exchange rates, liquidity and financial market developments.",
  },
  {
    source: "ECONIQ",
    category: "Data",
    type: "Economic Intelligence",
    title: "Kenya longitudinal economic data",
    date: "2026",
    description:
      "Structured historical observations designed to reveal economic trends over time.",
  },
];

const filters = [
  "All",
  "News",
  "Reports",
  "Markets",
  "Companies",
  "Data",
];

const starterQuestions = [
  "What were the main drivers of inflation in Kenya in July 2026?",
  "How did Kenya's inflation change between June and July 2026?",
  "What are the main economic risks facing Kenya?",
  "What is the outlook for Kenya's economy?",
];

/* ============================================================
   PAGE
============================================================ */

export default function ExplorePage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentMessage =
    messages.length > 0
      ? messages[messages.length - 1]
      : null;

  const filteredArticles = useMemo(() => {
    return articles.filter(
      (article) =>
        activeFilter === "All" ||
        article.category === activeFilter,
    );
  }, [activeFilter]);

  /* ============================================================
     ASK ECONIQ
  ============================================================ */

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

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
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
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10">
        <Navbar />

        <section className="mx-auto max-w-5xl py-16 sm:py-20">
          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="mb-10">
            <div className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              Economic intelligence
            </div>

            <h1 className="max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              Ask the economy.
              <br />
              <span className="text-white/30">
                Get answers grounded in evidence.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
              Search economic reports, data and research
              with ECONIQ's evidence-based intelligence
              engine.
            </p>
          </div>

          {/* ====================================================
              SEARCH
          ==================================================== */}

          <form
            onSubmit={handleSubmit}
            className="relative"
          >
            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.025]
                p-2
                shadow-2xl
                shadow-black/30
                transition
                duration-300
                focus-within:border-white/20
                focus-within:bg-white/[0.04]
              "
            >
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
                  placeholder="Ask anything about Kenya's economy..."
                  className="
                    min-h-[58px]
                    flex-1
                    resize-none
                    bg-transparent
                    px-2
                    py-3
                    text-sm
                    leading-6
                    text-white
                    outline-none
                    placeholder:text-white/20
                    disabled:opacity-50
                  "
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !question.trim()
                  }
                  aria-label="Ask ECONIQ"
                  className="
                    mb-2
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-black
                    transition
                    duration-200
                    hover:scale-105
                    hover:bg-white/90
                    disabled:cursor-not-allowed
                    disabled:opacity-20
                    disabled:hover:scale-100
                  "
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  ) : (
                    <ArrowUp size={17} />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                  <Globe2 size={12} />
                  Kenya
                </div>

                <span className="text-[10px] text-white/15">
                  Enter to ask · Shift + Enter for new line
                </span>
              </div>
            </div>
          </form>

          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (
            <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3">
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
          )}

          {/* ====================================================
              STARTER QUESTIONS
          ==================================================== */}

          {!currentMessage && !loading && (
            <div className="mt-5 flex flex-wrap gap-2">
              {starterQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void askQuestion(item)}
                  className="
                    rounded-full
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
                    px-4
                    py-2
                    text-xs
                    text-white/35
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-white/15
                    hover:bg-white/[0.05]
                    hover:text-white/70
                  "
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading && (
            <div className="mt-12 flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Bot
                  size={15}
                  className="text-white/50"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30 [animation-delay:300ms]" />
                </div>

                <p className="mt-2 text-xs text-white/30">
                  ECONIQ is retrieving and analyzing
                  economic evidence...
                </p>
              </div>
            </div>
          )}

          {/* ====================================================
              ANSWER
          ==================================================== */}

          {currentMessage && (
            <section className="mt-14">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={14}
                    className="text-white/45"
                  />

                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                    ECONIQ intelligence
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearConversation}
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    uppercase
                    tracking-[0.15em]
                    text-white/20
                    transition
                    hover:text-white/50
                  "
                >
                  <X size={12} />
                  Clear
                </button>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-medium tracking-tight text-white/90 sm:text-2xl">
                  {currentMessage.question}
                </h2>
              </div>

              <div className="mt-7 flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <Bot
                    size={15}
                    className="text-white/55"
                  />
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

                        blockquote: ({
                          children,
                        }) => (
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

              {/* ==================================================
                  SOURCES
              ================================================== */}

              <Sources
                sources={
                  currentMessage.response.sources
                }
              />

              {/* ==================================================
                  FOLLOW UPS
              ================================================== */}

              <FollowUpQuestions
                question={
                  currentMessage.question
                }
                onAsk={(followUp) =>
                  void askQuestion(followUp)
                }
                disabled={loading}
              />

              {/* ==================================================
                  PREVIOUS QUESTIONS
              ================================================== */}

              {messages.length > 1 && (
                <div className="mt-12 border-t border-white/[0.06] pt-7">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-white/20">
                    Conversation
                  </p>

                  <div className="space-y-2">
                    {messages
                      .slice(0, -1)
                      .reverse()
                      .map((message) => (
                        <button
                          key={message.id}
                          type="button"
                          onClick={() =>
                            setQuestion(
                              message.question,
                            )
                          }
                          className="
                            block
                            w-full
                            rounded-xl
                            border
                            border-white/[0.06]
                            bg-white/[0.015]
                            px-4
                            py-3
                            text-left
                            text-xs
                            text-white/35
                            transition
                            hover:border-white/10
                            hover:bg-white/[0.03]
                            hover:text-white/60
                          "
                        >
                          {message.question}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ====================================================
              DISCOVERY FEED
          ==================================================== */}

          {!currentMessage &&
            !loading && (
              <section className="mt-20">
                <div className="flex items-end justify-between border-b border-white/[0.06] pb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                      Intelligence feed
                    </p>

                    <h2 className="mt-2 text-xl font-medium">
                      Explore the economy
                    </h2>
                  </div>

                  <div className="hidden items-center gap-2 text-xs text-white/20 sm:flex">
                    <Database size={13} />
                    Kenya
                  </div>
                </div>

                {/* Filters */}

                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                  {filters.map((filter) => {
                    const active =
                      activeFilter === filter;

                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() =>
                          setActiveFilter(filter)
                        }
                        className={`
                          whitespace-nowrap
                          rounded-full
                          border
                          px-4
                          py-2
                          text-xs
                          transition
                          duration-300
                          ${
                            active
                              ? "border-white/20 bg-white/[0.09] text-white"
                              : "border-white/10 text-white/30 hover:border-white/20 hover:bg-white/[0.04] hover:text-white/60"
                          }
                        `}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                {/* Feed */}

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {filteredArticles.map(
                    (article) => (
                      <article
                        key={article.title}
                        className="
                          group
                          rounded-2xl
                          border
                          border-white/[0.07]
                          bg-white/[0.02]
                          p-6
                          transition
                          duration-300
                          hover:-translate-y-1
                          hover:border-white/[0.14]
                          hover:bg-white/[0.035]
                        "
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {article.category ===
                            "Markets" ? (
                              <BarChart3
                                size={15}
                                className="text-white/30"
                              />
                            ) : (
                              <FileText
                                size={15}
                                className="text-white/30"
                              />
                            )}

                            <span className="text-xs text-white/35">
                              {article.source}
                            </span>
                          </div>

                          <ArrowUpRight
                            size={15}
                            className="
                              text-white/20
                              transition
                              duration-300
                              group-hover:-translate-y-0.5
                              group-hover:translate-x-0.5
                              group-hover:text-white/60
                            "
                          />
                        </div>

                        <div className="mt-8">
                          <span className="text-[10px] uppercase tracking-[0.16em] text-white/20">
                            {article.type}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-medium leading-6 tracking-tight">
                          {article.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-white/35">
                          {article.description}
                        </p>

                        <div className="mt-7 flex items-center justify-between">
                          <span className="text-xs text-white/20">
                            {article.date}
                          </span>

                          <span className="text-[10px] uppercase tracking-[0.15em] text-white/15 transition group-hover:text-white/35">
                            Explore
                          </span>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            )}
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   SOURCES
============================================================ */

function Sources({
  sources,
}: {
  sources: RAGSource[];
}) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-white/[0.06] pt-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
            Retrieved evidence
          </p>

          <p className="mt-2 text-xs text-white/30">
            {sources.length} source
            {sources.length === 1 ? "" : "s"} used
            to generate this answer.
          </p>
        </div>

        <Database
          size={14}
          className="text-white/20"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {sources.map((source, index) => (
          <div
            key={`${source.document_id}-${source.chunk_id}-${index}`}
            className="
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.02]
              p-4
              transition
              hover:border-white/[0.12]
              hover:bg-white/[0.03]
            "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText
                  size={13}
                  className="text-white/30"
                />

                <span className="text-xs text-white/45">
                  KNBS
                </span>
              </div>

              <span className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                Evidence {index + 1}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-white/30">
                Page {source.page_number}
              </span>

              <span className="text-xs text-white/20">
                Score {source.score.toFixed(3)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   FOLLOW-UP QUESTIONS
============================================================ */

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

        <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
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
            className="
              rounded-full
              border
              border-white/[0.07]
              bg-white/[0.02]
              px-4
              py-2.5
              text-xs
              text-white/35
              transition
              duration-300
              hover:border-white/15
              hover:bg-white/[0.05]
              hover:text-white/70
              disabled:pointer-events-none
              disabled:opacity-30
            "
          >
            {followUp}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CONTEXTUAL FOLLOW UPS
============================================================ */

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