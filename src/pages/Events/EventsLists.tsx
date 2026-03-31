import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EventList from "../../components/Events/EventList";

export default function EventsLists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Events List"
        description=""
      />
      <PageBreadcrumb pageTitle="Events List" />
          <EventList/>
    </div>
  );
}
