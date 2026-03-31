import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AddEvent from "../../components/Events/AddEvent";

export default function AddEvents() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Add Event"
        description=""
      />
      <PageBreadcrumb pageTitle="Add Events" />
        <AddEvent/>
    </div>
  );
}
