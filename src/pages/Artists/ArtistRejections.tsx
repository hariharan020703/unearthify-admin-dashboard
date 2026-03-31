import ArtistRejectedList from "../../components/Artists/ArtistRejectedList";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ArtistRejections() {
  return (
    <div>
      <PageMeta title="Artist Rejections" description="" />
      <PageBreadcrumb pageTitle="Artist Rejections" />
      <ArtistRejectedList />
    </div>
  );
}