import ReactGA from "react-ga4";

// Reemplaza "G-TU_ID_AQUI" con tu ID de Google Analytics
export const initGA = () => {
  ReactGA.initialize("G-TU_ID_AQUI");
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
