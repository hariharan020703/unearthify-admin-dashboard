import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AddContribution from "../../components/Contibution/AddContribution";

export default function AddContibutions() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Add Contributions"
        description=""
      />
      <PageBreadcrumb pageTitle="Add Contributions" />
          <AddContribution/>
    </div>
  );
}