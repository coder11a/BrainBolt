import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { Zap, Target, Trophy, Brain, ArrowRight, Moon, Sun, Sparkles, TrendingUp, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage({ onAuth }: { onAuth: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [animatedScore, setAnimatedScore] = useState(2450);
  const [animatedStreak, setAnimatedStreak] = useState(12);

  useEffect(() => {
    const scoreInterval = setInterval(() => {
      setAnimatedScore(prev => prev + Math.floor(Math.random() * 50));
    }, 2000);

    const streakInterval = setInterval(() => {
      setAnimatedStreak(prev => (prev >= 15 ? 12 : prev + 1));
    }, 3000);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(streakInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-3/5 dark:from-primary/10 dark:via-background dark:to-chart-3/10 pointer-events-none" />
      
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-chart-3/20 rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110">
              <Zap className="w-5 h-5 text-primary-foreground animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text" data-testid="text-logo">BrainBolt</span>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle" className="hover:bg-primary/10 transition-colors">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button onClick={onAuth} data-testid="button-login" variant="outline" className="hover:bg-primary/10">Sign In</Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-40">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-chart-3/20 text-primary text-sm font-medium border border-primary/20 shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Adaptive Learning Platform
                </div>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                  Challenge Your
                  <span className="block bg-gradient-to-r from-primary via-chart-3 to-primary bg-clip-text text-transparent animate-in slide-in-from-bottom duration-1000">
                    Mind Endlessly
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                  An infinite quiz platform that adapts to your skill level in real-time. Build streaks, climb leaderboards, and watch your knowledge grow exponentially.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button 
                    size="lg" 
                    onClick={onAuth} 
                    data-testid="button-get-started"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 text-base px-8 py-6"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 text-base px-8 py-6"
                  >
                    Watch Demo
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-chart-2 to-chart-3 animate-pulse" />
                    Free forever
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-chart-2 to-chart-3 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-chart-2 to-chart-3 animate-pulse" style={{ animationDelay: '0.6s' }} />
                    Infinite questions
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-primary">10K+</div>
                    <div className="text-xs text-muted-foreground mt-1">Active Users</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-chart-2/10 to-chart-2/5 border border-chart-2/20 hover:border-chart-2/40 transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-chart-2">50K+</div>
                    <div className="text-xs text-muted-foreground mt-1">Questions</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-chart-4/10 to-chart-4/5 border border-chart-4/20 hover:border-chart-4/40 transition-all duration-300 hover:scale-105">
                    <div className="text-3xl font-bold text-chart-4">99%</div>
                    <div className="text-xs text-muted-foreground mt-1">Satisfaction</div>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block animate-in fade-in slide-in-from-right duration-700">
                <div className="relative rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-8 space-y-6 shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Level 7</span>
                    </div>
                    <span className="text-sm font-bold text-chart-2 bg-chart-2/10 px-3 py-1 rounded-full border border-chart-2/30 animate-pulse">
                      Streak: {animatedStreak}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="font-semibold text-lg text-foreground">What is the time complexity of binary search?</p>
                    <div className="space-y-3">
                      {["O(n)", "O(log n)", "O(n log n)", "O(1)"].map((choice, i) => (
                        <div
                          key={i}
                          className={`px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-300 cursor-pointer ${
                            i === 1
                              ? "border-chart-2 bg-gradient-to-r from-chart-2/20 to-chart-2/10 text-foreground shadow-lg shadow-chart-2/20 scale-105"
                              : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:scale-102"
                          }`}
                        >
                          {choice}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-chart-4" />
                      <span className="text-sm font-semibold text-foreground">Score: {animatedScore.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-chart-2" />
                      <span className="text-sm font-semibold text-foreground">Accuracy: 84%</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 -z-10 blur-xl animate-pulse" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-2xl bg-gradient-to-br from-chart-3/30 to-chart-3/10 -z-10 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 -right-4 w-20 h-20 rounded-full bg-chart-2/20 -z-10 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Brain className="w-4 h-4" />
                Features
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our adaptive engine personalizes every question to keep you in the perfect learning zone, maximizing growth and engagement.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Adaptive Difficulty",
                  description: "Questions dynamically adjust based on your performance, momentum, and streak using a stabilized algorithm.",
                  color: "primary",
                  gradient: "from-primary/20 to-primary/5"
                },
                {
                  icon: Target,
                  title: "Streak Multipliers",
                  description: "Build consecutive correct answers to multiply your score. Higher streaks mean exponentially more points.",
                  color: "chart-2",
                  gradient: "from-chart-2/20 to-chart-2/5"
                },
                {
                  icon: Trophy,
                  title: "Live Leaderboards",
                  description: "Compete in real-time with players worldwide. Track your rank by total score and longest streak.",
                  color: "chart-4",
                  gradient: "from-chart-4/20 to-chart-4/5"
                }
              ].map((feature, i) => (
                <Card 
                  key={i}
                  className={`p-8 space-y-4 border-2 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl ${
                    hoveredCard === i ? 'shadow-xl border-primary/50' : 'border-border/50'
                  }`}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transition-transform duration-300 ${
                    hoveredCard === i ? 'scale-110 rotate-6' : ''
                  }`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-xl text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 bg-gradient-to-b from-muted/20 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-chart-3/10 to-primary/10 border-2 border-primary/20 p-12 sm:p-16 text-center space-y-8 shadow-2xl hover:shadow-primary/20 transition-all duration-500">
              <div className="space-y-4">
                <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
                  Ready to Challenge Yourself?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of learners already improving their knowledge every day.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={onAuth}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 text-lg px-10 py-7"
                >
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  10,000+ users
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  No setup required
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-muted/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">BrainBolt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 BrainBolt. Empowering minds through adaptive learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
