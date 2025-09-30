import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Classic() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct legacy route
    router.replace('/legacy-root');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Redirecting to Classic Interface...</p>
      </div>
    </div>
  );
}