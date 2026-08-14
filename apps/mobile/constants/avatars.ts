// Avatar registry — each avatar gets a name and a two-stop gradient
// so every player badge looks distinct and colorful.

export interface AvatarDef {
  emoji: string;
  name: string;
  gradient: [string, string];
}

export const AVATARS: AvatarDef[] = [
  { emoji: '😎', name: 'Cool Guy', gradient: ['#ff512f', '#dd2476'] },
  { emoji: '🦊', name: 'Foxy', gradient: ['#f7971e', '#ffd200'] },
  { emoji: '🐱', name: 'Kitty', gradient: ['#ec008c', '#fc6767'] },
  { emoji: '🐶', name: 'Pup', gradient: ['#36d1dc', '#5b86e5'] },
  { emoji: '🦁', name: 'Leo', gradient: ['#f5af19', '#f12711'] },
  { emoji: '🐼', name: 'Panda', gradient: ['#11998e', '#38ef7d'] },
  { emoji: '🦄', name: 'Uni', gradient: ['#a18cd1', '#fbc2eb'] },
  { emoji: '🐲', name: 'Drake', gradient: ['#7f00ff', '#e100ff'] },
  { emoji: '👻', name: 'Boo', gradient: ['#8e9eab', '#eef2f3'] },
  { emoji: '🤖', name: 'Botty', gradient: ['#00c6ff', '#0072ff'] },
  { emoji: '🎃', name: 'Spooky', gradient: ['#ff9966', '#ff5e62'] },
  { emoji: '⭐', name: 'Star', gradient: ['#f6d365', '#fda085'] },
];

export const AVATAR_OPTIONS = AVATARS.map((a) => a.emoji);

export function getAvatarGradient(emoji: string): [string, string] {
  const idx = AVATAR_OPTIONS.indexOf(emoji);
  if (idx >= 0) return AVATARS[idx].gradient;
  // Deterministic gradient for custom/bot avatars
  let hash = 0;
  for (let i = 0; i < emoji.length; i++) hash = (hash * 31 + emoji.charCodeAt(i)) >>> 0;
  const palettes: [string, string][] = [
    ['#ff512f', '#dd2476'], ['#f7971e', '#ffd200'], ['#36d1dc', '#5b86e5'],
    ['#11998e', '#38ef7d'], ['#7f00ff', '#e100ff'], ['#f5af19', '#f12711'],
  ];
  return palettes[hash % palettes.length];
}
