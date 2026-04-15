import { KakaoMapLoader } from "@/components/KakaoMapLoader";

export default function ItemsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <KakaoMapLoader />
      {children}
    </>
  );
}

