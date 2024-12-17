import { RouteObject } from "react-router-dom"; // Para definir rutas
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomProfilePage } from "./pages/CustomProfilePage";

// Configuración de las rutas
const routes: RouteObject[] = [
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/profile",
        element: <CustomProfilePage />,
    },
];

export default routes;