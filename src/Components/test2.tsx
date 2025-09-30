import { useEffect, useMemo, useRef, useState } from "react";

// SunyaTimes — Article Page (Retreat Template)
// Stack: React + TailwindCSS
// Purpose: Article layout similar in spirit to the linked retreat page — minimal, modern, responsive, dark-mode.
// Drop into your app and route to <ArticlePage />. Replace mock data with CMS/API.

export default function ArticlePage() {
  const article = useMemo(
    () => ({
      title:
        "2‑Day Sunya Studio Retreat in Pune — Highlights, Schedule & How to Join",
      dek: "A compact weekend immersion in meditation, movement, and mindful creativity at Sunya Studio Pune.",
      cover:
        "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1600&auto=format&fit=crop",
      date: "Sep 17, 2025",
      read: "7 min read",
      category: "Culture",
      author: {
        name: "Sunya Desk",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
        role: "Editor",
      },
      tags: ["Retreats", "Meditation", "Studio", "Pune"],
      gallery: [
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1600&auto=format&fit=crop",
      ],
    }),
    []
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
      <ProgressBar />
      <Header />

      <main id="main" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-0 py-8">
        <Breadcrumbs category={article.category} date={article.date} />

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          {article.title}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {article.dek}
        </p>

        <MetaBar
          author={article.author}
          date={article.date}
          read={article.read}
        />

        <figure className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900">
          <img
            src={article.cover}
            alt="Retreat cover"
            className="w-full object-cover aspect-[16/9]"
          />
        </figure>

        <ShareBar />

        {/* Body */}
        <ArticleBody gallery={article.gallery} />

        <TagRow tags={article.tags} />

        <Divider />
        <AuthorCard author={article.author} />

        <Divider />
        <RelatedArticles />

        <Divider />
        <CommentsCTA />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-zinc-900 dark:bg-zinc-950/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded bg-zinc-900 dark:bg-zinc-100" />
          <span className="font-semibold tracking-tight">SunyaTimes</span>
        </a>
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <a className="hover:underline" href="#">
            Latest
          </a>
          <a className="hover:underline" href="#">
            Culture
          </a>
          <a className="hover:underline" href="#">
            Health
          </a>
          <a className="hover:underline" href="#">
            Tech
          </a>
        </nav>
        <button className="sm:hidden text-xl" aria-label="Open menu">
          ☰
        </button>
      </div>
    </header>
  );
}

function Breadcrumbs({ category, date }) {
  return (
    <div className="mb-4 mt-2 text-sm text-zinc-500 flex flex-wrap items-center gap-2">
      <a href="#" className="hover:underline">
        Home
      </a>
      <span>›</span>
      <a href="#" className="hover:underline">
        {category}
      </a>
      <span className="hidden sm:inline">•</span>
      <span className="hidden sm:inline">{date}</span>
    </div>
  );
}

function MetaBar({ author, date, read }) {
  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <img
          src={author.avatar}
          alt={author.name}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div>
          <div className="text-sm font-medium">{author.name}</div>
          <div className="text-xs text-zinc-500">{author.role}</div>
        </div>
      </div>
      <div className="text-xs text-zinc-500">
        {date} • {read}
      </div>
    </div>
  );
}

function ShareBar() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
      <span className="text-zinc-500">Share:</span>
      <button className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
        X
      </button>
      <button className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
        LinkedIn
      </button>
      <button className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
        WhatsApp
      </button>
      <button className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
        Copy Link
      </button>
    </div>
  );
}

function ArticleBody({ gallery }) {
  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:tracking-tight prose-h1:text-2xl prose-h2:mt-10 prose-h3:mt-8">
      <p>
        The Sunya Studio Retreat is a two‑day, small‑group experience designed
        to reset the nervous system, deepen your meditation practice, and
        reconnect you with creative flow. Expect a blend of silent sits, guided
        breathwork, mindful movement, and reflective journaling.
      </p>

      <Callout title="Who is this for?">
        Beginners and intermediate practitioners seeking a structured yet gentle
        reintroduction to daily practice. No prior experience is necessary.
      </Callout>

      <h2>What you’ll experience</h2>
      <ul>
        <li>Three core Sunya meditation sessions each day</li>
        <li>Movement & bodywork to release stored tension</li>
        <li>Tea circles and Q&A with facilitators</li>
        <li>Optional sunrise walk and photo essay sharing</li>
      </ul>

      <h2>Schedule (Sample)</h2>
      <Schedule />

      <PullQuote>
        “Silence is not the absence of sound — it’s the presence of attention.”
      </PullQuote>

      <h2>Venue & logistics</h2>
      <p>
        The retreat takes place at Sunya Studio, Pune. The studio offers a
        bright, acoustic‑friendly hall, mats and cushions, and a small library
        of practice guides. Light refreshments are included; lunch is available
        at cafés nearby.
      </p>

      <Gallery images={gallery} />

      <h2>How to join</h2>
      <ol>
        <li>
          Click the <em>Register</em> button below and fill in basic details.
        </li>
        <li>Choose your preferred batch (Sat–Sun / 8:00–18:00).</li>
        <li>
          Complete registration to receive a confirmation email and
          what‑to‑bring checklist.
        </li>
      </ol>

      <div className="not-prose mt-6">
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Register for the retreat →
        </a>
      </div>
    </article>
  );
}

