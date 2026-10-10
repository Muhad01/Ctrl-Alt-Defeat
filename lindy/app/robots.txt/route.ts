// This route handler generates the robots.txt file on demand.

export async function GET() {
  // Hardcoding the base URL to ensure reliability.
  // IMPORTANT: If your domain changes, this value must be updated here.
  const baseUrl = "https://www.mylindy.com"

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`

  // Return the robots.txt as a plain text response
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
