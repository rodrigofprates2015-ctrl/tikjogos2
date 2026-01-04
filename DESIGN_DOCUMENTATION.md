# 📐 Documentação de Design - TikJogos Impostor

## 🎨 Visão Geral do Design System

O design do TikJogos Impostor segue uma estética **moderna e vibrante** com elementos de **jogos espaciais**, utilizando cores saturadas, bordas arredondadas e efeitos de profundidade através de sombras e gradientes.

---

## 🎯 Paleta de Cores

### Cores Principais

```css
/* Background */
--bg-main: #1a1b2e;           /* Fundo principal escuro */
--bg-panel: #242642;          /* Painéis e cards */
--bg-panel-dark: #1e2036;     /* Variação mais escura */

/* Cores de Ação */
--purple: #8b5cf6;            /* Roxo vibrante */
--purple-dark: #6d28d9;       /* Roxo escuro */
--blue: #3b82f6;              /* Azul */
--green: #22c55e;             /* Verde */
--emerald: #10b981;           /* Verde esmeralda */
--yellow: #facc15;            /* Amarelo */
--rose: #f43f5e;              /* Rosa/Vermelho */
--orange: #f97316;            /* Laranja */

/* Tons de Cinza */
--slate-900: #0f172a;
--slate-800: #1e293b;
--slate-700: #334155;
--slate-400: #94a3b8;
```

### Cores Semânticas

```css
/* Impostor (Perigo) */
background: linear-gradient(135deg, #4a1a1a 0%, #6a2a2a 50%, #5a1a1a 100%);
border: 3px solid #c44536;

/* Tripulante (Sucesso) */
background: linear-gradient(135deg, #1a4a5a 0%, #2a6a7a 50%, #1a5a6a 100%);
border: 3px solid #2a9d8f;

/* Capitão (Destaque) */
background: #facc15;
color: #422006;

/* Você (Jogador Atual) */
background: #10b981;
border: #047857;
```

---

## 🔤 Tipografia

### Fontes

```css
/* Fonte Principal - Corpo de texto */
font-family: "Poppins", sans-serif;

/* Fonte de Destaque - Títulos e banners */
font-family: "GT America Compressed", "Impact", "Arial Narrow", sans-serif;

/* Fonte Alternativa - Banners especiais */
font-family: "Changa One", sans-serif;
```

### Hierarquia de Texto

```css
/* Títulos */
h1 { 
  font-size: 2.5rem; 
  font-weight: 900;
  letter-spacing: -0.02em;
}

h2 { 
  font-size: 2rem; 
  font-weight: 900;
}

h3 { 
  font-size: 1.25rem; 
  font-weight: 900;
}

/* Corpo */
p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--slate-400);
}
```

---

## 🏗️ Componentes Principais

### 1. Lobby Online

#### Container Principal
```tsx
<div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
  {/* Conteúdo do lobby */}
</div>
```

#### Header do Lobby
```tsx
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="p-3 bg-blue-500/10 rounded-2xl border-2 border-blue-500/20">
      <Users className="w-6 h-6 text-blue-400" />
    </div>
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white">
        Sala: {roomCode}
      </h2>
      <p className="text-slate-400 text-sm font-medium">
        {playerCount} tripulantes a bordo
      </p>
    </div>
  </div>
</div>
```

#### Card de Jogador
```tsx
<li className={cn(
  "relative p-4 rounded-3xl flex items-center justify-between border-4 transition-all duration-200",
  isMe 
    ? "bg-emerald-500 border-emerald-700 shadow-[0_6px_0_0_rgba(0,0,0,0.2)]" 
    : "bg-slate-800 border-slate-900 hover:bg-slate-750 hover:-translate-y-1 shadow-lg"
)}>
  {/* Avatar */}
  <div className={cn(
    "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-black/10",
    isMe ? "bg-white/20 text-white" : "bg-blue-500 text-white"
  )}>
    {initial}
  </div>
  
  {/* Nome e badges */}
  <div className="flex flex-col flex-1 min-w-0">
    <span className={cn(
      "font-black text-lg leading-tight",
      isMe ? "text-white" : "text-slate-100"
    )}>
      {playerName}
    </span>
    
    {isHost && (
      <span className="text-xs text-yellow-400 font-bold mt-1 flex items-center gap-1">
        <Crown className="w-3 h-3" fill="currentColor" /> CAPITÃO DA NAVE
      </span>
    )}
  </div>
</li>
```

