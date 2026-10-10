// app/sitemap.xml/route.ts
import { promises as fs } from "fs"
import path from "path"

// Function to recursively find all page.tsx files
async function getPageRoutes(dir: string, baseDir: string): Promise<string[]> {
  let routes: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    // Exclude API routes, special Next.js folders, and non-page files
    if (entry.name.startsWith("_") || entry.name.startsWith("api")) {
      continue
    }

    if (entry.isDirectory()) {
      // Check if the directory contains a page file
      const pageFileExists = ["page.tsx", "page.js", "page.jsx"].some((file) => {
        try {
          // Use sync check for simplicity within this loop
          fs.access(path.join(fullPath, file))
          return true
        } catch {
          return false
        }
      })

      if (pageFileExists) {
        // Construct the route path from the directory structure
        let route = path.relative(baseDir, fullPath)
        // Remove route groups `(..)` from the path
        route = route.replace(/\/$$.*?$$\//g, "/").replace(/$$.*$$/g, "")
        // Handle the root page case
        if (route === ".") {
          route = ""
        }
        routes.push(`/${route}`)
      }

      // Recurse into the directory
      routes = routes.concat(await getPageRoutes(fullPath, baseDir))
    }
  }
  // Return unique routes to avoid duplicates from recursion
  return [...new Set(routes)]
}

export async function GET() {
  // Hardcoding the base URL to ensure reliability.
  const baseUrl = "https://www.mylindy.com"
  const appDir = path.join(process.cwd(), "app")

  // Get all static page routes by scanning the app directory
  const staticRoutes = await getPageRoutes(appDir, appDir)

  // NOTE: For dynamic routes (e.g., /blog/[slug]), you would need to
  // fetch the slugs from your database or CMS and add them to the list here.
  // Example:
  // const blogPosts = await getBlogPostsFromDB();
  // const dynamicRoutes = blogPosts.map(post => `/blog/${post.slug}`);
  // const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const sitemapEntries = staticRoutes
    .map((route) => {
      const priority = route === "" ? 1.0 : 0.9
      const changeFrequency = route === "" ? "daily" : "weekly"
      return `
<url>
  <loc>${baseUrl}${route}</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
  <changefreq>${changeFrequency}</changefreq>
  <priority>${priority}</priority>
</url>`
    })
    .join("")

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
