import { useEffect, useRef, useState, type CSSProperties } from "react";
import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

interface TypeFormEmbedProps {
  formId: string;
  className?: string;
  style?: CSSProperties;
}

const TYPEFORM_SCRIPT_SRC = "https://embed.typeform.com/next/embed.js";
const TYPEFORM_SCRIPT_ID = "typeform-embed-script";

declare global {
  interface Window {
    __typeformScriptPromise?: Promise<void>;
  }
}

const hasTypeformGlobal = (): boolean => typeof (window as any).tf !== "undefined";

const loadTypeformScript = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (hasTypeformGlobal()) {
    return Promise.resolve();
  }

  if (window.__typeformScriptPromise) {
    return window.__typeformScriptPromise;
  }

  window.__typeformScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TYPEFORM_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    if (existing) {
      if (hasTypeformGlobal()) {
        resolve();
        return;
      }

      const onLoad = () => resolve();
      const onError = () =>
        reject(new Error("Unable to load Typeform embed script"));

      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = TYPEFORM_SCRIPT_ID;
    script.src = TYPEFORM_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Typeform embed script"));
    document.body.appendChild(script);
  });

  return window.__typeformScriptPromise;
};

const TypeFormEmbed = ({ formId, className, style }: TypeFormEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadTypeformScript()
      .then(() => {
        if (mounted) {
          setScriptReady(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setScriptError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (scriptError) {
    return (
      <div
        className={cn(
          "rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700",
          className,
        )}
        style={style}
      >
        <p>Secure scheduling is temporarily unavailable.</p>
        <a
          href={`tel:${officeInfo.phoneE164}`}
          className="mt-2 inline-flex font-semibold text-primary hover:underline"
        >
          Call {officeInfo.phone} to schedule directly
        </a>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        data-tf-live={formId}
        data-testid="typeform-embed"
        className={className}
        style={style}
        aria-busy={!scriptReady}
        aria-live="polite"
      />
      {!scriptReady ? (
        <p className="mt-3 text-center text-xs text-slate-500">
          Loading secure form…
        </p>
      ) : null}
      <noscript>
        Secure scheduling requires JavaScript. Call {officeInfo.phone} to book
        your appointment.
      </noscript>
    </>
  );
};

export default TypeFormEmbed;
