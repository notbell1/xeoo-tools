import { type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTools } from "../hooks/useTools";

// Standalone Pages
import Maintenance from "../pages/Maintenance";
import Soon from "../pages/Soon";
import NotFound from "../pages/NotFound";

// Tools
import Calculator from "../tools/math/Calculator";
import PercentageCalculator from "../tools/math/PercentageCalculator";
import FractionCalculator from "../tools/math/FractionCalculator";
import RatioCalculator from "../tools/math/RatioCalculator";
import AverageCalculator from "../tools/math/AverageCalculator";
import GcdLcmCalculator from "../tools/math/GcdLcmCalculator";
import PrimeNumberChecker from "../tools/math/PrimeNumberChecker";
import PrimeFactorization from "../tools/math/PrimeFactorization";
import FactorialCalculator from "../tools/math/FactorialCalculator";
import ExponentCalculator from "../tools/math/ExponentCalculator";
import SquareRootCalculator from "../tools/math/SquareRootCalculator";
import LinearEquationSolver from "../tools/math/LinearEquationSolver";
import QuadraticEquationSolver from "../tools/math/QuadraticEquationSolver";
import PythagoreanCalculator from "../tools/math/PythagoreanCalculator";
import AreaCalculator from "../tools/math/AreaCalculator";
import PerimeterCalculator from "../tools/math/PerimeterCalculator";
import VolumeCalculator from "../tools/math/VolumeCalculator";
import ImageCompressor from "../tools/image/ImageCompressor";
import ImageResizer from "../tools/image/ImageResizer";
import ImageConverter from "../tools/image/ImageConverter";
import ImageMetadataViewer from "../tools/image/ImageMetadataViewer";
import IPLookup from "../tools/network/IPLookup";
import DnsLookup from "../tools/network/DnsLookup";
import ReverseIpLookup from "../tools/network/ReverseIpLookup";
import PasswordGenerator from "../tools/security/PasswordGenerator";
import ScamLinkChecker from "../tools/security/ScamLinkChecker";
import WordPressExposureScanner from "../tools/security/WordPressExposureScanner";
import AdminFinder from "../tools/security/AdminFinder";
import SubdomainScanner from "../tools/security/SubdomainScanner";
import PasswordStrengthChecker from "../tools/security/PasswordStrengthChecker";
import HashGenerator from "../tools/security/HashGenerator";
import HashIdentifier from "../tools/security/HashIdentifier";
import JWTDecoder from "../tools/security/JWTDecoder";
import RandomTokenGenerator from "../tools/security/RandomTokenGenerator";
import UUIDGenerator from "../tools/security/UUIDGenerator";
import TypingTest from "../tools/productive/TypingTest";
import QrBarcodeGenerator from "../tools/productive/QrBarcodeGenerator";

// Psychology Tools
import BigFivePersonalityTest from "../tools/psychology/BigFivePersonalityTest";
import StressLevelTest from "../tools/psychology/StressLevelTest";
import ProcrastinationTest from "../tools/psychology/ProcrastinationTest";
import CognitiveDistortionChecker from "../tools/psychology/CognitiveDistortionChecker";
import AttachmentStyleTest from "../tools/psychology/AttachmentStyleTest";
import RelationshipPatternAnalyzer from "../tools/psychology/RelationshipPatternAnalyzer";
import EmotionalRegulationAnalyzer from "../tools/psychology/EmotionalRegulationAnalyzer";
import ConflictStyleAnalyzer from "../tools/psychology/ConflictStyleAnalyzer";
import DecisionMakingStyleTest from "../tools/psychology/DecisionMakingStyleTest";
import BoundaryAwarenessTest from "../tools/psychology/BoundaryAwarenessTest";
import SelfTalkAnalyzer from "../tools/psychology/SelfTalkAnalyzer";
import CopingStyleAnalyzer from "../tools/psychology/CopingStyleAnalyzer";
import EmotionalAwarenessTest from "../tools/psychology/EmotionalAwarenessTest";
import InterpersonalCommunicationAnalyzer from "../tools/psychology/InterpersonalCommunicationAnalyzer";
import PersonalValuesExplorer from "../tools/psychology/PersonalValuesExplorer";

