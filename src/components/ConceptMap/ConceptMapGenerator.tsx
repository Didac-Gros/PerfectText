import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Map, AlertCircle } from 'lucide-react';
import * as d3 from 'd3';
import { LoadingProgress } from '../shared/LoadingProgress';

interface Node {
  id: string;
  label: string;
  children?: Node[];
}

export function ConceptMapGenerator() {
  const [userText, setUserText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderConceptMap = (data: Node) => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear existing SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set dimensions
    const width = Math.max(1200, containerRef.current.clientWidth);
    const height = 800;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    // Configure SVG
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const tree = d3.tree<Node>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));

    // Create hierarchy
    const root = d3.hierarchy(data);
    const treeData = tree(root);

    // Create smooth curved links
    const linkGenerator = d3.linkHorizontal<any, any>()
      .x(d => d.y * 0.8)
      .y(d => d.x);

    // Add links
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator)
      .style('fill', 'none')
      .style('stroke', '#10b981')
      .style('stroke-width', '1.5px')
      .style('opacity', 0.6);

    // Create nodes
    const node = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y * 0.8},${d.x})`);

    // Add circles to nodes
    node.append('circle')
      .attr('r', 4)
      .style('fill', '#10b981')
      .style('stroke', '#059669')
      .style('stroke-width', '1.5px');

    // Add text labels
    const texts = node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -8 : 8)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.label)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151');

    // Add background to text
    texts.each(function() {
      const text = d3.select(this);
      const bbox = (this as SVGTextElement).getBBox();
      const padding = { x: 6, y: 3 };

      text.insert('rect', 'text')
        .attr('x', bbox.x - padding.x)
        .attr('y', bbox.y - padding.y)
        .attr('width', bbox.width + (padding.x * 2))
        .attr('height', bbox.height + (padding.y * 2))
        .attr('rx', 3)
        .style('fill', 'white')
        .style('stroke', '#e5e7eb')
        .style('stroke-width', '1px');

      text.raise();
    });

    // Configure zoom
    const zoom = d3.zoom()
      .scaleExtent([0.3, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any)
      .call(zoom.transform as any, d3.zoomIdentity
        .translate(margin.left, margin.top)
        .scale(0.8));
  };

  const parseMarkdownToNodes = (markdown: string): Node => {
    const lines = markdown.split('\n').filter(line => line.trim());
    const root: Node = { id: 'root', label: 'Conceptos Principales', children: [] };
    let currentLevel = 0;
    let currentNode = root;
    let nodeStack = [root];

    lines.forEach(line => {
      const match = line.match(/^(#+)\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const label = match[2].trim();

        if (label) {
          const node: Node = { 
            id: Math.random().toString(36).substr(2, 9), 
            label, 
            children: [] 
          };

          while (level <= currentLevel && nodeStack.length > 1) {
            nodeStack.pop();
            currentLevel--;
          }

          currentNode = nodeStack[nodeStack.length - 1];
          if (!currentNode.children) currentNode.children = [];
          currentNode.children.push(node);
          nodeStack.push(node);
          currentLevel = level;
        }
      }
    });

    return root;
  };

  const generateConceptMap = async () => {
    if (!userText.trim()) {
      setError('Por favor, introduce un texto');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/conceptmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el mapa conceptual');
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error('Formato de respuesta inválido');
      }

      const root = parseMarkdownToNodes(data.data);
      if (!root.children?.length) {
        throw new Error('No se pudieron generar conceptos del texto proporcionado');
      }

      renderConceptMap(root);
      setUserText('');
    } catch (err) {
      console.error('Error generating concept map:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el mapa conceptual');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
            <Map className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Generador de Mapas Conceptuales
          </h2>
          <p className="text-gray-600 mb-6">
            Introduce un texto y generaremos un mapa conceptual interactivo automáticamente
          </p>

          <form onSubmit={(e) => { e.preventDefault(); generateConceptMap(); }} className="mb-6">
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

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || !userText.trim()}
              className={`mt-4 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 w-full ${
                isLoading || !userText.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <LoadingProgress isLoading={isLoading} text="Generando mapa conceptual" />
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
        <div className="text-sm text-gray-500 mb-4 text-center">
          Puedes hacer zoom con la rueda del ratón y arrastrar para mover el mapa
        </div>
        <svg
          ref={svgRef}
          className="w-full h-full min-w-[1200px]"
          style={{ minHeight: '800px' }}
        />
      </div>
    </motion.div>
  );
}