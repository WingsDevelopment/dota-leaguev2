'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react";

interface registerLeague {
    steam_id: number,
    mmr: number
}
export default function VouchRequest() {
    const { data: session } = useSession()
    const { handleSubmit, register, reset, formState: { errors } } = useForm<registerLeague>({
        defaultValues: {
            mmr: 1000,
        }
    });

    const onSubmit = async (data: registerLeague) => {
        try {
            const res = await fetch("api/register-players/register-players-update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    steam_id: data.steam_id, 
                    mmr: data.mmr,
                    name:session?.user?.name,
                    discord_id:session?.user?.id })
            })
            if (!res.ok) {
                throw new Error("Could not register the player")
            }
            reset()
        } catch (error) {

        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Steam ID</CardTitle>
                    <CardDescription>
                        <input
                            {...register("steam_id", {
                                required: "Steam ID is required!",
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: "Steam ID must contain only numbers!"
                                },
                                maxLength: {
                                    value: 17,
                                    message: "Steam ID cannot exceed 17 characters!"
                                }
                            })}
                            type="text"
                        />
                    </CardDescription>
                    {errors.steam_id && <p className="text-red-500 text-sm">{errors.steam_id.message}</p>}
                    <CardTitle>Dota MMR</CardTitle>
                    <CardDescription>
                        <input
                            {...register("mmr", {
                                required: "MMR is required!",
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: "MMR must contain only numbers!"
                                },
                                maxLength: {
                                    value: 6,
                                    message: "MMR cannot exceed 6 characters!"
                                }
                            })}
                            type="text"
                        />
                    </CardDescription>
                    {errors.mmr && <p className="text-red-500 text-sm">{errors.mmr.message}</p>}
                    <CardDescription>
                        <button type='submit'>Register</button>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">Register for the Rade Komsa League</p>
                </CardContent>
            </Card>
        </form>
    )
}

