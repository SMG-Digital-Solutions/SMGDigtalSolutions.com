import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ChatCircleDots, X, PaperPlaneRight, UserCircle } from '@phosphor-icons/react';
import { sendChatMessage } from '../lib/chatApi';

interface ChatMessage {
  role: 'VISITOR' | 'ASSISTANT';
  content: string;
}

const CONVERSATION_ID_KEY = 'smg-chat-conversation-id';
const VISITOR_EMAIL_KEY = 'smg-chat-visitor-email';
const GREETING: ChatMessage = {
  role: 'ASSISTANT',
  content: "Hi! I'm the SMG Digital Solutions assistant — ask me about our services, pricing, or process, or click \"Talk to a person\" any time.",
};
const GENERIC_ERROR_MESSAGE = "Something went wrong sending that. Please try again, or email us directly at hello@smgdigitalsolutions.com.";

function readSessionValue(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionValue(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // sessionStorage unavailable — the widget still works, it just won't remember the conversation across a page navigation.
  }
}

/**
 * Sitewide live chat widget — floating bubble that expands into a message
 * panel. `data-smg-chat-widget` on the root marks this as a real chat
 * presence for the site's own Website Health Check audit (see
 * smg-admin's websiteAudit.ts CHAT_WIDGET_PATTERN). conversationId is
 * generated server-side on the first message and cached in sessionStorage
 * so a visitor who navigates to another page mid-conversation keeps the
 * same thread; the visible message list itself is not restored across a
 * navigation, only the backend conversation the AI is grounded against.
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailForEscalation, setNeedsEmailForEscalation] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [pendingEscalation, setPendingEscalation] = useState(false);

  const conversationIdRef = useRef<string | undefined>(undefined);
  const visitorEmailRef = useRef<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationIdRef.current = readSessionValue(CONVERSATION_ID_KEY) ?? undefined;
    visitorEmailRef.current = readSessionValue(VISITOR_EMAIL_KEY) ?? undefined;
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, needsEmailForEscalation]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  async function deliver(message: string, requestEscalation: boolean) {
    setIsSending(true);
    setError(null);
    try {
      const result = await sendChatMessage({
        conversationId: conversationIdRef.current,
        message,
        visitorEmail: visitorEmailRef.current,
        requestEscalation,
      });
      conversationIdRef.current = result.conversationId;
      writeSessionValue(CONVERSATION_ID_KEY, result.conversationId);
      setMessages((prev) => [...prev, { role: 'ASSISTANT', content: result.answer }]);
      setNeedsEmailForEscalation(result.needsEmailForEscalation);
      setPendingEscalation(result.needsEmailForEscalation && requestEscalation);
    } catch (err) {
      console.error('Chat message error:', err);
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSending(false);
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'VISITOR', content: trimmed }]);
    await deliver(trimmed, false);
  };

  const handleTalkToPerson = async () => {
    if (isSending) return;
    if (!visitorEmailRef.current) {
      setNeedsEmailForEscalation(true);
      setPendingEscalation(true);
      return;
    }
    setMessages((prev) => [...prev, { role: 'VISITOR', content: "I'd like to talk to a person." }]);
    await deliver("I'd like to talk to a person.", true);
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = emailDraft.trim();
    if (!trimmed || isSending) return;
    visitorEmailRef.current = trimmed;
    writeSessionValue(VISITOR_EMAIL_KEY, trimmed);
    setEmailDraft('');
    setNeedsEmailForEscalation(false);
    if (pendingEscalation) {
      setMessages((prev) => [...prev, { role: 'VISITOR', content: "I'd like to talk to a person." }]);
      await deliver("I'd like to talk to a person.", true);
    }
    setPendingEscalation(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div data-smg-chat-widget className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              role="dialog"
              aria-modal="false"
              aria-label="Live chat"
              className="flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0F1B2C]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-[#008C9E] px-4 py-3 dark:border-white/10 dark:bg-[#1A2B3C]">
                <div>
                  <p className="text-sm font-bold text-white">SMG Digital Solutions</p>
                  <p className="text-xs text-white/80">Usually replies in a minute</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full p-2 text-white/90 transition hover:bg-white/10"
                >
                  <X size={18} weight="bold" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
                {messages.map((entry, index) => (
                  <div key={index} className={`flex ${entry.role === 'VISITOR' ? 'justify-end' : 'justify-start'}`}>
                    <p
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                        entry.role === 'VISITOR'
                          ? 'bg-[#008C9E] text-white dark:bg-[#4CAF50]'
                          : 'bg-[#F7F7F7] text-[#121212] dark:bg-[#122238] dark:text-[#F7F7F7]'
                      }`}
                    >
                      {entry.content}
                    </p>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <p className="rounded-2xl bg-[#F7F7F7] px-3.5 py-2.5 text-sm text-[#4b5563] dark:bg-[#122238] dark:text-[#d5dde4]">
                      Typing...
                    </p>
                  </div>
                )}
                {needsEmailForEscalation && (
                  <div className="rounded-2xl border border-[#008C9E]/30 bg-[#008C9E]/5 p-3 dark:border-[#4CAF50]/30 dark:bg-[#4CAF50]/10">
                    <p className="mb-2 text-xs text-[#4b5563] dark:text-[#d5dde4]">
                      What&apos;s your email? Our team will follow up there.
                    </p>
                    <form onSubmit={handleEmailSubmit} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={emailDraft}
                        onChange={(event) => setEmailDraft(event.target.value)}
                        placeholder="you@example.com"
                        disabled={isSending}
                        className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#0F1B2C] dark:text-[#F7F7F7]"
                      />
                      <button
                        type="submit"
                        disabled={isSending}
                        className="shrink-0 rounded-full bg-[#008C9E] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div ref={threadEndRef} />
              </div>

              <div className="border-t border-black/10 px-3 py-2 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleTalkToPerson}
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 px-1.5 py-1 text-xs font-semibold text-[#008C9E] transition hover:underline disabled:opacity-50 dark:text-[#4CAF50]"
                >
                  <UserCircle size={16} weight="bold" aria-hidden="true" />
                  Talk to a person
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-black/10 p-3 dark:border-white/10">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 disabled:opacity-50 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7]"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  aria-label="Send message"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#008C9E] p-2.5 text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
                >
                  <PaperPlaneRight size={18} weight="bold" aria-hidden="true" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          aria-expanded={isOpen}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#008C9E] text-white shadow-xl transition hover:bg-[#006a73] hover:scale-105 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
        >
          {isOpen ? <X size={24} weight="bold" aria-hidden="true" /> : <ChatCircleDots size={26} weight="bold" aria-hidden="true" />}
        </button>
      </div>
    </MotionConfig>
  );
}