function Schedule() {
  const rows = [
    { t: "08:00", a: "Check‑in & grounding" },
    { t: "09:00", a: "Sunya meditation — Session 1" },
    { t: "10:30", a: "Tea & reflective journaling" },
    { t: "11:30", a: "Movement & breathwork" },
    { t: "13:00", a: "Lunch break" },
    { t: "14:30", a: "Sunya meditation — Session 2" },
    { t: "16:00", a: "Q&A with facilitators" },
    { t: "17:00", a: "Closing circle" },
  ];
  return (
    <div className="not-prose rounded-2xl border border-zinc-200 overflow-hidden dark:border-zinc-900">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="odd:bg-zinc-50 even:bg-white dark:odd:bg-zinc-900/30 dark:even:bg-zinc-900"
            >
              <td className="px-4 py-3 w-24 text-zinc-500 align-top">{r.t}</td>
              <td className="px-4 py-3 font-medium">{r.a}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Gallery({ images }) {
  return (
    <div className="not-prose mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <img
        className="rounded-xl object-cover aspect-[16/10]"
        src={images[0]}
        alt="Gallery"
      />
      <div className="grid grid-cols-2 gap-4">
        <img
          className="rounded-xl object-cover aspect-[4/3]"
          src={images[1]}
          alt="Gallery"
        />
        <img
          className="rounded-xl object-cover aspect-[4/3]"
          src={images[2]}
          alt="Gallery"
        />
      </div>
    </div>
  );
}

function Callout({ title, children }) {
  return (
    <div className="not-prose mt-6 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm opacity-90">{children}</div>
    </div>
  );
}

function PullQuote({ children }) {
  return (
    <blockquote className="not-prose my-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-lg italic dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </blockquote>
  );
}

function TagRow({ tags }) {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-2">
      {tags.map((t) => (
        <a
          key={t}
          href={`#tag-${t}`}
          className="rounded-full border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          #{t}
        </a>
      ))}
    </div>
  );
}

function AuthorCard({ author }) {
  return (
    <section className="flex items-center gap-4">
      <img
        src={author.avatar}
        alt={author.name}
        className="h-12 w-12 rounded-full object-cover"
      />
      <div>
        <div className="font-medium">{author.name}</div>
        <div className="text-sm text-zinc-500">
          Editor at SunyaTimes. Exploring meditation, community, and humane
          tech.
        </div>
      </div>
    </section>
  );
}

function RelatedArticles() {
  const items = [
    {
      title: "Sunya Mega Retreat — Lumbini Photo Essay",
      date: "Sep 14, 2025",
      href: "#",
    },
    {
      title: "How to Start a 10‑Minute Daily Practice",
      date: "Sep 10, 2025",
      href: "#",
    },
    {
      title: "Inside Sunya Studio: A Guide to First‑Timers",
      date: "Sep 07, 2025",
      href: "#",
    },
  ];
  return (
    <section>
      <h3 className="text-lg font-semibold">Related</h3>
      <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-900">
        {items.map((it) => (
          <li key={it.title} className="py-3">
            <a href={it.href} className="hover:underline">
              <div className="font-medium">{it.title}</div>
              <div className="text-xs text-zinc-500">{it.date}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommentsCTA() {
  return (
    <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-900">
      <h3 className="text-lg font-semibold">Join the conversation</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Have a question or a reflection from the retreat? Share it with the
        community.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          placeholder="Write a comment…"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-700"
        />
        <button className="rounded-xl bg-zinc-900 text-white px-4 text-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Post
        </button>
      </div>
    </section>
  );
}

function Divider() {
  return <div className="my-10 h-px bg-zinc-200 dark:bg-zinc-900" />;
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-200 dark:border-zinc-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 text-sm text-zinc-500">
        © {new Date().getFullYear()} SunyaTimes
      </div>
    </footer>
  );
}

// Reading progress bar
function ProgressBar() {
  const ref = useRef(null);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const p = total > 0 ? (el.scrollTop / total) * 100 : 0;
      setPct(p);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div ref={ref} className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
      <div
        className="h-full bg-zinc-900 dark:bg-zinc-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
