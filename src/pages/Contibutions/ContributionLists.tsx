import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ContributionList from "../../components/Contibution/ContributionList";

export default function ContibutionLists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Contributions List"
        description=""
      />
      <PageBreadcrumb pageTitle="Contributions" />
          <ContributionList/>
    </div>
  );
}