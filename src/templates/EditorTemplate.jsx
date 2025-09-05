import React from 'react'
import UploadSection from '../organisms/UploadSection'

export default function EditorTemplate() {
  return (
    <div className="wrapper" style={{ width: '100vw', height: '100vh', margin: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px 0' }}>
        <h4 style={{ margin: 0, textAlign: 'center' }}>
           Загрузка и просмотр изображения
        </h4>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <UploadSection />
      </div>
    </div>
  )
}
