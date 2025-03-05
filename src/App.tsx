import { useEffect } from "react";
import routes from "./routes"; // Importa las rutas
import {
  BrowserRouter as Router,
  useLocation,
  useRoutes,
} from "react-router-dom";
import { initGA, logPageView } from "./utils/analytics";

function AppRoutes() {
  const element = useRoutes(routes);
  const location = useLocation(); // Obtiene la ubicación actual

  useEffect(() => {
    logPageView(location.pathname); // Envía evento a Google Analytics cada vez que cambie la ruta
  }, [location]);

  return element;
}
function App() {
  useEffect(() => {
    initGA(); // Inicializa Google Analytics una vez al cargar la app
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;

