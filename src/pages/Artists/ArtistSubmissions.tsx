import ArtistSubmissionsList from "../../components/Artists/ArtistSubmissionsList";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ArtistSubmissions() {
  return (
    <div>
      <PageMeta title="Artist Submissions" description="" />
      <PageBreadcrumb pageTitle="Artist Submissions" />
      <ArtistSubmissionsList />
    </div>
  );
}