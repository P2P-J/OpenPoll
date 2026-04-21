import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { X, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useTheme } from "@/contexts/ThemeContext";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: string;
}

interface SocialItem {
    id: string;
    label: string;
    icon: ReactNode;
    bgStyle: React.CSSProperties;
    onClick: () => void;
}

const TwitterIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'white' }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'white' }}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'white' }}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const EmailIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const SHARE_TEXT = "나의 DOS 정치 성향 결과를 확인해보세요!";
const COPY_RESET_MS = 2500;
const POPUP_OPTIONS = "width=550,height=420";

const openPopup = (url: string) => window.open(url, "_blank", POPUP_OPTIONS);

const FONT_STACK = "'Pretendard Variable', Pretendard, sans-serif";

export function ShareModal({ isOpen, onClose, type }: ShareModalProps) {
    const { isDark } = useTheme();
    const [copied, setCopied] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);
    const [hoverClose, setHoverClose] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // trailing slash 필수: 서버가 slash 없는 경로를 HTTPS→HTTP+slash 로 301 리다이렉트 하는데
    // SNS 크롤러(카카오·페이스북·X)가 이 scheme 다운그레이드 리다이렉트를 따라가지 못해 OG 메타를 못 읽음.
    const shareUrl = `${window.location.origin}/dos/share/${type}/`;

    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
            setEmailCopied(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const copyTimer = useRef<number | null>(null);
    const emailTimer = useRef<number | null>(null);
    useEffect(() => () => {
        if (copyTimer.current) clearTimeout(copyTimer.current);
        if (emailTimer.current) clearTimeout(emailTimer.current);
    }, []);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch {
            inputRef.current?.select();
            document.execCommand("copy");
        }
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    }, [shareUrl]);

    const handleEmailShare = useCallback(async () => {
        const emailBody = `나의 DOS 정치 성향 테스트 결과를 확인해보세요!\n${shareUrl}`;
        try {
            await navigator.clipboard.writeText(emailBody);
        } catch {
            // fallback
        }
        setEmailCopied(true);
        if (emailTimer.current) clearTimeout(emailTimer.current);
        emailTimer.current = window.setTimeout(() => setEmailCopied(false), COPY_RESET_MS);
    }, [shareUrl]);

    // 색상 토큰
    const fg = isDark ? '#ffffff' : '#1a1a1a';
    const bg = isDark ? '#1a1a1a' : '#ffffff';
    const mutedFg = isDark ? '#a0a0a0' : '#666';
    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const border2 = `2px solid ${fg}`;

    const socialItems: SocialItem[] = [
        {
            id: "twitter",
            label: "X",
            icon: <TwitterIcon />,
            bgStyle: { backgroundColor: '#0f0f0f' },
            onClick: () =>
                openPopup(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(SHARE_TEXT)}`
                ),
        },
        {
            id: "facebook",
            label: "Facebook",
            icon: <FacebookIcon />,
            bgStyle: { backgroundColor: "#1877F2" },
            onClick: () =>
                openPopup(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                ),
        },
        {
            id: "instagram",
            label: "Instagram",
            icon: <InstagramIcon />,
            bgStyle: {
                background:
                    "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
            },
            onClick: async () => {
                try { await navigator.clipboard.writeText(shareUrl); } catch { /* noop */ }
                window.open("https://www.instagram.com/", "_blank");
            },
        },
        {
            id: "email",
            label: emailCopied ? "복사됨!" : "이메일",
            icon: <EmailIcon />,
            bgStyle: { backgroundColor: emailCopied ? "#22c55e" : "#6b7280" },
            onClick: handleEmailShare,
        },
    ];

    const sectionLabelStyle: React.CSSProperties = {
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 3,
        color: mutedFg,
        marginBottom: 12,
        textTransform: 'uppercase',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-8"
                    role="dialog"
                    aria-modal="true"
                    aria-label="결과 공유하기"
                    onClick={onClose}
                    style={{ fontFamily: FONT_STACK }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0"
                        aria-hidden="true"
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            overscrollBehavior: 'contain',
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="relative"
                        style={{
                            backgroundColor: bg,
                            color: fg,
                            border: border2,
                            borderRadius: 20,
                            width: '92%',
                            maxWidth: 500,
                            boxShadow: isDark
                                ? '0 20px 60px rgba(0,0,0,0.6)'
                                : '0 20px 60px rgba(0,0,0,0.18)',
                            overflow: 'hidden',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ padding: '26px 28px 18px', position: 'relative' }}>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    letterSpacing: 4,
                                    color: mutedFg,
                                    marginBottom: 6,
                                }}
                            >
                                SHARE
                            </div>
                            <div
                                style={{
                                    fontSize: 26,
                                    fontWeight: 900,
                                    letterSpacing: -1,
                                    lineHeight: 1.1,
                                    color: fg,
                                }}
                            >
                                결과 공유하기
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="닫기"
                                onMouseEnter={() => setHoverClose(true)}
                                onMouseLeave={() => setHoverClose(false)}
                                style={{
                                    position: 'absolute',
                                    top: 20,
                                    right: 20,
                                    padding: 8,
                                    borderRadius: 10,
                                    background: hoverClose ? hoverBg : 'transparent',
                                    color: fg,
                                    transition: 'background-color 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* 공유 아이콘 */}
                        <div style={{ padding: '0 28px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
                                {/* eslint-disable-next-line react-hooks/refs -- onClick handlers only access refs on click, not during render */}
                                {socialItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={item.onClick}
                                        aria-label={`${item.label}로 공유`}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 8,
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            flex: 1,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'filter 0.15s ease, transform 0.15s ease',
                                                ...item.bgStyle,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.filter = 'brightness(1.08)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.filter = 'none';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: mutedFg }}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 공유 링크 */}
                        <div style={{ padding: '0 28px 20px' }}>
                            <div style={sectionLabelStyle}>공유 링크</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input
                                    ref={inputRef}
                                    id="share-url-input"
                                    name="share-url"
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        padding: '12px 16px',
                                        border: border2,
                                        borderRadius: 14,
                                        backgroundColor: bg,
                                        color: fg,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        outline: 'none',
                                        fontFamily: FONT_STACK,
                                    }}
                                />
                                <button
                                    onClick={handleCopy}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '10px 20px',
                                        borderRadius: 100,
                                        background: copied ? '#22c55e' : fg,
                                        color: copied ? '#ffffff' : bg,
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: 14,
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        transition: 'transform 0.12s ease',
                                        fontFamily: FONT_STACK,
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} />
                                            <span>복사됨!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            <span>복사</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* QR 코드 */}
                        <div style={{ padding: '0 28px 28px' }}>
                            <div style={sectionLabelStyle}>QR 코드</div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: 20,
                                    border: border2,
                                    borderRadius: 14,
                                    background: '#ffffff',
                                }}
                            >
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={148}
                                    bgColor="#ffffff"
                                    fgColor="#1a1a1a"
                                    level="M"
                                />
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#666', margin: 0 }}>
                                    QR 코드를 스캔해 결과를 공유하세요
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
