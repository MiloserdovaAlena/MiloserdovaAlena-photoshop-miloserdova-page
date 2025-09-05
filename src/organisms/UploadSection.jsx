import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import UploaderImage from '../molecules/UploaderImage';
import StatusBar from '../atoms/StatusBar';
import useImageParser from '../hooks/useImageParser';
import CanvasSection from './CanvasSection';
import ResizeModal from '../modals/ResizeModal';
import ToolBar from '../atoms/ToolBar';
import EyedropperPanel from './EyedropperPanel'; 
import LayersPanel from './LayersPanel';
import { compositeLayers, BlendMode } from '../utils/blending';
import CurvesModal from '../modals/CurvesModal';
import { applyLUTToImageData } from '../utils/curves';

export default function UploadSection() {
  const fileRef = useRef();
  const [scale, setScale] = useState(1);
  const [interpolationMethod, setInterpolationMethod] = useState('bilinear');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [isCurvesOpen, setIsCurvesOpen] = useState(false);
  const [curvesPreview, setCurvesPreview] = useState({ enabled:false, lut:null, channel:'rgb' });

  const [activeTool, setActiveTool] = useState(null);
  const [samples, setSamples] = useState({ first: null, second: null })
  
  const [{ width, height, depth }, data, handleFileInput] = useImageParser();

  // Layers state
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);

  const ensureBaseLayer = (baseData) => {
    setLayers((prev) => {
      if (prev.length > 0) return prev;
      const id = crypto.randomUUID();
      return [{ id, name: 'Слой 1', data: baseData, width, height, visible: true, opacity: 1, blendMode: BlendMode.NORMAL, alphaVisible: true }];
    });
  };

  const addLayerFromImageFile = (file) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      // Preserve aspect ratio: fit image into base canvas
      const scale = Math.min(width / img.width, height / img.height);
      const dw = Math.round(img.width * scale);
      const dh = Math.round(img.height * scale);
      const dx = Math.floor((width - dw) / 2);
      const dy = Math.floor((height - dh) / 2);
      ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
      const imageData = ctx.getImageData(0, 0, width, height).data;
      const id = crypto.randomUUID();
      setLayers((prev) => [...prev, { id, name: `Слой ${prev.length + 1}` , data: new Uint8ClampedArray(imageData), width, height, visible: true, opacity: 1, blendMode: BlendMode.NORMAL, alphaVisible: true }]);
      setActiveLayerId(id);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleAddImage = () => {
    if (layers.length >= 2) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.gb7,.jpg,.jpeg';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) addLayerFromImageFile(f);
    };
    input.click();
  };

  const handleAddColor = () => {
    if (layers.length >= 2) return;
    const input = document.createElement('input');
    input.type = 'color';
    input.value = '#ff0000';
    input.onchange = () => {
      const hex = input.value;
      const rgb = hex.replace('#','');
      const r = parseInt(rgb.slice(0,2),16);
      const g = parseInt(rgb.slice(2,4),16);
      const b = parseInt(rgb.slice(4,6),16);
      const a = 255;
      const buffer = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        buffer[idx] = r; buffer[idx+1] = g; buffer[idx+2] = b; buffer[idx+3] = a;
      }
      const id = crypto.randomUUID();
      setLayers((prev) => [...prev, { id, name: `Слой ${prev.length + 1}` , data: buffer, width, height, visible: true, opacity: 1, blendMode: BlendMode.NORMAL, alphaVisible: true }]);
      setActiveLayerId(id);
    };
    input.click();
  };

  const handleRemoveLayer = (id) => {
    setLayers((prev) => prev.filter(l => l.id !== id));
    if (activeLayerId === id) setActiveLayerId(null);
  };

  const handleMoveUp = (id) => {
    setLayers((prev) => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = prev.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(idx + 1, 0, item);
      return copy;
    });
  };
  const handleMoveDown = (id) => {
    setLayers((prev) => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx <= 0) return prev;
      const copy = prev.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(idx - 1, 0, item);
      return copy;
    });
  };

  const handleToggleVisible = (id, v) => setLayers((prev) => prev.map(l => l.id === id ? { ...l, visible: v } : l));
  const handleToggleAlphaVisible = (id, v) => setLayers((prev) => prev.map(l => l.id === id ? { ...l, alphaVisible: v } : l));
  const handleChangeOpacity = (id, v) => setLayers((prev) => prev.map(l => l.id === id ? { ...l, opacity: v } : l));
  const handleChangeBlendMode = (id, m) => setLayers((prev) => prev.map(l => l.id === id ? { ...l, blendMode: m } : l));
  const handleDeleteAlpha = (id) => setLayers((prev) => prev.map(l => {
    if (l.id !== id) return l;
    const copy = new Uint8ClampedArray(l.data);
    for (let i = 0; i < copy.length; i += 4) copy[i + 3] = 255;
    return { ...l, data: copy, alphaVisible: true };
  }));

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

  useEffect(() => {
    if (data && layers.length === 0) {
      ensureBaseLayer(data);
      setActiveLayerId((prev) => prev ?? (layers[0]?.id));
    }
  }, [data, layers.length]);

  const composedOpaque = useMemo(() => {
    if (!data || layers.length === 0) return data;
    if (curvesPreview.enabled && curvesPreview.lut && activeLayerId) {
    const idx = layers.findIndex(l => l.id === activeLayerId);
    if (idx !== -1) {
      const L = layers[idx];
      const previewData = applyLUTToImageData(L.data, curvesPreview.lut, curvesPreview.channel);
      const working = layers.slice();
      working[idx] = { ...L, data: previewData };
      return compositeLayers(width, height, working);
    }
    return compositeLayers(width, height, layers);
  }
  }, [data, layers, width, height, curvesPreview, activeLayerId]);
  return (
    <div style={{display: 'flex', alignItems: 'stretch', flexDirection: 'column', height: '100%', overflow: 'hidden'}}>
      <div className="controls" style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px',  justifyContent: 'center', flexDirection: 'column' }}>
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
           <>
             <button style={{marginLeft: '10px'}} onClick={() => setIsModalOpen(true)}>
               Настроить масштаб
             </button>
             <button style={{marginLeft: '10px'}} disabled={!activeLayerId}
               onClick={() => setIsCurvesOpen(true)}
               title={activeLayerId ? 'Градационная коррекция (Curves)' : 'Нет активного слоя'}
            >
               Кривые
             </button>           
             </>
          )}
        </div>
      </div>

      {data && (
        <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <CanvasSection 
              data={composedOpaque} 
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
            <StatusBar 
                style={{ padding: '8px 0' }}
                width={width} 
                height={height} 
                depth={depth} 
                scale={scale}
                method={interpolationMethod}
              />
          </div>
          
          <LayersPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onSetActive={setActiveLayerId}
            onAddLayer={() => {}}
            onRemoveLayer={handleRemoveLayer}
            onToggleVisible={handleToggleVisible}
            onToggleAlphaVisible={handleToggleAlphaVisible}
            onChangeOpacity={handleChangeOpacity}
            onChangeBlendMode={handleChangeBlendMode}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDeleteAlpha={handleDeleteAlpha}
            onAddImage={handleAddImage}
            onAddColor={handleAddColor}
          />

          {activeTool === 'eyedropper' && <EyedropperPanel samples={samples} />}
        </div>
      )}


      <ResizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleScaleConfirm}
        currentScale={scale}
        currentMethod={interpolationMethod}
      />
     <CurvesModal
       isOpen={isCurvesOpen}
       onClose={() => setIsCurvesOpen(false)}
       layer={layers.find(l => l.id === activeLayerId)}
      onPreview={useCallback((enabled, lut, channel = 'rgb') => {
        setCurvesPreview(prev => {
          if (
            prev.enabled === enabled &&
            prev.channel === channel &&
            prev.lut === lut
          ) return prev;
          return { enabled, lut, channel };
        });
      }, [])}
       onApply={(lut, channel) => {
         if (!activeLayerId || !lut) return;
         setLayers(prev => {
           const idx = prev.findIndex(l => l.id === activeLayerId);
           if (idx === -1) return prev;
           const L = prev[idx];
           const out = applyLUTToImageData(L.data, lut, channel);
           const next = prev.slice();
           next[idx] = { ...L, data: out };
           return next;
         });
         setCurvesPreview({ enabled:false, lut:null, channel:'rgb' });
         setIsCurvesOpen(false);
       }}
     />
    </div>
  );
}