import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Gamepad2, BookOpen, Gift, Newspaper } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import logoTikjogos from "@assets/logo tikjogos_1764616571363.png";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: "/", label: "Início", icon: <Home className="w-5 h-5" /> },
  { href: "/blog", label: "Blog", icon: <Newspaper className="w-5 h-5" /> },
  { href: "/comojogar", label: "Como Jogar", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/outros-jogos", label: "Outros Jogos", icon: <Gamepad2 className="w-5 h-5" /> },
  { href: "/doacoes", label: "Apoie", icon: <Gift className="w-5 h-5" /> },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="bg-[#242642]/90 backdrop-blur-sm border-b border-[#2f3252] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center cursor-pointer">
          <img src={logoTikjogos} alt="TikJogos" className="h-8" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${
                location === item.href
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#2f3252]"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] bg-[#1a1b2e] border-r border-[#2f3252] p-0"
          >
            <SheetHeader className="p-6 border-b border-[#2f3252]">
              <SheetTitle className="flex items-center gap-3">
                <img src={logoTikjogos} alt="TikJogos" className="h-8" />
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-6 py-4 text-base font-semibold transition-colors ${
                    location === item.href
                      ? "bg-purple-600/20 text-purple-400 border-l-4 border-purple-500"
                      : "text-slate-300 hover:bg-[#242642] hover:text-white border-l-4 border-transparent"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#2f3252]">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-bold">
                Siga-nos
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://discord.gg/tikjogos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white hover:brightness-110 transition-all"
                >
                  <SiDiscord className="w-5 h-5" />
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default MobileNav;
