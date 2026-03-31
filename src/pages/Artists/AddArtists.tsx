import AddArtist from "../../components/Artists/AddArtist";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function AddArtists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Add Artist"
        description=""
      />
      <PageBreadcrumb pageTitle="Add Artists" />
        <AddArtist />
    </div>
  );
}