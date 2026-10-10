import Image from "next/image";

export default function Page() {
  return (
    <>
      <img alt="" src="/hero.png" />
      <Image height={100} src="/hero.png" width={100} />
    </>
  );
}
