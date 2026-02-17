import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
type LeaderboardScoreRow = { userId: string; totalScore: number; updatedAt: string | null; displayName: string | null; profileImage: string | null };
type LeaderboardStreakRow = { userId: string; maxStreak: number; updatedAt: string | null; displayName: string | null; profileImage: string | null };
import { Trophy, Flame, Medal } from "lucide-react";

function getRankStyle(rank: number) {
  if (rank === 1) return "text-chart-4";
  if (rank === 2) return "text-muted-foreground";
  if (rank === 3) return "text-chart-4/70";
  return "text-muted-foreground";
}

function getRankIcon(rank: number) {
  if (rank <= 3) {
    return <Medal className={`w-4 h-4 ${getRankStyle(rank)}`} />;
  }
  return <span className="text-xs text-muted-foreground font-mono w-4 text-center">{rank}</span>;
}

function ScoreRow({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardScoreRow;
  rank: number;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all hover-elevate active-elevate-2 ${
        isCurrentUser ? "bg-primary/5 ring-1 ring-primary/20" : ""
      }`}
      data-testid={`row-score-${rank}`}
    >
      <div className="w-6 flex items-center justify-center">{getRankIcon(rank)}</div>
      <Avatar className="w-8 h-8">
        <AvatarImage src={entry.profileImage || undefined} />
        <AvatarFallback className="text-xs">
          {(entry.displayName || "?")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {entry.displayName || "Anonymous"}
          {isCurrentUser && (
            <Badge variant="secondary" className="ml-2 text-[10px]">You</Badge>
          )}
        </p>
      </div>
      <span className="text-sm font-mono font-medium text-foreground" data-testid={`text-leaderboard-score-${rank}`}>
        {Math.round(entry.totalScore).toLocaleString()}
      </span>
    </div>
  );
}

function StreakRow({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: LeaderboardStreakRow;
  rank: number;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all hover-elevate active-elevate-2 ${
        isCurrentUser ? "bg-primary/5 ring-1 ring-primary/20" : ""
      }`}
      data-testid={`row-streak-${rank}`}
    >
      <div className="w-6 flex items-center justify-center">{getRankIcon(rank)}</div>
      <Avatar className="w-8 h-8">
        <AvatarImage src={entry.profileImage || undefined} />
        <AvatarFallback className="text-xs">
          {(entry.displayName || "?")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {entry.displayName || "Anonymous"}
          {isCurrentUser && (
            <Badge variant="secondary" className="ml-2 text-[10px]">You</Badge>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Flame className="w-3.5 h-3.5 text-chart-4" />
        <span className="text-sm font-mono font-medium text-foreground" data-testid={`text-leaderboard-streak-${rank}`}>
          {entry.maxStreak}
        </span>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-6 h-4" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();

  const { data: scoreBoard, isLoading: loadingScores } = useQuery<LeaderboardScoreRow[]>({
    queryKey: ["/api/leaderboard/score"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const { data: streakBoard, isLoading: loadingStreaks } = useQuery<LeaderboardStreakRow[]>({
    queryKey: ["/api/leaderboard/streak"],
    enabled: !!user,
    refetchInterval: 10000,
  });

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-chart-4/10 blur-3xl" />
        <div className="absolute -bottom-28 right-[-8rem] h-72 w-[44rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-chart-4/10 text-chart-4 flex items-center justify-center border border-chart-4/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight" data-testid="text-leaderboard-title">Leaderboard</h1>
              <p className="text-xs text-muted-foreground">Updated every 10 seconds</p>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs">
            Compete with the community
          </Badge>
        </div>

        <Tabs defaultValue="score">
          <TabsList className="w-full">
            <TabsTrigger value="score" className="flex-1" data-testid="tab-score">
              <Trophy className="w-3.5 h-3.5 mr-1.5" />
              Top Score
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex-1" data-testid="tab-streak">
              <Flame className="w-3.5 h-3.5 mr-1.5" />
              Best Streak
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <Card className="p-2 sm:p-3">
              {loadingScores ? (
                <LeaderboardSkeleton />
              ) : !scoreBoard?.length ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No scores yet. Be the first to play!
                </div>
              ) : (
                <div className="space-y-0.5">
                  {scoreBoard.map((entry, i) => (
                    <ScoreRow
                      key={entry.userId}
                      entry={entry}
                      rank={i + 1}
                      isCurrentUser={entry.userId === user?.id}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="streak">
            <Card className="p-2 sm:p-3">
              {loadingStreaks ? (
                <LeaderboardSkeleton />
              ) : !streakBoard?.length ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No streaks yet. Start playing to compete!
                </div>
              ) : (
                <div className="space-y-0.5">
                  {streakBoard.map((entry, i) => (
                    <StreakRow
                      key={entry.userId}
                      entry={entry}
                      rank={i + 1}
                      isCurrentUser={entry.userId === user?.id}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
