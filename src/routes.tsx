import { RouteObject } from "react-router-dom"; // Para definir rutas
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CustomProfilePage } from "./pages/CustomProfilePage";
import { SuccessPaymentPage } from "./pages/SuccessPaymentPage";
import InvitationPage from "./pages/InvitationPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

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
  // {
  //   path: "/profile",
  //   element: <CustomProfilePage bgColor />,
  // },
  {
    path: "/success",
    element: <SuccessPaymentPage />,
  },
  {
    path: "/invite",
    element: <InvitationPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
  },
    {
    path: "/terms",
    element: <TermsPage />,
  },
];

export default routes;
