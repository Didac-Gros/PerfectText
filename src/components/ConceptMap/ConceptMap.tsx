import { useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  children?: Node[];
}

interface ConceptMapProps {
  data: Node;
}

export const ConceptMap: React.FC<ConceptMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Renderizar el mapa usando D3
  const renderMap = () => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = Math.max(1200, containerRef.current.clientWidth);
    const height = 800;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<Node>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.8));

    const root = d3.hierarchy(data);
    const treeData = tree(root);

    const linkGenerator = d3.linkHorizontal<any, any>()
      .x(d => d.y * 0.8)
      .y(d => d.x);

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

    const node = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y * 0.8},${d.x})`);

    node.append('circle')
      .attr('r', 4)
      .style('fill', '#10b981')
      .style('stroke', '#059669')
      .style('stroke-width', '1.5px');

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => (d.children ? -8 : 8))
      .style('text-anchor', d => (d.children ? 'end' : 'start'))
      .text(d => d.data.label)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151');
  };

  return (
    <div ref={containerRef} className="bg-white rounded-2xl shadow-lg p-8 overflow-x-auto">
      <div className="text-sm text-gray-500 mb-4 text-center">
        Usa zoom para acercar/alejar y arrastra para mover el mapa
      </div>
      <svg ref={svgRef} className="w-full h-full min-w-[1200px]" style={{ minHeight: '800px' }} />
    </div>
  );
};
