interface MatchHistoryProps {
    params: {
      id: string; // Next.js dynamic params are always strings
    };
  }
export default function MatchHistory({ params }:MatchHistoryProps) {
    return (
        <div>
            <h1>Match ID: {params.id}</h1>
            <p>Details for match {params.id}</p>
        </div>
    )
}