// Defacement Simulation Tools
import DefacePageGenerator from "../tools/defacement/DefacePageGenerator";
import DefacementTemplateBuilder from "../tools/defacement/DefacementTemplateBuilder";
import CtfLauncher from "../tools/ctf/CtfLauncher";

// Health Tools
import BmiCalculator from "../tools/health/BmiCalculator";
import CalorieMacroCalculator from "../tools/health/CalorieMacroCalculator";
import HeartRateZoneCalculator from "../tools/health/HeartRateZoneCalculator";
import SleepCalculator from "../tools/health/SleepCalculator";
import DailyHealthMetricsTracker from "../tools/health/DailyHealthMetricsTracker";

// File Tools
import FileEncryptor from "../tools/file/FileEncryptor";
import ZipInspector from "../tools/file/ZipInspector";
import FileCompressor from "../tools/file/FileCompressor";
import FileExtractor from "../tools/file/FileExtractor";
import FileSplitter from "../tools/file/FileSplitter";
import FileMerger from "../tools/file/FileMerger";
import FileHashChecker from "../tools/file/FileHashChecker";
import FileIntegrityChecker from "../tools/file/FileIntegrityChecker";
import FileTypeIdentifier from "../tools/file/FileTypeIdentifier";
import FileSignatureAnalyzer from "../tools/file/FileSignatureAnalyzer";
import FileMetadataViewer from "../tools/file/FileMetadataViewer";
import MetadataRemover from "../tools/file/MetadataRemover";

// SEO Tools
import DaPaChecker from "../tools/seo/DaPaChecker";
import MetaTagAnalyzer from "../tools/seo/MetaTagAnalyzer";
import SerpSnippetPreview from "../tools/seo/SerpSnippetPreview";
import RobotsTxtGenerator from "../tools/seo/RobotsTxtGenerator";
import SitemapGenerator from "../tools/seo/SitemapGenerator";
import OpenGraphChecker from "../tools/seo/OpenGraphChecker";
import SchemaMarkupGenerator from "../tools/seo/SchemaMarkupGenerator";

// AI Tools
import PromptOptimizer from "../tools/ai/PromptOptimizer";
import PromptTemplateBuilder from "../tools/ai/PromptTemplateBuilder";
import PromptFormatter from "../tools/ai/PromptFormatter";
import AiTokenCounter from "../tools/ai/AiTokenCounter";
import AiCostCalculator from "../tools/ai/AiCostCalculator";
import SystemPromptBuilder from "../tools/ai/SystemPromptBuilder";
import AiModelParameterExplorer from "../tools/ai/AiModelParameterExplorer";
import AiOutputEvaluator from "../tools/ai/AiOutputEvaluator";
import AiContextWindowCalculator from "../tools/ai/AiContextWindowCalculator";
import AiJsonSchemaPromptBuilder from "../tools/ai/AiJsonSchemaPromptBuilder";
import PaletteInspect from "../tools/design/PaletteInspect";
import ColorConverter from "../tools/design/ColorConverter";
import ColorHarmonyGenerator from "../tools/design/ColorHarmonyGenerator";
import GradientGenerator from "../tools/design/GradientGenerator";
import ContrastChecker from "../tools/design/ContrastChecker";
import CssShadowGenerator from "../tools/design/CssShadowGenerator";
import CssBorderRadiusGenerator from "../tools/design/CssBorderRadiusGenerator";
import GlassmorphismGenerator from "../tools/design/GlassmorphismGenerator";
import CssFilterGenerator from "../tools/design/CssFilterGenerator";
import TypographyScaleGenerator from "../tools/design/TypographyScaleGenerator";

interface ToolDefinition {
  name: string;
  component: ReactNode;
  defaultStatus?: "ready" | "maintenance" | "upcoming";
}

