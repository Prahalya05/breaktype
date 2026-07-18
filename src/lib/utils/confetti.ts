import confetti from 'canvas-confetti'

export function triggerPBConfetti(): void {
  confetti({
    particleCount: 120,
    spread: 75,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: ['#f4c95d', '#ffd873', '#6fd18f', '#e4e6ef'],
  })
}
