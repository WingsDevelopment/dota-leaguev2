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
                <span className="text-blue-600 hover:underline">Grif Ban</span>
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

        <section id="leave-ban" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Leave Ban</h1>
          <p>
            Leaving the game prematurely results in penalties.{" "}
            <strong>2 leaves ban 30 days!</strong>
          </p>
        </section>

        <section id="grif-ban" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">Grif Ban</h1>
          <p>The following ban durations apply for grif actions:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>1 grif:</strong> 4 days ban
            </li>
            <li>
              <strong>2 grif:</strong> 10 days ban
            </li>
            <li>
              <strong>3 grif:</strong> Year and a half.
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
            Non grif bans are tied to time rather than seasons.{" "}
            <strong>
              The minimum ban period is calculated as days per year and a half
            </strong>
            , with a <strong>maximum of 3.5 years</strong>.
          </p>
        </section>
      </main>
    </div>
  );
}
