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
  Skull
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    
    try {
      const response = await apiRequest("POST", "/api/admin/login", { email, password });
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem("adminToken", data.token);
      }
    } catch (error: any) {
      setLoginError("Credenciais inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setRooms([]);
    localStorage.removeItem("adminToken");
  };

  const fetchRooms = async () => {
    if (!isAuthenticated) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/rooms", {
        headers: {
          "Authorization": `Bearer ${token || localStorage.getItem("adminToken")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const inspectRoom = async (code: string) => {
    try {
      const response = await fetch(`/api/admin/rooms/${code}`, {
        headers: {
          "Authorization": `Bearer ${token || localStorage.getItem("adminToken")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedRoom(data);
        setIsSpectatorOpen(true);
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
    if (isAuthenticated) {
      fetchRooms();
      const interval = setInterval(fetchRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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
    </div>
  );
}
