import { Suspense } from 'react';
import ReportFamiliaAnimalServer from '@/components/reportes/ReportFamiliaAnimalServer';

const ReporteFamiliaAnimal = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <ReportFamiliaAnimalServer />
    </Suspense>
  );
};

export default ReporteFamiliaAnimal;

export const dynamic = 'force-dynamic';
