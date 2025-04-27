import { RouteObject } from "react-router-dom"; // Para definir rutas
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CustomProfilePage } from "./pages/CustomProfilePage";
import { SuccessPaymentPage } from "./pages/SuccessPaymentPage";
import InvitationPage from "./pages/InvitationPage";

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
  {
    path: "/success",
    element: <SuccessPaymentPage />,
  },
  {
    path: "/invite",
    element: <InvitationPage />,
  },
];

export default routes;
