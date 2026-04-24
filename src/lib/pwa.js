// pwa.js — Dynamic PWA Generator
export const setupPWA = (portalName, slug) => {
  if (!portalName || !slug) return;

  // 1. Browser ka title badlo
  document.title = portalName;

  // 2. Dynamic Manifest Object banao
  const myDynamicManifest = {
    short_name: portalName,
    name: portalName,
    description: `Welcome to ${portalName} - Powered by Meri Kamai`,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    start_url: `/${slug}`,
    display: "standalone",
    theme_color: "#0a0a0a",
    background_color: "#0a0a0a"
  };

  // 3. Manifest ko 'Blob' (Dynamic URL) me badlo
  const stringManifest = JSON.stringify(myDynamicManifest);
  const blob = new Blob([stringManifest], { type: 'application/json' });
  const manifestURL = URL.createObjectURL(blob);

  // 4. Purane manifest link ko hatao aur naya lagao
  const oldManifest = document.querySelector('link[rel="manifest"]');
  if (oldManifest) oldManifest.remove();

  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = manifestURL;
  document.head.appendChild(link);

  console.log(`✅ PWA Manifest Updated for: ${portalName}`);
};