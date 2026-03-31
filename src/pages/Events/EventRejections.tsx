import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EventRejectedList from "../../components/Events/EventRejectedList";

export default function EventRejections() {
  return (
    <div>
      <PageMeta title="Event Rejections" description="" />
      <PageBreadcrumb pageTitle="Event Rejections" />
      <EventRejectedList/>
    </div>
  );
}