#### Botão Iniciar Partida
```tsx
<button 
  onClick={startGame}
  disabled={playerCount < 3}
  className={cn(
    "w-full px-8 py-5 rounded-2xl font-black text-xl tracking-wide",
    "flex items-center justify-center gap-3 transition-all duration-300",
    "border-b-[6px] shadow-2xl",
    playerCount >= 3
      ? "bg-gradient-to-r from-purple-500 to-violet-500 border-purple-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2" 
      : "bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50"
  )}
>
  <Play size={28} className={playerCount >= 3 ? 'animate-bounce fill-current' : 'fill-current'} />
  {playerCount >= 3 ? 'ESCOLHER MODO' : 'AGUARDANDO TRIPULANTES'}
</button>
```

---

### 2. Tela de Configuração

#### Modal de Configuração
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
  <div className="w-full max-w-2xl bg-[#242642] rounded-[3rem] p-6 md:p-10 shadow-2xl border-4 border-[#2f3252] relative animate-scale-in">
    {/* Conteúdo */}
  </div>
</div>
```

#### Header da Configuração
```tsx
<div className="flex items-center justify-between mb-8">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-orange-500/10 rounded-xl border-2 border-orange-500/20">
      <Settings className="w-6 h-6 text-orange-500" />
    </div>
    <div>
      <h2 className="text-2xl md:text-3xl font-black text-white">
        Configurações da Partida
      </h2>
      <p className="text-slate-400 text-sm font-medium">
        Apenas para tema clássico - Palavra Secreta
      </p>
    </div>
  </div>
</div>
```

#### Controle de Contador
```tsx
<div className="bg-slate-800/50 rounded-2xl p-5 border-2 border-slate-700/50">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-500/10 rounded-xl border-2 border-red-500/20">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg">Quantidade de Impostores</h3>
        <p className="text-slate-400 text-sm">Quantos impostores haverá na partida</p>
      </div>
    </div>
  </div>
  
  <div className="flex items-center justify-center gap-4">
    <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all">
      <Minus className="w-5 h-5 text-white mx-auto" />
    </button>
    
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center border-4 border-red-700 shadow-xl">
      <span className="text-4xl font-black text-white">{count}</span>
    </div>
    
    <button className="w-12 h-12 rounded-xl bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all">
      <Plus className="w-5 h-5 text-white mx-auto" />
    </button>
  </div>
</div>
```

#### Toggle Switch
```tsx
<div className="bg-slate-800/50 rounded-2xl p-5 border-2 border-slate-700/50">
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <h3 className="text-white font-bold text-base mb-1">Dica para o Impostor</h3>
      <p className="text-slate-400 text-sm">O impostor recebe uma pista vaga sobre a palavra.</p>
    </div>
    
    <button
      onClick={() => setChecked(!checked)}
      className={cn(
        "relative w-16 h-9 rounded-full transition-colors duration-300 border-2 shrink-0",
        checked 
          ? "bg-emerald-500 border-emerald-600" 
          : "bg-slate-600 border-slate-900"
      )}
    >
      <div className={cn(
        "absolute top-1 left-1 bg-white w-7 h-7 rounded-full transition-transform duration-300 shadow-lg flex items-center justify-center",
        checked ? "translate-x-7" : "translate-x-0"
      )}>
        {checked ? (
          <Check size={16} className="text-emerald-600" strokeWidth={3} />
        ) : (
          <X size={16} className="text-slate-600" strokeWidth={3} />
        )}
      </div>
    </button>
  </div>
</div>
```

---

### 3. Tela de Seleção de Modos

#### Container de Modos
```tsx
<div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Cards de modo */}
  </div>
</div>
```

#### Card de Modo de Jogo
```tsx
<div
  onClick={() => selectMode(modeId)}
  className={cn(
    "relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border-4 shadow-xl",
    "hover:-translate-y-2 hover:shadow-2xl",
    isSelected
      ? "bg-gradient-to-br from-purple-600 to-violet-700 border-purple-800 shadow-[0_8px_0_0_rgba(0,0,0,0.3)]"
      : "bg-slate-800 border-slate-900 hover:bg-slate-750"
  )}
>
  {/* Header do Card */}
  <div className="flex justify-between items-start mb-4">
    <div className={cn(
      "p-3 rounded-2xl border-2 border-black/10",
      isSelected ? 'bg-white/20 text-white' : 'bg-blue-500 text-white'
    )}>
      <Icon size={32} strokeWidth={2.5} />
    </div>
    
    <div className={cn(
      "text-xs font-bold px-3 py-1 rounded-full border-2 border-black/10",
      isSelected ? 'bg-black/20 text-white' : 'bg-slate-900 text-slate-400'
    )}>
      {difficulty.toUpperCase()}
    </div>
  </div>

  {/* Conteúdo */}
  <div className="flex flex-col gap-1">
    <h3 className={cn(
      "font-black text-xl leading-tight",
      isSelected ? 'text-white' : 'text-slate-100'
    )}>
      {mode.title}
    </h3>
    <p className={cn(
      "text-sm font-medium leading-relaxed",
      isSelected ? 'text-white/90' : 'text-slate-400'
    )}>
      {mode.desc}
    </p>
  </div>
