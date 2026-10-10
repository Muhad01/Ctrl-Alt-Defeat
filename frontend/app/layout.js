import "./globals.css";

export const metadata = {
  title: "Prior Auth Copilot",
  description: "Agentic prior authorization and denial prevention with evidence-grounded AI and human approval.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