const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  calculator: {
    name: "Calculator",
    component: <Calculator />,
    defaultStatus: "ready",
  },
  "percentage-calculator": {
    name: "Percentage Calculator",
    component: <PercentageCalculator />,
    defaultStatus: "ready",
  },
  "fraction-calculator": {
    name: "Fraction Calculator",
    component: <FractionCalculator />,
    defaultStatus: "ready",
  },
  "ratio-calculator": {
    name: "Ratio Calculator",
    component: <RatioCalculator />,
    defaultStatus: "ready",
  },
  "average-calculator": {
    name: "Average Calculator",
    component: <AverageCalculator />,
    defaultStatus: "ready",
  },
  "gcd-lcm-calculator": {
    name: "GCD & LCM Calculator",
    component: <GcdLcmCalculator />,
    defaultStatus: "ready",
  },
  "prime-number-checker": {
    name: "Prime Number Checker",
    component: <PrimeNumberChecker />,
    defaultStatus: "ready",
  },
  "prime-factorization": {
    name: "Prime Factorization",
    component: <PrimeFactorization />,
    defaultStatus: "ready",
  },
  "factorial-calculator": {
    name: "Factorial Calculator",
    component: <FactorialCalculator />,
    defaultStatus: "ready",
  },
  "exponent-calculator": {
    name: "Exponent Calculator",
    component: <ExponentCalculator />,
    defaultStatus: "ready",
  },
  "square-root-calculator": {
    name: "Square Root Calculator",
    component: <SquareRootCalculator />,
    defaultStatus: "ready",
  },
  "linear-equation-solver": {
    name: "Linear Equation Solver",
    component: <LinearEquationSolver />,
    defaultStatus: "ready",
  },
  "quadratic-equation-solver": {
    name: "Quadratic Equation Solver",
    component: <QuadraticEquationSolver />,
    defaultStatus: "ready",
  },
  "pythagorean-calculator": {
    name: "Pythagorean Calculator",
    component: <PythagoreanCalculator />,
    defaultStatus: "ready",
  },
  "area-calculator": {
    name: "Area Calculator",
    component: <AreaCalculator />,
    defaultStatus: "ready",
  },
  "perimeter-calculator": {
    name: "Perimeter Calculator",
    component: <PerimeterCalculator />,
    defaultStatus: "ready",
  },
  "volume-calculator": {
    name: "Volume Calculator",
    component: <VolumeCalculator />,
    defaultStatus: "ready",
  },
  "image-compressor": {
    name: "Image Compressor",
    component: <ImageCompressor />,
    defaultStatus: "ready",
  },
  "image-resizer": {
    name: "Image Resizer",
    component: <ImageResizer />,
    defaultStatus: "ready",
  },
  "image-converter": {
    name: "Image Converter",
    component: <ImageConverter />,
    defaultStatus: "ready",
  },
  "image-metadata-viewer": {
    name: "Image Metadata Viewer",
    component: <ImageMetadataViewer />,
    defaultStatus: "ready",
  },
  "ip-lookup": {
    name: "IP Lookup",
    component: <IPLookup />,
    defaultStatus: "ready",
  },
  "dns-lookup": {
    name: "DNS Lookup",
    component: <DnsLookup />,
    defaultStatus: "ready",
  },
  "reverse-ip-lookup": {
    name: "Reverse IP Lookup",
    component: <ReverseIpLookup />,
    defaultStatus: "ready",
  },
  "password-generator": {
    name: "Password Generator",
    component: <PasswordGenerator />,
    defaultStatus: "ready",
  },
  "scam-link-checker": {
    name: "Scam Link Checker",
    component: <ScamLinkChecker />,
    defaultStatus: "ready",
  },
  "wordpress-exposure-scanner": {
    name: "WordPress Exposure Scanner",
    component: <WordPressExposureScanner />,
    defaultStatus: "ready",
  },
  "admin-finder": {
    name: "Admin Finder",
    component: <AdminFinder />,
    defaultStatus: "ready",
  },
  "subdomain-scanner": {
    name: "Subdomain Scanner",
    component: <SubdomainScanner />,
    defaultStatus: "ready",
  },
  "password-strength-checker": {
    name: "Password Strength Checker",
    component: <PasswordStrengthChecker />,
    defaultStatus: "ready",
  },
  "hash-generator": {
    name: "Hash Generator",
    component: <HashGenerator />,
    defaultStatus: "ready",
  },
  "hash-identifier": {
    name: "Hash Identifier",
    component: <HashIdentifier />,
    defaultStatus: "ready",
  },
  "jwt-decoder": {
    name: "JWT Decoder",
    component: <JWTDecoder />,
    defaultStatus: "ready",
  },
  "random-token-generator": {
    name: "Random Token Generator",
    component: <RandomTokenGenerator />,
    defaultStatus: "ready",
  },
  "uuid-generator": {
    name: "UUID Generator",
    component: <UUIDGenerator />,
    defaultStatus: "ready",
  },
  "file-hash-checker": {
    name: "File Hash Checker",
    component: <FileHashChecker />,
    defaultStatus: "ready",
  },
  "typing-test": {
    name: "Typing Test",
    component: <TypingTest />,
    defaultStatus: "ready",
  },
  "qr-barcode-generator": {
    name: "QR & Barcode Generator",
    component: <QrBarcodeGenerator />,
    defaultStatus: "ready",
  },
  "big-five-personality-test": {
    name: "Big Five Personality Test",
    component: <BigFivePersonalityTest />,
    defaultStatus: "ready",
  },
  "stress-level-test": {
    name: "Stress Level Test",
    component: <StressLevelTest />,
    defaultStatus: "ready",
  },
  "procrastination-test": {
    name: "Procrastination Test",
    component: <ProcrastinationTest />,
    defaultStatus: "ready",
  },
  "cognitive-distortion-checker": {
    name: "Cognitive Distortion Checker",
    component: <CognitiveDistortionChecker />,
    defaultStatus: "ready",
  },
  "attachment-style-test": {
    name: "Attachment Style Test",
    component: <AttachmentStyleTest />,
    defaultStatus: "ready",
  },
  "relationship-pattern-analyzer": {
    name: "Relationship Pattern Analyzer",
    component: <RelationshipPatternAnalyzer />,
    defaultStatus: "ready",
  },
  "emotional-regulation-analyzer": {
    name: "Emotional Regulation Analyzer",
    component: <EmotionalRegulationAnalyzer />,
    defaultStatus: "ready",
  },
  "conflict-style-analyzer": {
    name: "Conflict Style Analyzer",
    component: <ConflictStyleAnalyzer />,
    defaultStatus: "ready",
  },
  "decision-making-style-test": {
    name: "Decision-Making Style Test",
    component: <DecisionMakingStyleTest />,
    defaultStatus: "ready",
  },
  "boundary-awareness-test": {
    name: "Boundary Awareness Test",
    component: <BoundaryAwarenessTest />,
    defaultStatus: "ready",
  },
  "self-talk-analyzer": {
    name: "Self-Talk Analyzer",
    component: <SelfTalkAnalyzer />,
    defaultStatus: "ready",
  },
  "coping-style-analyzer": {
    name: "Coping Style Analyzer",
    component: <CopingStyleAnalyzer />,
    defaultStatus: "ready",
  },
  "emotional-awareness-test": {
    name: "Emotional Awareness Test",
    component: <EmotionalAwarenessTest />,
    defaultStatus: "ready",
  },
  "interpersonal-communication-analyzer": {
    name: "Interpersonal Communication Analyzer",
    component: <InterpersonalCommunicationAnalyzer />,
    defaultStatus: "ready",
  },
  "personal-values-explorer": {
    name: "Personal Values Explorer",
    component: <PersonalValuesExplorer />,
    defaultStatus: "ready",
  },
  "deface-page-generator": {
    name: "Deface Page Generator",
    component: <DefacePageGenerator />,
    defaultStatus: "ready",
  },
  "defacement-template-builder": {
    name: "Defacement Template Builder",
    component: <DefacementTemplateBuilder />,
    defaultStatus: "ready",
  },
  "defacement-challenge-generator": {
    name: "Defacement Challenge Generator",
    component: <CtfLauncher />,
    defaultStatus: "ready",
  },
  "defacement-ctf": {
    name: "Defacement Challenge",
    component: <CtfLauncher />,
    defaultStatus: "ready",
  },
  "bmi-calculator": {
    name: "BMI Calculator",
    component: <BmiCalculator />,
    defaultStatus: "ready",
  },
  "calorie-macro-calculator": {
    name: "Calorie & Macro Calculator",
    component: <CalorieMacroCalculator />,
    defaultStatus: "ready",
  },
  "heart-rate-zone-calculator": {
    name: "Heart Rate Zone Calculator",
    component: <HeartRateZoneCalculator />,
    defaultStatus: "ready",
  },
  "sleep-calculator": {
    name: "Sleep Calculator",
    component: <SleepCalculator />,
    defaultStatus: "ready",
  },
  "daily-health-metrics-tracker": {
    name: "Daily Health Metrics Tracker",
    component: <DailyHealthMetricsTracker />,
    defaultStatus: "ready",
  },
  "file-encryptor": {
    name: "File Encryptor",
    component: <FileEncryptor />,
    defaultStatus: "ready",
  },
  "zip-inspector": {
    name: "ZIP Inspector",
    component: <ZipInspector />,
    defaultStatus: "ready",
  },
  "file-compressor": {
    name: "File Compressor",
    component: <FileCompressor />,
    defaultStatus: "ready",
  },
  "file-extractor": {
    name: "File Extractor",
    component: <FileExtractor />,
    defaultStatus: "ready",
  },
  "file-splitter": {
    name: "File Splitter",
    component: <FileSplitter />,
    defaultStatus: "ready",
  },
  "file-merger": {
    name: "File Merger",
    component: <FileMerger />,
    defaultStatus: "ready",
  },
  "file-integrity-checker": {
    name: "File Integrity Checker",
    component: <FileIntegrityChecker />,
    defaultStatus: "ready",
  },
  "file-type-identifier": {
    name: "File Type Identifier",
    component: <FileTypeIdentifier />,
    defaultStatus: "ready",
  },
  "file-signature-analyzer": {
    name: "File Signature Analyzer",
    component: <FileSignatureAnalyzer />,
    defaultStatus: "ready",
  },
  "file-metadata-viewer": {
    name: "File Metadata Viewer",
    component: <FileMetadataViewer />,
    defaultStatus: "ready",
  },
  "metadata-remover": {
    name: "Metadata Remover",
    component: <MetadataRemover />,
    defaultStatus: "ready",
  },
  "da-pa-checker": {
    name: "DA / PA Checker",
    component: <DaPaChecker />,
    defaultStatus: "ready",
  },
  "meta-tag-analyzer": {
    name: "Meta Tag Analyzer",
    component: <MetaTagAnalyzer />,
    defaultStatus: "ready",
  },
  "serp-snippet-preview": {
    name: "SERP Snippet Preview",
    component: <SerpSnippetPreview />,
    defaultStatus: "ready",
  },
  "robots-txt-generator": {
    name: "Robots.txt Generator",
    component: <RobotsTxtGenerator />,
    defaultStatus: "ready",
  },
  "sitemap-generator": {
    name: "Sitemap Generator",
    component: <SitemapGenerator />,
    defaultStatus: "ready",
  },
  "open-graph-checker": {
    name: "Open Graph Checker",
    component: <OpenGraphChecker />,
    defaultStatus: "ready",
  },
  "schema-markup-generator": {
    name: "Schema Markup Generator",
    component: <SchemaMarkupGenerator />,
    defaultStatus: "ready",
  },
  "prompt-optimizer": {
    name: "Prompt Optimizer",
    component: <PromptOptimizer />,
    defaultStatus: "ready",
  },
  "prompt-template-builder": {
    name: "Prompt Template Builder",
    component: <PromptTemplateBuilder />,
    defaultStatus: "ready",
  },
  "prompt-formatter": {
    name: "Prompt Formatter",
    component: <PromptFormatter />,
    defaultStatus: "ready",
  },
  "ai-token-counter": {
    name: "AI Token Counter",
    component: <AiTokenCounter />,
    defaultStatus: "ready",
  },
  "ai-cost-calculator": {
    name: "AI Cost Calculator",
    component: <AiCostCalculator />,
    defaultStatus: "ready",
  },
  "system-prompt-builder": {
    name: "System Prompt Builder",
    component: <SystemPromptBuilder />,
    defaultStatus: "ready",
  },
  "ai-model-parameter-explorer": {
    name: "AI Model Parameter Explorer",
    component: <AiModelParameterExplorer />,
    defaultStatus: "ready",
  },
  "ai-output-evaluator": {
    name: "AI Output Evaluator",
    component: <AiOutputEvaluator />,
    defaultStatus: "ready",
  },
  "ai-context-window-calculator": {
    name: "AI Context Window Calculator",
    component: <AiContextWindowCalculator />,
    defaultStatus: "ready",
  },
  "ai-json-schema-prompt-builder": {
    name: "AI JSON Schema Prompt Builder",
    component: <AiJsonSchemaPromptBuilder />,
    defaultStatus: "ready",
  },
  "palette-inspect": {
    name: "Palette Inspect",
    component: <PaletteInspect />,
    defaultStatus: "ready",
  },
  "color-converter": {
    name: "Color Converter",
    component: <ColorConverter />,
    defaultStatus: "ready",
  },
  "color-harmony-generator": {
    name: "Color Harmony Generator",
    component: <ColorHarmonyGenerator />,
    defaultStatus: "ready",
  },
  "gradient-generator": {
    name: "Gradient Generator",
    component: <GradientGenerator />,
    defaultStatus: "ready",
  },
  "contrast-checker": {
    name: "Contrast Checker",
    component: <ContrastChecker />,
    defaultStatus: "ready",
  },
  "css-shadow-generator": {
    name: "CSS Shadow Generator",
    component: <CssShadowGenerator />,
    defaultStatus: "ready",
  },
  "css-border-radius-generator": {
    name: "CSS Border Radius Generator",
    component: <CssBorderRadiusGenerator />,
    defaultStatus: "ready",
  },
  "glassmorphism-generator": {
    name: "Glassmorphism Generator",
    component: <GlassmorphismGenerator />,
    defaultStatus: "ready",
  },
  "css-filter-generator": {
    name: "CSS Filter Generator",
    component: <CssFilterGenerator />,
    defaultStatus: "ready",
  },
  "typography-scale-generator": {
    name: "Typography Scale Generator",
    component: <TypographyScaleGenerator />,
    defaultStatus: "ready",
  },
};

