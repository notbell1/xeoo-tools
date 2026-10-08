import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";

const titleMessages = ["Coming Soon"];

const soonMessages = [
  "THIS TOOL IS CURRENTLY IN ACTIVE DEVELOPMENT. AT LEAST WE HAD THE DECENCY TO PUT A 'COMING SOON' SIGN, UNLIKE THEM WHO SAID 'I'LL TEXT YOU LATER' AND DISAPPEARED FOR THREE MONTHS.",
  "CURRENTLY IN THE PIPELINE. WE ARE WRITING CODE AS FAST AS WE CAN, BUT EVEN A SLOW SERVER DEPLOYS FASTER THAN THEIR BRAIN REALIZING YOU WERE THE ONE WHO ACTUALLY CARED.",
  "ALMOST READY FOR LAUNCH. MUCH LIKE YOUR DATING LIFE—FULL OF SPECTACULAR COUNTDOWNS, HUGE PROMISES, AND ZERO ACTUAL COMMITMENT ON LAUNCH DAY.",
  "FUTURE RELEASE SCHEDULED. REMEMBER WHEN THEY PROMISED 'WE WILL HANG OUT SOON'? IT HAS BEEN TWO YEARS, BESTIE. THIS SCRIPT WILL ARRIVE MUCH FASTER.",
  "HANG TIGHT, WE ARE BUILDING SOMETHING SPECIAL. UNFORTUNATELY, NO MATTER HOW PATIENT YOU ARE, YOU CANNOT FORCE MUTUAL FEELINGS TO MANIFEST OUT OF THIN AIR.",
  "NOT YET AVAILABLE. WE KNOW YOU ARE USED TO WAITING FOR THINGS THAT ARE NEVER GUARANTEED, BUT AT LEAST OUR DEPLOYMENT CYCLE DOES NOT LEAD YOU ON.",
  "OUR DEVELOPERS ARE FINE-TUNING THE CODEBASE. STOP CHECKING YOUR NOTIFICATIONS EVERY THIRTY SECONDS—IF THEY WANTED TO TALK TO YOU, THEY WOULD HAVE ALREADY.",
  "THIS FEATURE IS ON THE HORIZON. DO NOT SPEND YOUR WHOLE NIGHT WAITING FOR A MIRACLE, WHETHER IT'S A NEW TOOL RELEASE OR A SUDDEN TEXT FROM YOUR EX.",
];

const quotes = [
  "“GREAT THINGS TAKE TIME TO BUILD, BUT WAITING FOR UNREQUITED LOVE IS PURE DELUSION.”",
  "“SOME TABS REMAIN UNOPENED, JUST LIKE THE UNREPLIED MESSAGES SITTING AT THE BOTTOM OF YOUR CHAT.”",
  "“A COUNTDOWN TIMER EVENTUALLY REACHES ZERO; FALSE HOPES JUST KEEP TICKING FOREVER.”",
  "“STOP WAITING AT THE ARRIVAL GATE FOR SOMEONE WHO NEVER BOARDED THE FLIGHT.”",
  "“PATIENCE IS A VIRTUE IN SOFTWARE ENGINEERING, BUT A TRAGIC TRAP IN ONE-SIDED DEVOTION.”",
  "“DO NOT PUT YOUR LIFE ON PAUSE FOR SOMEONE WHO HAS YOU ON PERMANENT MUTE.”",
  "“NEW FEATURES ARE WORTH ANTICIPATING; EMPTY PROMISES DESERVE TO BE ARCHIVED.”",
  "“ACCEPTING THAT SOMETHING ISN'T READY YET IS HEALTHY; WAITING FOR THE IMPOSSIBLE IS EXHAUSTING.”",
];

const footerMessages = [
  "PLEASE EXPLORE OTHER READY TOOLS WHILE WE COMPLETE THIS ONE.",
  "FEEL FREE TO RETURN TO THE HOMEPAGE AT ANY TIME.",
  "SOME LAUNCHES ARE WORTH WAITING FOR; UNRECIPROCATED LOVE IS NOT.",
  "AT LEAST OUR STATUS MESSAGES ARE HONEST AND TRANSPARENT.",
  "TAKE A DEEP BREATH AND CLOSE UNNECESSARY BROWSER TABS.",
  "THE HOMEPAGE IS ALWAYS WAITING FOR YOU.",
  "NO NEED TO REFRESH; WE WILL LAUNCH IT AS SOON AS IT IS READY.",
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
        className="ml-1 inline-block text-sky-400"
      >
        |
      </motion.span>
    </span>
  );
}

