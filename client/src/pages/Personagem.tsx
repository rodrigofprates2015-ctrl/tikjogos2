import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Camera,
  Check,
  Copy,
  Gamepad2,
  Heart,
  ImagePlus,
  Instagram,
  Loader2,
  Send,
  Trophy,
  Upload,
  UserRound,
} from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import logoTikjogos from "@assets/logo_nova_tikjogos (1).png";
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
import lobbyPodium from "@assets/podio.png";

type PaymentState = {
  status: "idle" | "loading" | "awaiting_payment" | "success" | "error";
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  error?: string;
};

const characterImages = [
  character1,
  character2,
  character3,
  character4,
  character5,
  character6,
  character7,
  character8,
  character9,
  character10,
];

const benefits = [
  { icon: UserRound, title: "Avatar permanente", text: "Seu personagem fica salvo para entrar nas partidas." },
  { icon: Trophy, title: "Destaque no lobby", text: "Apareca com uma skin exclusiva entre os jogadores." },
  { icon: Gamepad2, title: "Dentro do TikJogos", text: "A skin entra no estilo visual oficial do site." },
  { icon: Heart, title: "Apoia o projeto", text: "Ajuda a manter o jogo online e evoluindo." },
];

const steps = [
  { icon: Camera, title: "Envie sua foto ou @", text: "Use uma foto sua ou informe seu Instagram para eu escolher uma referencia." },
  { icon: Send, title: "Conte sobre seus hobbies", text: "Futebol, games, profissao, estilo de roupa e detalhes que combinam com voce." },
  { icon: Gamepad2, title: "Entre como personagem", text: "Depois da criacao manual, eu publico a skin no site para voce usar." },
];

