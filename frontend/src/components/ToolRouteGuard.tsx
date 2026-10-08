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
