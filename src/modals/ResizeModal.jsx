import { useState } from 'react';

export default function ResizeModal({
  isOpen,
  onClose,
  onConfirm,
  currentScale,
  currentMethod
}) {
  const [scale, setScale] = useState(currentScale);
  const [method, setMethod] = useState(currentMethod);

  if (!isOpen) return null;

  return (
    <dialog open className="resize-modal">
      <h3>Настройки масштабирования</h3>
      
      <div className="form-group">
        <label>Масштаб (%):</label>
        <input
          type="number"
          min="12"
          max="300"
          step="1"
          value={(scale * 100).toFixed(0)}
          onChange={(e) => setScale(parseFloat(e.target.value) / 100)}
        />
      </div>

      <div className="form-group">
        <label>Алгоритм:</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="bilinear">Билинейная интерполяция</option>
          <option value="nearest">Метод ближайшего соседа</option>
        </select>
      </div>

      <div className="button-group">
        <button onClick={onClose}>Отмена</button>
        <button onClick={() => onConfirm(scale, method)}>
          Применить
        </button>
      </div>
    </dialog>
  );
}