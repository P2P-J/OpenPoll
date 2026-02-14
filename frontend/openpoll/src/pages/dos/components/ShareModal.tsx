import { useState, useRef, useEffect } from "react";
import { X, Link2, Check, Copy, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: string;
}

export function ShareModal({ isOpen, onClose, type }: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const shareUrl = `${window.location.origin}/dos/share/${type}`;

    useEffect(() => {
        if (!isOpen) setCopied(false);
    }, [isOpen]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            inputRef.current?.select();
            document.execCommand("copy");
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black opacity-95" />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 rounded-xl flex items-center justify-center">
                                    <Link2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-lg font-bold text-white">
                                    결과 공유하기
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="p-5 border-b border-white/10">
                            <div className="text-sm text-gray-300 font-semibold mb-4">
                                공유
                            </div>
                            <div className="flex items-start">
                                {/* X (Twitter) */}
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("나의 DOS 정치 성향 결과를 확인해보세요!")}`,
                                            "_blank",
                                            "width=550,height=420"
                                        )
                                    }
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] text-gray-400">X</span>
                                </button>

                                {/* Facebook */}
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                                            "_blank",
                                            "width=550,height=420"
                                        )
                                    }
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:brightness-110 transition-all" style={{ backgroundColor: '#1877F2' }}>
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] text-gray-400">Facebook</span>
                                </button>

                                {/* Instagram */}
                                <button
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(shareUrl);
                                        window.open("https://www.instagram.com/", "_blank");
                                    }}
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:brightness-110 transition-all" style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}>
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] text-gray-400">Instagram</span>
                                </button>

                                {/* Email */}
                                <button
                                    onClick={() => {
                                        window.location.href = `mailto:?subject=${encodeURIComponent("나의 DOS 정치 성향 결과")}&body=${encodeURIComponent(`나의 DOS 정치 성향 테스트 결과를 확인해보세요!\n${shareUrl}`)}`;
                                    }}
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:brightness-110 transition-all" style={{ backgroundColor: '#555' }}>
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] text-gray-400">이메일</span>
                                </button>
                            </div>
                        </div>

                        {/* URL Section */}
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="text-sm text-gray-300 font-semibold mb-2">
                                    공유 링크
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        id="share-url-input"
                                        name="share-url"
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${copied
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                            : "bg-white text-black hover:bg-gray-200"
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>복사됨!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                <span>복사</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="px-5 pb-5">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <QrCode className="w-4 h-4" />
                                <span>{showQR ? 'QR 코드 숨기기' : 'QR 코드 보기'}</span>
                            </button>
                            <AnimatePresence>
                                {showQR && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col items-center gap-3 pt-4">
                                            <div className="bg-white p-3 rounded-xl">
                                                <QRCodeSVG
                                                    value={shareUrl}
                                                    size={160}
                                                    bgColor="#ffffff"
                                                    fgColor="#000000"
                                                    level="M"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">QR 코드를 스캔하여 결과를 공유하세요</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-white/10 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
