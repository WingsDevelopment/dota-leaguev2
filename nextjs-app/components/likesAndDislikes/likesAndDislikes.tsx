"use client";
import { apiCallerPutLikeOrDislike } from "@/app/api/likes-dislikes/like-and-dislike/caller";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";

export enum VoteType {
    LIKE = "like",
    DISLIKE = "dislike",
    UNLIKE = "liked",
    UNDISLIKE = "disliked"
}
interface LikesAndDislikes {
    userSteamId: string | null;
    otherPlayerSteamId: string;
    isUserLiked?: number | null;
}

export default function LikesAndDislikes({
    userSteamId,
    otherPlayerSteamId,
    isUserLiked,
}: LikesAndDislikes) {
    const router = useRouter()


    const likeAndDislike = async (type: VoteType) => {
        try {
            apiCallerPutLikeOrDislike({
                userSteamId,
                otherPlayerSteamId,
                type
            }).then(() => {
                router.refresh()
            })
        } catch (error) {
            console.error("Failed to update likes and dislikes.", error);
        }
    };

    const getButtonStyles = (
        type: "like" | "dislike",
        isUserLiked: number | null
    ) => {
        const baseStyles = "px-4 py-2 text-white rounded transition shadow-sm";

        if (isUserLiked === 1 && type === "like")
            return `${baseStyles} bg-blue-500 shadow-blue-500/50`;
        if (isUserLiked === 0 && type === "dislike")
            return `${baseStyles} bg-red-500 shadow-red-500/50`;

        // If isLiked is null or undefined, both buttons should be gray
        return `${baseStyles} bg-gray-500 hover:bg-gray-600`;
    };

    // if (loading) return (
    //     <div className="relative w-40 h-10">
    //         {/* Semi-transparent background overlay */}
    //         <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg overflow-hidden flex items-center justify-center">
    //             {/* Vertical sweeping light effect */}
    //             <div className="absolute w-full h-full bg-white/20 blur-md animate-[verticalSweep_1.5s_infinite_linear]"></div>
    //         </div>
    //     </div>
    // );
    return (
        <>
            <button
                onClick={() => likeAndDislike(isUserLiked === 1 ? VoteType.UNLIKE : VoteType.LIKE)}
                className={getButtonStyles("like", isUserLiked ?? null)}
            >
                <ThumbsUp
                    size={20}
                    className={isUserLiked === 1 ? "text-white" : "text-gray-300"}
                />
            </button>
            <button
                onClick={() => likeAndDislike(isUserLiked === 0 ? VoteType.UNDISLIKE : VoteType.DISLIKE)}
                className={getButtonStyles("dislike", isUserLiked ?? null)}
            >
                <ThumbsDown
                    size={20}
                    className={isUserLiked === 0 ? "text-white" : "text-gray-300"}
                />
            </button>
        </>
    );
}
