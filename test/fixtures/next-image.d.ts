declare module "next/image" {
  import type { ComponentProps } from "react";

  export default function Image(props: ComponentProps<"img">): React.JSX.Element;
}
