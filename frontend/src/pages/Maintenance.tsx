import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";

const titleMessages = ["503 Under Maintenance"];

const maintenanceMessages = [
  "WE ARE CURRENTLY FIXING CRITICAL BUGS AND REPLACING BROKEN MODULES. UNFORTUNATELY, THERE IS NO UPDATE FILE FOR SPENDING MONTHS WAITING FOR SOMEONE WHO NEVER VALUED YOU.",
  "THIS TOOL IS UNDERGOING SCHEDULED OVERHAUL. WE PUT MORE EFFORT INTO REPAIRING THIS SCRIPT THAN THEY EVER PUT INTO REPLYING TO YOUR LATE-NIGHT MESSAGES.",
  "PARTS ARE CURRENTLY BEING REPLACED. UNLIKE YOU, WHO THOUGHT YOU WERE IRREPLACEABLE UNTIL THEY INTRODUCED SOMEONE NEW A COUPLE OF WEEKS LATER.",
  "MAINTENANCE MODE ACTIVATED TO PREVENT FURTHER DAMAGE—A STRATEGY YOU PROBABLY SHOULD HAVE APPLIED TO YOUR EMOTIONAL LIFE A LONG TIME AGO.",
  "WE ARE REBUILDING THE ENGINE FROM SCRATCH. TAKE A CUE FROM OUR DEVELOPERS AND STOP TRYING TO REPAIR A CONNECTION THAT HAS BEEN BROKEN BEYOND SALVATION.",
  "CIRCUIT SHUTDOWN IN PROGRESS. MACHINES RECOGNIZE WHEN THEY ARE OVERHEATING; YOU, ON THE OTHER HAND, KEPT DOUBLE-TEXTING INTO THE VOID.",
  "WE ARE CALIBRATING PROTOCOLS. AT LEAST THIS TOOL WILL ACTUALLY COME BACK WORKING, UNLIKE THAT 'I JUST NEED TIME TO FIND MYSELF' PROMISE.",
  "SYSTEM UNAVAILABLE FOR TUNING. YOU CAN REFRESH ALL YOU WANT, BUT SOME THINGS SIMPLY CANNOT BE FIXED WHEN ONLY ONE SIDE IS DOING THE WORK.",
];

const quotes = [
  "“SOME THINGS BREAK BEYOND REPAIR, BUT UNLIKE YOU, AN ENGINEER KNOWS WHEN TO SCRAP THE MACHINE.”",
  "“STOP VOLUNTEERING TO FIX SOMEONE WHO HAS NO PROBLEM LEAVING YOU IN PIECES.”",
  "“YOU CAN'T REBUILD TRUST WITH SOMEONE WHO ONLY CALLS WHEN THEIR FIRST OPTION IS UNAVAILABLE.”",
  "“OVERHAULING A SYSTEM TAKES TIME, BUT REBUILDING YOUR DIGNITY STARTS THE MOMENT YOU WALK AWAY.”",
  "“EVEN THE MOST ADVANCED CODEBASE THROWS AN ERROR; YOU JUST IGNORED ALL THEIR RED FLAGS.”",
  "“SOME CONNECTIONS AREN'T IN MAINTENANCE—THEY HAVE BEEN PERMANENTLY DECOMMISSIONED.”",
  "“DO NOT INVEST YOUR BEST EFFORTS INTO A RELATIONSHIP THAT TREATS YOU LIKE A TEMPORARY BACKUP SERVER.”",
  "“REPAIRS ARE TEMPORARY, BUT THE LESSON THAT YOU DESERVE RECIPROCATED EFFORT SHOULD BE PERMANENT.”",
];

const footerMessages = [
  "PLEASE RETURN TO THE HOMEPAGE WHILE WE FINISH THE REPAIRS.",
  "SOME TOOLS NEED TIME TO FIX, UNLIKE THEIR HEART WHICH WAS NEVER OPEN.",
  "TAKE THIS DOWNTIME TO REST YOUR TIRED, OVERTHINKING BRAIN.",
  "NO AMOUNT OF REFRESHING WILL SPEED UP RECOVERY, BOTH FOR THIS TOOL AND YOUR PRIDE.",
  "AT LEAST OUR SERVERS HAVE THE DECENCY TO NOTIFY YOU WHEN THEY ARE DOWN.",
  "THE HOMEPAGE IS AVAILABLE AND FULLY FUNCTIONAL.",
  "SAVE YOUR TOOLS FOR SOMETHING THAT CAN ACTUALLY BE SALVAGED.",
];

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function TypewriterText({
  text,
  speed = 22,
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
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        className="ml-1 inline-block text-amber-500"
      >
        |
      </motion.span>
    </span>
  );
}

