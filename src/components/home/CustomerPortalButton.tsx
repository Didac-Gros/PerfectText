import React from 'react';

const CustomerPortalButton: React.FC = () => {
    const portalLink = 'https://billing.stripe.com/p/login/8wM6slcKdbTD9Ow9AA';

    const handleClick = (): void => {
        window.open(portalLink, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex justify-center items-center">
            <button
                onClick={handleClick}
                className="
                    bg-indigo-600 text-white py-3 px-6 rounded-lg 
                    shadow-md font-semibold text-lg
                    transition duration-300 ease-in-out
                    hover:bg-indigo-700 hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75
                "
            >
                Actualizar o cancelar suscripción
            </button>
        </div>
    );
};

export default CustomerPortalButton;
