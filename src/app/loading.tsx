import SwirlingEffectSpinner from "~/components/spinner";

export default function Loading() {
  return (
    <div className="bg-background fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center">
      <SwirlingEffectSpinner size={100} />
    </div>
  );
}
