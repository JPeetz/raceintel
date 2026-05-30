import Link from "next/link";

const festivals = [
  {
    slug: "cheltenham",
    name: "Cheltenham Festival",
    venue: "Cheltenham Racecourse",
    dates: "March (4 days)",
    type: "Jumps",
    grade: "Grade 1",
    highlights: "Gold Cup, Champion Hurdle, Queen Mother Champion Chase, Stayers' Hurdle",
    description: "The pinnacle of National Hunt racing. Four days of the finest jumps racing in the world, featuring the Cheltenham Gold Cup — the blue riband event of the season.",
  },
  {
    slug: "royal-ascot",
    name: "Royal Ascot",
    venue: "Ascot Racecourse",
    dates: "June (5 days)",
    type: "Flat",
    grade: "Group 1",
    highlights: "Gold Cup, Diamond Jubilee Stakes, Prince of Wales's Stakes, St James's Palace Stakes",
    description: "Five days of world-class flat racing attended by the Royal Family. A unique blend of heritage, fashion, and elite thoroughbred racing.",
  },
  {
    slug: "aintree",
    name: "Grand National Meeting",
    venue: "Aintree Racecourse",
    dates: "April (3 days)",
    type: "Jumps",
    grade: "Grade 1",
    highlights: "Grand National, Aintree Hurdle, Melling Chase, Liverpool Hurdle",
    description: "Home of the world's most famous steeplechase — the Randox Grand National. Three days of top-class jumps racing watched by 600 million people worldwide.",
  },
  {
    slug: "epsom-derby",
    name: "Epsom Derby Festival",
    venue: "Epsom Downs",
    dates: "June (2 days)",
    type: "Flat",
    grade: "Group 1",
    highlights: "Derby Stakes, Oaks Stakes, Coronation Cup",
    description: "The most prestigious flat race in the world. The Derby and Oaks are the ultimate tests of the thoroughbred — both run at the unique Epsom Downs.",
  },
  {
    slug: "glorious-goodwood",
    name: "Glorious Goodwood",
    venue: "Goodwood Racecourse",
    dates: "July/August (5 days)",
    type: "Flat",
    grade: "Group 1",
    highlights: "Sussex Stakes, Nassau Stakes, Goodwood Cup, Stewards' Cup",
    description: "Five days of top-class flat racing on the picturesque Sussex Downs. A unique garden party atmosphere combined with elite Group 1 action.",
  },
];

export default function FestivalsPage() {
  return (
    <main className="min-h-screen bg-[#0a0d14]">
      <section className="border-b border-white/[0.06] px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Festival Hub</h1>
          <p className="text-gray-400 max-w-2xl">
            AI-powered race previews, ante-post selections, and day-by-day analysis for the biggest meetings in UK & Irish racing.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivals.map((f) => (
            <Link
              key={f.slug}
              href={`/festivals/${f.slug}`}
              className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/20 transition-colors group"
            >
              <div className="text-xs text-emerald-400 font-semibold mb-2">{f.grade} · {f.type}</div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{f.name}</h3>
              <div className="text-sm text-gray-400 mb-2">{f.venue} · {f.dates}</div>
              <p className="text-sm text-gray-500 line-clamp-3">{f.description}</p>
              <div className="mt-3 text-xs text-gray-600">
                <span className="text-gray-500">Highlights:</span> {f.highlights}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}