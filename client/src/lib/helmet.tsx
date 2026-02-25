import * as helmetAsync from "react-helmet-async";
import type React from "react";

const raw = helmetAsync as unknown as {
  Helmet?: React.ComponentType<any>;
  HelmetProvider?: React.ComponentType<any>;
  default?: {
    Helmet: React.ComponentType<any>;
    HelmetProvider: React.ComponentType<any>;
  };
  "module.exports"?: {
    Helmet: React.ComponentType<any>;
    HelmetProvider: React.ComponentType<any>;
  };
};

const resolved = (raw.HelmetProvider && raw.Helmet
  ? raw
  : raw.default ?? raw["module.exports"]) as {
  Helmet: React.ComponentType<any>;
  HelmetProvider: React.ComponentType<any>;
};

export const Helmet = resolved.Helmet;
export const HelmetProvider = resolved.HelmetProvider;
