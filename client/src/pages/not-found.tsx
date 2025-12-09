import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-black text-white font-poppins flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-[#ff0050]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[#ff0050]">404</h1>
            <p className="text-xl text-gray-300">Página não encontrada</p>
          </div>

          <p className="text-gray-400 text-sm">
            Desculpe, a página que você está procurando não existe.
          </p>

          <Link href="/" className="block">
            <Button className="w-full h-12 border-2 border-[#00f2ea] bg-transparent text-[#00f2ea] hover:bg-[#00f2ea]/10 rounded-lg font-medium flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar à Tela Inicial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
