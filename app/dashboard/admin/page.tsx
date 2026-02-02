import { Suspense } from "react";
import { default as dynamicImport } from "next/dynamic";

export const dynamic = "force-dynamic";

const AdminPanelOverviewDynamic = dynamicImport(
  () => import("./AdminPanelOverview"),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    ),
  },
);

export default function AdminPanelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminPanelOverviewDynamic />
    </Suspense>
  );
}
