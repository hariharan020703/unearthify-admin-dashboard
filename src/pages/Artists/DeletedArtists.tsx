import DeletedArtists from "../../components/Artists/DeletedArtists";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function DeletedArtistsPage() {
  return (
    <div>
      <PageMeta title="Deleted Artists" description="" />
      <PageBreadcrumb pageTitle="Deleted Artists" />
      <DeletedArtists/>
    </div>
  );
}