/* eslint-disable */
"use client";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from 'lucide-react';

type ChatMsg = { role: "user" | "bot"; content: string };

/* animation for loading message - used ChatGPT for this */
function TypingDots() {
  return (
    <div className="flex gap-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </div>
  );
}

export default function SpeciesChatbot() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog.length, isLoading]);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return; // ignore empty sends
    if (isLoading) return;

    // add the user message
    setChatLog((prev) => [...prev, { role: "user", content: trimmed }]);
    setMessage("");
    setIsLoading(true);

    // reset textarea height after clearing
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = "auto";

    // fetch API key
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        // try to read error body if provided
        let errText = "Something went wrong.";
        try {
          const errJson = (await res.json()) as { error?: string };
          if (typeof errJson.error === "string") {
            errText = errJson.error;
          }
        } catch {}
        setChatLog((prev) => [...prev, { role: "bot", content: `Sorry, ${errText}` }]);
        return;
      }

      const data = (await res.json()) as { response?: string };

      const botReply =
        typeof data?.response === "string" && data.response.trim()
          ? data.response.trim()
          : "Sorry, I couldn’t respond.";

      setChatLog((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I’m having trouble communicating with the animals right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <TypographyH2>Species Chatbot</TypographyH2>
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-4">
          <TypographyP className="text-sm text-muted-foreground">
            Don't be koi, feel free to ask The Species Chatbot any questions you have about animals! It can provide information on their habitat, diet,
            conservation status, etc. Simply type your question in the input field below and hit enter.
          </TypographyP>
          <TypographyP className="text-sm text-muted-foreground">
            Please keep your inquires relevant to animals.
          </TypographyP>
        </div>
      </div>

      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium">Chat</p>
          <p className="text-xs text-muted-foreground">Enter to send · Shift+Enter for new line</p>
        </div>

        {/* chat history */}
        <div className="h-[440px] overflow-y-auto px-4 py-4">
          {chatLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Start chatting about a species!</p>
          ) : (
            chatLog.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "rounded-bl-none border border-border bg-foreground text-primary-foreground"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {isLoading ? (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl rounded-bl-none border border-border bg-foreground p-3 text-sm text-primary-foreground">
                <TypingDots />
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-background px-4 py-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onInput={handleInput}
              rows={1}
              placeholder="Ask about a species..."
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              className="w-full resize-none overflow-hidden rounded-lg border border-border bg-background
                         py-3 pl-3 pr-12 text-sm text-foreground focus:outline-none
                         disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isLoading || !message.trim()}
              aria-label="Send message"
              className="absolute bottom-3 right-2 flex h-8 w-8 items-center justify-center
                         rounded-full bg-primary text-primary-foreground
                         transition hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? <TypingDots /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
