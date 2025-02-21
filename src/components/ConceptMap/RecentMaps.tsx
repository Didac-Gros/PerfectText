import React from "react";
import { motion } from "framer-motion";
import { BsDiagram2 } from "react-icons/bs";
import { ConceptMap } from "../../types/global";

interface RecentMapProps {
  maps: ConceptMap[];
  handleRecentMap: (quiz: ConceptMap) => void;
}

export const RecentMaps: React.FC<RecentMapProps> = ({
  maps,
  handleRecentMap,
}) => {
  return (
    <div className="h-full w-72 bg-white rounded-2xl shadow-lg p-5 overflow-y-auto border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Mapas Recientes
      </h3>

      {maps.length === 0 ? (
        <p className="text-sm text-gray-500">No hay mapas recientes</p>
      ) : (
        <div className="flex flex-col space-y-3 max-h-[35rem] overflow-y-auto pr-2">
          {maps.map((map) => (
            <motion.div
              key={map.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRecentMap(map)}
              className="flex items-center bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
              <div className="inline-block p-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-2">
                <BsDiagram2 className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800">{map.mapTitle}</h4>
                <p className="text-xs text-gray-500">
                  {map.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
