import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

// Custom typewriter hook
function useTypewriter(text, speed = 28, startDelay = 400) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    setDone(false);

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export function LoginPage() {
  const { login } = useAuth();

  // Navigation & Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isOperateOpen, setIsOperateOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Authentication State
  const [activeTab, setActiveTab] = useState('student'); // 'student', 'mentor', 'admin'
  const [email, setEmail] = useState('alex.kim@student.moodtrack.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Action Pills Fade-in State (appears 400ms after load)
  const [pillsVisible, setPillsVisible] = useState(false);

  // Project-Focused Typewriter Text
  const typewriterText = "Glad you stopped in. Take 30 seconds to track your mood, understand your stress patterns, and access confidential faculty support.";
  const { displayed, done } = useTypewriter(typewriterText, 28, 400);

  // Video Scrubbing Ref and State
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const prevXRef = useRef(null);

  // Handle Tab Selection
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'student') {
      setEmail('alex.kim@student.moodtrack.edu');
    } else if (tab === 'mentor') {
      setEmail('aris.thorne@moodtrack.edu');
    } else if (tab === 'admin') {
      setEmail('admin@moodtrack.edu');
    }
    setPassword('password123');
  };

  // Quick Open Portal with specific role
  const openPortalWithRole = (role) => {
    handleTabSelect(role);
    setIsPortalOpen(true);
    setMobileMenuOpen(false);
  };

  // Handle Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password, activeTab);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid institutional credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy Email to Clipboard
  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('support@moodtrack.edu');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Pill animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Video mouse scrub control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const performSeek = () => {
      if (!video || isSeekingRef.current) return;
      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.04) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      if (video && Math.abs(video.currentTime - targetTimeRef.current) > 0.04) {
        performSeek();
      }
    };

    video.addEventListener('seeked', handleSeeked);

    const handleMouseMove = (e) => {
      if (!video || !video.duration || isNaN(video.duration)) return;
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const SENSITIVITY = 0.8;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let nextTarget = targetTimeRef.current + timeOffset;
      nextTarget = Math.max(0, Math.min(video.duration, nextTarget));
      targetTimeRef.current = nextTarget;

      performSeek();
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Escape key handler for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPortalOpen(false);
        setIsOperateOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none bg-black text-white"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* 1. BACKGROUND VIDEO (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        className="fixed inset-0 z-0 w-full h-full object-cover pointer-events-none"
        style={{ objectPosition: '70% center' }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4"
        muted
        playsInline
        preload="auto"
      />

      {/* Subtle Dark Gradient Overlay to ensure text readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-black/70 via-black/25 to-black/50 pointer-events-none" />

      {/* 2. NAVBAR (fixed, z-index: 10) */}
      <nav className="fixed top-0 left-0 w-full z-10 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center pointer-events-auto">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-white font-medium"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            MoodTrack®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-white select-none leading-none"
            style={{ letterSpacing: '-0.02em' }}
            aria-hidden="true"
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) - Project Related */}
        <div className="hidden md:flex items-center text-[21px] lg:text-[23px] text-white">
          <button
            type="button"
            onClick={() => openPortalWithRole('student')}
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            Student Care
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onClick={() => openPortalWithRole('mentor')}
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            Mentor Advisory
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onClick={() => openPortalWithRole('admin')}
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            Campus Heatmaps
          </button>
          <span>,&nbsp;</span>
          <button
            type="button"
            onClick={() => setIsOperateOpen(true)}
            className="hover:opacity-60 transition-opacity cursor-pointer"
          >
            How Privacy Works
          </button>
        </div>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:block">
          <button
            type="button"
            onClick={() => setIsPortalOpen(true)}
            className="text-[21px] lg:text-[23px] text-white underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer"
          >
            Access Portal
          </button>
        </div>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] cursor-pointer focus:outline-none z-20"
          aria-label="Toggle navigation menu"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile overlay (z-index: 9) */}
      <div
        className={`md:hidden fixed inset-0 z-[9] bg-black/90 backdrop-blur-md flex flex-col justify-center px-8 gap-7 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => openPortalWithRole('student')}
          className="text-[28px] font-medium text-white text-left hover:opacity-70 transition-opacity cursor-pointer"
        >
          Student Care (Daily Check-in)
        </button>
        <button
          type="button"
          onClick={() => openPortalWithRole('mentor')}
          className="text-[28px] font-medium text-white text-left hover:opacity-70 transition-opacity cursor-pointer"
        >
          Mentor Advisory (Faculty Care)
        </button>
        <button
          type="button"
          onClick={() => openPortalWithRole('admin')}
          className="text-[28px] font-medium text-white text-left hover:opacity-70 transition-opacity cursor-pointer"
        >
          Campus Heatmaps (Dean Analytics)
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            setIsOperateOpen(true);
          }}
          className="text-[28px] font-medium text-white text-left hover:opacity-70 transition-opacity cursor-pointer"
        >
          How Privacy Works (Protocol)
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            setIsPortalOpen(true);
          }}
          className="text-[28px] font-medium text-teal-400 text-left underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer pt-3"
        >
          Access Portal (Sign In)
        </button>
      </div>

      {/* 3. HERO SECTION (z-index: 1) */}
      <main className="relative z-1 h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
        <div className="max-w-xl relative z-10">
          {/* 1. Crisp Project Intro Label (Unblurred & Relevant) */}
          <div
            className="pointer-events-none select-none mb-4 sm:mb-5 tracking-wide"
            style={{
              fontSize: 'clamp(17px, 3.5vw, 24px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#fff',
            }}
          >
            <span className="text-white/90">Hey there, welcome to MoodTrack,</span><br />
            <span className="font-semibold text-teal-300">Campus Well-Being & Stress Intelligence Hub</span>
          </div>

          {/* 2. Typewriter text - Relevant to Student Well-Being */}
          <p
            className="text-white mb-5 sm:mb-6 font-normal min-h-[58px] text-base sm:text-lg md:text-xl"
            style={{
              lineHeight: 1.4,
            }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] cursor-blink" />
            )}
          </p>

          {/* 3. Action pill buttons - Project Related */}
          <div
            className={`flex flex-wrap gap-y-1 transition-all duration-400 ease-out ${
              pillsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {/* 4 White pill buttons */}
            <button
              type="button"
              onClick={() => openPortalWithRole('student')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-md"
            >
              Log Today's Mood
            </button>

            <button
              type="button"
              onClick={() => openPortalWithRole('mentor')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-md"
            >
              Faculty Advisory
            </button>

            <button
              type="button"
              onClick={() => openPortalWithRole('admin')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-md"
            >
              Campus Heatmaps
            </button>

            <button
              type="button"
              onClick={() => setIsOperateOpen(true)}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-md"
            >
              How Privacy Works
            </button>

            {/* 1 Outline pill button */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
              title="Click to copy email address"
            >
              <span>
                Reach us: <span className="underline underline-offset-1">support@moodtrack.edu</span>
              </span>
              {/* 12x12 copy SVG icon */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copiedEmail && (
                <span className="text-[11px] font-bold text-emerald-400">Copied!</span>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* 4. TRUE GLASSMORPHISM ACCESS PORTAL MODAL */}
      {isPortalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          {/* Frosted Glass Card Container */}
          <div className="relative w-full max-w-md rounded-3xl p-6 md:p-8 text-white backdrop-blur-3xl bg-white/[0.08] dark:bg-black/[0.35] border border-white/25 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] overflow-hidden">
            {/* Ambient inner iridescent glow lights */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight">Access Portal</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  Sign in to your institutional wellness console
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPortalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-base transition-all cursor-pointer backdrop-blur-md"
                aria-label="Close portal"
              >
                ✕
              </button>
            </div>

            {/* Role Switcher with Frosted Glass Tabs */}
            <div className="relative z-10 grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md mt-5">
              <button
                type="button"
                onClick={() => handleTabSelect('student')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleTabSelect('mentor')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'mentor'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Mentor
              </button>
              <button
                type="button"
                onClick={() => handleTabSelect('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Quick Demo Persona Chips with Glassmorphic Style */}
            <div className="relative z-10 mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1.5">
                Instant 1-Click Demo Login:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTabSelect('student')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border backdrop-blur-md transition-all cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-teal-500/30 border-teal-400 text-teal-300 ring-2 ring-teal-400/40 font-bold'
                      : 'bg-white/[0.06] border-white/15 text-white/80 hover:bg-white/[0.12]'
                  }`}
                >
                  🎓 Alex Kim (Student)
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSelect('mentor')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border backdrop-blur-md transition-all cursor-pointer ${
                    activeTab === 'mentor'
                      ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300 ring-2 ring-indigo-400/40 font-bold'
                      : 'bg-white/[0.06] border-white/15 text-white/80 hover:bg-white/[0.12]'
                  }`}
                >
                  👨‍🏫 Dr. Thorne (Mentor)
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSelect('admin')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border backdrop-blur-md transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-purple-500/30 border-purple-400 text-purple-300 ring-2 ring-purple-400/40 font-bold'
                      : 'bg-white/[0.06] border-white/15 text-white/80 hover:bg-white/[0.12]'
                  }`}
                >
                  🏛️ Dean Miller (Admin)
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="relative z-10 mt-4 p-3 rounded-2xl bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-medium backdrop-blur-md">
                {errorMsg}
              </div>
            )}

            {/* Credentials Form with Frosted Inputs */}
            <form onSubmit={handleSubmit} className="relative z-10 mt-4 space-y-3.5 text-xs text-left">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-white/80 uppercase tracking-wider">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@moodtrack.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.15] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 backdrop-blur-md transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-white/80 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.15] focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 backdrop-blur-md transition-all text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white shadow-xl shadow-teal-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 shimmer-sweep"
              >
                {loading ? 'Authenticating Credentials...' : `Enter as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </button>
            </form>

            {/* Security Guarantee */}
            <div className="relative z-10 mt-4 pt-4 border-t border-white/15 text-center text-[11px] text-white/60">
              🔒 256-Bit TLS Encryption • Student Reflections Strictly Confidential
            </div>
          </div>
        </div>
      )}

      {/* 5. "HOW PRIVACY WORKS" PRINCIPLES MODAL */}
      {isOperateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl p-6 md:p-8 text-white backdrop-blur-3xl bg-white/[0.08] dark:bg-black/[0.4] border border-white/25 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div>
                <h3 className="text-xl font-bold">How MoodTrack Operates</h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Privacy-first campus mental well-being protocol
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOperateOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-base transition-colors cursor-pointer backdrop-blur-md"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-white/80 leading-relaxed">
              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm mb-1 text-teal-300">1. Zero Dean-Level Intrusion</div>
                <p>
                  Institutional administrators and deans have zero visibility into individual student reflections, private journal notes, or specific identity details. Data is aggregated using strict differential privacy and k-anonymity.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm mb-1 text-indigo-300">2. 3-Day Early Burnout Intervention</div>
                <p>
                  Faculty mentors only receive automated outreach prompts when a student experiences sustained high stress (level ≥ 4 for 3 consecutive days), ensuring timely, non-stigmatizing pastoral care.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm mb-1 text-emerald-300">3. 30-Second Micro Check-ins</div>
                <p>
                  Daily tracking is designed to be frictionless and effortless, preventing survey fatigue while maintaining statistically sound longitudinal wellness telemetry.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm mb-1 text-purple-300">4. Evidence-Based Mindful Grounding</div>
                <p>
                  Built-in 60-second physiological sigh and box breathing modules immediately stimulate the parasympathetic nervous system to reduce acute autonomic arousal during high-pressure exam cycles.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOperateOpen(false);
                  setIsPortalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer shadow-lg"
              >
                Open Access Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
