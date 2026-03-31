import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DeletedEvents from "../../components/Events/DeletedEvent";

export default function DeletedEventsPage() {
  return (
    <div>
      <PageMeta title="Deleted Events" description="" />
      <PageBreadcrumb pageTitle="Deleted Events" />
      <DeletedEvents/>
    </div>
  );
}