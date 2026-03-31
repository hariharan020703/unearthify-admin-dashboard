import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ArtistsList from "../../components/Artists/ArtistsList";

export default function ArtistsLists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Artist List"
        description=""
      />
      <PageBreadcrumb pageTitle="Artists List" />
          <ArtistsList/>
    </div>
  );
}
