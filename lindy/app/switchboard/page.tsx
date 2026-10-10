import InteractiveSwitchboardDemo from "@/components/interactive-switchboard-demo"
// Removed: import Navbar from "@/components/navbar"
// Removed: import Footer from "@/components/footer"

export default function SwitchboardPage() {
  return (
    // The surrounding div and main tag with flex properties are typically handled by the layout.
    // The layout app/switchboard/layout.tsx wraps {children}
    // We can add a <main> tag here if the layout doesn't provide one around {children}.
    // Assuming the layout's {children} is wrapped in a <main> or similar structure.
    <InteractiveSwitchboardDemo />
  )
}
