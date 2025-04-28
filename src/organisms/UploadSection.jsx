import { useRef } from 'react';
import UploaderImage from '../molecules/UploaderImage';
import StatusBar from '../atoms/StatusBar';
import useImageParser from '../hooks/useImageParser'
import CanvasSection from './CanvasSection'

export default function UploaderSection() {
  const fileRef = useRef();
  const [{ width, height, depth }, data, handleFileInput] = useImageParser();

  return (
    <div>
      <UploaderImage fileRef={fileRef} onUpload={() => handleFileInput(fileRef.current)}/>      
      { data && <CanvasSection data={data} width={width} height={height} />}
      {<StatusBar width={width} height={height} depth={depth} />}
    </div>
  );
}