import { useEffect } from "react";
import routes from "./routes"; // Importa las rutas
import {
  BrowserRouter as Router,
  useLocation,
  useRoutes,
} from "react-router-dom";
import { logPageView } from "./utils/analytics";
import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-MXDS10FD1V"; // Reemplaza con tu ID
function AppRoutes() {
  const element = useRoutes(routes);
  const location = useLocation(); // Obtiene la ubicación actual

  useEffect(() => {
    logPageView(location.pathname); // Envía evento a Google Analytics cada vez que cambie la ruta
  }, [location]);

  return element;
}
const App: React.FC = () => {
  useEffect(() => {
    ReactGA.initialize(MEASUREMENT_ID);
    ReactGA.send("pageview");

  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
