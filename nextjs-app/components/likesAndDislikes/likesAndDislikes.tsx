'use client'
import { useState } from "react";
import { Button } from "react-day-picker";

interface LikesAndDislikes {
    userSteamId: string;
    otherPlayerSteamId: string;
}

export default function LikesAndDislikes({ userSteamId, otherPlayerSteamId }: LikesAndDislikes) {
    const [loading, setLoading] = useState(false);

    const likeAndDislike = async (type: string) => {
        const confirmation = confirm("Are you sure you want to like this person?");
        if (!confirmation) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/likes-dislikes/like-and-dislike`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userSteamId, otherPlayerSteamId, type }),
            });
            const data = await res.json(); // Parse the response
            console.log(data.success,"dataaaaaaaa")
            if (!data.success) {
                alert(data.message || "Failed to update likes and dislikes."); // Show error message if request fails
                return;
            }

            alert("Vote recorded successfully!");

        } catch (error) {
            console.error("Failed to update likes and dislikes.", error);
        } finally {
            setLoading(false)
        }
        //provjerimo da li je vec lajkovano u api
        //ako jeste vratimo error da je lajkovano/dislajkovano
    }

    return (
        <>
            <button
                onClick={() => likeAndDislike("like")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Like
            </button>
            <button
                onClick={() => likeAndDislike("dislike")}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
                Dislike
            </button>
        </>
    )
}