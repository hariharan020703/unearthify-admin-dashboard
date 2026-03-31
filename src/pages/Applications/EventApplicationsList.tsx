import EventApplicationList from "../../components/Application/EventApplicationList";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function EventApplicationsList() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Event Applications"
        description=""
      />
      <PageBreadcrumb pageTitle="Events Registrations" />
          <EventApplicationList/>
    </div>
  );
}