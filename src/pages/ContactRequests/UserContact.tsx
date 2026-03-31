import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ContactRequestsList from "../../components/ContactRequest/UserContact";

export default function AddArtists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-User Contact"
        description=""
      />
      <PageBreadcrumb pageTitle="User Contact" />
        <ContactRequestsList />
    </div>
  );
}