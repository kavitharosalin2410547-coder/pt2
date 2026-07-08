import { Bot, RotateCcw, Send, Sparkles, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/common/Button';
import { aiService } from '../services/aiService';
import { getErrorMessage } from '../services/apiClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'How do I improve in DSA?',
  'Explain Dynamic Programming with example',
  'Common HR interview questions',
  "How to answer 'Tell me about yourself'?",
  'Difference between process and thread',
];

function formatMarkdown(text: string): string {
  // Basic formatting: bold, code, line breaks
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono dark:bg-slate-700">$1</code>')
    .replace(/\n/g, '<br />');
}

export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || isLoading) return;

    const userEntry: Message = { id: crypto.randomUUID(), role: 'user', content: userMsg };
    setMessages((prev) => [...prev, userEntry]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await aiService.chat(userMsg);
      const assistantEntry: Message = { id: crypto.randomUUID(), role: 'assistant', content: reply };
      setMessages((prev) => [...prev, assistantEntry]);
    } catch (err: unknown) {
      const errorEntry: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ ${getErrorMessage(err)}`,
      };
      setMessages((prev) => [...prev, errorEntry]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
            <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">AI Placement Assistant</h2>
            <p className="text-xs text-slate-500">Powered by Gemini · DSA, Core CS, HR, System Design</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" onClick={() => setMessages([])}>
            <RotateCcw size={14} />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
              <Bot className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="text-center">
              <p className="mb-1 text-base font-semibold text-slate-800 dark:text-slate-100">
                Ask me anything about placement prep
              </p>
              <p className="text-sm text-slate-400">DSA, Core CS, HR questions, System Design, and more</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 px-4 py-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
                    msg.role === 'user' ? 'bg-brand-600' : 'bg-slate-700 dark:bg-slate-600'
                  }`}
                >
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-brand-600 text-white'
                      : 'rounded-tl-sm bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 px-4 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white dark:bg-slate-600">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3 dark:bg-slate-800">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <textarea
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
          placeholder="Ask anything about DSA, Core CS, HR... (Enter to send, Shift+Enter for newline)"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          onClick={() => sendMessage(input)}
          isLoading={isLoading}
          disabled={!input.trim()}
          className="self-end"
        >
          <Send size={16} />
          Send
        </Button>
      </div>
    </div>
  );
}
