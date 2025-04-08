"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Image from "next/image";
import { apiCallerCreatePlayers } from "../api/register-players/register-players-create/caller";

interface registerLeague {
  steam_id: number;
  mmr: number;
}
export default function VouchRequest() {
  const { data: session } = useSession();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<registerLeague>({
    defaultValues: {
      mmr: 1000,
    },
  });

  const onSubmit = async (data: registerLeague) => {

    try {
      await apiCallerCreatePlayers({ steam_id: data.steam_id, mmr: data.mmr })
      reset();
      alert("Success, ping admins for approval");
    } catch (error) {
      console.error("failed to vouch.")
      alert("Failed to vouch.")
    }
  };

  if (!session) {
    return (
      <div>
        <h1>You must log in with Discord to request a vouch</h1>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Steam ID</CardTitle>
          <CardDescription>
            <Input
              {...register("steam_id", {
                required: "Steam ID is required!",
                maxLength: {
                  value: 17,
                  message: "Steam ID cannot exceed 17 characters!",
                },
              })}
              type="number"
            />
          </CardDescription>
          {errors.steam_id && (
            <p className="text-red-500 text-sm">{errors.steam_id.message}</p>
          )}
          <CardTitle>Dota MMR</CardTitle>
          <CardDescription>
            <Input
              {...register("mmr", {
                required: "MMR is required!",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "MMR must contain only numbers!",
                },
                maxLength: {
                  value: 6,
                  message: "MMR cannot exceed 6 characters!",
                },
              })}
              type="text"
            />
          </CardDescription>
          {errors.mmr && (
            <p className="text-red-500 text-sm">{errors.mmr.message}</p>
          )}
          <CardDescription>
            <Button type="submit">Register</Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">How do i find my steamd ID? (see image)</p>
          <ul className="mt-4">
            <li>Open your steam client</li>
            <li>Click on the "Account details".</li>
            <li>Copy your steam ID, below the username</li>
          </ul>

          <div className="mt-4">
            <Image
              src="/how-to-find-steam-id.png"
              alt="how to find steam id"
              width={700}
              height={600}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
