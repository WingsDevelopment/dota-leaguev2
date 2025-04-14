"use client";
import { apiCallerisUserLikedOrDisliked } from "@/app/api/likes-dislikes/is-user-liked-or-disliked/caller";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "react-day-picker";

interface LikesAndDislikes {
    userSteamId: string |null;
    otherPlayerSteamId: string;
    isUserLiked: number;
    fetchLD: () => Promise<void>;
}

export default function LikesAndDislikes({
    userSteamId,
    otherPlayerSteamId,
    isUserLiked,
    fetchLD,
}: LikesAndDislikes) {
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(isUserLiked);



    const fetchData = async () => {
        setLoading(true)
        try {
           setIsLiked( await apiCallerisUserLikedOrDisliked({ otherPlayerSteamId, userSteamId }))

        } catch (error) {
            console.error("Couldn't get user likes/dislikes.");
        } finally {
            setLoading(false)
        }
    };
    const likeAndDislike = async (type: string) => {
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
        } catch (error) {
            console.error("Failed to update likes and dislikes.", error);
        } finally {
            setLoading(false);
        }
    };

    const getButtonStyles = (
        type: "like" | "dislike",
        isLiked: number | null
    ) => {
        const baseStyles = "px-4 py-2 text-white rounded transition shadow-sm";

        if (isLiked === 1 && type === "like")
            return `${baseStyles} bg-blue-500 shadow-blue-500/50`;
        if (isLiked === 0 && type === "dislike")
            return `${baseStyles} bg-red-500 shadow-red-500/50`;

        // If isLiked is null or undefined, both buttons should be gray
        return `${baseStyles} bg-gray-500 hover:bg-gray-600`;
    };

    if (loading) return (
        <div className="relative w-40 h-10">
            {/* Semi-transparent background overlay */}
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg overflow-hidden flex items-center justify-center">
                {/* Vertical sweeping light effect */}
                <div className="absolute w-full h-full bg-white/20 blur-md animate-[verticalSweep_1.5s_infinite_linear]"></div>
            </div>
        </div>
    );
    return (
        <>
            <button
                onClick={() => likeAndDislike(isLiked === 1 ? "liked" : "like")}
                className={getButtonStyles("like", isLiked)}
                disabled={loading}
            >
                <ThumbsUp
                    size={20}
                    className={isLiked === 1 ? "text-white" : "text-gray-300"}
                />
            </button>
            <button
                onClick={() => likeAndDislike(isLiked === 0 ? "disliked" : "dislike")}
                className={getButtonStyles("dislike", isLiked)}
                disabled={loading}
            >
                <ThumbsDown
                    size={20}
                    className={isLiked === 0 ? "text-white" : "text-gray-300"}
                />
            </button>
        </>
    );
}
