"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function RulesPage() {
  useEffect(() => {
    // If there's a hash in the URL, scroll smoothly to that element
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div className="container mx-auto flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="md:w-64 mb-8 md:mb-0 md:mr-8">
        <nav className="sticky top-4 p-4 border-l border-gray-200">
          <ul className="space-y-2">
            <li>
              <Link href="#points">
                <span className="text-blue-600 hover:underline">
                  Points System
                </span>
              </Link>
            </li>
            <li>
              <Link href="#captain">
                <span className="text-blue-600 hover:underline">
                  Captain Rules
                </span>
              </Link>
            </li>
            <li>
              <Link href="#league-mode">
                <span className="text-blue-600 hover:underline">
                  League Modes
                </span>
              </Link>
            </li>
            <li>
              <Link href="#leave-ban">
                <span className="text-blue-600 hover:underline">Leave Ban</span>
              </Link>
            </li>
            <li>
              <Link href="#grif-ban">
                <span className="text-blue-600 hover:underline">Grief Ban</span>
              </Link>
            </li>
            <li>
              <Link href="#misconduct">
                <span className="text-blue-600 hover:underline">
                  Misconduct & Sanctions
                </span>
              </Link>
            </li>
            <li>
              <Link href="#ban-durations">
                <span className="text-blue-600 hover:underline">
                  Bad Behavior Ban(BBB)
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-prose px-4">
        <section id="points" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Points System</h1>
          <p>
            Winning a game awards you +25 points, while a loss deducts 25
            points.
          </p>
        </section>

        <section id="captain" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Captain Rules</h1>
          <p>
            Rules about captain selection and responsibilities are in effect.
            For more details, please{" "}
            <Link href="/info">
              <span className="text-blue-600 hover:underline">
                Read more here
              </span>
            </Link>
            .
          </p>
        </section>

        <section id="league-mode" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">League Modes</h1>
          <p>
            League mode supports <strong>CM</strong> with queue options
            including <strong>balanced shuffle</strong> or{" "}
            <strong>draft</strong> formats.{" "}
            <Link href="/info">
              <span className="text-blue-600 hover:underline">
                Read more here
              </span>
            </Link>
            .
          </p>
        </section>

        <section id="didnt-show-ban" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Didn't Show Ban</h1>
          <p>Failing to show up at the scheduled time results in penalties.</p>
          <p>The following ban durations apply for missing a game:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>1 missed game:</strong> 1-day ban
            </li>
            <li>
              <strong>2 or more missed games:</strong> added to the previous
              count (1 missed: 1 day, 2 missed: 2 days and so on.)
            </li>
          </ul>
        </section>

        <section id="leave-ban" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Leave Ban</h1>
          <p>Leaving a game prematurely results in penalties.</p>
          <p>The following ban durations apply for leaving a game:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>1 leave:</strong> 1-day ban
            </li>
            <li>
              <strong>2 or more leaves:</strong> results in a 10-day stacking
              ban
            </li>
          </ul>
        </section>

        <section id="grif-ban" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Grief Ban</h1>
          <p>
            Griefing refers to the act of intentionally disrupting or annoying
            other players such as going out of your way to ruin the experience
            for others by trolling, team-killing, blocking progress, spamming,
            or otherwise being disruptive... It doesn't include mistakes coming
            from skill difference between players.
          </p>
          <p>The following ban durations apply for grif actions:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>1 grif:</strong> 4 days ban
            </li>
            <li>
              <strong>2 grif:</strong> 10 days ban
            </li>
            <li>
              <strong>3 grif:</strong> Season ban.
            </li>
          </ul>
        </section>

        <section id="misconduct" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Misconduct & Sanctions</h1>
          <p>
            INAPPROPRIATENESS, deliberate pausing, and insolence result in bans.
            Additionally, threats lead to an instant BBB (Bad Behavior Ban).
          </p>
        </section>

        <section id="ban-durations" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">
            Bad Behavior Ban(BBB) durations
          </h1>
          <p>
            First (BBB) ban period is <strong> 2 weeks</strong>, and a{" "}
            <strong> 1.5 years</strong> every other time.
          </p>
        </section>
      </main>
    </div>
  );
}
