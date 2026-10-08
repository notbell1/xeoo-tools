import { useEffect, useMemo, useState } from "react";

import { ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";

const titleMessages = ["404 Not Found"];

const sadMessages = [
  "YOU GOT LOST, AND THAT IS FINE. SOMETIMES WEB PAGES DISAPPEAR, AND SOMETIMES PEOPLE LEAVE WITHOUT A TRACE—BUT AT LEAST THIS PAGE HAD THE DECENCY TO LEAVE A 404 ERROR.",
  "THE PAGE YOU ARE LOOKING FOR IS NOT HERE, OR MAYBE IT NEVER EXISTED IN THE FIRST PLACE, JUST LIKE THAT MUTUAL CONNECTION YOU THOUGHT YOU HAD.",
  "NOTHING TO SEE HERE, NO BIG EXPLANATION, AND NO DRAMA! JUST A MISSING PAGE AND A DEAFENING SILENCE, REMINISCENT OF YOUR LAST DELIVERED TEXT.",
  "PERHAPS THE URL WAS WRONG, OR MAYBE THE TIMING WAS JUST OFF? EITHER WAY, YOU ARE STUCK WAITING FOR SOMETHING THAT IS CLEARLY IGNORING YOU.",
  "THIS PAGE LEFT WITHOUT SAYING GOODBYE, WHICH IS A LITTLE RUDE, BUT IT IS STILL BETTER THAN BEING GHOSTED AFTER PLANNING A WHOLE FUTURE IN YOUR HEAD!",
  "NOT EVERYTHING YOU SEARCH FOR IS MEANT TO BE FOUND, AND SOME THINGS JUST QUIETLY SLIP AWAY, LIKE THEIR INTEREST IN CONTINUING THE CONVERSATION.",
  "STILL REFRESHING THE PAGE? THAT IS SOME SERIOUS DEDICATION, BUT UNFORTUNATELY, THIS LINK IS JUST AS DEAD AS THE HOPE THAT THEY WILL FINALLY CALL YOU BACK.",
  "THIS URL MADE A PROMISE IT COULD NOT KEEP! WE HAVE ALL TRUSTED WORSE THINGS, LIKE BELIEVING 'I AM JUST REALLY BUSY LATELY' WAS ACTUALLY THE TRUTH.",
  "YOU CAME HERE EXPECTING A PAGE BUT GOT HIT WITH A LITTLE EXISTENTIAL DAMAGE INSTEAD—SORRY ABOUT THAT, BUT YOU ARE CLEARLY NOT THEIR PRIORITY.",
  "THERE IS ABSOLUTELY NOTHING HERE! JUST YOU, A 404 ERROR, AND THE CRUSHING REALIZATION THAT YOU MIGHT BE THE ONLY ONE INVESTED IN THIS RELATIONSHIP.",
];

const quotes = [
  "“SOME THINGS DISAPPEAR BEFORE WE EVEN REALIZE WE WERE JUST A CONVENIENT BACKUP PLAN.”",
  "“NOT EVERY DEAD END NEEDS A SECOND ATTEMPT, ESPECIALLY WHEN THEY ARE CONSTANTLY LEAVING YOU ON READ.”",
  "“CLOSING THE WRONG TAB IS EASY, BUT CLOSING THE DOOR ON YOUR DELUSIONAL HOPE? NOT SO MUCH.”",
  "“SOME THINGS FADE AWAY QUIETLY, WHILE YOUR UNJUSTIFIED OVERCONFIDENCE LINGERS LOUDLY IN THE VOID.”",
  "“YOU CAN MISS SOMEONE CRAZILY WITHOUT FORCING A CONNECTION THAT WAS ONLY EVER ONE-SIDED.”",
  "“NOT EVERY MISSING PIECE IS MEANT TO BE RECOVERED; SOMETIMES THEY SIMPLY DO NOT WANT TO BE FOUND BY YOU.”",
  "“A BROKEN LINK IS A PRETTY CLEAR HINT, YET HERE YOU ARE, STILL WAITING FOR A MIRACLE TO HAPPEN!”",
  "“MAYBE THIS WAS NEVER YOUR PAGE TO BEGIN WITH, MUCH LIKE THEIR HEART WAS NEVER YOURS TO CLAIM.”",
  "“THE INTERNET FORGETS BROKEN LINKS QUICKLY, BUT APPARENTLY, YOU CANNOT FORGET SOMEONE WHO BARELY KNOWS YOU EXIST.”",
  "“SOME TABS TRULY DESERVE TO STAY CLOSED, RATHER THAN FEEDING YOUR ENDLESS HALLUCINATIONS.”",
  "“WHY FORCE A WRONG TURN INTO A DESTINATION JUST BECAUSE YOU CANNOT ACCEPT UNREQUITED LOVE?”",
  "“SOMETIMES THE BEST STRATEGY IS TO JUST RETREAT, BEFORE YOU EMBARRASS YOURSELF ANY FURTHER.”",
];

const footerMessages = [
  "PERHAPS GO BACK TO THE HOMEPAGE INSTEAD OF WAITING FOR SOMETHING THAT WON'T COME.",
  "FIND ANOTHER PAGE, BECAUSE THEY HAVE ALREADY FOUND SOMEONE ELSE.",
  "THIS IS A PERFECT TIME TO TURN AROUND AND RETAIN YOUR DIGNITY.",
  "PLEASE TAKE THE HINT, AND JUST CLICK THE BACK BUTTON!",
  "THE HOMEPAGE IS STILL AVAILABLE, UNLIKE THEIR UNAVAILABLE HEART.",
  "IT IS JUST A WRONG CLICK, NOT THE END OF YOUR UNREQUITED ROMANCE.",
  "DO NOT TAKE IT PERSONALLY; IT IS JUST A 404 ERROR AND NOT A REJECTION LETTER.",
  "YOU ARE NOT STUCK HERE, YOU ARE JUST TRAPPED IN THE FRIENDZONE.",
  "LET US JUST PRETEND THIS NEVER HAPPENED, MUCH LIKE YOUR IMAGINARY RELATIONSHIP STATUS.",
  "YOU ARE JUST ONE CLICK AWAY FROM FACING OUR SAD, SOLITARY REALITY.",
  "THE WEB IS FULL OF DEAD ENDS, BUT THANKFULLY THIS ONE DOES NOT BREAK YOUR HEART.",
];

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function TypewriterText({
  text,
  speed = 24,
  startDelay = 0,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    let timeoutId: number | undefined;
    let intervalId: number | undefined;

    const start = () => {
      intervalId = window.setInterval(() => {
        index += 1;

        setDisplayed(text.slice(0, index));

        if (index >= text.length && intervalId !== undefined) {
          window.clearInterval(intervalId);
        }
      }, speed);
    };

    timeoutId = window.setTimeout(start, startDelay);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [text, speed, startDelay]);

  return (
    <span>
      {displayed}
      <motion.span
        aria-hidden="true"
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="ml-1 inline-block text-red-500"
      >
        |
      </motion.span>
    </span>
  );
}

function SadIllustration({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <svg
        viewBox="0 0 240 220"
        className="h-full w-full drop-shadow-2xl filter"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A1B1D" />
            <stop offset="100%" stopColor="#140D0E" />
          </linearGradient>
          <linearGradient id="grad1-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3A2527" />
            <stop offset="100%" stopColor="#1C1214" />
          </linearGradient>
        </defs>
        <motion.path
          d="M67 49C67 32 81 20 97 20C109 20 120 27 124 39C129 27 140 20 153 20C169 20 182 32 182 49C182 75 158 96 124 122C90 96 67 75 67 49Z"
          fill="url(#grad1)"
          stroke="url(#grad1-stroke)"
          strokeWidth="2"
          animate={{
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: "center",
          }}
        />

        <motion.path
          d="M124 40L112 64L132 73L120 98"
          stroke="#EF4444"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))" }}
          animate={{
            opacity: [0.65, 1, 0.65],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <path
          d="M57 162C80 144 102 138 124 138C146 138 169 144 191 162"
          stroke="#4B5563"
          strokeWidth="5"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))" }}
        />

        <motion.circle
          cx="72"
          cy="179"
          r="5"
          fill="#4B5563"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))" }}
          animate={{
            y: [0, -5, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg
        viewBox="0 0 240 220"
        className="h-full w-full drop-shadow-2xl filter"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
        </defs>
        <motion.path
          d="M33 72C52 41 82 26 116 29C143 31 166 45 183 68C198 89 204 112 210 145"
          stroke="url(#grad2)"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))" }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <path
          d="M42 107C61 86 83 77 104 79C129 81 146 96 166 104C184 111 201 110 216 101"
          stroke="#4B5563"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))" }}
        />

        <path
          d="M69 142L61 177"
          stroke="#9CA3AF"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <path
          d="M94 145L86 181"
          stroke="#9CA3AF"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <path
          d="M121 143L113 178"
          stroke="#9CA3AF"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <path
          d="M150 138L142 174"
          stroke="#9CA3AF"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <path
          d="M45 185C76 194 143 196 198 183"
          stroke="#1F2937"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.5))" }}
        />

        <motion.circle
          cx="50"
          cy="45"
          r="5"
          fill="#9CA3AF"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))" }}
          animate={{
            y: [0, 7, 0],
            opacity: [0.15, 0.8, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
      </svg>
    );
  }

  if (variant === 2) {
    return (
      <svg
        viewBox="0 0 240 220"
        className="h-full w-full drop-shadow-2xl filter"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="grad3" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#111827" />
          </radialGradient>
        </defs>
        <motion.circle
          cx="123"
          cy="90"
          r="50"
          fill="url(#grad3)"
          style={{ filter: "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.6))" }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <path
          d="M143 54C132 60 124 70 124 83C124 102 140 117 159 117C169 117 178 114 185 108C179 132 158 148 135 148C105 148 81 124 81 94C81 65 104 42 133 40C142 40 151 43 157 48"
          fill="#4B5563"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))" }}
        />

        <path
          d="M62 171C78 158 99 151 122 150C146 149 171 157 187 171"
          stroke="#4B5563"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))" }}
        />

        <motion.circle
          cx="184"
          cy="41"
          r="4"
          fill="#9CA3AF"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))" }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
          }}
        />
      </svg>
    );
  }

  if (variant === 3) {
    return (
      <svg
        viewBox="0 0 240 220"
        className="h-full w-full drop-shadow-2xl filter"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
        </defs>
        <path
          d="M78 110C78 83 95 62 118 62C141 62 158 83 158 110"
          stroke="url(#grad4)"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))" }}
        />

        <path
          d="M62 111H174"
          stroke="#374151"
          strokeWidth="8"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))" }}
        />

        <path
          d="M77 111L69 162"
          stroke="#6B7280"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <path
          d="M158 111L167 162"
          stroke="#6B7280"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <path
          d="M90 116L83 158"
          stroke="#6B7280"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <path
          d="M145 116L152 158"
          stroke="#6B7280"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
        />

        <motion.circle
          cx="119"
          cy="79"
          r="10"
          fill="#451A1E"
          style={{ filter: "drop-shadow(0px 2px 8px rgba(239, 68, 68, 0.4))" }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        <path
          d="M111 79L118 86L128 73"
          stroke="#EF4444"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0px 0px 4px rgba(239, 68, 68, 0.6))" }}
        />

        <path
          d="M46 177C76 168 157 168 193 179"
          stroke="#1F2937"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.5))" }}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 220"
      className="h-full w-full drop-shadow-2xl filter"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D333B" />
          <stop offset="100%" stopColor="#171A21" />
        </linearGradient>
        <linearGradient id="grad5-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A5260" />
          <stop offset="100%" stopColor="#252A36" />
        </linearGradient>
      </defs>
      <motion.path
        d="M120 47C136 27 165 29 176 50C189 77 170 102 120 136C70 102 51 77 64 50C75 29 104 27 120 47Z"
        fill="url(#grad5)"
        stroke="url(#grad5-stroke)"
        strokeWidth="2"
        animate={{
          scale: [1, 1.035, 1],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transformOrigin: "center",
          filter: "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.5))",
        }}
      />

      <path
        d="M120 47C108 60 100 74 100 88C100 108 116 125 137 125C147 125 156 122 164 115C151 130 136 141 120 151C70 116 51 86 64 60C75 39 104 33 120 47Z"
        fill="#4B5563"
        style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))" }}
      />

      <path
        d="M118 51L109 72L126 80L116 99"
        stroke="#9CA3AF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))" }}
      />

      <path
        d="M61 173C81 165 100 161 120 161C142 161 162 166 182 174"
        stroke="#4B5563"
        strokeWidth="6"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))" }}
      />

      <motion.circle
        cx="55"
        cy="139"
        r="4"
        fill="#64748B"
        style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))" }}
        animate={{
          y: [0, -7, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
        }}
      />

      <motion.circle
        cx="187"
        cy="70"
        r="5"
        fill="#64748B"
        style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))" }}
        animate={{
          y: [0, 6, 0],
          opacity: [0.2, 0.7, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />
    </svg>
  );
}

export default function NotFound() {
  const title = useMemo(() => randomItem(titleMessages), []);
  const message = useMemo(() => randomItem(sadMessages), []);
  const quote = useMemo(() => randomItem(quotes), []);
  const smallMessage = useMemo(() => randomItem(footerMessages), []);
  const illustration = useMemo(() => Math.floor(Math.random() * 5), []);

  useEffect(() => {
    document.title = title;

    return () => {
      document.title = "XeooTools — FREE ONLINE TOOLS";
    };
  }, [title]);

  const goHome = () => {
    window.location.href = "/";
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <main className="fixed inset-0 z-[100] flex min-h-dvh h-dvh w-screen flex-col overflow-y-auto lg:overflow-hidden bg-gradient-to-br from-[#0a0a0f] to-[#120a11] text-white selection:bg-red-500/30">
      {/* 3D Lighting and Ambient Effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[-15%] top-[-15%] h-[50vh] w-[50vh] rounded-full bg-red-600/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-purple-600/10 blur-[120px]" />
        
        {/* Subtle grid pattern for depth */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"
        />
        
        {/* Center highlight */}
        <div className="absolute left-1/2 top-1/2 h-[40vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-full w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-12 py-6">
        <div className="grid w-full items-center gap-6 md:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          
          {/* Content Area */}
          <motion.section
            className="order-2 flex flex-col md:order-1 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-gradient-to-r from-red-500 to-transparent sm:w-12 rounded-full" />
              <p className="text-[10px] sm:text-[12px] font-extrabold uppercase tracking-[0.25em] text-red-400/90">
                Page Not Found
              </p>
            </div>

            {/* 3D 404 Text */}
            <motion.h1
              className="mt-3 text-[clamp(5.5rem,15vw,10rem)] font-black leading-[0.8] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700 drop-shadow-[0_10px_20px_rgba(220,38,38,0.25)] sm:mt-4"
              style={{
                textShadow: "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(220,38,38,0.4)"
              }}
              animate={{
                textShadow: [
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(220,38,38,0.3)",
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 25px rgba(220,38,38,0.6)",
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(220,38,38,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              404
            </motion.h1>

            <div className="mt-5 max-w-xl sm:mt-6">
              <p className="text-[13px] font-medium uppercase leading-[1.8] text-white/80 sm:text-[15px] sm:leading-[1.9]">
                <TypewriterText text={message} speed={15} startDelay={200} />
              </p>
            </div>

            <div className="mt-5 max-w-lg border-l-2 border-red-500/40 bg-gradient-to-r from-red-500/5 to-transparent pl-4 py-2 sm:mt-6 sm:pl-5 rounded-r-lg">
              <p className="text-[11px] uppercase italic leading-[1.8] text-white/60 sm:text-[12px] sm:leading-[1.9]">
                <TypewriterText text={quote} speed={18} startDelay={500} />
              </p>
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/40 sm:text-[11px]">
              {smallMessage}
            </p>

            <motion.div
              className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <button
                type="button"
                onClick={goHome}
                className="group relative inline-flex h-11 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-white to-neutral-200 px-6 text-[12px] font-extrabold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.98]"
              >
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <Home size={15} strokeWidth={2.5} />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={goBack}
                className="group relative inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-6 text-[12px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-[0.98]"
              >
                <ArrowLeft size={15} strokeWidth={2.5} />
                <span>Go Back</span>
              </button>
            </motion.div>
          </motion.section>

          {/* 3D Illustration Area */}
          <motion.section
            className="order-1 flex items-center justify-center md:order-2 h-full max-h-[40vh] md:max-h-none"
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="relative flex w-full max-w-[220px] items-center justify-center sm:max-w-[280px] md:max-w-[340px] lg:max-w-[400px] perspective-[1000px]"
              animate={{
                y: [0, -10, 0],
                rotateX: [0, 2, 0],
                rotateZ: [0, -1, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Floating glow behind illustration */}
              <div
                aria-hidden="true"
                className="absolute inset-[10%] rounded-full bg-red-600/15 blur-[60px] transition-all duration-1000"
              />

              {/* 3D Container for illustration */}
              <div 
                className="relative aspect-square w-full"
                style={{
                  transformStyle: "preserve-3d",
                  filter: "drop-shadow(0px 25px 35px rgba(0,0,0,0.6))"
                }}
              >
                <SadIllustration variant={illustration} />
              </div>
            </motion.div>
          </motion.section>

        </div>
      </div>
    </main>
  );
}