<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

// Helper to generate evidence PNG image data URI with base64
function generateEvidenceImageBase64(int $width, int $height, string $hexBg, string $label, array $pixels = []): string {
    $img = imagecreatetruecolor($width, $height);
    $hex = ltrim($hexBg, '#');
    $r = (int)hexdec(substr($hex, 0, 2));
    $g = (int)hexdec(substr($hex, 2, 2));
    $b = (int)hexdec(substr($hex, 4, 2));
    $bgCol = imagecolorallocate($img, $r, $g, $b);
    imagefilledrectangle($img, 0, 0, $width, $height, $bgCol);

    // Subtle grid lines
    $gridCol = imagecolorallocate($img, max(0, $r - 15), max(0, $g - 15), max(0, $b - 15));
    for ($x = 0; $x < $width; $x += 20) {
        imageline($img, $x, 0, $x, $height, $gridCol);
    }
    for ($y = 0; $y < $height; $y += 20) {
        imageline($img, 0, $y, $width, $y, $gridCol);
    }

    // Text label
    $textCol = imagecolorallocate($img, 200, 210, 230);
    imagestring($img, 3, 10, 10, $label, $textCol);

    // Specific coordinate pixels
    foreach ($pixels as $p) {
        $pCol = imagecolorallocate($img, $p['r'], $p['g'], $p['b']);
        imagesetpixel($img, $p['x'], $p['y'], $pCol);
    }

    ob_start();
    imagepng($img);
    $bin = ob_get_clean();
    imagedestroy($img);

    return 'data:image/png;base64,' . base64_encode($bin);
}

