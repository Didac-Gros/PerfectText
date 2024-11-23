import routes from "./routes/routes"; // Importa las rutas
import { BrowserRouter as Router, useRoutes } from "react-router-dom";

function App() {

  function AppRoutes() {
    const element = useRoutes(routes); // Configura las rutas
    return element;
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;