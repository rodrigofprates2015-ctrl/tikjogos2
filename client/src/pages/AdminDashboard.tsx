import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  Home, 
  Eye, 
  LogOut, 
  RefreshCw, 
  Lock,
  AlertTriangle,
  User,
  Skull,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type Player = {
  uid: string;
  name: string;
  waitingForGame?: boolean;
  connected?: boolean;
};

type GameData = {
  eliminatedPlayers?: string[];
  votingResults?: Record<string, string>;
  [key: string]: any;
};

type Room = {
  code: string;
  hostId: string;
  status: string;
  gameMode: string | null;
  currentCategory: string | null;
  currentWord: string | null;
  impostorId: string | null;
  gameData: GameData | null;
  players: Player[];
  createdAt: string;
};

type Theme = {
  id: string;
  titulo: string;
  autor: string;
  palavras: string[];
  isPublic: boolean;
  accessCode: string | null;
  paymentStatus: string;
  paymentId: string | null;
  approved: boolean;
  createdAt: string;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSpectatorOpen, setIsSpectatorOpen] = useState(false);
  
  // Theme management states
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [themeSearchQuery, setThemeSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    
    try {
      // Clear any existing token before attempting new login
      localStorage.removeItem("adminToken");
      setToken(null);
      
      const response = await apiRequest("POST", "/api/admin/login", { email, password });
      const data = await response.json();
      
      if (data.success) {
        const newToken = data.token;
        setToken(newToken);
        localStorage.setItem("adminToken", newToken);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      setLoginError("Credenciais inválidas");
      // Ensure clean state on error
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("adminToken");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication state
    localStorage.removeItem("adminToken");
    setToken(null);
    setIsAuthenticated(false);
    setRooms([]);
    setThemes([]);
    setEmail("");
    setPassword("");
    setLoginError("");
  };

  const fetchRooms = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/rooms", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else if (response.status === 401) {
        // Unauthorized - clear auth and redirect
        console.log('[Admin] Unauthorized, clearing auth');
        handleLogout();
      } else {
        console.error(`[Admin] Error fetching rooms: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchThemes = async () => {
    if (!isAuthenticated || !token) return;
    
    setIsLoadingThemes(true);
    try {
      const response = await fetch("/api/admin/themes", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      } else if (response.status === 401) {
        // Unauthorized - clear auth and redirect
        console.log('[Admin] Unauthorized, clearing auth');
        handleLogout();
      } else {
        console.error(`[Admin] Error fetching themes: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching themes:", error);
    } finally {
      setIsLoadingThemes(false);
    }
  };

  const deleteTheme = async (themeId: string) => {
    if (!token || !confirm("Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/themes/${themeId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setThemes(themes.filter(t => t.id !== themeId));
        alert("Tema excluído com sucesso!");
      } else if (response.status === 401) {
        handleLogout();
      } else {
        alert("Erro ao excluir tema");
      }
    } catch (error) {
      console.error("Error deleting theme:", error);
      alert("Erro ao excluir tema");
    }
  };

  const approveTheme = async (themeId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/admin/themes/${themeId}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setThemes(themes.map(t => t.id === themeId ? { ...t, approved: true } : t));
        alert("Tema aprovado com sucesso!");
      } else if (response.status === 401) {
        handleLogout();
      } else {
        alert("Erro ao aprovar tema");
      }
    } catch (error) {
      console.error("Error approving theme:", error);
      alert("Erro ao aprovar tema");
    }
  };

  const rejectTheme = async (themeId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/admin/themes/${themeId}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setThemes(themes.map(t => t.id === themeId ? { ...t, approved: false } : t));
        alert("Tema rejeitado!");
      } else if (response.status === 401) {
        handleLogout();
      } else {
        alert("Erro ao rejeitar tema");
      }
    } catch (error) {
      console.error("Error rejecting theme:", error);
      alert("Erro ao rejeitar tema");
    }
  };

  const inspectRoom = async (code: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/admin/rooms/${code}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedRoom(data);
        setIsSpectatorOpen(true);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRooms();
      fetchThemes();
      const interval = setInterval(fetchRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);
  const activeRooms = rooms.filter(r => r.status === "playing").length;
  const waitingRooms = rooms.filter(r => r.status === "waiting").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-white text-xl">Admin Dashboard</CardTitle>
            <p className="text-slate-400 text-sm">Acesso restrito ao administrador</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                  data-testid="input-admin-password"
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {loginError}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
                data-testid="button-admin-login"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchRooms}
              disabled={isRefreshing}
              className="text-slate-300"
              data-testid="button-refresh-rooms"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-300"
              data-testid="button-admin-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Home className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Salas Ativas</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-rooms">{rooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Jogadores Online</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-players">{totalPlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Eye className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Jogando / Aguardando</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-rooms-status">{activeRooms} / {waitingRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Lista de Salas</CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Nenhuma sala ativa no momento
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Código</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Jogadores</TableHead>
                      <TableHead className="text-slate-300">Modo</TableHead>
                      <TableHead className="text-slate-300">Criada em</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.code} className="border-slate-700" data-testid={`row-room-${room.code}`}>
                        <TableCell className="font-mono font-bold text-white">{room.code}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={room.status === "playing" ? "default" : "secondary"}
                            className={room.status === "playing" ? "bg-green-600" : "bg-slate-600"}
                          >
                            {room.status === "playing" ? "Jogando" : "Aguardando"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">{room.players.length}/10</TableCell>
                        <TableCell className="text-slate-300">{room.gameMode || "-"}</TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {new Date(room.createdAt).toLocaleTimeString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => inspectRoom(room.code)}
                            className="border-slate-600 text-slate-300"
                            data-testid={`button-inspect-${room.code}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Inspecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Management Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Gerenciar Temas da Comunidade
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchThemes}
                disabled={isLoadingThemes}
                className="text-slate-300"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingThemes ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título ou autor..."
                  value={themeSearchQuery}
                  onChange={(e) => setThemeSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </div>

            {isLoadingThemes ? (
              <div className="text-center py-8 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Carregando temas...
              </div>
            ) : themes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Nenhum tema criado ainda
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Título</TableHead>
                      <TableHead className="text-slate-300">Autor</TableHead>
                      <TableHead className="text-slate-300">Palavras</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Pagamento</TableHead>
                      <TableHead className="text-slate-300">Criado em</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {themes
                      .filter(theme => 
                        theme.titulo.toLowerCase().includes(themeSearchQuery.toLowerCase()) ||
                        theme.autor.toLowerCase().includes(themeSearchQuery.toLowerCase())
                      )
                      .map((theme) => (
                        <TableRow key={theme.id} className="border-slate-700">
                          <TableCell className="font-semibold text-white">{theme.titulo}</TableCell>
                          <TableCell className="text-slate-300">{theme.autor}</TableCell>
                          <TableCell className="text-slate-300">{theme.palavras.length}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={theme.approved ? "default" : "secondary"}
                              className={theme.approved ? "bg-green-600" : "bg-yellow-600"}
                            >
                              {theme.approved ? "Aprovado" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={
                                theme.paymentStatus === "approved" ? "bg-green-600" :
                                theme.paymentStatus === "pending" ? "bg-yellow-600" :
                                "bg-red-600"
                              }
                            >
                              {theme.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {new Date(theme.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTheme(theme);
                                  setIsThemeDialogOpen(true);
                                }}
                                className="text-blue-400 hover:text-blue-300"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!theme.approved && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => approveTheme(theme.id)}
                                  className="text-green-400 hover:text-green-300"
                                  title="Aprovar tema"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {theme.approved && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => rejectTheme(theme.id)}
                                  className="text-yellow-400 hover:text-yellow-300"
                                  title="Rejeitar tema"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTheme(theme.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Excluir tema"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isSpectatorOpen} onOpenChange={setIsSpectatorOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Modo Fantasma - Sala {selectedRoom?.code}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Status</p>
                  <Badge className={selectedRoom.status === "playing" ? "bg-green-600" : "bg-slate-600"}>
                    {selectedRoom.status === "playing" ? "Jogando" : "Aguardando"}
                  </Badge>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Modo de Jogo</p>
                  <p className="text-white font-medium">{selectedRoom.gameMode || "Não definido"}</p>
                </div>
              </div>

              {selectedRoom.status === "playing" && (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <p className="text-red-400 text-sm mb-1 flex items-center gap-2">
                      <Skull className="w-4 h-4" />
                      Impostor
                    </p>
                    <p className="text-white font-bold" data-testid="text-impostor-name">
                      {selectedRoom.players.find(p => p.uid === selectedRoom.impostorId)?.name || "N/A"}
                    </p>
                  </div>

                  {selectedRoom.currentWord && (
                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                      <p className="text-blue-400 text-sm mb-1">Palavra Secreta</p>
                      <p className="text-white font-bold text-lg" data-testid="text-secret-word">
                        {selectedRoom.currentWord}
                      </p>
                      {selectedRoom.currentCategory && (
                        <p className="text-slate-400 text-sm mt-1">
                          Categoria: {selectedRoom.currentCategory}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-slate-400 text-sm mb-3">Jogadores ({selectedRoom.players.length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoom.players.map((player) => {
                    const isImpostor = player.uid === selectedRoom.impostorId;
                    const isHost = player.uid === selectedRoom.hostId;
                    const isEliminated = selectedRoom.gameData?.eliminatedPlayers?.includes(player.uid);
                    
                    return (
                      <div 
                        key={player.uid}
                        className={`p-3 rounded-lg flex items-center gap-3 ${
                          isEliminated 
                            ? "bg-slate-700/30 opacity-50" 
                            : isImpostor 
                              ? "bg-red-500/20 border border-red-500/30" 
                              : "bg-slate-700/50"
                        }`}
                        data-testid={`player-${player.uid}`}
                      >
                        <User className={`w-5 h-5 ${isImpostor ? "text-red-400" : "text-slate-400"}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${isImpostor ? "text-red-400" : "text-white"}`}>
                            {player.name}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {isHost && <Badge variant="secondary" className="text-xs bg-yellow-600">Host</Badge>}
                            {isImpostor && <Badge className="text-xs bg-red-600">Impostor</Badge>}
                            {isEliminated && <Badge variant="secondary" className="text-xs bg-slate-600">Eliminado</Badge>}
                            {!player.connected && <Badge variant="secondary" className="text-xs bg-orange-600">Desconectado</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Theme Details Dialog */}
      <Dialog open={isThemeDialogOpen} onOpenChange={setIsThemeDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes do Tema
            </DialogTitle>
          </DialogHeader>
          {selectedTheme && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Título</Label>
                  <p className="text-white font-semibold">{selectedTheme.titulo}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Autor</Label>
                  <p className="text-white">{selectedTheme.autor}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Status</Label>
                  <Badge 
                    variant={selectedTheme.approved ? "default" : "secondary"}
                    className={selectedTheme.approved ? "bg-green-600" : "bg-yellow-600"}
                  >
                    {selectedTheme.approved ? "Aprovado" : "Pendente"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-400">Pagamento</Label>
                  <Badge 
                    variant="secondary"
                    className={
                      selectedTheme.paymentStatus === "approved" ? "bg-green-600" :
                      selectedTheme.paymentStatus === "pending" ? "bg-yellow-600" :
                      "bg-red-600"
                    }
                  >
                    {selectedTheme.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-400">Público</Label>
                  <p className="text-white">{selectedTheme.isPublic ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <Label className="text-slate-400">Código de Acesso</Label>
                  <p className="text-white font-mono">{selectedTheme.accessCode || "-"}</p>
                </div>
              </div>

              <div>
                <Label className="text-slate-400">Palavras ({selectedTheme.palavras.length})</Label>
                <div className="mt-2 p-4 bg-slate-700 rounded-lg max-h-60 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {selectedTheme.palavras.map((palavra, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-600">
                        {palavra}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {!selectedTheme.approved && (
                  <Button
                    onClick={() => {
                      approveTheme(selectedTheme.id);
                      setIsThemeDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar Tema
                  </Button>
                )}
                {selectedTheme.approved && (
                  <Button
                    onClick={() => {
                      rejectTheme(selectedTheme.id);
                      setIsThemeDialogOpen(false);
                    }}
                    variant="secondary"
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar Tema
                  </Button>
                )}
                <Button
                  onClick={() => {
                    deleteTheme(selectedTheme.id);
                    setIsThemeDialogOpen(false);
                  }}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Tema
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