try {
    $ctfId = (int)$pdo->query("SELECT id FROM ctfs WHERE slug = 'defacement-season-1'")->fetchColumn();
    if (!$ctfId) {
        $ctfId = 1;
    }

    $challenges = [
        // -------------------------------------------------------------
        // EASY 1
        // -------------------------------------------------------------
        [
            'slug' => 'source-comment-breach',
            'title' => 'Source Comment Breach',
            'category' => 'Source Forensics',
            'difficulty' => 'easy',
            'points' => 100,
            'estimated_minutes' => 3,
            'case_reference' => 'CASE-XE-001',
            'scenario' => 'An enterprise landing page was compromised and defaced. A system operator left emergency recovery remarks in the raw static markup prior to host isolation.',
            'objective' => 'Examine markup structure to locate the emergency recovery token.',
            'flag' => 'XEOO{source_comments_uncovered}',
            'sort_order' => 1,
            'hints' => [
                ['title' => 'Check Raw Markup', 'hint_text' => 'Use the Source Viewer tab to view unrendered HTML rather than looking only at visual preview.', 'cost' => 5],
                ['title' => 'Search for Markup Comments', 'hint_text' => 'Look for HTML comments placed near document footers or diagnostic blocks.', 'cost' => 10],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Inspect HTML Source',
                    'objective' => 'Open the source viewer for index.html and review operator remarks.',
                    'clue' => 'Operator remarks and rollback tickets may persist in static defacement captures.',
                    'observation' => 'Found HTML comment near the bottom.',
                    'extraction_method' => 'Source inspection',
                    'interpretation' => 'Emergency ticket token contains the recovery flag.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>SYSTEM OVERRIDE // CLASSIFIED</title>\n  <style>\n    body { background: #0a0c10; color: #f87171; font-family: monospace; text-align: center; padding: 60px 20px; }\n    h1 { font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }\n    p { color: #94a3b8; font-size: 14px; }\n  </style>\n</head>\n<body>\n  <h1>[ 403 - PORTAL DECOMMISSIONED ]</h1>\n  <p>All administrative access routes have been sealed by unauthorized actors.</p>\n  <p>Investigation ticket #98241 in progress.</p>\n\n  <!-- emergency-rollback-token: XEOO{source_comments_uncovered} (auth: ops-recovery) -->\n</body>\n</html>",
                    'metadata_json' => ['encoding' => 'UTF-8', 'format' => 'HTML5'],
                    'sort_order' => 1,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // EASY 2
        // -------------------------------------------------------------
        [
            'slug' => 'ghost-in-the-dom',
            'title' => 'Ghost in the DOM',
            'category' => 'DOM Hierarchy',
            'difficulty' => 'easy',
            'points' => 100,
            'estimated_minutes' => 5,
            'case_reference' => 'CASE-XE-002',
            'scenario' => 'The attacker altered an advisory page to display decoy maintenance text. Forensic responders suspect unrendered elements remain present in the DOM tree.',
            'objective' => 'Inspect the DOM tree nodes to locate quarantined non-visible elements.',
            'flag' => 'XEOO{hidden_in_plain_dom}',
            'sort_order' => 2,
            'hints' => [
                ['title' => 'Inspect DOM Structure', 'hint_text' => 'Traverse the element tree in the DOM Inspector to reveal nodes not rendered visually.', 'cost' => 5],
                ['title' => 'Look for Suppressed Nodes', 'hint_text' => 'Search for containers styled with display: none or hidden attributes.', 'cost' => 10],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Analyze DOM Hierarchy',
                    'objective' => 'Traverse the element tree in the DOM inspector.',
                    'clue' => 'Suppressed elements remain present in the DOM despite being invisible.',
                    'observation' => 'Hidden container quarantine-telemetry-node discovered.',
                    'extraction_method' => 'DOM Tree traversal',
                    'interpretation' => 'Unrendered node text holds the flag.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Security Incident Advisory</title>\n  <style>\n    body { background: #0f172a; color: #e2e8f0; font-family: sans-serif; padding: 40px; text-align: center; }\n    .banner { border: 1px solid #334155; padding: 30px; border-radius: 8px; background: #1e293b; max-width: 500px; margin: 0 auto; }\n  </style>\n</head>\n<body>\n  <div class=\"banner\">\n    <h2>Server Maintenance</h2>\n    <p>Routine security evaluation underway. Visual rendering operating within normal parameters.</p>\n  </div>\n\n  <div id=\"quarantine-telemetry-node\" style=\"display: none;\" aria-hidden=\"true\">\n    XEOO{hidden_in_plain_dom}\n  </div>\n</body>\n</html>",
                    'metadata_json' => ['hidden_nodes' => 1],
                    'sort_order' => 1,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // EASY 3
        // -------------------------------------------------------------
        [
            'slug' => 'attribute-exposure',
            'title' => 'Attribute Exposure',
            'category' => 'Data Attributes',
            'difficulty' => 'easy',
            'points' => 100,
            'estimated_minutes' => 5,
            'case_reference' => 'CASE-XE-003',
            'scenario' => 'A cyber syndicate defaced a corporate portal and embedded exfiltrated telemetry inside custom data attributes attached to an interactive badge component.',
            'objective' => 'Discover the custom attribute holding the session token.',
            'flag' => 'XEOO{data_attributes_exposed}',
            'sort_order' => 3,
            'hints' => [
                ['title' => 'Inspect Component Attributes', 'hint_text' => 'Select UI badges and warning elements in the DOM Inspector and read their attribute list.', 'cost' => 5],
                ['title' => 'Examine Data Properties', 'hint_text' => 'Look for telemetry or session attributes beginning with data-*.', 'cost' => 10],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Inspect Badge Attributes',
                    'objective' => 'Inspect the warning badge element in the DOM tree.',
                    'clue' => 'Custom HTML5 data-* properties frequently preserve telemetry data.',
                    'observation' => 'Attribute data-session-token located on span.badge-warning.',
                    'extraction_method' => 'Attribute inspection',
                    'interpretation' => 'Value contains the incident flag.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>NOTICE // DOMAIN SEIZED</title>\n  <style>\n    body { background: #09090b; color: #f43f5e; font-family: monospace; padding: 40px; text-align: center; }\n    .badge-warning { background: #27272a; padding: 6px 12px; border-radius: 4px; display: inline-block; color: #fbbf24; }\n  </style>\n</head>\n<body>\n  <h1>DEFACEMENT ADVISORY</h1>\n  <p>The host system is under quarantine.</p>\n  <span class=\"badge-warning\" data-node=\"incident-beacon\" data-session-token=\"XEOO{data_attributes_exposed}\">\n    STATUS: COMPROMISED\n  </span>\n</body>\n</html>",
                    'metadata_json' => ['attributes' => ['data-node', 'data-session-token']],
                    'sort_order' => 1,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // EASY 4
        // -------------------------------------------------------------
        [
            'slug' => 'meta-header-leak',
            'title' => 'Meta Header Leak',
            'category' => 'Header Metadata',
            'difficulty' => 'easy',
            'points' => 100,
            'estimated_minutes' => 4,
            'case_reference' => 'CASE-XE-004',
            'scenario' => 'During an unauthorized automated deployment, server-side CI/CD variables populated custom header metadata tags with incident correlation data.',
            'objective' => 'Extract the incident signature from document metadata tags.',
            'flag' => 'XEOO{meta_tags_preserve_state}',
            'sort_order' => 4,
            'hints' => [
                ['title' => 'Examine the <head> section', 'hint_text' => 'Document metadata is defined in <meta> tags inside the <head> container.', 'cost' => 5],
                ['title' => 'Search for Custom Headers', 'hint_text' => 'Look for meta names related to incident tracking or system telemetry.', 'cost' => 10],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Inspect Document Head',
                    'objective' => 'Read <meta> headers inside the index.html source code.',
                    'clue' => 'Meta headers convey session data often neglected during site modification.',
                    'observation' => '<meta name=\"x-incident-signature\"> found.',
                    'extraction_method' => 'Meta inspection',
                    'interpretation' => 'Content attribute holds flag.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"author\" content=\"NullSec Syndicate\">\n  <meta name=\"x-incident-signature\" content=\"XEOO{meta_tags_preserve_state}\">\n  <title>Under Reconstruction</title>\n</head>\n<body style=\"background:#111; color:#fff; font-family:sans-serif; text-align:center; padding:50px;\">\n  <h2>Under Reconstruction</h2>\n  <p>The original content will be restored once security verification is complete.</p>\n</body>\n</html>",
                    'metadata_json' => ['head_meta_count' => 4],
                    'sort_order' => 1,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // EASY 5
        // -------------------------------------------------------------
        [
            'slug' => 'the-comment-trail',
            'title' => 'The Comment Trail',
            'category' => 'Comment Trails',
            'difficulty' => 'easy',
            'points' => 100,
            'estimated_minutes' => 6,
            'case_reference' => 'CASE-XE-005',
            'scenario' => 'The defacer left a fragmented breadcrumb trail partitioned across markup header, body, and footer sections disguised as automated build digests.',
            'objective' => 'Find all 3 digest markers in sequence and assemble the token.',
            'flag' => 'XEOO{split_comment_trails_found}',
            'sort_order' => 5,
            'hints' => [
                ['title' => 'Examine Document Top to Bottom', 'hint_text' => 'Fragments are placed across distinct sections of the document.', 'cost' => 5],
                ['title' => 'Correlate Numbered Markers', 'hint_text' => 'Look for indexed comments such as [1], [2], [3] and assemble them in order.', 'cost' => 10],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Collect Digest Fragments',
                    'objective' => 'Scan the HTML source to gather all 3 build digest comments.',
                    'clue' => 'Indexed comments in header, body, and footer form a coherent string.',
                    'observation' => 'Found build-digest[1], [2], and [3].',
                    'extraction_method' => 'String concatenation',
                    'interpretation' => 'Joining pieces creates the complete flag string.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>Archived Deface State</title>\n  <!-- build-digest[1]: XEOO{split_ -->\n</head>\n<body style=\"background:#030712; color:#38bdf8; font-family:monospace; padding:30px;\">\n  <h1>ZONE-H ARCHIVE REPLAY</h1>\n  <p>Snapshot timestamp: 2026-10-07 04:12:00 UTC</p>\n\n  <!-- build-digest[2]: comment_ -->\n\n  <div>\n    <p>Evidence manifest captured by response unit Alpha.</p>\n  </div>\n\n  <!-- build-digest[3]: trails_found} -->\n</body>\n</html>",
                    'metadata_json' => ['fragments' => 3],
                    'sort_order' => 1,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // MEDIUM 1 (6)
        // -------------------------------------------------------------
        [
            'slug' => 'style-injection-trace',
            'title' => 'Style Injection Trace',
            'category' => 'CSS Forensics',
            'difficulty' => 'medium',
            'points' => 250,
            'estimated_minutes' => 8,
            'case_reference' => 'CASE-XE-006',
            'scenario' => 'An enterprise management console was compromised. Responders noted that external styling sheets contain custom variable properties associated with an override button.',
            'objective' => 'Identify the anomalous DOM class and inspect its CSS declaration in styles.css.',
            'flag' => 'XEOO{css_custom_properties_leaked}',
            'sort_order' => 6,
            'hints' => [
                ['title' => 'Inspect Interactive Elements', 'hint_text' => 'Inspect the DOM elements to find a button with an anomalous override class.', 'cost' => 10],
                ['title' => 'Inspect styles.css', 'hint_text' => 'Open styles.css and locate the rule corresponding to that button class to inspect custom properties (--*).', 'cost' => 15],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Identify DOM Anomaly',
                    'objective' => 'Inspect the action button in the DOM tree.',
                    'clue' => 'The action button features a suspicious styling class.',
                    'observation' => 'Found class sys-emergency-override on button.',
                    'extraction_method' => 'DOM Inspection',
                    'interpretation' => 'Class leads to external CSS rule.',
                    'next_action' => 'Open styles.css.',
                    'sort_order' => 1,
                ],
                [
                    'stage_uid' => 'stg-2',
                    'title' => 'Inspect CSS Declaration',
                    'objective' => 'Open styles.css and locate rule for .sys-emergency-override.',
                    'clue' => 'CSS variables (starting with --) are frequently utilized to store hidden configuration values.',
                    'observation' => 'Variable --session-telemetry-seed holds token string.',
                    'extraction_method' => 'CSS rule extraction',
                    'interpretation' => 'Token value contains flag.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 2,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <div class=\"system-card\">\n    <h2>Administrative Lockout</h2>\n    <p>Emergency procedures activated. Subsystem authentication is offline.</p>\n    <button class=\"btn sys-emergency-override\">Bypass Core</button>\n  </div>\n</body>\n</html>",
                    'metadata_json' => ['linked_css' => 'styles.css'],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'styles.css',
                    'name' => 'styles.css',
                    'type' => 'css',
                    'role' => 'supporting',
                    'content' => "body {\n  background-color: #0b0f19;\n  color: #f1f5f9;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n  padding: 40px;\n}\n\n.system-card {\n  border: 1px solid #1e293b;\n  padding: 24px;\n  background: #111827;\n  max-width: 480px;\n  margin: 0 auto;\n  border-radius: 8px;\n}\n\n.btn {\n  padding: 8px 16px;\n  background: #dc2626;\n  color: white;\n  border: none;\n  border-radius: 4px;\n}\n\n.sys-emergency-override {\n  --session-telemetry-seed: \"XEOO{css_custom_properties_leaked}\";\n  cursor: pointer;\n  box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);\n}",
                    'metadata_json' => ['rules_count' => 4],
                    'sort_order' => 2,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // MEDIUM 2 (7)
        // -------------------------------------------------------------
        [
            'slug' => 'encoded-forensic-note',
            'title' => 'Encoded Forensic Note',
            'category' => 'Base64 Artifacts',
            'difficulty' => 'medium',
            'points' => 250,
            'estimated_minutes' => 8,
            'case_reference' => 'CASE-XE-007',
            'scenario' => 'The response team recovered an edge gateway error page generated during an upstream failure. The proxy left an internal exception trace containing an encoded diagnostic envelope.',
            'objective' => 'Identify the encoded envelope string in the gateway error trace and decode it.',
            'flag' => 'XEOO{base64_forensic_artifact}',
            'sort_order' => 7,
            'hints' => [
                ['title' => 'Inspect Server Diagnostics', 'hint_text' => 'Examine the technical error comments in the source code to find an encoded envelope token.', 'cost' => 10],
                ['title' => 'Identify Base64 Structure', 'hint_text' => 'An alphanumeric string without spaces or symbols fits Base64. Use the Base64 Decode tool in the Decoder Workbench.', 'cost' => 15],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Extract Correlation Envelope',
                    'objective' => 'Inspect the upstream error trace inside index.html comments.',
                    'clue' => 'The FastCGI exception dump includes an anomalous correlation envelope token.',
                    'observation' => 'Token WEVPT3tiYXNlNjRfZm9yZW5zaWNfYXJ0aWZhY3R9 identified.',
                    'extraction_method' => 'Log extraction',
                    'interpretation' => 'String is Base64 encoded payload.',
                    'next_action' => 'Open Decoder Workbench.',
                    'sort_order' => 1,
                ],
                [
                    'stage_uid' => 'stg-2',
                    'title' => 'Decode with Decoder Workbench',
                    'objective' => 'Decode the Base64 string in the toolbox.',
                    'clue' => 'The workbench decodes Base64 directly without third-party software.',
                    'observation' => 'Decoded string matches flag format.',
                    'extraction_method' => 'Base64 Decode',
                    'interpretation' => 'Plaintext flag recovered.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 2,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>502 Bad Gateway - Edge Reverse Proxy</title>\n</head>\n<body style=\"background:#090d16; color:#94a3b8; font-family:monospace; padding:40px; line-height:1.6;\">\n  <h1 style=\"color:#f87171; font-size:20px; margin-bottom:8px;\">502 Bad Gateway // Upstream Cluster Unreachable</h1>\n  <p>The upstream application pool terminated unexpectedly while serving the request.</p>\n  <hr style=\"border-color:#1e293b; margin:20px 0;\">\n  <p style=\"font-size:12px; color:#64748b;\">Incident ID: ERR-GW-9941 | Host: edge-proxy-03.core.local</p>\n\n  <!--\n    Nginx/1.24.0 (Ubuntu) FastCGI Exception Dump:\n    Thread ID: 0x7fa920bf4700 | Signal: SIGSEGV (Address boundary error)\n    Fault Address: 0x000055e82b7194\n    X-Correlation-Envelope: WEVPT3tiYXNlNjRfZm9yZW5zaWNfYXJ0aWZhY3R9\n    Register Dump: RAX=0x00000000 RBX=0x7fa920bf3bf0 RCX=0x00000000\n  -->\n</body>\n</html>",
                    'metadata_json' => ['http_status' => 502],
                    'sort_order' => 1,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // MEDIUM 3 (8)
        // -------------------------------------------------------------
        [
            'slug' => 'script-state-anomaly',
            'title' => 'Script State Anomaly',
            'category' => 'JavaScript Forensics',
            'difficulty' => 'medium',
            'points' => 250,
            'estimated_minutes' => 10,
            'case_reference' => 'CASE-XE-008',
            'scenario' => 'A client-side telemetry script was bundled into the defaced web application. Investigators detected an anomalous configuration signature in the client runtime state.',
            'objective' => 'Inspect client runtime telemetry and decode the hexadecimal byte string.',
            'flag' => 'XEOO{js_variables_extracted}',
            'sort_order' => 8,
            'hints' => [
                ['title' => 'Check JavaScript Artifact', 'hint_text' => 'Open app_forensics.js in the JavaScript Viewer to inspect runtime objects.', 'cost' => 10],
                ['title' => 'Hexadecimal Byte Sequence', 'hint_text' => 'An even-length string composed of 0-9 and a-f represents hex bytes. Decode it using the Hex Decoder in the Decoder Workbench.', 'cost' => 15],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Inspect DOM Script Inclusion',
                    'objective' => 'Follow <script src=\"app_forensics.js\">.',
                    'clue' => 'The client loads app_forensics.js.',
                    'observation' => 'Script referenced by index.html.',
                    'extraction_method' => 'Artifact traversal',
                    'interpretation' => 'Logic lives in app_forensics.js.',
                    'next_action' => 'Open app_forensics.js.',
                    'sort_order' => 1,
                ],
                [
                    'stage_uid' => 'stg-2',
                    'title' => 'Extract Hex Signature',
                    'objective' => 'Read auditSignature from client runtime.',
                    'clue' => 'auditSignature contains 56 hex chars.',
                    'observation' => 'Found 58454f4f7b6a735f7661726961626c65735f6578747261637465647d.',
                    'extraction_method' => 'JS variable extraction',
                    'interpretation' => 'Hex representation of ASCII string.',
                    'next_action' => 'Decode hex in workbench.',
                    'sort_order' => 2,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>DEVOPS PIPELINE PAUSED</title>\n</head>\n<body style=\"background:#0b0f19; color:#94a3b8; font-family:sans-serif; padding:40px;\">\n  <h2>DevOps Deployment Pipeline</h2>\n  <div id=\"status-panel\" data-module=\"telemetryClient\">Pipeline execution suspended.</div>\n  <script src=\"app_forensics.js\"></script>\n</body>\n</html>",
                    'metadata_json' => ['scripts' => ['app_forensics.js']],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'app_forensics.js',
                    'name' => 'app_forensics.js',
                    'type' => 'javascript',
                    'role' => 'supporting',
                    'content' => "// Automated Incident Telemetry v3.4.1\n(function(window) {\n  'use strict';\n  const telemetryClient = {\n    tenantId: \"cluster-us-east-1\",\n    logLevel: \"warn\",\n    heartbeatMs: 60000,\n    auditSignature: \"58454f4f7b6a735f7661726961626c65735f6578747261637465647d\",\n    initializedAt: 1775551200\n  };\n  window.__TELEMETRY_SESSION__ = telemetryClient;\n})(window);",
                    'metadata_json' => ['version' => '3.4.1'],
                    'sort_order' => 2,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // MEDIUM 4 (9)
        // -------------------------------------------------------------
        [
            'slug' => 'image-metadata-inspection',
            'title' => 'Image Metadata Inspection',
            'category' => 'Image Metadata',
            'difficulty' => 'medium',
            'points' => 250,
            'estimated_minutes' => 10,
            'case_reference' => 'CASE-XE-009',
            'scenario' => 'Intruders replaced the brand logo on the defaced site with a custom tamper graphic. Forensic analysis of the graphic reveals technical image metadata.',
            'objective' => 'Inspect image metadata in the browser and decode the extracted string.',
            'flag' => 'XEOO{in_browser_evidence_found}',
            'sort_order' => 9,
            'hints' => [
                ['title' => 'Open Image Analyzer', 'hint_text' => 'Select compromised_banner.png in the Artifacts tab to view its visual analysis and metadata panel.', 'cost' => 10],
                ['title' => 'Examine Image Header Tags', 'hint_text' => 'Look at technical attributes such as XMP-Toolkit or Software headers containing encoded strings.', 'cost' => 15],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Inspect Image Metadata',
                    'objective' => 'View compromised_banner.png metadata tags.',
                    'clue' => 'Image analyzers extract EXIF/XMP chunks.',
                    'observation' => 'XMP-Toolkit holds WEVPT3tpbl9icm93c2VyX2V2aWRlbmNlX2ZvdW5kfQ==.',
                    'extraction_method' => 'Metadata inspection',
                    'interpretation' => 'Base64 encoded flag string.',
                    'next_action' => 'Decode base64 string.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<body style=\"background:#09090b; color:#fff; text-align:center; padding:30px;\">\n  <h1>ACCESS DENIED</h1>\n  <img src=\"compromised_banner.png\" alt=\"Forensic Evidence Graphic\" style=\"max-width:320px; border:1px solid #333;\">\n  <p>Evidence ID #7729 captured from victim host.</p>\n</body>\n</html>",
                    'metadata_json' => ['images' => ['compromised_banner.png']],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'compromised_banner.png',
                    'name' => 'compromised_banner.png',
                    'type' => 'image',
                    'role' => 'supporting',
                    'content' => generateEvidenceImageBase64(320, 200, '#161b26', 'EVIDENCE_BANNER_09'),
                    'metadata_json' => [
                        'Format' => 'PNG 24-bit Truecolor',
                        'Dimensions' => '320x200 px',
                        'Color-Profile' => 'sRGB IEC61966-2.1',
                        'Software' => 'OptiPNG / ImageMagick 7.1.0',
                        'Timestamp' => '2026-10-07T09:15:22Z',
                        'XMP-Toolkit' => 'WEVPT3tpbl9icm93c2VyX2V2aWRlbmNlX2ZvdW5kfQ==',
                        'Acquisition' => 'Browser Memory Dump',
                    ],
                    'sort_order' => 2,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // MEDIUM 5 (10)
        // -------------------------------------------------------------
        [
            'slug' => 'tri-fragment-reassembly',
            'title' => 'Tri-Fragment Reassembly',
            'category' => 'Fragment Reassembly',
            'difficulty' => 'medium',
            'points' => 250,
            'estimated_minutes' => 10,
            'case_reference' => 'CASE-XE-010',
            'scenario' => 'The defacer distributed their signature across HTML, CSS, and JS project files using consistent build digest markers to bypass single-file static analysis.',
            'objective' => 'Gather the three indexed fragments and reconstruct the complete flag.',
            'flag' => 'XEOO{fragment_reconstruction}',
            'sort_order' => 10,
            'hints' => [
                ['title' => 'Check All 3 Artifacts', 'hint_text' => 'Fragment [1] is in index.html, Fragment [2] is in styles.css, and Fragment [3] is in main.js.', 'cost' => 10],
                ['title' => 'Assemble by Index', 'hint_text' => 'Combine the build-digest fragments in order [1] + [2] + [3].', 'cost' => 15],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Correlate Tri-Artifact Digest',
                    'objective' => 'Extract build-digest[1], [2], [3] from HTML, CSS, and JS.',
                    'clue' => 'All three source files carry sequential build fragments.',
                    'observation' => 'frag 1 = XEOO{frag, frag 2 = ment_re, frag 3 = construction}.',
                    'extraction_method' => 'Cross-artifact assembly',
                    'interpretation' => 'Reassembled string yields complete flag.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<!-- build-digest[1]: XEOO{frag -->\n<head>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body style=\"background:#0f172a; color:#f8fafc; font-family:sans-serif; padding:40px;\">\n  <h2>Incident Case #8812</h2>\n  <script src=\"main.js\"></script>\n</body>\n</html>",
                    'metadata_json' => ['part' => 1],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'styles.css',
                    'name' => 'styles.css',
                    'type' => 'css',
                    'role' => 'supporting',
                    'content' => "/* build-digest[2]: ment_re */\nbody {\n  background: #0f172a;\n  color: #f8fafc;\n}\n.banner {\n  padding: 20px;\n  border-radius: 6px;\n}",
                    'metadata_json' => ['part' => 2],
                    'sort_order' => 2,
                ],
                [
                    'artifact_uid' => 'main.js',
                    'name' => 'main.js',
                    'type' => 'javascript',
                    'role' => 'supporting',
                    'content' => "// build-digest[3]: construction}\nconsole.log(\"Telemetry stream verified.\");",
                    'metadata_json' => ['part' => 3],
                    'sort_order' => 3,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // HARD 1 (11)
        // -------------------------------------------------------------
        [
            'slug' => 'coordinate-grid-extraction',
            'title' => 'Coordinate Grid Extraction',
            'category' => 'Pixel Steganography',
            'difficulty' => 'hard',
            'points' => 500,
            'estimated_minutes' => 20,
            'case_reference' => 'CASE-XE-011',
            'scenario' => 'Forensic analysts recovered a visual canvas containing a steganographic matrix. A DOM calibration origin attribute correlates with exact pixel coordinates that reveal a symmetric cipher key.',
            'objective' => 'Identify coordinate anchor, sample pixel RGB values to discover cipher key, and decrypt the payload.',
            'flag' => 'XEOO{pixels_leave_evidence}',
            'sort_order' => 11,
            'hints' => [
                ['title' => 'Check Calibration Origin in DOM', 'hint_text' => 'The diagnostic container in index.html contains data-calibration-origin=\'14:28\'. Navigate to pixel (14, 28) in the Image Analyzer.', 'cost' => 15],
                ['title' => 'Convert Pixel RGB to ASCII', 'hint_text' => 'Pixel (14, 28) and (15, 28) contain RGB byte values that convert to ASCII characters representing the symmetric key.', 'cost' => 20],
                ['title' => 'Vigenère Cipher Decryption', 'hint_text' => 'Use key \'PIXEL\' with Vigenère Cipher in the Cipher Workbench on the cipherSeal string from script.js.', 'cost' => 25],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Locate Pixel Calibration',
                    'objective' => 'Find calibration origin in index.html.',
                    'clue' => 'data-calibration-origin points to X=14, Y=28.',
                    'observation' => 'Target coordinate is (14, 28).',
                    'extraction_method' => 'DOM Inspection',
                    'interpretation' => 'Anchor coordinate identifies steganographic pixel.',
                    'next_action' => 'Open Image Analyzer on evidence_grid.png.',
                    'sort_order' => 1,
                ],
                [
                    'stage_uid' => 'stg-2',
                    'title' => 'Sample Pixel to ASCII Key',
                    'objective' => 'Sample RGB at (14, 28) and (15, 28).',
                    'clue' => 'RGB values 80, 73, 88, 69, 76 spell PIXEL.',
                    'observation' => 'Key discovered: PIXEL.',
                    'extraction_method' => 'Pixel Sampling',
                    'interpretation' => 'PIXEL is symmetric Vigenere key.',
                    'next_action' => 'Decrypt script.js ciphertext.',
                    'sort_order' => 2,
                ],
                [
                    'stage_uid' => 'stg-3',
                    'title' => 'Decrypt Vigenere Seal',
                    'objective' => 'Decrypt MMLS{axfbpd_amxzp_tdfhpckb} with key PIXEL.',
                    'clue' => 'Cipher Workbench performs Vigenere decrypt.',
                    'observation' => 'Decrypted text reveals XEOO{pixels_leave_evidence}.',
                    'extraction_method' => 'Vigenere Decryption',
                    'interpretation' => 'Final flag obtained.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 3,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>CRIME SCENE // SYSTEM HALTED</title>\n</head>\n<body style=\"background:#0a0e17; color:#f87171; font-family:monospace; padding:30px;\">\n  <h1>UNAUTHORIZED SYSTEM STATE</h1>\n  <p>Forensic capture in progress.</p>\n  <div class=\"diagnostic-frame\" data-calibration-origin=\"14:28\" data-render-mode=\"direct-pixel\">\n    <img id=\"evidence-canvas\" src=\"evidence_grid.png\" alt=\"Evidence Grid\" style=\"border:1px solid #334155;\">\n  </div>\n  <script src=\"script.js\"></script>\n</body>\n</html>",
                    'metadata_json' => ['target_img' => 'evidence_grid.png'],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'evidence_grid.png',
                    'name' => 'evidence_grid.png',
                    'type' => 'image',
                    'role' => 'supporting',
                    'content' => generateEvidenceImageBase64(320, 240, '#101624', 'GRID_FORENSICS', [
                        ['x' => 14, 'y' => 28, 'r' => 80, 'g' => 73, 'b' => 88], // P, I, X
                        ['x' => 15, 'y' => 28, 'r' => 69, 'g' => 76, 'b' => 65], // E, L, A
                    ]),
                    'metadata_json' => [
                        'Sensor-Grid' => 'EVIDENCE-PIXEL-ALPHA',
                        'Dimensions' => '320x240 px',
                        'Color-Depth' => '32-bit RGBA',
                        'Calibration-Anchor' => 'data-calibration-origin specifies reference pixel',
                    ],
                    'sort_order' => 2,
                ],
                [
                    'artifact_uid' => 'script.js',
                    'name' => 'script.js',
                    'type' => 'javascript',
                    'role' => 'supporting',
                    'content' => "// Incident Verification Script\nconst sessionAudit = {\n  subsystem: \"kernel_guard\",\n  cipherSeal: \"MMLS{axfbpd_amxzp_tdfhpckb}\",\n  locked: true\n};\nconsole.log(\"Audit lock engaged:\", sessionAudit.subsystem);",
                    'metadata_json' => ['subsystem' => 'kernel_guard'],
                    'sort_order' => 3,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // HARD 2 (12)
        // -------------------------------------------------------------
        [
            'slug' => 'cross-artifact-cascade',
            'title' => 'Cross-Artifact Cascade',
            'category' => 'DOM Cascade',
            'difficulty' => 'hard',
            'points' => 500,
            'estimated_minutes' => 22,
            'case_reference' => 'CASE-XE-012',
            'scenario' => 'A multi-layered compromise trail connects a cluster card class in the DOM to an internal stylesheet token, decoding to an enclave registry key that unlocks a ROT13 encrypted flag.',
            'objective' => 'Traverse the four-step artifact chain and recover the ROT13 encrypted flag.',
            'flag' => 'XEOO{dom_artifact_chain_solved}',
            'sort_order' => 12,
            'hints' => [
                ['title' => 'Inspect DOM Cluster Card', 'hint_text' => 'The element has class cluster-node-918. Look up .cluster-node-918 in styles.css.', 'cost' => 15],
                ['title' => 'Decode CSS Variable', 'hint_text' => 'Decode the Base64 value inside --cluster-session-auth in the Decoder Workbench.', 'cost' => 20],
                ['title' => 'Registry Lookup & ROT13', 'hint_text' => 'Use the decoded key to query clusterRegistry in security.js and decrypt the resulting value with ROT13.', 'cost' => 25],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Cascade Traversal',
                    'objective' => 'Trace cluster-node-918 to styles.css and decode --cluster-session-auth.',
                    'clue' => 'c3RhZ2UzX2tleQ== decodes to stage3_key.',
                    'observation' => 'Key stage3_key points to registry entry in security.js.',
                    'extraction_method' => 'Multi-step resolution',
                    'interpretation' => 'Registry value is ROT13 ciphertext KRBB{qbz_negvsnpg_punva_fbyirq}.',
                    'next_action' => 'Apply ROT13 decode in Cipher Workbench.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body style=\"background:#0b0f17; color:#e2e8f0; font-family:sans-serif; padding:30px;\">\n  <div class=\"cluster-card cluster-node-918\" data-cluster-state=\"isolated\">\n    <h3>SECURE ENCLAVE QUARANTINED</h3>\n  </div>\n  <script src=\"security.js\"></script>\n</body>\n</html>",
                    'metadata_json' => ['cluster' => 'node-918'],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'styles.css',
                    'name' => 'styles.css',
                    'type' => 'css',
                    'role' => 'supporting',
                    'content' => ".cluster-card {\n  background: #1e293b;\n  border-left: 4px solid #ef4444;\n  padding: 16px;\n  border-radius: 6px;\n}\n\n.cluster-node-918 {\n  --cluster-session-auth: \"c3RhZ2UzX2tleQ==\";\n  border-color: #dc2626;\n}",
                    'metadata_json' => ['rules' => 2],
                    'sort_order' => 2,
                ],
                [
                    'artifact_uid' => 'security.js',
                    'name' => 'security.js',
                    'type' => 'javascript',
                    'role' => 'supporting',
                    'content' => "// Enclave Service Registry\nconst clusterRegistry = {\n  legacy_v1: \"DISABLED\",\n  stage3_key: \"KRBB{qbz_negvsnpg_punva_fbyirq}\",\n  metrics_stream: \"STANDBY\"\n};",
                    'metadata_json' => ['entries' => 3],
                    'sort_order' => 3,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // HARD 3 (13)
        // -------------------------------------------------------------
        [
            'slug' => 'spectral-forensic-analysis',
            'title' => 'Spectral Forensic Analysis',
            'category' => 'Spectral Analysis',
            'difficulty' => 'hard',
            'points' => 500,
            'estimated_minutes' => 24,
            'case_reference' => 'CASE-XE-013',
            'scenario' => 'An altered system banner image holds spectral calibration parameters. The calibration coordinate in the metadata identifies the cipher type via pixel RGB bytes, while the preset profile provides the decryption key.',
            'objective' => 'Correlate image metadata, pixel sampling, and Vigenère decryption.',
            'flag' => 'XEOO{coordinates_and_ciphers}',
            'sort_order' => 13,
            'hints' => [
                ['title' => 'Check Calibration in Metadata', 'hint_text' => 'The metadata includes \'Calibration-Point: 42, 19\' and \'Preset-Profile: ATLAS\'.', 'cost' => 15],
                ['title' => 'Sample Pixel (42, 19)', 'hint_text' => 'Pixel (42, 19) has RGB (86, 73, 71) which spells \'VIG\' in ASCII, indicating the Vigenère cipher.', 'cost' => 20],
                ['title' => 'Decrypt in Cipher Workbench', 'hint_text' => 'Decrypt payloadRecord from vault.js using Vigenère with key ATLAS.', 'cost' => 25],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Spectral Analysis & Decryption',
                    'objective' => 'Identify calibration point (42, 19), extract ASCII cipher tag VIG, and decrypt with key ATLAS.',
                    'clue' => 'XXZO{uohcdanteek_ago_capaprk} encrypted with Vigenere.',
                    'observation' => 'Key ATLAS decrypts to XEOO{coordinates_and_ciphers}.',
                    'extraction_method' => 'Correlated pixel-cipher analysis',
                    'interpretation' => 'Flag recovered.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<body style=\"background:#090d16; color:#e2e8f0; font-family:sans-serif; padding:30px;\">\n  <h2>FORENSIC INCIDENT ARCHIVE</h2>\n  <img src=\"spectral_evidence.png\" alt=\"Evidence\" style=\"border:1px solid #333; max-width:100%;\">\n  <script src=\"vault.js\"></script>\n</body>\n</html>",
                    'metadata_json' => ['target' => 'spectral_evidence.png'],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'spectral_evidence.png',
                    'name' => 'spectral_evidence.png',
                    'type' => 'image',
                    'role' => 'supporting',
                    'content' => generateEvidenceImageBase64(320, 240, '#131b2e', 'SPECTRAL_ANALYSIS', [
                        ['x' => 42, 'y' => 19, 'r' => 86, 'g' => 73, 'b' => 71], // V, I, G
                    ]),
                    'metadata_json' => [
                        'Spectrograph-Model' => 'Thorlabs Optical Sensor V4',
                        'Calibration-Point' => '42, 19',
                        'Preset-Profile' => 'ATLAS',
                        'Bit-Resolution' => '24-bit TrueColor',
                        'Capture-Time' => '2026-10-07T08:30:00Z',
                    ],
                    'sort_order' => 2,
                ],
                [
                    'artifact_uid' => 'vault.js',
                    'name' => 'vault.js',
                    'type' => 'javascript',
                    'role' => 'supporting',
                    'content' => "// Secure Storage Manifest\nconst vaultArchive = {\n  version: \"2.8\",\n  payloadRecord: \"XXZO{uohcdanteek_ago_capaprk}\",\n  status: \"tampered\"\n};\nconsole.log(\"Vault status:\", vaultArchive.status);",
                    'metadata_json' => ['version' => '2.8'],
                    'sort_order' => 3,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // HARD 4 (14)
        // -------------------------------------------------------------
        [
            'slug' => 'tri-layer-convergence',
            'title' => 'Tri-Layer Convergence',
            'category' => 'Tri-Layer Convergence',
            'difficulty' => 'hard',
            'points' => 500,
            'estimated_minutes' => 25,
            'case_reference' => 'CASE-XE-014',
            'scenario' => 'The intruders split a 32-byte hexadecimal stream across markup telemetry attributes, stylesheet variables, and a client-side JavaScript object.',
            'objective' => 'Reconstruct three hex segments from HTML, CSS, and JS, and decode the hex string.',
            'flag' => 'XEOO{source_css_js_convergence}',
            'sort_order' => 14,
            'hints' => [
                ['title' => 'Chunk Alpha in HTML', 'hint_text' => 'Check index.html for node-sync-alpha with data-signature-alpha.', 'cost' => 15],
                ['title' => 'Chunk Beta in CSS', 'hint_text' => 'Check styles.css for .node-sync-beta with --signature-beta.', 'cost' => 20],
                ['title' => 'Chunk Gamma in JS & Hex Decode', 'hint_text' => 'Check script.js for signatureGamma in syncRegistry. Concatenate all 3 and use Hex Decode in the Decoder Workbench.', 'cost' => 25],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Hex Convergence',
                    'objective' => 'Concatenate hex chunks 58454f4f7b + 736f757263655f6373735f + 6a735f636f6e76657267656e63657d.',
                    'clue' => 'Full hex stream decodes to plaintext flag.',
                    'observation' => 'Full hex is 58454f4f7b736f757263655f6373735f6a735f636f6e76657267656e63657d.',
                    'extraction_method' => 'Hex Decode',
                    'interpretation' => 'Yields XEOO{source_css_js_convergence}.',
                    'next_action' => 'Submit recovered flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body style=\"background:#09090b; color:#fff; font-family:monospace; padding:30px;\">\n  <h2>INCIDENT PARTITION MATRIX</h2>\n  <div class=\"audit-node node-sync-alpha\" data-signature-alpha=\"58454f4f7b\">Node Alpha Sync</div>\n  <script src=\"script.js\"></script>\n</body>\n</html>",
                    'metadata_json' => ['sync_role' => 'alpha'],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'styles.css',
                    'name' => 'styles.css',
                    'type' => 'css',
                    'role' => 'supporting',
                    'content' => ".audit-node {\n  padding: 12px;\n  margin: 8px 0;\n  border: 1px solid #334155;\n}\n\n.node-sync-beta {\n  --signature-beta: \"736f757263655f6373735f\";\n  color: #38bdf8;\n}",
                    'metadata_json' => ['sync_role' => 'beta'],
                    'sort_order' => 2,
                ],
                [
                    'artifact_uid' => 'script.js',
                    'name' => 'script.js',
                    'type' => 'javascript',
                    'role' => 'supporting',
                    'content' => "// Node synchronization runtime\nconst syncRegistry = {\n  status: \"active\",\n  signatureGamma: \"6a735f636f6e76657267656e63657d\",\n  validated: false\n};\nconsole.log(\"Sync registry state:\", syncRegistry.status);",
                    'metadata_json' => ['sync_role' => 'gamma'],
                    'sort_order' => 3,
                ]
            ],
        ],

        // -------------------------------------------------------------
        // HARD 5 (15) — BOSS LEVEL
        // -------------------------------------------------------------
        [
            'slug' => 'the-breach-manifest-boss',
            'title' => 'The Breach Manifest (Boss Forensics)',
            'category' => 'Incident Boss Forensics',
            'difficulty' => 'hard',
            'points' => 600,
            'estimated_minutes' => 30,
            'case_reference' => 'CASE-XE-015',
            'scenario' => 'A high-profile defacement incident left an encrypted evidence manifest requiring visual analysis, DOM traversal, metadata inspection, pixel sampling, ASCII decoding, and Atbash cipher decryption.',
            'objective' => 'Execute the complete 11-stage forensic workflow to recover the master flag.',
            'flag' => 'XEOO{defacement_forensics_master_solved}',
            'sort_order' => 15,
            'hints' => [
                ['title' => 'Find Quarantine Container', 'hint_text' => 'Inspect the DOM for an element with class quarantine-banner and check its data-calibration-anchor.', 'cost' => 15],
                ['title' => 'Inspect Image Calibration Anchor', 'hint_text' => 'In breach_manifest.png metadata, the Calibration-Anchor points to coordinate (32, 16).', 'cost' => 20],
                ['title' => 'Sample Pixel (32, 16)', 'hint_text' => 'Pixel (32, 16) has RGB (65, 84, 66) which spells \'ATB\' (Atbash cipher). Use Atbash in Cipher Workbench on encryptedManifest in breach_forensics.js.', 'cost' => 25],
            ],
            'stages' => [
                [
                    'stage_uid' => 'stg-1',
                    'title' => 'Boss Forensic Workflow',
                    'objective' => 'Traverse DOM anchor to breach_manifest.png, sample pixel (32, 16) RGB 65, 84, 66 (ATB), and decrypt breach manifest.',
                    'clue' => 'CVLL{wvuzxvnvmg_ulivmhrxh_nzhgvi_hloevw} decrypted via Atbash cipher.',
                    'observation' => 'Atbash reflects alphabet characters (C->X, V->E, L->O).',
                    'extraction_method' => 'Atbash reflection decrypt',
                    'interpretation' => 'Master flag XEOO{defacement_forensics_master_solved} recovered.',
                    'next_action' => 'Submit master flag.',
                    'sort_order' => 1,
                ]
            ],
            'artifacts' => [
                [
                    'artifact_uid' => 'index.html',
                    'name' => 'index.html',
                    'type' => 'html',
                    'role' => 'primary',
                    'content' => "<!DOCTYPE html>\n<html>\n<head>\n  <title>CYBERSECURITY INCIDENT ADVISORY</title>\n</head>\n<body style=\"background:#030712; color:#ef4444; font-family:monospace; padding:30px;\">\n  <h1>CRITICAL BREACH STATE // CODE RED</h1>\n  <div class=\"quarantine-banner\" data-forensic-asset=\"breach_manifest.png\" data-calibration-anchor=\"32:16\">\n    <p>Forensic capture initiated by security response team.</p>\n  </div>\n  <script src=\"breach_forensics.js\"></script>\n</body>\n</html>",
                    'metadata_json' => ['level' => 'boss'],
                    'sort_order' => 1,
                ],
                [
                    'artifact_uid' => 'breach_manifest.png',
                    'name' => 'breach_manifest.png',
                    'type' => 'image',
                    'role' => 'supporting',
                    'content' => generateEvidenceImageBase64(320, 240, '#0f172a', 'BREACH_MANIFEST_MASTER', [
                        ['x' => 32, 'y' => 16, 'r' => 65, 'g' => 84, 'b' => 66], // A, T, B
                    ]),
                    'metadata_json' => [
                        'Document-Type' => 'CERT Emergency Capture',
                        'Calibration-Anchor' => '32, 16',
                        'Case-File' => 'CASE-992-ALPHA-CLASSIFIED',
                        'Target-Asset' => 'breach_forensics.js',
                    ],
                    'sort_order' => 2,
                ],
                [
                    'artifact_uid' => 'breach_forensics.js',
                    'name' => 'breach_forensics.js',
                    'type' => 'javascript',
                    'role' => 'supporting',
                    'content' => "// Incident Command Center - Master Lock\nconst quarantineManifest = {\n  caseId: \"CASE-992\",\n  encryptedManifest: \"CVLL{wvuzxvnvmg_ulivmhrxh_nzhgvi_hloevw}\",\n  lockStatus: \"sealed\"\n};\nconsole.log(\"Quarantine case:\", quarantineManifest.caseId);",
                    'metadata_json' => ['caseId' => 'CASE-992'],
                    'sort_order' => 3,
                ]
            ],
        ],
    ];

    $stmtChallenge = $pdo->prepare("
        INSERT INTO ctf_challenges (
            ctf_id, slug, title, category, difficulty, points, estimated_minutes,
            case_reference, scenario, objective, flag_hash, flag_format, status, sort_order
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, 'XEOO{...}', 'published', ?
        ) ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            category = VALUES(category),
            difficulty = VALUES(difficulty),
            points = VALUES(points),
            estimated_minutes = VALUES(estimated_minutes),
            scenario = VALUES(scenario),
            objective = VALUES(objective),
            flag_hash = VALUES(flag_hash),
            sort_order = VALUES(sort_order),
            status = 'published'
    ");

    $stmtArtifact = $pdo->prepare("
        INSERT INTO ctf_artifacts (
            challenge_id, artifact_uid, name, type, role, content, metadata_json, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmtStage = $pdo->prepare("
        INSERT INTO ctf_stages (
            challenge_id, stage_uid, title, objective, clue, observation,
            extraction_method, interpretation, next_action, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmtHint = $pdo->prepare("
        INSERT INTO ctf_hints (
            challenge_id, title, hint_text, cost, sort_order
        ) VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($challenges as $c) {
        $flagHash = password_hash($c['flag'], PASSWORD_BCRYPT, ['cost' => 10]);

        $stmtChallenge->execute([
            $ctfId,
            $c['slug'],
            $c['title'],
            $c['category'],
            $c['difficulty'],
            $c['points'],
            $c['estimated_minutes'],
            $c['case_reference'],
            $c['scenario'],
            $c['objective'],
            $flagHash,
            $c['sort_order'],
        ]);

        // Get challenge ID
        $chId = (int)$pdo->query("SELECT id FROM ctf_challenges WHERE slug = " . $pdo->quote($c['slug']))->fetchColumn();

        // Clear existing artifacts/stages/hints for clean seed
        $pdo->exec("DELETE FROM ctf_artifacts WHERE challenge_id = {$chId}");
        $pdo->exec("DELETE FROM ctf_stages WHERE challenge_id = {$chId}");
        $pdo->exec("DELETE FROM ctf_hints WHERE challenge_id = {$chId}");

        // Insert artifacts
        foreach ($c['artifacts'] as $art) {
            $metaJson = isset($art['metadata_json']) ? json_encode($art['metadata_json']) : null;
            $stmtArtifact->execute([
                $chId,
                $art['artifact_uid'],
                $art['name'],
                $art['type'],
                $art['role'],
                $art['content'],
                $metaJson,
                $art['sort_order']
            ]);
        }

        // Insert stages
        foreach ($c['stages'] as $stg) {
            $stmtStage->execute([
                $chId,
                $stg['stage_uid'],
                $stg['title'],
                $stg['objective'],
                $stg['clue'] ?? null,
                $stg['observation'] ?? null,
                $stg['extraction_method'] ?? null,
                $stg['interpretation'] ?? null,
                $stg['next_action'] ?? null,
                $stg['sort_order']
            ]);
        }

        // Insert hints
        $hSort = 1;
        foreach ($c['hints'] as $h) {
            $stmtHint->execute([
                $chId,
                $h['title'],
                $h['hint_text'],
                $h['cost'],
                $hSort++
            ]);
        }
    }

    echo "SUCCESS: 15 Challenges seeded successfully into database.\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

