"use client";

import Script from "next/script";
import { useCookieConsent } from "@/context/CookieConsentContext";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Third-party analytics tags — loaded only after explicit consent to
 * non-essential cookies / analytics (see cookie banner).
 */
export function ConsentAwareAnalytics() {
  const { ready, analyticsAllowed } = useCookieConsent();

  if (!ready || !analyticsAllowed) {
    return null;
  }

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

export function ConsentAwareAnalyticsNoScript() {
  const { ready, analyticsAllowed } = useCookieConsent();

  if (!ready || !analyticsAllowed) {
    return null;
  }

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
