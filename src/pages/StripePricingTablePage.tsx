import { useEffect } from 'react';

const StripePricingTablePage = () => {
    useEffect(() => {
        // Cargar el script de Stripe
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Limpieza opcional
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div>
            {/* Renderizar el componente de Stripe */}
            <stripe-pricing-table pricing-table-id="prctbl_1QRMPMKIdUQC1kmZXWE2XtyG"
                publishable-key="pk_test_51QRAsiKIdUQC1kmZW09sMdKMahtALxF2ePorDUxt8vadtGkEW80S2Vxa9i3kgd71HyQVTpwXsHloaYTbttnBvU2S00GmqySJHZ">
            </stripe-pricing-table>
        </div>
    );
};

export default StripePricingTablePage;
