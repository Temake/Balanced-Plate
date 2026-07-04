import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useVerifyBillingPayment } from '@/hooks/useBilling';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { getApiErrorMessage } from '@/utils/billing';

const SubscriptionSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || '';
  const verifyPayment = useVerifyBillingPayment();
  const verifiedReference = useRef<string | null>(null);

  useEffect(() => {
    if (reference && verifiedReference.current !== reference) {
      verifiedReference.current = reference;
      verifyPayment.mutate(reference);
    }
  }, [reference, verifyPayment]);

  const content = (() => {
    if (!reference) {
      return {
        icon: <TriangleAlert className="h-10 w-10 text-amber-500" />,
        title: 'Missing payment reference',
        message: 'Paystack did not return a payment reference. Please check your billing page.',
      };
    }
    if (verifyPayment.isPending) {
      return {
        icon: <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />,
        title: 'Verifying payment',
        message: 'Please wait while we confirm your payment with Paystack.',
      };
    }
    if (verifyPayment.isError) {
      return {
        icon: <TriangleAlert className="h-10 w-10 text-red-500" />,
        title: 'Payment not verified',
        message: getApiErrorMessage(verifyPayment.error, 'We could not verify this payment.'),
      };
    }
    return {
      icon: <CheckCircle2 className="h-10 w-10 text-emerald-600" />,
      title: 'Subscription active',
      message: 'Your paid features are now available.',
    };
  })();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex justify-center">{content.icon}</div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{content.title}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{content.message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/billing">Billing</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default SubscriptionSuccess;
