/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to support CRM API routes and Server Components.
  // Vercel handles SSR Next.js apps natively; existing generateStaticParams() pages still pre-render.
  trailingSlash: false,
  images: { unoptimized: true },
}
export default nextConfig
