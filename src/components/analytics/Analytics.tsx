/**
 * Loads third-party analytics (Yandex Metrika and Google Tag Manager) only
 * when the corresponding environment variables are set, so dev / preview
 * builds stay clean.
 *
 * - `NEXT_PUBLIC_YM_ID` — Yandex Metrika counter ID, e.g. `99999999`.
 * - `NEXT_PUBLIC_GTM_ID` — Google Tag Manager container ID, e.g. `GTM-XXXXXX`.
 *
 * Both scripts are loaded with `strategy="afterInteractive"` to keep them
 * out of the LCP critical path. GTM noscript fallback is rendered only
 * when GTM is enabled.
 */
import Script from "next/script";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

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
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${YM_ID}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true,
                ecommerce:"dataLayer"
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
