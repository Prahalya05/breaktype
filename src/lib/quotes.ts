export const MOTIVATIONAL_QUOTES: readonly string[] = [
  "You can do it — one word at a time.",
  "Small breaks, steady gains. Keep going.",
  "Every keystroke is practice for the real thing.",
  "Five minutes well spent beats five minutes doomscrolled.",
  "Your fingers are learning even when your mind is resting.",
  "Progress, not perfection. Type on.",
  "Back to DSA in a bit — but first, warm up those fingers.",
  "Consistency beats intensity. You're building a habit.",
  "You showed up. That's most of the battle.",
  "Slow is smooth, smooth is fast.",
  "Mistakes are just data. Learn and move on.",
  "This break counts as practice too.",
  "You're faster today than you were yesterday.",
  "Breathe. Type. Repeat.",
  "Great things are built one small session at a time.",
  "Your future self will thank you for this rep.",
  "Focus on accuracy — speed follows.",
  "You've got this — the keyboard doesn't stand a chance.",
  "A calm mind types cleaner.",
  "Momentum matters more than motivation. Just start.",
  "Every pro was once a beginner mashing the wrong keys.",
  "Take pride in the boring reps — they add up.",
  "Your hands know more than you think. Trust them.",
  "Recharge, then get back to it stronger.",
  "This is your break — enjoy the flow.",
  "Typing well is a superpower nobody notices until you have it.",
  "Keep your wrists loose, your mind looser.",
  "You're one session closer to your personal best.",
  "Discipline in small things builds discipline in big things.",
  "Even champions warm up. This is your warm-up.",
  "Nice pace — keep that rhythm going.",
  "The best time to improve was yesterday. The next best time is now.",
  "You're not just typing — you're training focus.",
  "A short, sharp break beats a long, scattered one.",
  "Trust the process. The numbers will follow.",
  "Good habits are just small wins repeated daily.",
  "You're building muscle memory that lasts a lifetime.",
  "Stay loose. Stay sharp. Stay kind to yourself.",
  "Every typo taught you something. Onward.",
  "You showed up for yourself today. That matters.",
] as const

export function pickRandomQuote(exclude?: string): string {
  if (MOTIVATIONAL_QUOTES.length === 1) return MOTIVATIONAL_QUOTES[0]
  let next: string
  do {
    next = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  } while (next === exclude)
  return next
}
