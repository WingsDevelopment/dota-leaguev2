"use client";
import { getApiClientCallerConfig } from "@/app/api/common/clientUtils";
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
    const config= getApiClientCallerConfig()
    const router = useRouter()


    const likeAndDislike = async (type: VoteType) => {
        try {
            apiCallerPutLikeOrDislike({
                params:{userSteamId,
                otherPlayerSteamId,
                type},config   
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
