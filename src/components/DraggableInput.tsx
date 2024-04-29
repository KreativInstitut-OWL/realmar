function DraggableInput({
  id,
  index,
  file,
  lastIndex,
  removeFile,
  moveFile,
}: {
  id: string;
  index: number;
  file: File;
  lastIndex: number;
  removeFile: Function;
  moveFile: Function;
}) {
  return (
    <div className="draggable-input">
      <img src={id} alt={file.name} />
      <button onClick={() => moveFile("up", index)} disabled={index === 0}>
        Up
      </button>
      <button
        onClick={() => moveFile("down", index)}
        disabled={index === lastIndex}
      >
        Down
      </button>
      <button onClick={() => removeFile(index)}>Remove</button>
    </div>
  );
}

export default DraggableInput;
