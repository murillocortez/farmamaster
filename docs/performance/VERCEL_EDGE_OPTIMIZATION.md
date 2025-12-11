# Vercel Edge Optimization

## 1. Caching Strategy (SWR)
We utilize `stale-while-revalidate` for critical public content (Store):

```javascript
// Example Header
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```
This serves cached content instantly (Edge) while fetching updates in background.

## 2. Image Optimization
*   **Format:** AVIF (where supported), WebP fallback.
*   **Sizes:** Automatically resized by Vercel Image Optimization API based on viewport.
*   **Lazy Loading:** Native `loading="lazy"` on all images below the fold.

## 3. Edge Middleware
*   **Routing:** 0ms latency routing for subdomains.
*   **Geo-Detection:** Tenant currency/language defaults set by user IP at edge.
