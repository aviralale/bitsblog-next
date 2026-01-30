import { Suspense } from "react";
import dynamic from "next/dynamic";

const ArchivesContent = dynamic(() => import("./ArchivesContent"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

export default function ArchivesPage() {
  return <ArchivesContent />;
}
