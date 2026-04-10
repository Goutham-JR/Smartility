"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { MessageCircle, X, Send, Sparkles, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  "How many active employees?",
  "Show high priority tasks",
  "Give me today's summary",
  "Which communities need attention?",
];

function getAIResponse(query: string, state: ReturnType<typeof useStore.getState>): string {
  const q = query.toLowerCase();
  const { employees, communities, tasks, userRole, staffEmployeeId, userName } = state;
  const isStaff = userRole === "Staff" && staffEmployeeId;
  const myTasks = isStaff ? tasks.filter((t) => t.assigneeId === staffEmployeeId) : tasks;
  const active = employees.filter((e) => e.status === "Active");
  const inactive = employees.filter((e) => e.status === "Inactive");
  const highTasks = myTasks.filter((t) => t.priority === "High");
  const pendingTasks = myTasks.filter((t) => t.status === "Pending");
  const inProgressTasks = myTasks.filter((t) => t.status === "In Progress");

  if (q.includes("active") && q.includes("employee")) {
    return `There are **${active.length} active employees** out of ${employees.length} total.\n\nHere they are:\n${active.map((e) => `- ${e.name} (${e.role})`).join("\n")}`;
  }
  if (q.includes("inactive") && q.includes("employee")) {
    return `There are **${inactive.length} inactive employees**:\n${inactive.map((e) => `- ${e.name} (${e.role})`).join("\n")}`;
  }
  if (q.includes("employee") || q.includes("staff") || q.includes("how many")) {
    return `We have **${employees.length} total employees** - ${active.length} active and ${inactive.length} inactive across ${communities.length} communities.`;
  }
  if (q.includes("high") && q.includes("task") || q.includes("priority")) {
    if (highTasks.length === 0) return "Great news! There are no high priority tasks right now.";
    return `There are **${highTasks.length} high priority tasks**:\n${highTasks.map((t) => `- ${t.title} (${t.status})`).join("\n")}`;
  }
  if (q.includes("pending") && q.includes("task")) {
    return `There are **${pendingTasks.length} pending tasks**:\n${pendingTasks.map((t) => `- ${t.title} [${t.priority}]`).join("\n")}`;
  }
  if (q.includes("task")) {
    return `Task overview:\n- **${pendingTasks.length}** Pending\n- **${inProgressTasks.length}** In Progress\n- **${tasks.filter((t) => t.status === "Completed").length}** Completed\n\nTotal: ${tasks.length} tasks`;
  }
  if (q.includes("communit") || q.includes("attention")) {
    const lowStaff = communities.filter((c) => c.employeeIds.length < 3);
    if (lowStaff.length > 0) {
      return `**${lowStaff.length} communities** have fewer than 3 staff assigned and may need attention:\n${lowStaff.map((c) => `- ${c.name} (${c.employeeIds.length} staff)`).join("\n")}`;
    }
    return `All ${communities.length} communities are well-staffed. No immediate concerns.`;
  }
  if (q.includes("summary") || q.includes("report") || q.includes("overview")) {
    return `**Daily Summary - ${new Date().toLocaleDateString()}**\n\n- **Employees:** ${employees.length} total (${active.length} active)\n- **Communities:** ${communities.length} managed\n- **Tasks:** ${pendingTasks.length} pending, ${inProgressTasks.length} in progress\n- **High Priority:** ${highTasks.length} tasks need attention\n\nOverall operations are running smoothly. ${highTasks.length > 0 ? "Focus on the high-priority tasks today." : "No urgent items today!"}`;
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello! I'm your AI assistant for Smartility. I can help you with employee info, task status, community insights, and daily reports. What would you like to know?";
  }
  return `I can help you with:\n- Employee counts and details\n- Task status and priorities\n- Community insights\n- Daily summaries\n\nTry asking something like "How many active employees?" or "Show high priority tasks"`;
}

export function AIChatbot() {
  const { chatOpen, setChatOpen, chatMessages, addChatMessage, clearChat } = useStore();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    addChatMessage({ role: "user", content: text.trim() });
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const response = getAIResponse(text, useStore.getState());
      addChatMessage({ role: "assistant", content: response });
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-105",
          chatOpen
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-[90] flex h-[500px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Assistant</p>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
            <button
              onClick={clearChat}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {chatMessages.length === 0 && !typing && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-accent px-4 py-2.5 text-sm">
                    Hi! I&apos;m your Smartility AI assistant. How can I help you today?
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-9">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div key={msg.id} className={cn("flex items-start gap-2", msg.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}
                >
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-accent"
                  )}
                >
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={i}>{part.slice(2, -2)}</strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-accent px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-xl border-0 bg-accent/50 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
