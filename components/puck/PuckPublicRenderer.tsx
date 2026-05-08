"use client";

import { Render } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import { puckConfig } from "@/lib/puck/puck.config";

interface Props {
  puckData: Data;
}

/**
 * Render undangan Puck di halaman publik.
 * Menggunakan <Render /> dari @measured/puck yang hanya merender
 * komponen tanpa UI editor — ringan dan cepat.
 */
export default function PuckPublicRenderer({ puckData }: Props) {
  return (
    <div className="w-full flex justify-center bg-gray-100 min-h-screen">
      <main className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl relative overflow-x-hidden">
        <Render config={puckConfig} data={puckData} />
      </main>
    </div>
  );
}