export default function ToolRouteGuard() {
  const { toolParam = "" } = useParams<{ toolParam: string }>();
  const { tools, loading } = useTools();

  // Parse potential status query delimiter '=' e.g. "scam-link-checker=maintenance"
  const hasEqualDelimiter = toolParam.includes("=");
  const [slug, ...statusParts] = toolParam.split("=");
  const requestedStatus = hasEqualDelimiter ? statusParts.join("=") : null;

  // Standalone redirect: Defacement CTF / Challenge generator goes to /ctf
  if (slug === "defacement-challenge-generator" || slug === "defacement-ctf") {
    return <Navigate to="/ctf" replace />;
  }

  // Find tool in database or registry
  const dbTool = tools.find((t) => t.slug === slug);
  const registryTool = TOOL_REGISTRY[slug];

  // If data is still loading and tool is known in registry, use default or wait
  if (loading && !dbTool && !registryTool) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-xeoo-bg text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-xeoo-primary border-t-transparent" />
      </div>
    );
  }

  // If tool doesn't exist anywhere, render 404
  if (!dbTool && !registryTool && !loading) {
    return <NotFound />;
  }

  const toolName = dbTool?.name || registryTool?.name || slug;
  const currentStatus =
    dbTool?.status || registryTool?.defaultStatus || "ready";

  // CASE 1: The URL has a status modifier like "=maintenance" or "=soon" or "=anything"
  if (requestedStatus !== null) {
    // Exact strict match for maintenance
    if (requestedStatus === "maintenance") {
      if (currentStatus === "maintenance") {
        return <Maintenance toolName={toolName} />;
      }
      // Status mismatch (e.g. tool is upcoming or ready, but URL has =maintenance) -> 404
      return <NotFound />;
    }

    // Exact strict match for soon
    if (requestedStatus === "soon") {
      if (currentStatus === "upcoming") {
        return <Soon toolName={toolName} />;
      }
      // Status mismatch (e.g. tool is maintenance or ready, but URL has =soon) -> 404
      return <NotFound />;
    }

    // Any invalid/typo status suffix (e.g. "=maintenancea", "=soonn", etc.) -> 404
    return <NotFound />;
  }

  // CASE 2: The URL is a clean tool slug (e.g. "/tools/scam-link-checker")
  if (currentStatus === "maintenance") {
    return <Navigate to={`/tools/${slug}=maintenance`} replace />;
  }

  if (currentStatus === "upcoming") {
    return <Navigate to={`/tools/${slug}=soon`} replace />;
  }

  // Tool is active/ready -> Render tool component directly into parent layout
  if (registryTool?.component) {
    return <>{registryTool.component}</>;
  }

  // If no React component exists for this slug -> 404
  return <NotFound />;
}
