import type { ReactNode } from "react";
import { ArrowLeft, Crown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import character1 from "@assets/character (1).png";
import character2 from "@assets/character (2).png";
import character3 from "@assets/character (3).png";
import character4 from "@assets/character (4).png";
import character5 from "@assets/character (5).png";
import character6 from "@assets/character (6).png";
import character7 from "@assets/character (7).png";
import character8 from "@assets/character (8).png";
import character9 from "@assets/character (9).png";
import character10 from "@assets/character (10).png";

const characters = [character1, character2, character3, character4, character5, character6, character7, character8, character9, character10];

export type IdentityPlayer = {
  uid: string;
  name: string;
  connected?: boolean;
  characterIndex?: number;
  score?: number;
  vidas?: number;
  ordem?: number;
  finished?: boolean;
};

export function GameIdentityAvatar({ player, index, className }: { player: IdentityPlayer; index: number; className?: string }) {
  const characterIndex = player.characterIndex ?? index;
  return <div className={cn("relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950/80", className)}><div className="absolute inset-x-2 bottom-1 h-3 rounded-full bg-violet-400/30 blur-sm"/><img src={characters[Math.abs(characterIndex) % characters.length]} alt={`Personagem de ${player.name}`} className="absolute left-1/2 top-0 h-[150%] w-auto max-w-none -translate-x-1/2 object-contain" draggable={false}/></div>;
}

export function GameIdentityCharacterPicker({ selectedIndex, takenIndexes, onSelect }: { selectedIndex: number; takenIndexes: number[]; onSelect: (index: number) => void }) {
  return <div className="grid grid-cols-5 gap-2">{characters.map((character,index)=>{const selected=selectedIndex===index;const taken=takenIndexes.includes(index);return <button type="button" key={character} onClick={()=>!taken&&onSelect(index)} disabled={taken} aria-label={`Escolher personagem ${index+1}`} className={cn("relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-950/80 transition",selected?"border-violet-400 shadow-[0_0_18px_rgba(139,92,246,.45)]":taken?"cursor-not-allowed border-white/5 grayscale opacity-25":"border-white/10 hover:border-violet-400/60")}><img src={character} alt="" className="absolute left-1/2 top-0 h-[155%] w-auto max-w-none -translate-x-1/2 object-contain" draggable={false}/>{selected&&<span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-violet-500 text-[11px] font-black text-white">✓</span>}{taken&&<span className="absolute inset-x-1 bottom-1 rounded bg-slate-950/85 px-1 py-0.5 text-[7px] font-black uppercase text-slate-400">Ocupado</span>}</button>})}</div>;
}

export function GameIdentityPlayers({ players, userId, hostId, detail, header, footer, className }: { players: IdentityPlayer[]; userId?: string; hostId?: string; detail?: (player: IdentityPlayer, index: number) => ReactNode; header?: ReactNode; footer?: ReactNode; className?: string }) {
  return <aside className={cn("tj-surface flex min-w-0 w-full flex-col overflow-hidden p-3 sm:p-5", className)}>{header&&<div className="mb-5 border-b border-slate-700/60 pb-4">{header}</div>}<div className="flex items-center justify-between px-1"><h2 className="text-sm font-black uppercase tracking-[.14em] text-slate-300">Jogadores</h2><span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">{players.length} / 10</span></div><div className="mt-4 space-y-2.5">{players.map((player,index)=>{const me=player.uid===userId;const host=player.uid===hostId;return <article key={player.uid} className={cn("tj-player-card flex min-w-0 items-center gap-3 p-3",me&&"is-current")}><GameIdentityAvatar player={player} index={index} className="h-12 w-12 sm:h-14 sm:w-14"/><div className="min-w-0 flex-1">{host&&<span className="mb-1 inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-violet-300"><Crown className="h-3 w-3"/> Capitão da sala</span>}<div className="flex items-center gap-2"><strong className="truncate text-sm text-white">{player.name}</strong>{me&&<span className="rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-black uppercase">Você</span>}</div>{detail?.(player,index)}</div><span className={cn("h-3 w-3 rounded-full",player.connected===false?"bg-slate-600":"bg-emerald-400 text-emerald-400 shadow-[0_0_12px_currentColor]")}/></article>})}</div>{footer&&<div className="mt-5 border-t border-slate-700/60 pt-4">{footer}</div>}</aside>;
}

export type GameIdentityLayoutProps = {
  players: IdentityPlayer[];
  userId?: string;
  hostId?: string;
  detail?: (player: IdentityPlayer, index: number) => ReactNode;
  children: ReactNode;
  onBackToLobby?: () => void;
  onExit?: () => void;
  sidebarHeader?: ReactNode;
  sidebarFooter?: ReactNode;
  sidebarClassName?: string;
  stageClassName?: string;
  backgroundClassName?: string;
};

export function GameIdentityLayout({ players, userId, hostId, detail, children, onBackToLobby, onExit, sidebarHeader, sidebarFooter, sidebarClassName, stageClassName, backgroundClassName }: GameIdentityLayoutProps) {
  return <div className="relative z-10 w-full max-w-[1480px] px-2 py-2 sm:px-5 sm:py-4 md:py-6"><div className={cn("fixed inset-0 pointer-events-none", backgroundClassName || "bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]")}/><div className="relative grid min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-5 lg:grid-cols-[350px_minmax(0,1fr)]"><div className="order-2 lg:order-1"><GameIdentityPlayers players={players} userId={userId} hostId={hostId} detail={detail} header={sidebarHeader} footer={sidebarFooter} className={sidebarClassName}/></div><main className={cn("tj-surface tj-surface--stage order-1 flex min-h-[560px] min-w-0 flex-col overflow-hidden p-4 sm:p-6 lg:order-2 lg:min-h-[720px] lg:p-8", stageClassName)}>{(onBackToLobby || onExit) && <nav className="mb-4 grid grid-cols-2 gap-2 border-b border-slate-700/60 pb-4 sm:flex sm:justify-end"><button type="button" onClick={onBackToLobby} disabled={!onBackToLobby} className="h-11 rounded-xl border border-slate-700 bg-slate-900 px-4 text-xs font-black text-slate-300 transition hover:border-violet-400/50 hover:text-white disabled:hidden"><ArrowLeft className="mr-2 inline h-4 w-4"/>Voltar ao lobby</button><button type="button" onClick={onExit} disabled={!onExit} className="h-11 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 text-xs font-black text-rose-200 transition hover:bg-rose-500/20 disabled:hidden"><LogOut className="mr-2 inline h-4 w-4"/>Sair para a home</button></nav>}{children}</main></div></div>;
}
