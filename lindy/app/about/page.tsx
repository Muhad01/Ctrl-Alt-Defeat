"use client"

import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <style jsx>{`
@keyframes blink {
  0%, 50% { border-color: #374151; }
  51%, 100% { border-color: transparent; }
}
`}</style>
      {/* Mission Letter - Post-it Note Style */}
      <section className="py-16 sm:py-24 md:py-36 bg-white">
        <div className="container px-2 md:px-6">
          <div className="max-w-2xl mx-auto px-0 sm:px-6 relative">
            {/* Staggered Background Papers - Same Size Cards */}
            <motion.div
              className="absolute -top-3 -left-4 w-[80%] sm:w-full h-full bg-white rounded-sm shadow-xl transform rotate-3 opacity-30 sm:opacity-40 scale-85 sm:scale-95 md:scale-100"
              initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
              animate={{ opacity: 0.3, rotate: 3, scale: 0.85 }}
              transition={{ duration: 1.4, delay: 0.1 }}
            />
            <motion.div
              className="absolute -top-2 -right-2 w-[80%] sm:w-full h-full bg-white rounded-sm shadow-xl transform -rotate-2 opacity-35 sm:opacity-45 scale-85 sm:scale-95 md:scale-100"
              initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
              animate={{ opacity: 0.35, rotate: -2, scale: 0.85 }}
              transition={{ duration: 1.4, delay: 0.3 }}
            />
            <motion.div
              className="absolute top-2 left-2 w-[80%] sm:w-full h-full bg-white rounded-sm shadow-xl transform rotate-1 opacity-25 sm:opacity-35 scale-85 sm:scale-95 md:scale-100"
              initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
              animate={{ opacity: 0.25, rotate: 1, scale: 0.85 }}
              transition={{ duration: 1.4, delay: 0.5 }}
            />
            <motion.div
              className="absolute -bottom-2 -left-3 w-[80%] sm:w-full h-full bg-white rounded-sm shadow-xl transform rotate-4 opacity-28 sm:opacity-38 scale-85 sm:scale-95 md:scale-100"
              initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
              animate={{ opacity: 0.28, rotate: 4, scale: 0.85 }}
              transition={{ duration: 1.4, delay: 0.7 }}
            />
            <motion.div
              className="absolute bottom-1 right-1 w-[80%] sm:w-full h-full bg-white rounded-sm shadow-xl transform -rotate-3 opacity-22 sm:opacity-32 scale-85 sm:scale-95 md:scale-100"
              initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
              animate={{ opacity: 0.22, rotate: -3, scale: 0.85 }}
              transition={{ duration: 1.4, delay: 0.9 }}
            />

            {/* Main Paper Letter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="p-4 sm:p-8 md:p-14 shadow-lg mx-0 w-full relative z-10"
              style={{
                background: "#fefefe",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              {/* Subtle paper texture */}
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage:
                    "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVVEhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAFVklEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92U2hXHF/C1M8uP/ZtYdiuj26UdAdQQSXQErwSOMzt/XWRWAz5GuSBIkwG1H3FabJ2OsUOUhGC6tK4EMtJO0ttC6IBD3kM0ve0tJwMdSfjZo+EEISaeTr9P3wYrGjXqyC1krcKdhMpxEnt5JetoulscpyzhXN5FRpuPHvbeQaKxFAEB6EN+cYN6xD7RYGpXpNndMmZgM5Dcs3YSNFDHUo2LGfZuukSWyUYirJAdYbF3MfqEKmjM+I2EfhA94iG3L7uKrR+GdWD73ydlIB+6hgref1QTlmgmbM3_LeX5GI1Ux1RWpgxpLuZ2+I+IjzZ8wqE4nilvQdkUdfhzI5QDWy+kw5Wgg2pGpeEVeCCA7b85BO3F9DzxB3cdqvBzWcmzbyMiqhzuYqtHRVG2y4x+KOlnyqla8AoWWpuBoYRxzXrfKuILl6SfiWCbjxoZJUaCBj1CjH7GIaDbc9kqBY3W-Rgjda1iqQcOJu2WW+76pZC9QG7M00dffe9hNnseupFL53r8F7YHSwJWUKP2q+k7RdsxyOB11n0xtOvnW4irMMFNV4H0uqwS5ExsmP9AxbDTc9JwgneAT5vTiUSm1E7BSflSt3bfa1tv8Di3R8n3Af7MNWzs49hmauE2wP+ttrq+AsWpFG2awvsuOqbipWHgtuvuaAE+A1Z_7gC9hesnr+7wqCwG8c5yAg3AL1fm8T9AZtp_bbJGwl1pNrE7RuOX7PeMRUERVaPpEs+yqeoSmuOlokqw49pgomjLeh7icHNlG19yjs6XXOMedYm5xH2YxpV2tc0Ro2jJfxC50ApuxGob7lMsxfTbeUv07TyYxpeLucEH1gNd4IKH2LAg5TdVhlCafZvpskfncCfx8pOhJzd76bJWeYFnFciwcYfubRc12Ip_ppIhA1_mSZ_RxjFDrJC5xifFjJpY2Xl5zXdguFqYyTR1zSp1Y9p+tktDYYSNflcxI0iyO4TPBdlRcpeqjK_piF5bklq77VSEaA+z8qmJTFzIWiitbnzR794USKBUaT0NTEsVjZqLaFVqJoPN9ODG70IPbfBHKK+/q/AWR0tJzYHRULOa4MP+W+HfGadZUbfw177G7j+OGbIs8TahLyynl4X4RinF793Oz+BU0saXtUHrVBFT/DnA3ctNPoGbs4hRIjTok8i+algT1lTHi4SxFvONKNrgQFAq2_gFnWMXgwffgYMJpiKYkmW3tTg3ZQ9Jq+f8XN+A5eeUKHWvJWJ2sgJ1Sop+wwhqFVijqWaJhwtD8MNlSBeWNNWTa5Z5kPZw5+LbVT99wqTdx29lMUH4OIG_D86ruKEauBjvH5xy6um_Sfj7ei6UUVk4AIl3MyD4MSSTOFgSwsH_QJWaQ5as7ZcmgBZmzjjU1UrQ74ci1gWBCSGHtuV1H2mhSnO3Wp_3fEV5a+4wz//6qy8JxjZsmxxy5+4w9CDNJY09T072iKG0EnOS0arEYgXqYnXcYHwjTtUNAcMelOd4xpkoqiTYICWFq0JSiPfPDQdnt+4_wuqcXY47QILbgAAAABJRU5ErkJggg==')",
                }}
              />

              {/* Subtle letter elements behind */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Letter A */}
                <div
                  className="absolute top-8 left-4 text-6xl font-serif text-gray-100 opacity-30 select-none"
                  style={{ transform: "rotate(-15deg)" }}
                >
                  A
                </div>
                {/* Letter S */}
                <div
                  className="absolute top-16 right-8 text-5xl font-serif text-gray-100 opacity-25 select-none"
                  style={{ transform: "rotate(12deg)" }}
                >
                  S
                </div>
                {/* Letter L */}
                <div
                  className="absolute bottom-20 left-8 text-7xl font-serif text-gray-100 opacity-20 select-none"
                  style={{ transform: "rotate(8deg)" }}
                >
                  L
                </div>
                {/* Letter T */}
                <div
                  className="absolute bottom-32 right-12 text-4xl font-serif text-gray-100 opacity-35 select-none"
                  style={{ transform: "rotate(-8deg)" }}
                >
                  T
                </div>
                {/* Letter R */}
                <div
                  className="absolute top-1/2 left-1/2 text-8xl font-serif text-gray-100 opacity-15 select-none"
                  style={{ transform: "translate(-50%, -50%) rotate(5deg)" }}
                >
                  R
                </div>
              </div>

              <div className="space-y-6 text-gray-700 leading-relaxed relative z-10">
                <p>
                  With <strong>Strawberry Antler</strong>, the company behind Lindy, the mission is clear, even when the
                  path isn't. We build AI that's actually useful and feels great to use.
                </p>
                <p>
                  We're not just another tech company; we're licensed independent insurance agents ourselves. We've
                  lived the challenges of the industry and built Lindy to solve them.
                </p>

                <p>
                  We believe software should get out of your way. Ours is built to be fast, clean, and—dare we say
                  it—fun. But ease of use isn't the whole point.
                </p>

                <p>
                  We're here for the doers. The lean teams, the scrappy startups, the solo operators punching above
                  their weight. Our job is to give them leverage. Help them compete, win, and scale in a world built for
                  giants.
                </p>

                <p>
                  At the core is our AI-infused CRM. It's smart enough to automate the busywork, sharp enough to surface
                  what matters, and flexible enough to adapt to your flow. It doesn't just store data. It helps you act
                  on it.
                </p>

                <p>
                  We don't just ship software and wish you luck. We build with you. Custom AI agents. Purpose-built
                  workflows. Real support every step of the way.
                </p>

                <p>
                  AI is noisy. Confusing. We cut through that. We handle setup, integrations, hands-on training, and
                  ongoing support. Because we don't just sell software. We serve our clients.
                </p>

                <p>We're here to help you win. And if we miss the mark, tell us. We'll make it right. Fast.</p>
              </div>

              {/* Letter signature line */}
              <div className="mt-8 pt-6 border-t border-gray-200 relative z-10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Sincerely,</p>
                    <div>
                      <img src="/signature-jw.svg" alt="JW Signature" width={86} height={80} />
                      <div className="mt-2">
                        <p className="text-gray-700">Justin White</p>
                        <p className="text-gray-700">Co-founder & CEO</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
