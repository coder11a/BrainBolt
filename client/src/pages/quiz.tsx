import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuizNextResponse, SubmitAnswerResponse } from "@shared/schema";
import { Zap, Flame, Target, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";

function DifficultyBar({ difficulty }: { difficulty: number }) {
  const maxDifficulty = 10;
  const pct = (difficulty / maxDifficulty) * 100;
  const color =
    difficulty <= 3 ? "bg-chart-2" : difficulty <= 6 ? "bg-chart-4" : "bg-destructive";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Difficulty</span>
        <span className="font-mono font-medium">{Math.round(difficulty * 10) / 10}/10</span>
      </div>
      <div className="h-2 rounded-md bg-muted overflow-hidden">
        <div
          className={`h-full rounded-md transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StreakDisplay({ streak }: { streak: number }) {
  const multiplier = Math.min(1 + streak * 0.1, 3);
  return (
    <div className="flex items-center gap-2">
      <Flame className={`w-4 h-4 ${streak > 0 ? "text-chart-4" : "text-muted-foreground"}`} />
      <div>
        <div className="text-sm font-medium text-foreground">{streak}</div>
        <div className="text-[10px] text-muted-foreground">x{multiplier.toFixed(1)}</div>
      </div>
    </div>
  );
}

type FeedbackState = {
  correct: boolean;
  correctAnswer: number;
  scoreDelta: number;
} | null;

export default function QuizPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [animateIn, setAnimateIn] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(0);
  const prevQuestionIdRef = useRef<string | null>(null);

  const {
    data: question,
    isLoading: loadingQuestion,
    refetch: fetchNextQuestion,
  } = useQuery<QuizNextResponse>({
    queryKey: ["/api/quiz/next"],
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { questionId: string; answer: number; sessionId: string; stateVersion: number; answerIdempotencyKey: string }) => {
      const res = await apiRequest("POST", "/api/quiz/answer", data);
      return (await res.json()) as SubmitAnswerResponse;
    },
    onSuccess: (data) => {
      setFeedback({
        correct: data.correct,
        correctAnswer: data.correctAnswer,
        scoreDelta: data.scoreDelta,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quiz/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/score"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/streak"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({ title: "Session expired", description: "Please sign in again", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSelect = useCallback(
    (index: number) => {
      if (feedback || submitMutation.isPending) return;
      setSelectedAnswer(index);
    },
    [feedback, submitMutation.isPending]
  );

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || !question) return;
    submitMutation.mutate({
      questionId: question.questionId,
      answer: selectedAnswer,
      sessionId: question.sessionId,
      stateVersion: question.stateVersion,
      answerIdempotencyKey: `${question.questionId}-${Date.now()}`,
    });
  }, [selectedAnswer, question, submitMutation]);

  const handleNext = useCallback(() => {
    setSelectedAnswer(null);
    setFeedback(null);
    setAnimateIn(false);
    setTimeout(() => {
      fetchNextQuestion();
      setAnimateIn(true);
    }, 100);
  }, [fetchNextQuestion]);

  useEffect(() => {
    setAnimateIn(true);
  }, [question?.questionId]);

  useEffect(() => {
    if (!question?.questionId) return;
    if (!prevQuestionIdRef.current) {
      setQuestionNumber(1);
      prevQuestionIdRef.current = question.questionId;
      return;
    }
    if (prevQuestionIdRef.current !== question.questionId) {
      setQuestionNumber((n) => (n > 0 ? n + 1 : 1));
      prevQuestionIdRef.current = question.questionId;
    }
  }, [question?.questionId]);

  useEffect(() => {
    if (!question) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;

      const key = e.key.toLowerCase();
      const keyToIndex: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };

      if (key in keyToIndex) {
        const idx = keyToIndex[key];
        if (idx < question.choices.length) {
          e.preventDefault();
          handleSelect(idx);
        }
        return;
      }

      if (key === "enter") {
        if (feedback) {
          e.preventDefault();
          handleNext();
          return;
        }
        if (selectedAnswer !== null && !submitMutation.isPending) {
          e.preventDefault();
          handleSubmit();
        }
      }

      if (key === "escape") {
        if (!feedback && !submitMutation.isPending) {
          setSelectedAnswer(null);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [question, feedback, selectedAnswer, submitMutation.isPending, handleSelect, handleNext, handleSubmit]);

  if (loadingQuestion) {
    return (
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/10" />
          <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-48 left-[-10rem] h-[26rem] w-[52rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-48 right-[-12rem] h-[28rem] w-[56rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)]" />
        </div>

        <div className="max-w-3xl mx-auto p-4 sm:p-6 py-8 sm:py-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Card className="p-6 space-y-4 rounded-2xl bg-background/60 backdrop-blur-xl border-border/60 shadow-xl shadow-primary/10">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="relative isolate min-h-screen flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/10" />
          <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-48 left-[-10rem] h-[26rem] w-[52rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-48 right-[-12rem] h-[28rem] w-[56rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)]" />
        </div>

        <Card className="w-full max-w-md mx-4 p-6 text-center space-y-3 rounded-2xl bg-background/60 backdrop-blur-xl border-border/60 shadow-xl shadow-primary/10">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No questions available</p>
          <Button onClick={() => fetchNextQuestion()} data-testid="button-retry">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const getChoiceStyle = (index: number) => {
    if (!feedback) {
      if (selectedAnswer === index) {
        return "border-primary bg-primary/5 ring-1 ring-primary/20";
      }
      return "border-border hover-elevate cursor-pointer";
    }

    if (index === feedback.correctAnswer) {
      return "border-chart-2 bg-chart-2/10";
    }
    if (selectedAnswer === index && !feedback.correct) {
      return "border-destructive bg-destructive/10";
    }
    return "border-border opacity-50";
  };

  return (
    <div className="relative isolate min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-3/10" />
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-48 left-[-10rem] h-[26rem] w-[52rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-48 right-[-12rem] h-[28rem] w-[56rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_55%)]" />
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 py-8 sm:py-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-chart-3/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Quick Quiz</h1>
                <p className="text-xs text-muted-foreground">Use A-D to choose. Enter to submit.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="text-category">{question.tags[0]}</Badge>
            {questionNumber > 0 ? (
              <Badge variant="outline" className="font-mono text-xs">
                Q{questionNumber}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/60 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Score</span>
              </div>
              <span className="text-sm font-mono font-semibold text-foreground" data-testid="text-score">
                {Math.round(question.currentScore).toLocaleString()}
              </span>
            </div>
            <div className="mt-2">
              <StreakDisplay streak={question.currentStreak} />
            </div>
          </Card>

          <Card className="p-4 space-y-2 bg-background/60 backdrop-blur-xl border-border/60 shadow-lg shadow-primary/5">
            <DifficultyBar difficulty={question.currentDifficulty} />
          </Card>
        </div>

        <Card
          className={`p-5 sm:p-6 space-y-5 transition-all duration-300 rounded-2xl bg-background/60 backdrop-blur-xl border-border/60 shadow-xl shadow-primary/10 ${
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <p className="text-lg font-medium text-foreground leading-relaxed" data-testid="text-question">
            {question.prompt}
          </p>

          <div className="space-y-2.5">
            {question.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={!!feedback}
                data-testid={`button-choice-${i}`}
                className={`group w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 flex items-center gap-3 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background/40 backdrop-blur ${getChoiceStyle(i)}`}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-md border border-border flex items-center justify-center text-xs font-mono font-semibold text-muted-foreground bg-background group-hover:bg-muted/40 transition-colors">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-foreground leading-snug">{choice}</span>
                {feedback && i === feedback.correctAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-chart-2 flex-shrink-0" />
                )}
                {feedback && selectedAnswer === i && !feedback.correct && (
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {feedback && (
            <div
              className={`px-4 py-3 rounded-md text-sm border ${
                feedback.correct
                  ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
              data-testid="text-feedback"
            >
              <div className="flex items-center gap-3">
                {feedback.correct ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-medium">
                  {feedback.correct ? "Correct!" : "Incorrect"}
                </span>
                <span className="ml-auto font-mono text-xs">
                  {feedback.scoreDelta > 0 ? "+" : ""}
                  {Math.round(feedback.scoreDelta)} pts
                </span>
              </div>
              {!feedback.correct ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  Correct answer: <span className="font-medium text-foreground">{question.choices[feedback.correctAnswer]}</span>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            {!feedback ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null || submitMutation.isPending}
                data-testid="button-submit-answer"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Submit
              </Button>
            ) : (
              <Button onClick={handleNext} data-testid="button-next-question">
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Brain(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}
