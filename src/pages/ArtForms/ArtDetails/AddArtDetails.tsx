import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AddArtDetail from "../../../components/ArtForms/AddArtDetail";

export default function AddArtDetails() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Add Art Detail"
        description=""
      />
      <PageBreadcrumb pageTitle="Add Art Details" />
          <AddArtDetail/>
    </div>
  );
}
