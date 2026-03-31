import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ArtDetailList from "../../../components/ArtForms/ArtDetailList";

export default function ArtDetailLists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Art Details"
        description=""
      />
      <PageBreadcrumb pageTitle="Art Details List" />
          <ArtDetailList/>
    </div>
  );
}
