import { useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import UploaderImage from '../molecules/UploaderImage';
import StatusBar from '../atoms/StatusBar';
import useImageParser from '../hooks/useImageParser';
import CanvasSection from './CanvasSection';
import ResizeModal from '../modals/ResizeModal';
import ToolBar from '../atoms/ToolBar';
import EyedropperPanel from './EyedropperPanel'; 

export default function UploadSection() {
  const fileRef = useRef();
  const [scale, setScale] = useState(1);
  const [interpolationMethod, setInterpolationMethod] = useState('bilinear');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  const [activeTool, setActiveTool] = useState(null);
  const [samples, setSamples] = useState({ first: null, second: null })
  
  const [{ width, height, depth }, data, handleFileInput] = useImageParser();

  const handleSelectTool = (toolId) => {
    setActiveTool(prev => {
      const next = prev === toolId ? null : toolId;
      if (toolId === 'eyedropper') {
        setSamples({ first: null, second: null });
      }
      return next;
    });
  };

  useHotkeys('h', () => handleSelectTool('hand'));
  useHotkeys('e', () => handleSelectTool('eyedropper'));
  useHotkeys('esc', () => {
    setActiveTool(null);
    setSamples({ first: null, second: null });
  });


  const handleScaleConfirm = (newScale, method) => {
    setScale(newScale);
    setInterpolationMethod(method);
    setIsModalOpen(false);
  };

  return (
    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
      <div className="controls">
        {data && (
          <ToolBar 
            activeTool={activeTool} 
            onSelect={handleSelectTool} 
          />
        )}

        <div style={{display: 'flex'}}>
        <UploaderImage 
          fileRef={fileRef} 
          onUpload={() => {
            handleFileInput(fileRef.current);
            setOriginalDimensions({ width, height });
          }}
        />

        {data && (
            <button style={{marginLeft: '10px'}} onClick={() => setIsModalOpen(true)}>
              Настроить масштаб
            </button>
          )}
        </div>
      </div>

      {data && (
        <div style={{ display: 'flex' }}>
          <CanvasSection 
            data={data} 
            width={width} 
            height={height} 
            scale={scale}
            interpolationMethod={interpolationMethod}
            activeTool={activeTool}
            onSample={(color, coords, isModifier) => {
              setSamples(prev => ({
                first: prev.first || (!isModifier ? { color, coords } : null),
                second: prev.second || (isModifier ? { color, coords } : null),
              }));
            }}
          />
          {activeTool === 'eyedropper' && <EyedropperPanel samples={samples} />}
        </div>
      )}

      <StatusBar 
        width={width} 
        height={height} 
        depth={depth} 
        scale={scale}
        method={interpolationMethod}
      />

      <ResizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleScaleConfirm}
        currentScale={scale}
        currentMethod={interpolationMethod}
      />
    </div>
  );
}