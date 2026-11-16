import { Suspense } from "react";
import { EditPodcastForm } from "./edit-podcast-form";

export const instant = false;

export default function EditPodcastPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading podcast editor...</div>}>
      <EditPodcastForm />
    </Suspense>
  );
}
