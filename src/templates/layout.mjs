import { site, links, nav } from '../../site.config.mjs';

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const abs = p => (p.startsWith('http') ? p : site.url + p);

const subscribe = (label, cls = 'btn btn-primary') =>
  `<a href="${links.substack}subscribe" data-subscribe class="${cls}">${label}</a>`;
export { subscribe };

export const shock = ({
  text = 'Motivation, insights, and actionable exercises that will help you hit your final form.',
  second = `<a href="/blog" class="btn btn-outline">Start Reading</a>`,
} = {}) => `
<div class="shock">
  <div class="wrap">
    <h2>We're Here To Shock Your System.</h2>
    <p>${text}</p>
    <div class="shock-actions">
      ${subscribe('Join Our Free Weekly Newsletter')}
      ${second}
    </div>
  </div>
</div>`;

// Same GA4 + Clarity properties as the Webflow site. Only fires on the production domain so preview deploys don't pollute the data.
const analytics = `<script>
if (/(^|\\.)joinkaminari\\.com$/.test(location.hostname)) {
  var s = document.createElement('script'); s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}'; document.head.appendChild(s);
  window.dataLayer = window.dataLayer || []; window.gtag = function(){dataLayer.push(arguments);};
  gtag('js', new Date()); gtag('config', '${site.ga4Id}');
  (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','${site.clarityId}');
}
</script>`;

const logo = `<img src="/assets/kaminari-mark.svg" alt="" width="35" height="28">Kaminari`;

// head: extra tags for one page. tracking: false leaves GA4 + Clarity off that page.
export function layout({ title, description = site.description, path, image = site.ogImage, type = 'website', jsonLd, body, head = '', tracking = true }) {
  const canonical = site.url + (path === '/' ? '' : path);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${abs(image)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${site.name}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(image)}">
<meta name="google-site-verification" content="${site.googleSiteVerification}">
<link rel="icon" href="/favicon.jpg" type="image/jpeg">
<link rel="apple-touch-icon" href="/apple-touch-icon.jpg">
<link rel="alternate" type="application/rss+xml" title="Kaminari Blog" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
${head}
${tracking ? analytics : ''}
</head>
<body>

<nav class="site-nav">
  <div class="wrap">
    <a href="/" class="brand" aria-label="Kaminari home">${logo}</a>
    <div class="nav-links" id="nav-links">
      ${nav.map(n => `<a href="${n.href}"${n.href === path || (n.href === '/blog' && path.startsWith('/blog')) ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n      ')}
    </div>
    <div class="nav-cta">
      ${subscribe('Join Our Free Weekly Newsletter', 'btn btn-primary btn-sm')}
      <button class="mobile-toggle" aria-label="Menu" aria-controls="nav-links" aria-expanded="false">☰</button>
    </div>
  </div>
</nav>

<main>
${body}
</main>

<footer id="newsletter">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/" class="brand" aria-label="Kaminari home">${logo}</a>
        <p>Your weekly dose of anime insights, recs, and deep dives. Trusted by thousands of readers worldwide.</p>
        ${subscribe('Subscribe', 'btn btn-primary btn-sm')}
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/newsletter">Newsletter</a></li>
          <li><a href="/anime-mindset">Anime Mindset</a></li>
          <li><a href="${links.discord}" target="_blank" rel="noopener">Discord</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>More</h4>
        <ul>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="mailto:${site.advertiseEmail}">Advertise</a></li>
          <li><a href="/rss.xml">RSS</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
        </ul>
        <div class="socials">
          <a href="${links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
          <a href="${links.substack}" target="_blank" rel="noopener">Substack</a>
          <a href="${links.discord}" target="_blank" rel="noopener">Discord</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} Kaminari. All rights reserved.</p>
    </div>
  </div>
</footer>

<dialog class="subscribe" aria-labelledby="subscribe-title">
  <button class="close" aria-label="Close">×</button>
  <h2 id="subscribe-title">Kaminari Newsletter</h2>
  <p>Every week we turn anime moments into fuel for your real life.</p>
  <iframe data-src="${links.substackEmbed}" title="Subscribe to the Kaminari newsletter" scrolling="no"></iframe>
  <p class="alt-link">Form not loading? <a href="${links.substack}subscribe" target="_blank" rel="noopener">Subscribe on Substack →</a></p>
</dialog>

<script src="/main.js" defer></script>
</body>
</html>
`;
}