</div>
```

#### Botão Iniciar Partida (Modo Selecionado)
```tsx
<button 
  onClick={startGame}
  disabled={!selectedMode}
  className={cn(
    "w-full md:w-auto md:min-w-[300px] px-8 py-5 rounded-2xl",
    "font-black text-xl tracking-wide flex items-center justify-center gap-3",
    "transition-all duration-300 border-b-[6px] shadow-2xl",
    selectedMode
      ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-800 text-white hover:brightness-110 active:border-b-0 active:translate-y-2" 
      : "bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed opacity-50"
  )}
>
  <Rocket size={28} className={selectedMode ? 'animate-bounce' : ''} />
  {selectedMode ? 'INICIAR PARTIDA' : 'SELECIONE UM MODO'}
</button>
```

---

## 🎭 Efeitos e Animações

### Animações CSS

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Scale In */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}

/* Bounce Soft */
@keyframes bounce-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-bounce {
  animation: bounce-soft 2s infinite;
}

/* Pulse Soft */
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.animate-pulse {
  animation: pulse-soft 3s infinite;
}
```

### Transições

```css
/* Hover suave */
transition: all 0.2s ease;

/* Hover com elevação */
transition: all 0.3s ease;
transform: translateY(-4px);

/* Botão pressionado */
active:translate-y-2
active:border-b-0
```

---

## 🎨 Padrões de Design

### Bordas e Sombras

```css
/* Card padrão */
border-radius: 2rem; /* 32px */
border: 4px solid;
box-shadow: 0 10px 20px rgba(0,0,0,0.4);

/* Card elevado */
border-radius: 3rem; /* 48px */
border: 4px solid;
box-shadow: 0 20px 40px rgba(0,0,0,0.5);

/* Botão com profundidade */
border-bottom: 6px solid;
box-shadow: 0 8px 20px rgba(0,0,0,0.3);
```

### Gradientes

```css
/* Gradiente de fundo */
background: linear-gradient(180deg, rgba(30, 50, 80, 0.95) 0%, rgba(20, 40, 70, 0.98) 100%);

/* Gradiente de botão */
background: linear-gradient(90deg, #22c55e 0%, #10b981 100%);

/* Gradiente de card selecionado */
background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%);
```

### Espaçamento

```css
/* Espaçamento interno (padding) */
p-4   /* 1rem / 16px */
p-6   /* 1.5rem / 24px */
p-8   /* 2rem / 32px */
p-10  /* 2.5rem / 40px */

/* Espaçamento entre elementos (gap) */
gap-2  /* 0.5rem / 8px */
gap-3  /* 0.75rem / 12px */
gap-4  /* 1rem / 16px */
gap-6  /* 1.5rem / 24px */

/* Espaçamento vertical (space-y) */
space-y-4  /* 1rem entre elementos */
space-y-6  /* 1.5rem entre elementos */
```

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile First */
/* Base: < 768px */

/* Tablet */
@media (min-width: 768px) { /* md: */ }

/* Desktop */
@media (min-width: 1024px) { /* lg: */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl: */ }
```

### Exemplo de Uso

```tsx
<div className="
  w-full 
  max-w-4xl 
  mx-auto 
  p-4 md:p-6 
  space-y-4 md:space-y-6
">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black">
    Título Responsivo
  </h1>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Cards */}
  </div>
</div>
```

---

## 🎯 Boas Práticas

### 1. Consistência Visual
- Use sempre as mesmas bordas arredondadas (rounded-2xl, rounded-3xl)
- Mantenha o padrão de sombras para profundidade
- Use a paleta de cores definida

### 2. Feedback Visual
- Botões devem ter estados hover, active e disabled
- Use animações suaves (0.2s - 0.3s)
- Indique claramente elementos clicáveis

### 3. Acessibilidade
- Contraste mínimo de 4.5:1 para texto
- Tamanho mínimo de toque: 44x44px
- Use aria-labels quando necessário

### 4. Performance
- Use transform para animações (não top/left)
- Prefira opacity para fade in/out
- Evite animações em muitos elementos simultaneamente

---

## 📦 Utilitários Customizados

```css
/* Esconder scrollbar */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Backdrop blur */
backdrop-blur-sm  /* blur(4px) */
backdrop-blur-md  /* blur(12px) */

/* Text truncate */
truncate  /* overflow: hidden; text-overflow: ellipsis; white-space: nowrap; */
```

---

**Última atualização:** Janeiro 2026