export default function Personagem() {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [about, setAbout] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [payment, setPayment] = useState<PaymentState>({ status: "idle" });

  const heroCharacter = useMemo(() => characterImages[1], []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Torne-se um Personagem Oficial - TikJogos";

    const desc = "Crie seu personagem personalizado no TikJogos por R$ 5. Envie sua foto ou Instagram e entre nas partidas com uma skin exclusiva.";
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", desc);
  }, []);

  useEffect(() => {
    if (payment.status !== "awaiting_payment" || !payment.paymentId) return;

    let isActive = true;
    const intervalId = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/donations/status/${payment.paymentId}`);
        if (!res.ok || !isActive) return;
        const data = await res.json();
        if (data.status === "approved") {
          window.clearInterval(intervalId);
          setPayment(prev => ({ ...prev, status: "success" }));
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento do personagem:", error);
      }
    }, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [payment.status, payment.paymentId]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyPixCode = () => {
    if (!payment.qrCode) return;
    navigator.clipboard.writeText(payment.qrCode);
    toast({ title: "PIX copiado", description: "Codigo copia e cola enviado para a area de transferencia." });
  };

  const handleCreateCharacter = async () => {
    if (!name.trim()) {
      toast({ title: "Digite seu nome", description: "Esse nome sera usado para identificar seu pedido.", variant: "destructive" });
      return;
    }

    if (!instagram.trim() && !photoName) {
      toast({ title: "Envie uma referencia", description: "Anexe uma foto ou informe seu @ do Instagram.", variant: "destructive" });
      return;
    }

    if (about.trim().length < 12) {
      toast({ title: "Conte um pouco mais", description: "Escreva seus hobbies, estilo ou detalhes para a skin ficar com a sua cara.", variant: "destructive" });
      return;
    }

    setPayment({ status: "loading" });

    try {
      const message = [
        "PERSONAGEM PERSONALIZADO",
        `Nome: ${name.trim()}`,
        `Instagram: ${instagram.trim() || "nao informado"}`,
        `Foto anexada na pagina: ${photoName || "nao"}`,
        `Descricao: ${about.trim()}`,
      ].join("\n");

      const res = await fetch("/api/donations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: name.trim(),
          message,
          amount: 5,
          skinRequest: {
            name: name.trim(),
            instagram: instagram.trim() || undefined,
            about: about.trim(),
            photoName: photoName || undefined,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha ao criar pagamento");
      }

      const data = await res.json();
      setPayment({
        status: "awaiting_payment",
        paymentId: String(data.paymentId),
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
      });
    } catch (error: any) {
      setPayment({ status: "error", error: error.message });
      toast({ title: "Erro no pagamento", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090d1a] text-white">
      <MobileNav />

      <main className="overflow-hidden">
        <section className="relative border-b border-white/10 bg-[radial-gradient(circle_at_75%_35%,rgba(124,58,237,0.24),transparent_34%),linear-gradient(135deg,#10172a_0%,#080b16_52%,#0f172a_100%)]">
          <div className="mx-auto grid min-h-[620px] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="pt-14 md:pt-10">
              <Link
                href="/"
                className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/55 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-200 hover:border-amber-300/40 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o lobby
              </Link>

              <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-amber-300">
                Torne-se um personagem
              </p>
              <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Personagem oficial do <span className="text-amber-300">TikJogos</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg">
                Sua foto vira um personagem exclusivo no estilo do jogo. Voce apoia o projeto e entra nas partidas com uma skin feita manualmente para voce.
              </p>

              <div className="mt-6 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
                      <Icon className="mb-2 h-5 w-5 text-amber-300" />
                      <p className="text-xs font-black text-white">{benefit.title}</p>
                      <p className="mt-1 text-[11px] leading-snug text-slate-400">{benefit.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={scrollToForm}
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-amber-300 px-6 text-base font-black text-slate-950 shadow-[0_8px_0_rgba(146,64,14,0.65)] transition hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-1 active:shadow-none"
                >
                  Criar meu personagem por R$ 5
                </button>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[420px] items-end justify-center pb-2 lg:max-w-[500px]">
              <div className="absolute bottom-10 h-16 w-[78%] rounded-full bg-violet-500/35 blur-2xl" />
              <img
                src={lobbyPodium}
                alt=""
                className="absolute bottom-0 z-0 w-[82%] max-w-[360px] object-contain drop-shadow-[0_12px_28px_rgba(56,189,248,0.22)]"
                draggable={false}
              />
              <img
                src={heroCharacter}
                alt="Personagem TikJogos personalizado"
                className="relative z-10 h-[430px] w-auto max-w-full object-contain drop-shadow-[0_28px_32px_rgba(0,0,0,0.55)] sm:h-[520px]"
                draggable={false}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#111827] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-sky-300">Como funciona</p>
              <h2 className="mt-2 text-3xl font-black uppercase text-white md:text-5xl">3 passos para virar personagem</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative rounded-2xl border border-white/10 bg-slate-950/45 p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="text-4xl font-black text-white/10">{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={formRef} className="bg-[#0b1020] py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-300">Formulario de criacao</p>
              <h2 className="mt-2 text-3xl font-black uppercase text-white md:text-5xl">Crie sua skin personalizada</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                Preencha os dados, gere o PIX de R$ 5 e eu crio o personagem manualmente. Depois ele entra no site em um deploy.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
              <div className="flex gap-3 overflow-x-auto p-3">
                {characterImages.map((character, index) => (
                  <div key={character} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    <img
                      src={character}
                      alt={`Exemplo de personagem ${index + 1}`}
                      className="absolute left-1/2 top-0 h-28 w-auto max-w-none -translate-x-1/2 object-contain"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl sm:p-5 md:p-6">
              {payment.status === "awaiting_payment" || payment.status === "success" ? (
                <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
                  <div className={cn(
                    "rounded-2xl border p-4 text-center lg:text-left",
                    payment.status === "success" ? "border-emerald-300/30 bg-emerald-400/10" : "border-amber-300/30 bg-amber-400/10"
                  )}>
                    <h3 className="text-2xl font-black text-white">
                      {payment.status === "success" ? "Pagamento aprovado" : "Pague com PIX"}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {payment.status === "success"
                        ? "Recebi sua solicitacao. Agora a criacao do personagem segue manualmente."
                        : "Depois do pagamento, sua solicitacao fica registrada para criacao manual."}
                    </p>
                  </div>

                  {payment.qrCodeBase64 && payment.status !== "success" && (
                    <img
                      src={`data:image/png;base64,${payment.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="mx-auto h-52 w-52 rounded-2xl bg-white p-3 sm:h-56 sm:w-56"
                    />
                  )}

                  <div className="space-y-3">
                    {payment.qrCode && payment.status !== "success" && (
                      <button
                        onClick={copyPixCode}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-black text-white hover:border-amber-300/40"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar codigo PIX
                      </button>
                    )}

                    {payment.status === "success" && (
                      <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 text-base font-black text-white">
                        <Check className="h-5 w-5" />
                        Pedido recebido
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[minmax(230px,0.8fr)_minmax(0,1fr)_minmax(220px,0.72fr)] lg:items-end">
                  <label className="block min-w-0">
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">Upload da foto</span>
                    <div className="relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-600 bg-slate-950/45 px-4 py-5 text-center transition hover:border-amber-300/40 sm:min-h-40 lg:min-h-[184px]">
                      <ImagePlus className="mb-2 h-8 w-8 text-amber-300" />
                      <span className="text-sm font-black text-white">Clique para anexar uma foto</span>
                      <span className="mt-1 text-xs font-bold text-slate-500">ou preencha o @Instagram abaixo</span>
                      <span className="mt-3 max-w-full truncate rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-slate-300">
                        {photoName || "Nenhum ficheiro selecionado"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(event) => setPhotoName(event.target.files?.[0]?.name || "")}
                      />
                    </div>
                  </label>

                  <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:gap-3">
                    <label className="block min-w-0">
                      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">Nome</span>
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={50}
                        placeholder="Seu nome ou nickname"
                        className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300"
                      />
                    </label>

                    <label className="block min-w-0">
                      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">@Instagram</span>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          value={instagram}
                          onChange={(event) => setInstagram(event.target.value)}
                          maxLength={80}
                          placeholder="@seuinstagram"
                          className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300"
                        />
                      </div>
                    </label>

                    <label className="block min-w-0 sm:col-span-2">
                      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">Conte um pouco sobre voce</span>
                      <textarea
                        value={about}
                        onChange={(event) => setAbout(event.target.value)}
                        maxLength={500}
                        rows={5}
                        placeholder="Gosto de futebol, sou programador, uso moletom preto, quero um personagem sorrindo..."
                        className="min-h-[124px] w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300 lg:min-h-[112px]"
                      />
                    </label>
                  </div>

                  <div className="min-w-0 space-y-3">
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-amber-200">Criacao manual</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        O pagamento registra seu pedido. A foto final e a publicacao da skin sao feitas manualmente.
                      </p>
                    </div>

                    <button
                      onClick={handleCreateCharacter}
                      disabled={payment.status === "loading"}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950 shadow-[0_8px_0_rgba(146,64,14,0.65)] transition hover:-translate-y-0.5 hover:bg-amber-200 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {payment.status === "loading" ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Gerando PIX...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          Criar personagem - R$ 5
                        </>
                      )}
                    </button>

                    {payment.status === "error" && (
                      <p className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                        {payment.error}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center">
            <img src={logoTikjogos} alt="TikJogos" className="h-12 w-auto object-contain" />
          </Link>
          <button
            onClick={scrollToForm}
            className="rounded-xl bg-white px-5 py-3 text-sm font-black uppercase text-slate-950 hover:bg-amber-200"
          >
            Criar minha skin
          </button>
        </div>
      </footer>
    </div>
  );
}
