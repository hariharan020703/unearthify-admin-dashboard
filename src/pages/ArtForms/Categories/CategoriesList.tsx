import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import CategoryList from "../../../components/ArtForms/CategoryList";

export default function CategoriesList() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Category List"
        description=""
      />
      <PageBreadcrumb pageTitle="Categories List" />
          <CategoryList/>
    </div>
  );
}
