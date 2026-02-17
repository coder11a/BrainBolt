import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { UserMetrics } from "@shared/schema";
import { Target, Flame, Trophy, BarChart3, CheckCircle2, Hash, TrendingUp, XCircle } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor,
  testId,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  iconColor: string;
  testId: string;
}) {
  return (
    <Card className="p-4 space-y-2 hover-elevate active-elevate-2 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
          <p className="text-2xl font-bold font-mono text-foreground" data-testid={testId}>{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </Card>
  );
}

export default function MetricsPage() {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery<UserMetrics>({
    queryKey: ["/api/quiz/metrics"],
    enabled: !!user,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No metrics available yet. Start playing!</p>
        </div>
      </div>
    );
  }

  const accuracyPct = Math.round(metrics.accuracy * 100);
  const difficultyPct = (metrics.currentDifficulty / 10) * 100;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 right-[-8rem] h-72 w-[44rem] rounded-full bg-chart-2/10 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight" data-testid="text-metrics-title">Your Stats</h1>
              <p className="text-xs text-muted-foreground">Live updates every 5 seconds</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Accuracy {accuracyPct}%</Badge>
            <Badge variant="outline" className="text-xs font-mono">Lvl {Math.round(metrics.currentDifficulty * 10) / 10}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Trophy}
          label="Total Score"
          value={Math.round(metrics.totalScore).toLocaleString()}
          iconColor="bg-chart-4/10 text-chart-4 border-chart-4/20"
          testId="text-total-score"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={metrics.streak}
          subtext={`Best: ${metrics.maxStreak}`}
          iconColor="bg-chart-5/10 text-chart-5 border-chart-5/20"
          testId="text-current-streak"
        />
        <StatCard
          icon={CheckCircle2}
          label="Accuracy"
          value={`${accuracyPct}%`}
          subtext={`${metrics.totalCorrect}/${metrics.totalAnswered} correct`}
          iconColor="bg-chart-2/10 text-chart-2 border-chart-2/20"
          testId="text-accuracy"
        />
        <StatCard
          icon={Hash}
          label="Questions"
          value={metrics.totalAnswered}
          iconColor="bg-primary/10 text-primary border-primary/20"
          testId="text-total-answered"
        />
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Performance Overview</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="w-3.5 h-3.5" />
              <span>Momentum</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-mono font-medium text-foreground">{accuracyPct}%</span>
              </div>
              <Progress value={accuracyPct} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Difficulty Level</span>
                <span className="font-mono font-medium text-foreground">
                  {Math.round(metrics.currentDifficulty * 10) / 10}/10
                </span>
              </div>
              <Progress value={difficultyPct} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Streak Progress</span>
                <span className="font-mono font-medium text-foreground">
                  {metrics.streak}/{metrics.maxStreak || 1}
                </span>
              </div>
              <Progress
                value={metrics.maxStreak > 0 ? (metrics.streak / metrics.maxStreak) * 100 : 0}
                className="h-2"
              />
            </div>
          </div>
        </Card>

        {metrics.difficultyHistogram.length > 0 && (
          <Card className="p-5 space-y-4" data-testid="card-difficulty-histogram">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Difficulty Distribution</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">Last 100</Badge>
            </div>
            <div className="space-y-2">
              {metrics.difficultyHistogram.map((entry) => {
                const maxCount = Math.max(...metrics.difficultyHistogram.map(e => e.count));
                const barPct = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
                return (
                  <div key={entry.difficulty} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono w-12">Lvl {entry.difficulty}</span>
                    <div className="flex-1 h-4 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-md transition-all"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-foreground w-8 text-right">{entry.count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {metrics.recentPerformance.length > 0 && (
          <Card className="p-5 space-y-4" data-testid="card-recent-performance">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent Answers</h2>
              <Badge variant="outline" className="text-[10px] font-mono">10 latest</Badge>
            </div>
            <div className="space-y-2">
              {metrics.recentPerformance.slice(0, 10).map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    {entry.correct ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-chart-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                    )}
                    <Badge variant="secondary" className="text-[10px]">Lvl {entry.difficulty}</Badge>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {entry.scoreDelta > 0 ? "+" : ""}{Math.round(entry.scoreDelta)} pts
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
