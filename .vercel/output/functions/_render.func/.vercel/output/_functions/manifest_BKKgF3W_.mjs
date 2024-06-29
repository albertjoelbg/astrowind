import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import './chunks/astro_BxxFoj1M.mjs';
import 'clsx';
import 'html-escaper';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    const path = toPath(sanitizedParams);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/contacto","isIndex":false,"type":"page","pattern":"^\\/contacto$","segments":[[{"content":"contacto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contacto.astro","pathname":"/contacto","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/homes/mobile-app","isIndex":false,"type":"page","pattern":"^\\/homes\\/mobile-app$","segments":[[{"content":"homes","dynamic":false,"spread":false}],[{"content":"mobile-app","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/homes/mobile-app.astro","pathname":"/homes/mobile-app","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/homes/personal","isIndex":false,"type":"page","pattern":"^\\/homes\\/personal$","segments":[[{"content":"homes","dynamic":false,"spread":false}],[{"content":"personal","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/homes/personal.astro","pathname":"/homes/personal","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/homes/saas","isIndex":false,"type":"page","pattern":"^\\/homes\\/saas$","segments":[[{"content":"homes","dynamic":false,"spread":false}],[{"content":"saas","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/homes/saas.astro","pathname":"/homes/saas","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.MOOZJWR0.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"},{"type":"inline","content":".twitter-tweet:not(.twitter-tweet-rendered){padding:var(--tc-padding, 1em);border:1px solid var(--tc-border-color, #cfd9de)}.twitter-tweet:not(.twitter-tweet-rendered)>:first-child{margin-top:0}.twitter-tweet:not(.twitter-tweet-rendered)>:last-child{margin-bottom:0}\nlite-youtube{background-color:#000;position:relative;display:block;contain:content;background-position:center center;background-size:cover;cursor:pointer;max-width:720px}lite-youtube:before{content:attr(data-title);display:block;position:absolute;top:0;background-image:linear-gradient(180deg,#000000ab,#0000008a 14%,#00000026 54%,#0000000d 72%,#0000 94%);height:99px;width:100%;font-family:YouTube Noto,Roboto,Arial,Helvetica,sans-serif;color:#eee;text-shadow:0 0 2px rgba(0,0,0,.5);font-size:18px;padding:25px 20px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box}lite-youtube:hover:before{color:#fff}lite-youtube:after{content:\"\";display:block;padding-bottom:56.25%}lite-youtube>iframe{width:100%;height:100%;position:absolute;top:0;left:0;border:0}lite-youtube>.lty-playbtn{display:block;width:100%;height:100%;background:no-repeat center/68px 48px;background-image:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 68 48\"><path d=\"M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z\" fill=\"red\"/><path d=\"M45 24 27 14v20\" fill=\"white\"/></svg>');position:absolute;cursor:pointer;z-index:1;filter:grayscale(100%);transition:filter .1s cubic-bezier(0,0,.2,1);border:0}lite-youtube:hover>.lty-playbtn,lite-youtube .lty-playbtn:focus{filter:none}lite-youtube.lyt-activated{cursor:unset}lite-youtube.lyt-activated:before,lite-youtube.lyt-activated>.lty-playbtn{opacity:0;pointer-events:none}.lyt-visually-hidden{clip:rect(0 0 0 0);-webkit-clip-path:inset(50%);clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}\nlite-youtube>iframe{all:unset!important;width:100%!important;height:100%!important;position:absolute!important;inset:0!important;border:0!important}\nlite-vimeo{font-size:10px;background-color:#000;position:relative;display:block;contain:content;background-position:center center;background-size:cover}lite-vimeo:after{content:\"\";display:block;padding-bottom:56.25%}lite-vimeo>iframe{all:unset!important;width:100%!important;height:100%!important;position:absolute!important;inset:0!important;border:0!important}lite-vimeo>.ltv-playbtn{content:\"\";position:absolute;inset:0;width:100%;background:transparent;outline:0;border:0;cursor:pointer}lite-vimeo>.ltv-playbtn:before{width:6.5em;height:4em;background:#172322bf;opacity:.8;border-radius:.25rem;transition:all .2s cubic-bezier(0,0,.2,1)}lite-vimeo>.ltv-playbtn:focus:before{outline:auto}lite-vimeo:hover>.ltv-playbtn:before{background-color:#00adef;background-color:var(--ltv-color, #00adef);opacity:1}lite-vimeo>.ltv-playbtn:after{border-style:solid;border-width:1em 0 1em 1.7em;border-color:transparent transparent transparent #fff}lite-vimeo>.ltv-playbtn:before,lite-vimeo>.ltv-playbtn:after{content:\"\";position:absolute;top:50%;left:50%;transform:translate3d(-50%,-50%,0)}lite-vimeo.ltv-activated:before,lite-vimeo.ltv-activated>.ltv-playbtn{cursor:unset;opacity:0;pointer-events:none}\n"}],"routeData":{"route":"/homes/startup","isIndex":false,"type":"page","pattern":"^\\/homes\\/startup$","segments":[[{"content":"homes","dynamic":false,"spread":false}],[{"content":"startup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/homes/startup.astro","pathname":"/homes/startup","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/landing/click-through","isIndex":false,"type":"page","pattern":"^\\/landing\\/click-through$","segments":[[{"content":"landing","dynamic":false,"spread":false}],[{"content":"click-through","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/landing/click-through.astro","pathname":"/landing/click-through","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/landing/lead-generation","isIndex":false,"type":"page","pattern":"^\\/landing\\/lead-generation$","segments":[[{"content":"landing","dynamic":false,"spread":false}],[{"content":"lead-generation","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/landing/lead-generation.astro","pathname":"/landing/lead-generation","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/landing/pre-launch","isIndex":false,"type":"page","pattern":"^\\/landing\\/pre-launch$","segments":[[{"content":"landing","dynamic":false,"spread":false}],[{"content":"pre-launch","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/landing/pre-launch.astro","pathname":"/landing/pre-launch","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/landing/product","isIndex":false,"type":"page","pattern":"^\\/landing\\/product$","segments":[[{"content":"landing","dynamic":false,"spread":false}],[{"content":"product","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/landing/product.astro","pathname":"/landing/product","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/landing/sales","isIndex":false,"type":"page","pattern":"^\\/landing\\/sales$","segments":[[{"content":"landing","dynamic":false,"spread":false}],[{"content":"sales","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/landing/sales.astro","pathname":"/landing/sales","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/landing/subscription","isIndex":false,"type":"page","pattern":"^\\/landing\\/subscription$","segments":[[{"content":"landing","dynamic":false,"spread":false}],[{"content":"subscription","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/landing/subscription.astro","pathname":"/landing/subscription","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/pricing","isIndex":false,"type":"page","pattern":"^\\/pricing$","segments":[[{"content":"pricing","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/pricing.astro","pathname":"/pricing","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/privacy","isIndex":false,"type":"page","pattern":"^\\/privacy$","segments":[[{"content":"privacy","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/privacy.md","pathname":"/privacy","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.ts","pathname":"/rss.xml","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/services","isIndex":false,"type":"page","pattern":"^\\/services$","segments":[[{"content":"services","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/services.astro","pathname":"/services","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/terms","isIndex":false,"type":"page","pattern":"^\\/terms$","segments":[[{"content":"terms","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/terms.md","pathname":"/terms","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.DZL4CV8D.js"}],"styles":[{"type":"external","src":"/_astro/click-through.DPp2nEki.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"never"}}}],"site":"https://astrowind.vercel.app","base":"/","trailingSlash":"never","compressHTML":true,"componentMetadata":[["C:/Users/alber/WebstormProjects/astrowind/src/pages/landing/click-through.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/landing/lead-generation.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/landing/pre-launch.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/landing/product.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/landing/sales.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/landing/subscription.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/privacy.md",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/terms.md",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/[...blog]/[...page].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/[...blog]/[category]/[...page].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/[...blog]/[tag]/[...page].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/[...blog]/index.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/about.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/contacto.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/homes/mobile-app.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/homes/personal.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/homes/saas.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/homes/startup.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/pricing.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/services.astro",{"propagation":"none","containsHead":true}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/404.astro",{"propagation":"none","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["C:/Users/alber/WebstormProjects/astrowind/src/utils/blog.ts",{"propagation":"in-tree","containsHead":false}],["C:/Users/alber/WebstormProjects/astrowind/src/components/blog/RelatedPosts.astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[...blog]/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["C:/Users/alber/WebstormProjects/astrowind/src/components/widgets/BlogHighlightedPosts.astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/alber/WebstormProjects/astrowind/src/components/widgets/BlogLatestPosts.astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/homes/personal@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/homes/saas@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[...blog]/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[...blog]/[category]/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[...blog]/[tag]/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Users/alber/WebstormProjects/astrowind/src/pages/rss.xml.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@ts",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_BBCaxjAQ.mjs","/src/pages/landing/lead-generation.astro":"chunks/pages/lead-generation_DLFaUNjJ.mjs","/src/pages/homes/personal.astro":"chunks/pages/personal_D7huvVJA.mjs","/src/pages/landing/pre-launch.astro":"chunks/pages/pre-launch_6cCMPz3l.mjs","/src/pages/landing/product.astro":"chunks/pages/product_BfHg1PJ7.mjs","/src/pages/rss.xml.ts":"chunks/pages/rss_DogzZLwQ.mjs","/src/pages/homes/saas.astro":"chunks/pages/saas_DPp_YHqN.mjs","/src/pages/landing/sales.astro":"chunks/pages/sales_hyWLarQu.mjs","/src/pages/services.astro":"chunks/pages/services_BZIYoyPu.mjs","/src/pages/landing/subscription.astro":"chunks/pages/subscription_CZUKxxe-.mjs","/src/pages/terms.md":"chunks/pages/terms_BsFXf-Er.mjs","\u0000@astrojs-manifest":"manifest_BKKgF3W_.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_k9NHowl_.mjs","\u0000@astro-page:src/pages/404@_@astro":"chunks/404_CAUTzeh5.mjs","\u0000@astro-page:src/pages/about@_@astro":"chunks/about_BvTek6nj.mjs","\u0000@astro-page:src/pages/contacto@_@astro":"chunks/contacto_kYDBSc7J.mjs","\u0000@astro-page:src/pages/homes/mobile-app@_@astro":"chunks/mobile-app_D-3M2l92.mjs","\u0000@astro-page:src/pages/homes/personal@_@astro":"chunks/personal_CBylwCqv.mjs","\u0000@astro-page:src/pages/homes/saas@_@astro":"chunks/saas_CrnW_Fwa.mjs","\u0000@astro-page:src/pages/homes/startup@_@astro":"chunks/startup_BqN3cgYC.mjs","\u0000@astro-page:src/pages/landing/click-through@_@astro":"chunks/click-through_BSdfAF4s.mjs","\u0000@astro-page:src/pages/landing/lead-generation@_@astro":"chunks/lead-generation_DtkGNKjE.mjs","\u0000@astro-page:src/pages/landing/pre-launch@_@astro":"chunks/pre-launch_Dd71tS5J.mjs","\u0000@astro-page:src/pages/landing/product@_@astro":"chunks/product_DCW82B5_.mjs","\u0000@astro-page:src/pages/landing/sales@_@astro":"chunks/sales_Cde5v9IW.mjs","\u0000@astro-page:src/pages/landing/subscription@_@astro":"chunks/subscription_fv0JqVVW.mjs","\u0000@astro-page:src/pages/pricing@_@astro":"chunks/pricing_Bu4bBAZZ.mjs","\u0000@astro-page:src/pages/privacy@_@md":"chunks/privacy_BawD75h-.mjs","\u0000@astro-page:src/pages/rss.xml@_@ts":"chunks/rss_CUxfF51O.mjs","\u0000@astro-page:src/pages/services@_@astro":"chunks/services_CwEjdiv_.mjs","\u0000@astro-page:src/pages/terms@_@md":"chunks/terms_BB18pTgt.mjs","\u0000@astro-page:src/pages/[...blog]/[category]/[...page]@_@astro":"chunks/_.._C3p-d7x_.mjs","\u0000@astro-page:src/pages/[...blog]/[tag]/[...page]@_@astro":"chunks/_.._C1x1JYDK.mjs","\u0000@astro-page:src/pages/[...blog]/[...page]@_@astro":"chunks/_.._DT9r3VuP.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_D2bWcjzo.mjs","\u0000@astro-page:src/pages/[...blog]/index@_@astro":"chunks/index_mww8Rvux.mjs","C:/Users/alber/WebstormProjects/astrowind/node_modules/astro/dist/env/setup.js":"chunks/setup_pmSpHZTB.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/adquisicion.jpg":"chunks/adquisicion_B0pkJI5G.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/app-store.png":"chunks/app-store_Bg_gmraD.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/contratos.webp":"chunks/contratos_DoobwAx-.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/default.png":"chunks/default_NCdmrxWN.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/evaluaciones.webp":"chunks/evaluaciones_DzdFVRcN.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/google-play.png":"chunks/google-play_CIqZ71o2.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/hero-image.png":"chunks/hero-image_Bc07G5KD.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/inversiones.jpg":"chunks/inversiones_BWx2UiY1.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/logo-bienes-raices.png":"chunks/logo-bienes-raices_C8e4JnIw.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property1.jpg":"chunks/property1_D3Mfrr-3.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property2.jpg":"chunks/property2_DgHkMZL7.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property3.jpg":"chunks/property3_NbOMZuDy.mjs","C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property4.jpg":"chunks/property4_me2CCqKL.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/astrowind-template-in-depth.mdx?astroContentCollectionEntry=true":"chunks/astrowind-template-in-depth_D7y5i9sZ.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/get-started-website-with-astro-tailwind-css.md?astroContentCollectionEntry=true":"chunks/get-started-website-with-astro-tailwind-css_DUdmgbpm.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/how-to-customize-astrowind-to-your-brand.md?astroContentCollectionEntry=true":"chunks/how-to-customize-astrowind-to-your-brand_mi5PNxbI.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/landing.md?astroContentCollectionEntry=true":"chunks/landing_BHVA0-wx.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/markdown-elements-demo-post.mdx?astroContentCollectionEntry=true":"chunks/markdown-elements-demo-post_CqwoEDVB.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/useful-resources-to-create-websites.md?astroContentCollectionEntry=true":"chunks/useful-resources-to-create-websites_DH0j3_5D.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/astrowind-template-in-depth.mdx?astroPropagatedAssets":"chunks/astrowind-template-in-depth_rMPdGrRM.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/get-started-website-with-astro-tailwind-css.md?astroPropagatedAssets":"chunks/get-started-website-with-astro-tailwind-css_06tmScPS.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/how-to-customize-astrowind-to-your-brand.md?astroPropagatedAssets":"chunks/how-to-customize-astrowind-to-your-brand_DUw8vr3j.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/landing.md?astroPropagatedAssets":"chunks/landing_B6ViSQ9d.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/markdown-elements-demo-post.mdx?astroPropagatedAssets":"chunks/markdown-elements-demo-post_DVsdBye_.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/useful-resources-to-create-websites.md?astroPropagatedAssets":"chunks/useful-resources-to-create-websites_BkvTAS4G.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/astrowind-template-in-depth.mdx":"chunks/astrowind-template-in-depth_iobnCA-S.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/get-started-website-with-astro-tailwind-css.md":"chunks/get-started-website-with-astro-tailwind-css_zeCJNkWl.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/how-to-customize-astrowind-to-your-brand.md":"chunks/how-to-customize-astrowind-to-your-brand_CVUeISis.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/landing.md":"chunks/landing_D2kPjNyR.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/markdown-elements-demo-post.mdx":"chunks/markdown-elements-demo-post_DptK2Id_.mjs","C:/Users/alber/WebstormProjects/astrowind/src/content/post/useful-resources-to-create-websites.md":"chunks/useful-resources-to-create-websites_DnNZ519i.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.MOOZJWR0.js","C:/Users/alber/WebstormProjects/astrowind/node_modules/@astro-community/astro-embed-vimeo/Vimeo.astro?astro&type=script&index=0&lang.ts":"_astro/Vimeo.astro_astro_type_script_index_0_lang.CgRsrQuG.js","C:/Users/alber/WebstormProjects/astrowind/node_modules/@astro-community/astro-embed-youtube/YouTube.astro?astro&type=script&index=0&lang.ts":"_astro/YouTube.astro_astro_type_script_index_0_lang.DkY74W4p.js","/astro/hoisted.js?q=1":"_astro/hoisted.DZL4CV8D.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/hero.DS4leGSY.mp4","/_astro/logo-bienes-raices._hsrswLL.svg","/_astro/adquisicion.Cin75cd6.jpg","/_astro/contratos.51nYrPFP.webp","/_astro/app-store.t3tG4Jz3.png","/_astro/evaluaciones.DMnDOiOm.webp","/_astro/google-play.ISTMcpLO.png","/_astro/inversiones.KHytCr6J.jpg","/_astro/logo-bienes-raices.CtgdMZuF.png","/_astro/property1.BWKPBOrL.jpg","/_astro/property2.C3vq_tH_.jpg","/_astro/default.CczmzLWf.png","/_astro/property3.33aVJl8w.jpg","/_astro/hero-image.DwIC_L_T.png","/_astro/favicon.1CMN-Vot.ico","/_astro/inter-cyrillic-ext-wght-normal.DIEz8p5i.woff2","/_astro/inter-greek-wght-normal.DyIDNIyN.woff2","/_astro/inter-cyrillic-wght-normal.BmJJXa8e.woff2","/_astro/inter-latin-wght-normal.BgVq2Tq4.woff2","/_astro/inter-latin-ext-wght-normal.CN1pIXkb.woff2","/_astro/inter-vietnamese-wght-normal._GQuwPVU.woff2","/_astro/inter-greek-ext-wght-normal.D5AYLNiq.woff2","/_astro/property4.C8yCp1Vx.jpg","/_astro/click-through.DPp2nEki.css","/robots.txt","/_headers","/decapcms/config.yml","/decapcms/index.html","/_astro/hoisted.DZL4CV8D.js","/_astro/hoisted.MOOZJWR0.js","/_astro/Vimeo.astro_astro_type_script_index_0_lang.CgRsrQuG.js","/_astro/YouTube.astro_astro_type_script_index_0_lang.DkY74W4p.js"],"buildFormat":"directory","checkOrigin":false,"rewritingEnabled":false,"experimentalEnvGetSecretEnabled":false});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };
