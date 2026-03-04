"use client";

import { useEffect } from "react";

const DASH_REGEX = /[-—–‑]/g;
const COLLAPSE_SPACES_REGEX = / {2,}/g;
const SKIP_PARENT_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "CODE",
  "PRE",
  "KBD",
  "SAMP",
]);

function sanitizeDashCopy(value: string): string {
  if (!DASH_REGEX.test(value)) {
    return value;
  }

  DASH_REGEX.lastIndex = 0;
  return value.replace(DASH_REGEX, " ").replace(COLLAPSE_SPACES_REGEX, " ");
}

function shouldSkipNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) {
    return true;
  }

  return SKIP_PARENT_TAGS.has(parent.tagName);
}

function normalizeTextNode(node: Text): void {
  if (shouldSkipNode(node)) {
    return;
  }

  const value = node.nodeValue;
  if (!value) {
    return;
  }

  const normalized = sanitizeDashCopy(value);
  if (normalized !== value) {
    node.nodeValue = normalized;
  }
}

function normalizeTree(root: ParentNode): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    normalizeTextNode(current as Text);
    current = walker.nextNode();
  }
}

export default function CopyDashSanitizer(): null {
  useEffect(() => {
    normalizeTree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            normalizeTextNode(node as Text);
            continue;
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            normalizeTree(node as Element);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
