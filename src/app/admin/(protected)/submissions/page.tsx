import { SubmissionsPanel } from "@/components/admin/submissions-panel";
import { SubmissionOperationsInbox } from "@/components/admin/submission-operations-inbox";

export const metadata = { title: "Revisiones | Admin SomosSalsa" };

export default function SubmissionsPage() {
  return (
    <>
      <SubmissionsPanel />
      <SubmissionOperationsInbox />
    </>
  );
}
