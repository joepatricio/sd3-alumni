import {
  Calendar,
  Newspaper,
  Heart,
  Users,
  Briefcase,
  BookOpen,
} from "lucide-react";

export function CallToAction() {
  const ctaCards = [
    {
      icon: BookOpen,
      title: "Alumni Directory",
      description:
        "Find and reconnect with classmates and fellow Josenians worldwide.",
      link: "/directory",
      color: "bg-[#1a5f3f]",
    },
    {
      icon: Calendar,
      title: "Upcoming Events",
      description:
        "Join alumni gatherings, networking sessions, and special celebrations.",
      link: "/events",
      color: "bg-[#2d7a4f]",
    },
    {
      icon: Newspaper,
      title: "Latest Bulletin",
      description:
        "Stay updated with news, achievements, and stories from fellow alumni.",
      link: "#bulletin",
      color: "bg-[#4aa573]",
    },
    {
      icon: Heart,
      title: "Support USJR",
      description:
        "Make a difference by contributing to scholarships and campus development.",
      link: "#donate",
      color: "bg-[#d4af37]",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Involved
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Discover ways to stay connected, give back, and grow
            with the USJR Alumni community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6">
          {ctaCards.map((card) => (
            <a
              key={card.title}
              href={card.link}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300"
            >
              <div
                className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600">
                {card.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}