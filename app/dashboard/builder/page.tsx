import { Metadata } from "next";
import dynamic from "next/dynamic";

// Lazy load Puck editor (besar, hanya dibutuhkan di halaman ini)
const PuckBuilderEditor = dynamic(
  () => import("@/components/puck/PuckBuilderEditor"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Visual Builder — Life-Start",
  description: "Buat undangan digital Anda dengan visual drag-and-drop builder.",
};

export default function BuilderPage() {
  return <PuckBuilderEditor />;
}
