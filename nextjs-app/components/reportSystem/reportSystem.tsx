import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Modal, ModalClose, ModalContent, ModalDescription, ModalHeader, ModalTrigger } from "../ui/modal";
import { useState } from "react";

export interface ReportSystem {
    userSteamId: string,
    discordId?: string
}
interface ReportsFormValues {
    type: string;
    matchId?: string;
    report: string
}
// Uzece steamId/userId da znamo ko je koga reportao
export default function ReportSystem({ userSteamId, discordId }: ReportSystem) {
    const [openModal, setOpenModal] = useState<number | null>(null);
    const {
        handleSubmit,
        register,
        reset,
        watch,
        formState: { errors },
    } = useForm<ReportsFormValues>({
        defaultValues: {
            type: "grief",
            matchId: "",
            report: "",
        },
    });
    const handleReport = () => {
        setOpenModal(null)
    }

    const maxLength = 256;
    const reportText = watch("report", "");
    //reportSystem
    // type 
    // matchId
    // userReason
    // reviewed 
    return (
        <>
            <Modal
                open={openModal === Number(discordId)}
                onOpenChange={(isOpen) =>
                    isOpen ? setOpenModal(Number(discordId)) : setOpenModal(null)
                }
            >
                <ModalTrigger className="bg-red-500 hover:bg-red-600 text-black px-4 py-2 rounded font-bold flex items-center gap-2" onClick={() => setOpenModal(Number(discordId))}>
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
                                >
                                    <option value="grief">Grief</option>
                                    <option value="bb">Bad Behaviour</option>
                                </select>
                                {errors.type && <p className="text-red-500">Type is required</p>}
                            </div>

                            <input
                                {...register("matchId")}
                                type="text"
                                name="matchId"
                                placeholder="Match ID (optional)"
                                className="p-2 border rounded w-full mb-2"
                            />

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