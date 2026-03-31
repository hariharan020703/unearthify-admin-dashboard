import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AddCategory from "../../../components/ArtForms/AddCategory";

export default function AddCategories() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Add Category"
        description=""
      />
      <PageBreadcrumb pageTitle="Add Categories" />
          <AddCategory/>
    </div>
  );
}
