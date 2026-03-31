import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EventSubmissionsList from "../../components/Events/EventSubmissionsList";

export default function EventSubmissions() {
  return (
    <div>
      <PageMeta title="Event Submissions" description="" />
      <PageBreadcrumb pageTitle="Event Submissions" />
      <EventSubmissionsList/>
    </div>
  );
}