function MaintenanceIllustration({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <svg
        viewBox="0 0 260 240"
        className="h-full w-full drop-shadow-2xl filter"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="maint-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E2011" />
            <stop offset="100%" stopColor="#140E06" />
          </linearGradient>
          <linearGradient id="maint-stroke1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#573812" />
            <stop offset="100%" stopColor="#291807" />
          </linearGradient>
        </defs>

        {/* Broken Heart Structure */}
        <motion.path
          d="M75 55C75 36 91 22 109 22C122 22 135 30 139 43C145 30 157 22 172 22C190 22 204 36 204 55C204 84 177 108 139 137C101 108 75 84 75 55Z"
          fill="url(#maint-grad1)"
          stroke="url(#maint-stroke1)"
          strokeWidth="2"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Lightning Repair Spark Crack */}
        <motion.path
          d="M139 45L126 72L148 82L135 110"
          stroke="#F59E0B"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.6))" }}
          animate={{ opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Wrench Repair Tool */}
        <motion.g
          animate={{ rotate: [0, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "180px 140px" }}
        >
          <path
            d="M165 110L205 150L195 160L155 120Z"
            fill="#78716C"
            stroke="#44403C"
            strokeWidth="2"
          />
          <circle cx="155" cy="115" r="14" fill="#D97706" stroke="#92400E" strokeWidth="2" />
          <circle cx="155" cy="115" r="6" fill="#1C1917" />
        </motion.g>

        {/* Base Support Line */}
        <path
          d="M65 180C90 160 115 154 139 154C164 154 189 160 214 180"
          stroke="#44403C"
          strokeWidth="5"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))" }}
        />

        <motion.circle
          cx="82"
          cy="198"
          r="5"
          fill="#57534E"
          style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))" }}
          animate={{ y: [0, -5, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 240"
      className="h-full w-full drop-shadow-2xl filter"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="maint-grad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Rotating 3D Gear */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "130px 105px" }}
      >
        <circle cx="130" cy="105" r="42" fill="#1C1917" stroke="url(#maint-grad2)" strokeWidth="4" />
        <circle cx="130" cy="105" r="18" fill="#292524" stroke="#78350F" strokeWidth="2" />
        <rect x="123" y="55" width="14" height="14" rx="2" fill="#F59E0B" />
        <rect x="123" y="141" width="14" height="14" rx="2" fill="#F59E0B" />
        <rect x="80" y="98" width="14" height="14" rx="2" fill="#F59E0B" />
        <rect x="166" y="98" width="14" height="14" rx="2" fill="#F59E0B" />
      </motion.g>

      {/* Warning Hazard Base Plate */}
      <path
        d="M45 188L215 188"
        stroke="#44403C"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <motion.path
        d="M80 188L95 188"
        stroke="#F59E0B"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M135 188L150 188"
        stroke="#F59E0B"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.path
        d="M190 188L205 188"
        stroke="#F59E0B"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
    </svg>
  );
}

export default function Maintenance({ toolName }: { toolName?: string } = {}) {
  const toolNameParam = toolName || "";

  const title = useMemo(() => randomItem(titleMessages), []);
  const message = useMemo(() => randomItem(maintenanceMessages), []);
  const quote = useMemo(() => randomItem(quotes), []);
  const smallMessage = useMemo(() => randomItem(footerMessages), []);
  const illustration = useMemo(() => Math.floor(Math.random() * 2), []);

  useEffect(() => {
    document.title = toolNameParam ? `${toolNameParam} — Under Maintenance` : title;
    return () => {
      document.title = "XeooTools — FREE ONLINE TOOLS";
    };
  }, [title, toolNameParam]);

  const goHome = () => {
    window.location.href = "/";
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <main className="relative flex min-h-screen max-h-screen h-[100vh] w-full flex-col overflow-hidden bg-gradient-to-br from-[#0e0b06] to-[#171008] text-white selection:bg-amber-500/30">
      {/* 3D Lighting and Ambient Effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[-15%] top-[-15%] h-[50vh] w-[50vh] rounded-full bg-amber-600/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-orange-600/10 blur-[120px]" />

        {/* Subtle grid pattern for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />

        {/* Center highlight */}
        <div className="absolute left-1/2 top-1/2 h-[40vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-12 py-4">
        <div className="grid w-full items-center gap-6 md:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Content Area */}
          <motion.section
            className="order-2 flex flex-col md:order-1 max-h-[85vh] overflow-y-auto pr-2 scrollbar-hide"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-gradient-to-r from-amber-500 to-transparent sm:w-12 rounded-full" />
              <p className="text-[10px] sm:text-[12px] font-extrabold uppercase tracking-[0.25em] text-amber-400/90">
                {toolNameParam ? `${toolNameParam} • Under Maintenance` : "Under Maintenance"}
              </p>
            </div>

            {/* 3D 503 Text */}
            <motion.h1
              className="mt-3 text-[clamp(5.5rem,15vw,10rem)] font-black leading-[0.8] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-700 drop-shadow-[0_10px_20px_rgba(245,158,11,0.25)] sm:mt-4"
              style={{
                textShadow:
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(245,158,11,0.4)",
              }}
              animate={{
                textShadow: [
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(245,158,11,0.3)",
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 25px rgba(245,158,11,0.6)",
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(245,158,11,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              503
            </motion.h1>

            <div className="mt-5 max-w-xl sm:mt-6">
              <p className="text-[13px] font-medium uppercase leading-[1.8] text-white/80 sm:text-[15px] sm:leading-[1.9]">
                <TypewriterText text={message} speed={15} startDelay={200} />
              </p>
            </div>

            <div className="mt-5 max-w-lg border-l-2 border-amber-500/40 bg-gradient-to-r from-amber-500/5 to-transparent pl-4 py-2 sm:mt-6 sm:pl-5 rounded-r-lg">
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
                rotateZ: [0, -1, 0],
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
                className="absolute inset-[10%] rounded-full bg-amber-600/15 blur-[60px] transition-all duration-1000"
              />

              {/* 3D Container for illustration */}
              <div
                className="relative aspect-square w-full"
                style={{
                  transformStyle: "preserve-3d",
                  filter: "drop-shadow(0px 25px 35px rgba(0,0,0,0.6))",
                }}
              >
                <MaintenanceIllustration variant={illustration} />
              </div>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
