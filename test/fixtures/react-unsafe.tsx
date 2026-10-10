export function Button(props: { label?: string; payload: any }) {
  return (
    <button onClick={() => console.info(props.payload)}>
      {props.label!.toUpperCase()}
    </button>
  );
}
