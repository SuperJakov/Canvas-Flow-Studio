import { useAtom } from "jotai";
import { errorMessageAtom } from "../atoms";
import { AlertCircle } from "lucide-react";

export default function ErrorMessage() {
  const [errorMessage] = useAtom(errorMessageAtom);

  return (
    errorMessage && (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      </div>
    )
  );
}
