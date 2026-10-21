import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Preserve existing hydration behavior while React Compiler remains disabled.
  // Exact deferred diagnostics are recorded in docs/NEXT16_SUPPORTED_RUNTIME.md.
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "**/.wrangler/**",
    ".wrangler-config/**",
    "automation/worker-configuration.d.ts",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
