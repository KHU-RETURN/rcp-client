export function estimateVmCost(
  serverCreatedAt: string | undefined,
  hourlyRate: number,
  now: number,
) {
  if (!serverCreatedAt || serverCreatedAt.startsWith('0001-')) return null;

  const createdAt = Date.parse(serverCreatedAt);
  if (!Number.isFinite(createdAt) || createdAt > now) return null;

  const elapsedMinutes = Math.floor((now - createdAt) / 60_000);
  const estimatedWon = Math.floor((elapsedMinutes * hourlyRate) / 60);

  return { elapsedMinutes, estimatedWon };
}
