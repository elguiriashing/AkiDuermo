import assert from "node:assert/strict";
import test from "node:test";
import { isCanonicalCrawlHost, isCrawlerMetadata, isPublicCrawlPage } from "../src/lib/public-crawl.ts";

test("canonical host only, never previews or deceptive suffixes", () => {
  assert.equal(isCanonicalCrawlHost("akiduermo.com"), true);
  assert.equal(isCanonicalCrawlHost("AKIDUERMO.COM"), true);
  for (const host of ["localhost:3103", "preview.workers.dev", "akiduermo.com.evil.example", "evil-akiduermo.com", "www.akiduermo.com"])
    assert.equal(isCanonicalCrawlHost(host), false, host);
});

test("only crawler metadata may bypass session refresh", () => {
  for (const path of ["/robots.txt", "/sitemap.xml"])
    assert.equal(isCrawlerMetadata(path), true);
  for (const path of ["/api/health", "/api/bookings", "/account", "/en/auth/callback", "/sitemap.xml/private", "/robots.txt/../account"])
    assert.equal(isCrawlerMetadata(path), false, path);
});

test("public marketing pages are discoverable", () => {
  for (const path of ["/", "/membership"])
    assert.equal(isPublicCrawlPage(path), true, path);
});

test("private and unknown routes remain noindex", () => {
  for (const path of ["/account", "/settings", "/bookings", "/saved", "/en/auth", "/es/auth/callback", "/en/terms/accept", "/api/car-rentals", "/api/stays", "/unknown", "/offline.html"])
    assert.equal(isPublicCrawlPage(path), false, path);
});

test("published accommodation routes and public legal documents are allowed", () => {
  for (const path of ["/stays/published-hotel", "/stays/published-hotel/", "/en/privacy", "/es/terms"])
    assert.equal(isPublicCrawlPage(path), true, path);
  for (const path of ["/stays/", "/stays/hotel/private", "/map"])
    assert.equal(isPublicCrawlPage(path), false, path);
});
