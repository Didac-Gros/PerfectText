import { useEffect } from "react";
import { useAuth } from "./../../hooks/useAuth";
import CustomerPortalButton from "../home/CustomerPortalButton";
import { UserSubscription } from "../../types/global";
export const StripePricingTable = () => {
  const { user, userStore } = useAuth();
  const portalLink =
    "https://billing.stripe.com/p/login/test_8wMdSK8sacIlfy86oo";

  useEffect(() => {
    // Cargar el script de Stripe

    if (userStore?.subscription == UserSubscription.FREE || !user) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/pricing-table.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Limpieza opcional
        document.body.removeChild(script);
      };
    } else {
      window.open(portalLink, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Gestiona tu suscripción
        </h2>
        {userStore?.subscription === UserSubscription.FREE || !user ? (
          <div className="stripe-pricing-table-container">
            <stripe-pricing-table
              pricing-table-id="prctbl_1QUArIKIdUQC1kmZFWGX4mUL"
              publishable-key="pk_live_51QRAsiKIdUQC1kmZ2An7o3OBNt54xFKdlTpByQz92H4xvh1NZvonLBUMooGH8k6XRXJ7zy3LLW3AlXlfdf00sDJK00OicnLdCI"
              client-reference-id={user?.uid}
            ></stripe-pricing-table>
          </div>
        ) : (
          <CustomerPortalButton />
        )}
      </div>
    </div>
  );
};
