export function readKey(env: Record<string, string | undefined>, keyVar: string): string | undefined {
  const value = env[keyVar]?.trim();
  return value || undefined;
}

export function maskKey(key: string): string {
  return (key.length < 4 ? "" : key.slice(0, 4)) + "...";
}
