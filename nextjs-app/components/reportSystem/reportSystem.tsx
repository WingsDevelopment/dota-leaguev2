import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Modal, ModalClose, ModalContent, ModalDescription, ModalHeader, ModalTrigger } from "../ui/modal";
import { useState } from "react";

export interface ReportSystem {
    userSteamId: string,
    otherPlayerSteamId: string
}
interface ReportsFormValues {
    type: string;
    matchId?: number;
    report: string
}
// Uzece steamId/userId da znamo ko je koga reportao
export default function ReportSystem({ userSteamId, otherPlayerSteamId }: ReportSystem) {
    const [openModal, setOpenModal] = useState<number | null>(null);
    const {
        handleSubmit,
        register,
        reset,
        watch,
        formState: { errors },
    } = useForm<ReportsFormValues>({
        defaultValues: {
            report: "",
        },
    });

    const handleReport = async (data: ReportsFormValues) => {
        const confirmation = confirm("Are you sure you want to report this player?");
        if (!confirmation) return;
        try {
            const res = await fetch("/api/report-system/create-report", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_steam_id: userSteamId,
                    other_player_steam_id: otherPlayerSteamId,
                    type: data.type,
                    report: data.report,
                    match_id: data.matchId
                }),
            });
            if (!res.ok) {
                throw new Error("Failed to submit the report.");
            }
            setOpenModal(null)
        } catch (error) {
            console.error("Failed to submit the report.")
        } finally {
            setOpenModal(null)
        }
    }

    const maxLength = 256;
    const reportText = watch("report", "");
    return (
        <>
            <Modal
                open={openModal === Number(userSteamId)}
                onOpenChange={(isOpen) =>
                    isOpen ? setOpenModal(Number(userSteamId)) : setOpenModal(null)
                }
            >
                <ModalTrigger className="bg-red-500 hover:bg-red-600 text-black px-4 py-2 rounded font-bold flex items-center gap-2" onClick={() => setOpenModal(Number(userSteamId))}>
                    <span className="text-red-600 text-xl">❗</span> Report a Player
                </ModalTrigger>
                <ModalContent>
                    <ModalHeader>Report a Player</ModalHeader>
                    <ModalDescription>
                        <form onSubmit={handleSubmit(handleReport)}>
                            <div className="mb-4">
                                <label htmlFor="type" className="mr-2">
                                    Type:
                                </label>
                                <select
                                    {...register("type", { required: true })}
                                    id="type"
                                    className="p-2 border rounded"
                                    defaultValue="GRIEF"
                                >
                                    <option value="GRIEF">Grief</option>
                                    <option value="BAD BEHAVIOUR">Bad Behaviour</option>
                                </select>
                                {errors.type && <p className="text-red-500">Type is required</p>}
                            </div>

                            <input
                                {...register("matchId", {
                                    setValueAs: (value) => (value === "" ? undefined : Number(value)), // Convert empty string to undefined
                                    validate: (value) =>
                                        value === undefined || !isNaN(value) || "Match ID must be a number",
                                })}
                                type="text"
                                name="matchId"
                                placeholder="Match ID (optional)"
                                className="p-2 border rounded w-full mb-2"
                            />
                            {errors.matchId && (
                                <p className="text-red-500 text-sm">{errors.matchId.message}</p>
                            )}
                            <label htmlFor="report">Report:</label>
                            <textarea
                                {...register("report", { required: true, maxLength: maxLength })}
                                id="report"
                                name="report"
                                rows={4}
                                className="p-2 border rounded w-full"
                                maxLength={maxLength}
                                placeholder="Describe the issue..."
                            ></textarea>
                            {errors.report?.type === "required" && <p className="text-red-500">Report is required</p>}
                            {errors.report?.type === "maxLength" && <p className="text-red-500">Report must be under {maxLength} characters</p>}

                            <p className="text-gray-500 text-sm mt-1">{maxLength - reportText.length} characters left</p>

                            <Button type="submit" className="mt-4">
                                Submit Report
                            </Button>
                        </form>
                    </ModalDescription>

                    <div className="mt-4 flex justify-end">
                        <ModalClose
                            className="bg-red-600 text-white px-4 py-2 rounded"
                            onClick={() => setOpenModal(null)}
                        >
                            Close
                        </ModalClose>
                    </div>
                </ModalContent>
            </Modal>
        </>
    )
}