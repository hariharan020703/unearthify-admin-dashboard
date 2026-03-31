import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ApplicationList from "../../components/Application/ApplicationList";

export default function ApplicationsList() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Art From Applications"
        description=""
      />
      <PageBreadcrumb pageTitle="Art Form Registrations" />
          <ApplicationList/>
    </div>
  );
}