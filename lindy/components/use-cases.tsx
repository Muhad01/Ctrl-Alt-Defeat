"use client"
import { BuildingIcon, GovernmentIcon, FinanceIcon, LegalIcon, EducationIcon } from "@/components/use-case-icons"

export default function UseCases() {
  const useCases = [
    {
      icon: <BuildingIcon />,
      title: "Small Businesses",
      description:
        "Lindy acts as your virtual assistant, handling scheduling, customer inquiries, and administrative tasks to help you focus on growth.",
      benefit:
        "Save time and resources by automating routine tasks, improving customer response times, and maintaining organized business operations without hiring additional staff.",
      accentColor: "rgba(59, 130, 246, 0.5)",
    },
    {
      icon: <GovernmentIcon />,
      title: "Marketing Teams",
      description:
        "Analyze campaign performance, generate content ideas, and schedule social media posts to enhance your marketing efforts.",
      benefit:
        "Increase campaign effectiveness, maintain consistent content schedules, and gain deeper insights into performance metrics to optimize your marketing strategy.",
      accentColor: "rgba(139, 92, 246, 0.5)",
    },
    {
      icon: <FinanceIcon />,
      title: "Financial Services",
      description:
        "Streamline financial reporting, analyze market trends, and automate client communications with secure AI assistance.",
      benefit:
        "Reduce reporting time by up to 70%, identify market opportunities faster, and maintain personalized client relationships while ensuring compliance with regulations.",
      accentColor: "rgba(245, 158, 11, 0.5)",
    },
    {
      icon: <LegalIcon />,
      title: "Sales Teams",
      description:
        "Track leads, analyze sales data, and automate follow-ups to help your team close more deals and increase revenue.",
      benefit:
        "Increase conversion rates, reduce manual follow-up work, and gain better visibility into your sales pipeline to forecast more accurately.",
      accentColor: "rgba(132, 204, 22, 0.5)",
    },
    {
      icon: <EducationIcon />,
      title: "Remote Teams",
      description:
        "Facilitate seamless collaboration, project management, and communication for distributed workforces.",
      benefit:
        "Improve team coordination across time zones, maintain project momentum with automated updates, and create a more connected remote work environment.",
      accentColor: "rgba(14, 165, 233, 0.5)",
    },
  ]

  return null
}
