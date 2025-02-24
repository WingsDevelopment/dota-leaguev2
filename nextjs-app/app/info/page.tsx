"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Page() {
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
              <Link href="#draft-queue">
                <span className="text-blue-600 hover:underline">
                  How Draft Queue Works
                </span>
              </Link>
            </li>
            <li>
              <Link href="#balanced-shuffle">
                <span className="text-blue-600 hover:underline">
                  How Balanced Shuffle Works
                </span>
              </Link>
            </li>
            <li>
              <Link href="#user-actions">
                <span className="text-blue-600 hover:underline">
                  User Actions
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-prose px-4">
        <section id="draft-queue" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">HOW DRAFT QUEUE WORKS</h1>
          <p>
            <strong>Admin can select a player to be a captain.</strong>
          </p>
          <p>
            If there are exactly two players flagged as captain, they will be
            captain, (league)MMR sorting is ignored in this case.
          </p>
          <p className="mt-2">
            <strong>Extra Flagged Captains Ignored:</strong> If more than two
            players are flagged as captains, only the top two (by MMR) are used;
            the others remain available for drafting.
          </p>
          <p className="mt-2">
            <strong>Fallback on (league)MMR:</strong> When there aren’t enough
            flagged players (one or none), it uses the highest (league)MMR from
            the remaining players to fill in the gap.
          </p>
        </section>

        <section id="balanced-shuffle" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">
            HOW BALANCED SHUFFLE WORKS
          </h1>
          <p>
            The balanced shuffle algorithm examines all possible ways to split
            the list of players into two teams. It calculates the total
            (league)MMR for each possible division and selects the combination
            with the smallest difference between teams.
          </p>
          <p className="mt-2">
            If multiple nearly balanced combinations are found (i.e. with a
            difference below a set threshold), the algorithm randomly selects
            one to ensure fairness. This process helps create teams that are as
            evenly matched as possible.
          </p>
        </section>

        <section id="user-actions" className="mb-12">
          <h1 className="text-2xl font-bold mb-4">USER ACTIONS</h1>
          <p>
            The bot offers a variety of commands to interact with the league
            system. Here are the main commands:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>/help:</strong> Displays all available commands and their
              descriptions.
            </li>
            <li>
              <strong>/stats:</strong> Shows your personal stats, including
              (league)MMR, wins, losses, and rank.
            </li>
            <li>
              <strong>/signup:</strong> Registers you for a game.
            </li>
            <li>
              <strong>/signupdraft:</strong> Registers you for a draft game.
            </li>
            <li>
              <strong>/leave:</strong> Removes you from the game queue.
            </li>
            <li>
              <strong>/autoscore:</strong> Attempts to score a game via the
              Steam API (use sparingly).
            </li>
            <li>
              <strong>/preferredrole:</strong> Sets your preferred role(s) for
              gameplay.
              <br />
              Example usage: <strong>/preferredrole 123</strong> or{" "}
              <strong>/preferredrole 1</strong> if you want to play any core, or
              just a carry.
            </li>
            <li>
              <strong>Admin Commands:</strong> For users with admin privileges,
              additional commands are available:
              <ul className="list-disc ml-6 mt-1">
                <li>
                  <strong>/vouch:</strong> Vouches for a player.
                </li>
                <li>
                  <strong>/score:</strong> Scores a match.
                </li>
                <li>
                  <strong>/rehost:</strong> Rehosts a game.
                </li>
                <li>
                  <strong>/clearqueue:</strong> Clears the game queue.
                </li>
                <li>
                  <strong>/cleardraftqueue:</strong> Clears the draft queue.
                </li>
                <li>
                  <strong>/cancelgame:</strong> Cancels a game.
                </li>
                <li>
                  <strong>/markcaptain:</strong> Marks a player as captain.
                </li>
                <li>
                  <strong>/unmarkcaptain:</strong> Remove captain role from a
                  player.
                </li>
              </ul>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
