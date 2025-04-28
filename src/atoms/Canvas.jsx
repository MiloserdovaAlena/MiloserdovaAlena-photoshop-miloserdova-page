import React from 'react';

const Canvas = React.forwardRef(
  (props, ref) => (
    <canvas ref={ref} className="canvas" {...props} />
  )
);
Canvas.displayName = 'canvas';

export default Canvas;