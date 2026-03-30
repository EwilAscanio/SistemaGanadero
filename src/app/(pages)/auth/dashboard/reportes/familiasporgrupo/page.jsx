import { Suspense } from 'react';
import ReportFamiliasPorGrupoServer from '@/components/reportes/ReportFamiliasPorGrupoServer';

const ReporteFamiliasPorGrupo = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <ReportFamiliasPorGrupoServer />
    </Suspense>
  );
};

export default ReporteFamiliasPorGrupo;

export const dynamic = 'force-dynamic';