import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Map, AlertCircle } from "lucide-react";
import * as d3 from "d3";
import { LoadingProgress } from "../shared/LoadingProgress";
import { parseFileToString, parseMarkdownToNodes } from "../../utils/utils";
import { FileUploader } from "../shared/FileUploader";
import { fetchConceptMap } from "../../services/openai/conceptMapApi";
import { ConceptMap, Node } from "../../types/global";
import { useNavigate } from "react-router-dom";
import { LoginPopUp } from "../shared/LoginPopUp";
import { User } from "firebase/auth";
import { QuizReview } from "../QuizGame/QuizReview";
import { fetchUserReview } from "../../services/firestore/userReview";
import {
  addConceptMapToFirestore,
  getUserConceptMaps,
} from "../../services/firestore/conceptMapRepository";
import { RecentMaps } from "./RecentMaps";
import { CiEdit } from "react-icons/ci";
import { updateFirestoreField } from "../../services/firestore/firestore";
import { v4 as uuidv4 } from "uuid";

interface ConceptMapGeneratorProps {
  removeTokens: (tokens: number) => void;
  user: User | null;
  userTokens: number | null;
  setShowPopUpTokens: (show: boolean) => void;
}

export const ConceptMapGenerator: React.FC<ConceptMapGeneratorProps> = ({
  user,
  removeTokens,
  userTokens,
  setShowPopUpTokens,
}) => {
  const [userText, setUserText] = useState("");
  const [fileText, setFileText] = useState("");
  const [fileTitle, setFileTitle] = useState("Mapa");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [resetFile, setResetFile] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [maps, setMaps] = useState<ConceptMap[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isMap, setIsMap] = useState(false);
  const [mapId, setMapId] = useState("");

  useEffect(() => {
    if (user) {
      const loadMaps = async () => {
        const userMaps = await getUserConceptMaps(user.uid);
        setMaps(userMaps);
      };

      loadMaps();
    }
  }, [user]);

  const doFineTuning = (liked: boolean) => {
    if (liked) {
      const fineTuning = [
        {
          role: "system",
          content:
            "Eres un asistente que genera un mapa conceptual basado en un texto.",
        },
        { role: "user", content: "El texto es: " + `${userText} ${fileText}` },
        {
          role: "assistant",
          content: "Mapa conceptual: " + markdown,
        },
      ];

      fetchUserReview(fineTuning)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    setShowPopup(false);
  };

  const renderConceptMap = (data: Node) => {
    if (!svgRef.current || !containerRef.current) return;

    // Limpiar SVG existente
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Dimensiones
    const width = Math.max(1200, containerRef.current.clientWidth);
    const height = 800;
    const margin = { top: 100, right: 120, bottom: 40, left: 120 };

    // Añadir fondo degradado al SVG
    svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "svgGradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#f0f4c3" },
        { offset: "100%", color: "#e8f5e9" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    svg
      .attr("width", width)
      .attr("height", height)
      .style("background", "url(#svgGradient)");

    // Configurar grupo principal
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Crear layout de árbol
    const tree = d3
      .tree<Node>()
      .size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right,
      ])
      .separation((a, b) => (a.parent === b.parent ? 2 : 3));

    // Crear jerarquía
    const root = d3.hierarchy<Node>(data);
    const treeData = tree(root);

    // Escalas de colores y tamaños
    const maxDepth = d3.max(treeData.descendants(), (d) => d.depth) || 1;

    // Escala de colores vibrantes para los nodos
    const colorScale = d3
      .scaleOrdinal(d3.schemeSet2)
      .domain(d3.range(0, maxDepth + 1).map(String));

    // Escala de tamaños de fuente
    const fontSizeScale = d3
      .scaleLinear()
      .domain([0, maxDepth])
      .range([28, 18]); // Nodos superiores más grandes

    // Escala de pesos de fuente
    const fontWeightScale = d3
      .scaleLinear()
      .domain([0, maxDepth])
      .range([800, 400]); // Nodos superiores en negrita

    // Crear enlaces curvos
    const linkGenerator = d3
      .linkHorizontal<any, any>()
      .x((d) => d.y)
      .y((d) => d.x);

    // Añadir enlaces con colores llamativos
    const link = g
      .selectAll<SVGPathElement, d3.HierarchyPointLink<Node>>(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", linkGenerator)
      .style("fill", "none")
      .style("stroke", (d) => colorScale(String(d.source.depth)))
      .style("stroke-width", "2px")
      .style("opacity", 0.7);

    // Definir gradientes radiales para los nodos
    const defs = svg.append("defs");

    treeData.descendants().forEach((d, i) => {
      const gradient = defs
        .append("radialGradient")
        .attr("id", `gradient-${i}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", "white");

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(String(d.depth)));
    });

    // Crear nodos
    const node = g
      .selectAll<SVGGElement, d3.HierarchyPointNode<Node>>(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Añadir círculos a los nodos con gradientes y tamaños según profundidad
    node
      .append("circle")
      .attr("r", (d) => 12 - d.depth) // Nodos superiores más grandes
      .style("fill", (_d, i) => `url(#gradient-${i})`)
      .style("stroke", "#333")
      .style("stroke-width", "1.5px");

    // Añadir etiquetas de texto
    const texts = node
      .append("text")
      .attr("dy", "0.35em")
      .attr("x", (d) => (d.children ? -16 : 16))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.label)
      .style("font-size", (d) => `${fontSizeScale(d.depth)}px`)
      .style("font-weight", (d) => fontWeightScale(d.depth).toString())
      .style("fill", "#374151");

    // Añadir fondo a las etiquetas
    texts.each(function () {
      const text = d3.select(this);
      const bbox = (this as SVGTextElement).getBBox();
      const padding = { x: 12, y: 8 };

      text
        .insert("rect", "text")
        .attr("x", bbox.x - padding.x)
        .attr("y", bbox.y - padding.y)
        .attr("width", bbox.width + padding.x * 2)
        .attr("height", bbox.height + padding.y * 2)
        .attr("rx", 6)
        .style("fill", "rgba(255, 255, 255, 0.8)")
        .style("stroke", "#ccc")
        .style("stroke-width", "1px");

      text.raise();
    });

    // Añadir interacciones
    node
      .on("mouseover", function (_event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 12 - d.depth + 4)
          .style("stroke", "#ff5722");

        d3.select(this)
          .select("text")
          .transition()
          .duration(200)
          .style("fill", "#ff5722");

        link
          .filter((l) => l.source === d || l.target === d)
          .transition()
          .duration(200)
          .style("stroke", "#ff5722");
      })
      .on("mouseout", function (_event, d) {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 12 - d.depth)
          .style("stroke", "#333");

        d3.select(this)
          .select("text")
          .transition()
          .duration(200)
          .style("fill", "#374151");

        link
          .filter((l) => l.source === d || l.target === d)
          .transition()
          .duration(200)
          .style("stroke", (l) => colorScale(String(l.source.depth)));
      });

    // Obtener el bounding box del grupo 'g'
    const gBBox = g.node()!.getBBox();

    // Dimensiones del SVG
    const svgWidth = width;
    const svgHeight = height;

    // Calcular la escala para ajustar el contenido al viewport
    const scale = Math.min(
      svgWidth / (gBBox.width + margin.left + margin.right),
      svgHeight / (gBBox.height + margin.top + margin.bottom)
    );

    // Calcular la traslación para centrar el contenido
    const x = (svgWidth - gBBox.width * scale) / 2 - gBBox.x * scale;
    const y = (svgHeight - gBBox.height * scale) / 2 - gBBox.y * scale;

    // Configurar zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Aplicar la transformación inicial
    svg
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  };

  const generateConceptMap = async () => {
    if (user) {
      if (
        userTokens === null ||
        userTokens >= userText.length + fileText.length
      ) {
        setIsLoading(true);
        setError(null);

        try {
          removeTokens(userText.length + fileText.length);
          const response = await fetchConceptMap(`${userText} ${fileText}`);
          setMarkdown(response);
          const root = parseMarkdownToNodes(response);

          if (!root.children?.length) {
            throw new Error(
              "No se pudieron generar conceptos del texto proporcionado"
            );
          }
          setTimeout(() => setShowPopup(true), 10000);
          renderConceptMap(root);
          const mapId = uuidv4();

          addConceptMapToFirestore(mapId, root, fileTitle)
            .then(() => {
              setMapId(mapId);
            })
            .catch((error) =>
              console.error("Error al guardar el quiz:", error)
            );
          svgRef.current?.scrollIntoView({ behavior: "smooth" });

          setUserText("");
          setResetFile(true);
          setIsMap(true);
        } catch (err) {
          console.error("Error generating concept map:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Error al generar el mapa conceptual"
          );
        } finally {
          setIsLoading(false);
        }
      } else setShowPopUpTokens(true);
    } else setShowPopUp(true);
  };

  const handleFileUpload = async (file: File) => {
    let content = "";
    let title = "";
    ({ title: title, text: content } = await parseFileToString(file));

    setFileText(content);
    setFileTitle(title);
  };

  const handleLogin = () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
    }
  };

  const handleRecentMap = (map: ConceptMap) => {
    renderConceptMap(map.root);
    setUserText("");
    setResetFile(true);
    setIsMap(true);
    setFileTitle(map.mapTitle);
    setMapId(map.id);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSave = () => {
    updateFirestoreField("maps", mapId, "mapTitle", fileTitle)
      .then(() => {
        setIsEditing(false);
      })
      .catch((error) => console.error("Error al guardar el quiz:", error));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full mx-auto px-4"
    >
      <div className="flex gap-6 mb-8">
        <div className="hidden md:block">
          <RecentMaps maps={maps} handleRecentMap={handleRecentMap} />
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 pt-5 text-center">
          <div className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-1">
            <Map className="size-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Generador de Mapas Conceptuales
          </h2>
          <p className="text-gray-600 mb-6">
            Introduce un texto y generaremos un mapa conceptual interactivo
            automáticamente
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              generateConceptMap();
            }}
            className="mb-8"
          >
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Escribe o pega tu texto aquí..."
              className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-500 mt-2 mb-4 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {showPopUp && (
              <LoginPopUp
                onClose={() => setShowPopUp(false)}
                onLogin={handleLogin}
              ></LoginPopUp>
            )}

            <FileUploader
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
              resetFile={resetFile}
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || (!userText.trim() && !fileText.trim())}
              className={`mt-4 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 w-full ${
                isLoading || (!userText.trim() && !fileText.trim())
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading ? (
                <LoadingProgress
                  isLoading={isLoading}
                  text="Generando mapa conceptual"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  <span>Generar Mapa Conceptual</span>
                </div>
              )}
            </motion.button>
          </form>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-white rounded-2xl shadow-lg p-8 overflow-x-auto"
      >
        <div className="text-sm text-gray-500 text-center mb-8">
          Puedes hacer zoom con la rueda del ratón y arrastrar para mover el
          mapa
        </div>

        <div className="flex items-center gap-2 justify-center mb-2">
          {isMap && !isEditing && (
            <h2 className="text-3xl font-bold text-gray-800">{fileTitle}</h2>
          )}

          {isEditing && (
            <input
              type="text"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              className="border-b-2 border-blue-500 outline-none text-lg font-semibold w-48"
            />
          )}
          {isMap && (
            <button onClick={() => setIsEditing(true)}>
              <CiEdit className="size-7 text-gray-500 hover:text-blue-500 mt-1" />
            </button>
          )}
        </div>
        <svg
          ref={svgRef}
          className="w-full h-full min-w-[1200px]"
          style={{ minHeight: "800px" }}
        />
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <QuizReview
              handleReview={doFineTuning}
              title="¿Qué te ha parecido el mapa conceptual?"
            ></QuizReview>
          </div>
        </div>
      )}
    </motion.div>
  );
};
