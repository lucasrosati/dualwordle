import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Menu = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-12 bg-zinc-900 text-gray-200">
    <h1 className="text-5xl font-extrabold tracking-widest">DUETO</h1>

    <div className="flex w-56 flex-col gap-4">
      {/* começa o jogo normal */}
      <Button asChild variant="default" size="lg">
        <Link to="/play">Jogar</Link>
      </Button>

      {/* abre o mesmo /play porém já com #ranking pra ativar a aba ranking */}
      <Button asChild variant="secondary" size="lg">
        <Link to="/play#ranking">Visualizar Ranking</Link>
      </Button>
    </div>
  </div>
);

export default Menu;
