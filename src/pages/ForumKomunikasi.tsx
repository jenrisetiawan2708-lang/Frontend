import React, { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api/auth";
import { getForum, kirimPesan } from "../api/forum";

import heroImg from "../assets/logo-navbar.png";

interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }

export default function ForumKomunikasi() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [modalLogout, setModalLogout] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();

  // Load pesan + polling 15 detik
  const fetchMessages = () => {
    getForum()
      .then((res) => { if (res.success) setMessages(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll ke bawah kalau ada pesan baru
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setMessageText("");
    try {
      const res = await kirimPesan(trimmed);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error("Gagal kirim pesan:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <div className="h-screen bg-[#e9eaec] overflow-hidden flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/dashboard-penghuni" className="flex items-center gap-3">
            <img src={heroImg} alt="HOMIA" className="w-14 object-contain" />
            <h1 className="text-3xl font-extrabold text-white tracking-wide">HOMIA</h1>
          </Link>
          <div className="flex gap-8 text-white text-lg md:text-xl items-center">
            <Link to="/dashboard-penghuni" className="hover:underline transition">Dashboard</Link>
            <Link to="/layanan-penghuni" className="hover:underline transition">Layanan Penghuni</Link>
            <button type="button" onClick={() => setModalLogout(true)} className="hover:underline transition">Logout</button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl w-full mx-auto px-6 py-7 flex-1 min-h-0">
        <section className="bg-white rounded-2xl shadow-md overflow-hidden h-full flex flex-col">
          <div className="bg-blue-50 border-b border-blue-100 px-7 py-3.5 flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Forum Penghuni</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] flex-1 min-h-0">
            {/* SIDEBAR */}
            <aside className="border-r border-blue-100 bg-white hidden lg:flex flex-col min-h-0">
              <div className="p-6 border-b border-blue-100 shrink-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Grup Kost</p>
                <h2 className="text-2xl font-extrabold text-gray-900">Forum Komunikasi</h2>
                <p className="text-sm text-gray-400 mt-1">Chat bersama penghuni lain</p>
              </div>

              <div className="p-4 space-y-2 overflow-y-auto">
                {/* Tampilkan pengirim unik dari messages */}
                {Array.from(new Set(messages.map((m: any) => m.sender)))
                  .slice(0, 8)
                  .map((name: any) => (
                    <div key={name} className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-blue-50 transition">
                      <AvatarComp name={name} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-green-500" />
                    </div>
                  ))}
              </div>
            </aside>

            {/* CHAT AREA */}
            <div className="flex flex-col min-h-0">
              {/* CHAT HEADER */}
              <div className="px-6 py-4 border-b border-blue-100 bg-white flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <ChatIcon />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-extrabold text-gray-900 truncate">Forum Komunikasi Kost</h2>
                    <p className="text-sm text-gray-400">Chat bersama penghuni lain</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-600">
                  Online
                </span>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 min-h-0 overflow-y-auto bg-[#f4f7fb] px-5 md:px-7 py-6 space-y-4">
                <div className="mx-auto w-fit rounded-full bg-white border border-blue-100 px-4 py-2 text-xs font-bold text-gray-400 shadow-sm">
                  Hari ini
                </div>

                {loading && (
                  <div className="text-center text-gray-400 text-sm py-8">Memuat pesan...</div>
                )}

                {!loading && messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">Belum ada pesan. Jadilah yang pertama!</div>
                )}

                {messages.map((message: any) => {
                  const isMe = message.sender === currentUser?.nama || message.role === currentUser?.role;
                  return (
                    <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] md:max-w-[62%] rounded-2xl px-4 py-3 shadow-sm ${isMe ? "bg-blue-600 text-white rounded-br-md" : "bg-white text-gray-900 border border-blue-100 rounded-bl-md"}`}>
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-extrabold text-blue-600">{message.sender}</p>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.isi_pesan}</p>
                        <div className={`mt-1 flex justify-end text-[11px] ${isMe ? "text-white/70" : "text-gray-400"}`}>
                          <span>{message.tanggal_fmt}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* INPUT */}
              <div className="border-t border-blue-100 bg-white p-4 shrink-0">
                <div className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-11 h-11 rounded-xl bg-white hover:bg-blue-100 text-blue-600 text-2xl font-bold flex items-center justify-center active:scale-95 transition"
                  >+</button>
                  <input ref={fileInputRef} type="file" className="hidden" />
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tulis pesan untuk penghuni kost..."
                    className="flex-1 min-w-0 rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-200 active:scale-95 transition-all duration-200 disabled:opacity-50"
                    disabled={!messageText.trim()}
                  >Kirim</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL LOGOUT */}
      <Modal open={modalLogout} onClose={() => setModalLogout(false)}>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Logout?</h2>
        <p className="text-gray-400 text-sm mb-6">Apakah kamu yakin ingin keluar dari akun ini?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setModalLogout(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200">Batal</button>
          <button type="button" onClick={handleLogout} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200">Ya, Logout</button>
        </div>
      </Modal>

      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}

function AvatarComp({ name }: { name: string }) {
  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">{initials}</div>
  );
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-xl animate-[modalIn_180ms_ease-out]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center transition">x</button>
        {children}
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600">
      <path d="M10 13.5C10 9.9 12.9 7 16.5 7h15C35.1 7 38 9.9 38 13.5v10C38 27.1 35.1 30 31.5 30H22l-8 8v-8.5c-2.3-.9-4-3.2-4-6v-10Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M17 16h14M17 23h9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
