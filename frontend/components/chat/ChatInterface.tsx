"use client";

import {
  ArrowUp,
  Bot,
  User,
} from "lucide-react";

import { FormEvent, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askEconIQ, type RagResponse } from "@/lib/api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  response?: RagResponse;
}

const suggestedQuestions = [
  "What was Kenya's inflation rate in July 2026?",
  "What were the main drivers of inflation in Kenya?",
  "How did inflation change between June and July 2026?",
];

export default function ChatInterface() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    console.log("[ECONIQ] CHAT FORM SUBMITTED");
    console.log("[ECONIQ] QUESTION:", question);

    await submitQuestion(question);
  }

  async function submitQuestion(value: string) {
    console.log("[ECONIQ] SUBMIT QUESTION CALLED:", value);

    const trimmedQuestion = value.trim();

    console.log("[ECONIQ] TRIMMED QUESTION:", trimmedQuestion);
    console.log("[ECONIQ] LOADING:", loading);

    if (!trimmedQuestion || loading) {
      console.log("[ECONIQ] SUBMISSION STOPPED");
      return;
    }

    console.log("[ECONIQ] ABOUT TO CALL askEconIQ");

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);

    try {
      console.log("[ECONIQ] CALLING ECONIQ API...");

      const response = await askEconIQ(
        trimmedQuestion,
      );

      console.log("[ECONIQ] API RESPONSE:", response);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.answer,
        response,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "[ECONIQ] API REQUEST FAILED:",
        error,
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting ECONIQ.";

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `I couldn't complete that request.\n\n${errorMessage}`,
        },
      ]);
    } finally {
      console.log("[ECONIQ] REQUEST FINISHED");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col">
      {messages.length === 0 && (
        <div className="mb-6">
          <p className="mb-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
            Explore ECONIQ
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {suggestedQuestions.map(
              (suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    console.log(
                      "[ECONIQ] SUGGESTION CLICKED:",
                      suggestion,
                    );

                    submitQuestion(
                      suggestion,
                    );
                  }}
                  disabled={loading}
                  className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-white/40 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/70 disabled:pointer-events-none disabled:opacity-40"
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  {suggestion}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            {message.role === "user" ? (
              <div className="flex max-w-2xl items-start gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.07] px-5 py-3.5 text-sm leading-6 text-white/90">
                  {message.content}
                </div>

                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50">
                  <User size={13} />
                </div>
              </div>
            ) : (
              <div className="flex w-full max-w-3xl items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60">
                  <Bot size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-7 text-white/75">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({
                          children,
                        }) => (
                          <strong className="font-semibold text-white">
                            {children}
                          </strong>
                        ),

                        p: ({ children }) => (
                          <p className="mb-4 last:mb-0">
                            {children}
                          </p>
                        ),

                        ul: ({ children }) => (
                          <ul className="mb-4 list-disc space-y-2 pl-5">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="mb-4 list-decimal space-y-2 pl-5">
                            {children}
                          </ol>
                        ),

                        li: ({ children }) => (
                          <li>{children}</li>
                        ),

                        h1: ({ children }) => (
                          <h1 className="mb-4 text-xl font-semibold text-white">
                            {children}
                          </h1>
                        ),

                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-6 text-lg font-semibold text-white">
                            {children}
                          </h2>
                        ),

                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-5 text-base font-semibold text-white">
                            {children}
                          </h3>
                        ),

                        code: ({ children }) => (
                          <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-xs text-white/70">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {message.response?.sources &&
                    message.response.sources.length > 0 && (
                      <Sources
                        sources={
                          message.response.sources
                        }
                      />
                    )}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && <ThinkingIndicator />}
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-5 mt-10"
      >
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-2 shadow-2xl shadow-black/40 transition duration-300 focus-within:border-white/20 focus-within:shadow-white/[0.03]">
          <div className="flex items-center">
            <input
              type="text"
              value={question}
              onChange={(event) => {
                setQuestion(
                  event.target.value,
                );
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  console.log(
                    "[ECONIQ] ENTER PRESSED",
                  );

                  if (
                    question.trim() &&
                    !loading
                  ) {
                    submitQuestion(question);
                  }
                }
              }}
              disabled={loading}
              placeholder="Ask ECONIQ anything..."
              autoComplete="off"
              className="h-12 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !question.trim()
              }
              onClick={() => {
                console.log(
                  "[ECONIQ] ASK BUTTON CLICKED",
                );
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black transition duration-200 hover:scale-105 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
              aria-label="Ask ECONIQ"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-white/15">
          ECONIQ answers using retrieved economic evidence.
        </p>
      </form>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60">
        <Bot size={15} />
      </div>

      <div className="flex items-center gap-3 py-2">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
        </div>

        <span className="text-xs text-white/40">
          ECONIQ is analyzing the evidence...
        </span>
      </div>
    </div>
  );
}

function Sources({
  sources,
}: {
  sources: RagResponse["sources"];
}) {
  return (
    <div className="mt-5 border-t border-white/[0.06] pt-4">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
        Sources
      </p>

      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <div
            key={`${source.document_id}-${source.chunk_id}`}
            className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/40 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white/60"
          >
            Document {source.document_id}
            {" · "}
            Page {source.page_number}
          </div>
        ))}
      </div>
    </div>
  );
}
