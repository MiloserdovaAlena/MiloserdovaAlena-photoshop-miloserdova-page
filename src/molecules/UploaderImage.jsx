import Button from '../atoms/ButtonUpload';
import InputHidden from '../atoms/InputHidden'

export default function UploaderImage({ fileRef, onUpload }) {
  return (
    <>
      <InputHidden
        innerRef={fileRef}
        accept='.png,.jpg,.jpeg,.gb7'
        onChange={() => onUpload()}
      />
      <Button onClick={() => fileRef.current?.click()}>Загрузить</Button>
    </>
  );
}