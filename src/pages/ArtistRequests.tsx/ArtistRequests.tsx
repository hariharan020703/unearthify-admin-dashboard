import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ArtistRequestsList from "../../components/ArtistRequest/ArtistRequestList";

export default function AddArtists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Artist Requests"
        description=""
      />
      <PageBreadcrumb pageTitle="Artist Requests" />
      <ArtistRequestsList />
    </div>
  );
}