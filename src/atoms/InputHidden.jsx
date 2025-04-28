
export default function InputHidden({ accept, onChange, innerRef }) {
  return (
    <input
      type="file"
      hidden
      ref={innerRef}
      accept={accept}
      onChange={onChange}
    />
  );
}
