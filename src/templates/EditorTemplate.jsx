import React from 'react'
import UploadSection from '../organisms/UploadSection'

export default function EditorTemplate() {
  return (
    <div className="wrapper" style={{ maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ margin: '2rem 0' }}>
        <h4 style={{ marginBottom: '1rem', textAlign: 'center' }}>
           Загрузка и просмотр изображения
        </h4>
       <UploadSection />
      </div>
    </div>
  )
}
