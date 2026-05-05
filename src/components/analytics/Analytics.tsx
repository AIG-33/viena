/**
 * Loads third-party analytics (Yandex Metrika, Google Tag Manager, Google
 * Analytics 4 via gtag.js) only when the corresponding environment variables
 * are set, so dev / preview builds stay clean.
 *
 * - `NEXT_PUBLIC_YM_ID` — Yandex Metrika counter ID, e.g. `99999999`.
 * - `NEXT_PUBLIC_GTM_ID` — Google Tag Manager container ID, e.g. `GTM-XXXXXX`.
 * - `NEXT_PUBLIC_GA_ID`  — GA4 measurement ID, e.g. `G-XXXXXXXXXX`. Use this
 *   only if GA4 isn't already wired via the GTM container, otherwise hits
 *   will be double-counted.
 *
 * All scripts are loaded with `strategy="afterInteractive"` to keep them
 * out of the LCP critical path. GTM noscript fallback is rendered only
 * when GTM is enabled.
 */
import Script from "next/script";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  return (
    <>
      {YM_ID ? (
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}", "ym");

              ym(${YM_ID}, "init", {
                ssr:true,
                webvisor:true,
                clickmap:true,
                ecommerce:"dataLayer",
                referrer: document.referrer,
                url: location.href,
                accurateTrackBounce:true,
                trackLinks:true
              });
            `,
          }}
        />
      ) : null}

      {GTM_ID ? (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      ) : null}

      {GA_ID ? (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `,
            }}
          />
        </>
      ) : null}
    </>
  );
}

export function AnalyticsNoScript() {
  if (!GTM_ID && !YM_ID) return null;
  return (
    <>
      {GTM_ID ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      ) : null}
      {YM_ID ? (
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: "absolute", left: -9999 }}
              alt=""
            />
          </div>
        </noscript>
      ) : null}
    </>
  );
}
