
import { Suspense } from "react";
import { EditArticleForm } from "./edit-article-form";

export const instant = false;

export default function EditArticlePage() {
    return (
        <Suspense fallback={<div className="p-6">Loading article editor...</div>}>
            <EditArticleForm />
        </Suspense>
    );
}
