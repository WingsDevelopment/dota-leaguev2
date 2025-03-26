'use client'
import { useState } from "react";
import { Button } from "react-day-picker";

interface LikesAndDislikes {
    userSteamId: string;
    otherPlayerSteamId: string;
    isUserLiked: number
}

export default function LikesAndDislikes({ userSteamId, otherPlayerSteamId, isUserLiked }: LikesAndDislikes) {
    const [loading, setLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(isUserLiked)

    const fetchData = async () => {

        const res = await fetch(`/api/likes-dislikes/is-user-liked-or-disliked?steam_id=${otherPlayerSteamId}&user_steam_id=${userSteamId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        try {
            if (!res) {

            }
            const data = await res.json(); // Parse the response
            if (!data.success) {
                alert(data.message || "Failed to update likes and dislikes."); // Show error message if request fails
                return;
            }
            setIsLiked(data.data[0].likes_dislikes)

        } catch (error) {
            console.error("Couldn't get user likes/dislikes.")
        }
    }
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
            if (!data.success) {
                alert(data.message || "Failed to update likes and dislikes."); // Show error message if request fails
                return;
            }
            fetchData();
            alert("Vote recorded successfully!");
        } catch (error) {
            console.error("Failed to update likes and dislikes.", error);
        } finally {
            setLoading(false)
        }
        //provjerimo da li je vec lajkovano u api
        //ako jeste vratimo error da je lajkovano/dislajkovano
    }

    const getButtonStyles = (type: "like" | "dislike", isLiked: number | null) => {
        const baseStyles = "px-4 py-2 text-white rounded transition shadow-sm";

        if (isLiked === 1 && type === "like") return `${baseStyles} bg-blue-500 shadow-blue-500/50`;
        if (isLiked === 0 && type === "dislike") return `${baseStyles} bg-red-500 shadow-red-500/50`;

        // If isLiked is null or undefined, both buttons should be gray
        return `${baseStyles} bg-gray-500 hover:bg-gray-600`;
    };

    return (
        <>
            <button
                onClick={() => likeAndDislike(isLiked === 1 ? "liked" : "like")}
                className={getButtonStyles("like", isLiked)}
                disabled={loading}
            >
                {isLiked === 1 ? "Liked" : "Like"}
            </button>
            <button
                onClick={() => likeAndDislike(isLiked === 0 ? "disliked" : "dislike")}
                className={getButtonStyles("dislike", isLiked)}
                disabled={loading}
            >
                {isLiked === 0 ? "Disliked" : "Dislike"}
            </button>
        </>
    )
}