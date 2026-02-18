import { Suspense } from 'react';
import ReportAnimalesServer from '@/components/reportes/ReportAnimalesServer';

const ReporteAnimales = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ReportAnimalesServer />
    </Suspense>
  );
};

export default ReporteAnimales;

export const dynamic = 'force-dynamic';