function SoonIllustration({ variant }: { variant: number }) {
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
          <linearGradient id="soon-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0C2340" />
            <stop offset="100%" stopColor="#05101F" />
          </linearGradient>
          <linearGradient id="soon-stroke1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>

        {/* Orbiting Capsule / Rocket Shell */}
        <motion.path
          d="M130 30C165 75 180 140 170 180L90 180C80 140 95 75 130 30Z"
          fill="url(#soon-grad1)"
          stroke="url(#soon-stroke1)"
          strokeWidth="2.5"
          animate={{ y: [-4, 6, -4], rotate: [-1, 1.5, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Glowing Cockpit Glass Dome */}
        <motion.circle
          cx="130"
          cy="95"
          r="24"
          fill="#0284C7"
          fillOpacity="0.35"
          stroke="#38BDF8"
          strokeWidth="2"
          animate={{ scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Glowing Cyan Wings */}
        <path d="M85 155L55 185L90 180Z" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
        <path d="M175 155L205 185L170 180Z" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />

        {/* Thruster Flame Pulse */}
        <motion.polygon
          points="130,215 118,180 142,180"
          fill="#38BDF8"
          animate={{ scaleY: [0.8, 1.3, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "130px 180px" }}
        />

        {/* Orbit Ring */}
        <motion.ellipse
          cx="130"
          cy="185"
          rx="90"
          ry="30"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "130px 185px" }}
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
        <linearGradient id="soon-grad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      {/* Orbiting Hourglass in Space */}
      <motion.g
        animate={{ rotate: [0, 180, 180, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        style={{ transformOrigin: "130px 105px" }}
      >
        <polygon points="95,65 165,65 130,105" fill="#0C2340" stroke="url(#soon-grad2)" strokeWidth="3" />
        <polygon points="130,105 165,145 95,145" fill="#0C2340" stroke="url(#soon-grad2)" strokeWidth="3" />
        <circle cx="130" cy="105" r="4" fill="#38BDF8" />
      </motion.g>

      {/* Futuristic Orbit Base Plate */}
      <path
        d="M45 188L215 188"
        stroke="#1E293B"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <motion.path
        d="M80 188L95 188"
        stroke="#38BDF8"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M135 188L150 188"
        stroke="#38BDF8"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.path
        d="M190 188L205 188"
        stroke="#38BDF8"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
    </svg>
  );
}

export default function Soon({ toolName }: { toolName?: string } = {}) {
  const toolNameParam = toolName || "";

  const title = useMemo(() => randomItem(titleMessages), []);
  const message = useMemo(() => randomItem(soonMessages), []);
  const quote = useMemo(() => randomItem(quotes), []);
  const smallMessage = useMemo(() => randomItem(footerMessages), []);
  const illustration = useMemo(() => Math.floor(Math.random() * 2), []);

  useEffect(() => {
    document.title = toolNameParam ? `${toolNameParam} — Coming Soon` : title;
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
    <main className="relative flex min-h-screen max-h-screen h-[100vh] w-full flex-col overflow-hidden bg-gradient-to-br from-[#060b14] to-[#0c1322] text-white selection:bg-sky-500/30">
      {/* 3D Lighting and Ambient Effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[-15%] top-[-15%] h-[50vh] w-[50vh] rounded-full bg-sky-600/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-indigo-600/10 blur-[120px]" />

        {/* Subtle grid pattern for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />

        {/* Center highlight */}
        <div className="absolute left-1/2 top-1/2 h-[40vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-[120px]" />
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
              <span className="h-[2px] w-8 bg-gradient-to-r from-sky-500 to-transparent sm:w-12 rounded-full" />
              <p className="text-[10px] sm:text-[12px] font-extrabold uppercase tracking-[0.25em] text-sky-400/90">
                {toolNameParam ? `${toolNameParam} • Coming Soon` : "Coming Soon"}
              </p>
            </div>

            {/* 3D SOON Text */}
            <motion.h1
              className="mt-3 text-[clamp(4.5rem,13vw,8.5rem)] font-black leading-[0.8] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-sky-400 to-sky-700 drop-shadow-[0_10px_20px_rgba(14,165,233,0.25)] sm:mt-4"
              style={{
                textShadow:
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(14,165,233,0.4)",
              }}
              animate={{
                textShadow: [
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(14,165,233,0.3)",
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 25px rgba(14,165,233,0.6)",
                  "0 1px 1px rgba(255,255,255,0.2), 0px 4px 10px rgba(14,165,233,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              SOON
            </motion.h1>

            <div className="mt-5 max-w-xl sm:mt-6">
              <p className="text-[13px] font-medium uppercase leading-[1.8] text-white/80 sm:text-[15px] sm:leading-[1.9]">
                <TypewriterText text={message} speed={15} startDelay={200} />
              </p>
            </div>

            <div className="mt-5 max-w-lg border-l-2 border-sky-500/40 bg-gradient-to-r from-sky-500/5 to-transparent pl-4 py-2 sm:mt-6 sm:pl-5 rounded-r-lg">
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
                className="absolute inset-[10%] rounded-full bg-sky-600/15 blur-[60px] transition-all duration-1000"
              />

              {/* 3D Container for illustration */}
              <div
                className="relative aspect-square w-full"
                style={{
                  transformStyle: "preserve-3d",
                  filter: "drop-shadow(0px 25px 35px rgba(0,0,0,0.6))",
                }}
              >
                <SoonIllustration variant={illustration} />
              </div>
            </motion.div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
