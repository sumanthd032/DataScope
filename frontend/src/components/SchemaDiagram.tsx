import React, { useState, useEffect } from 'react';
import { useDbState } from '../context/DbStateContext';
import { useApi } from '../hooks/useApi';
import mermaid from 'mermaid';

export const SchemaDiagram: React.FC = () => {
  const { sessionId } = useDbState();
  const { getSchemaDiagram } = useApi();
  
  const [svg, setSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRenderDiagram = async () => {
      if (!sessionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Fetch the diagram text from our API
        const { diagram_string } = await getSchemaDiagram(sessionId);

        // 2. Render it into an SVG using Mermaid
        const { svg: svgCode } = await mermaid.render(
          `mermaid-diagram-${sessionId}`, // Needs a unique ID
          diagram_string
        );
        
        setSvg(svgCode);
        
      } catch (err: any) {
        setError(err.message || 'Failed to render diagram');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndRenderDiagram();
  }, [sessionId, getSchemaDiagram]);

  if (isLoading) {
    return <div className="text-center p-10">Generating schema diagram...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  // 3. Display the raw SVG
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full overflow-auto">
      <div 
        className="w-full flex justify-center"
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  );
};