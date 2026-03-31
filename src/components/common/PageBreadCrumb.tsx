import { Link } from "react-router";

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
      {/* Page Title */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white/90 truncate max-w-full sm:max-w-[60%]">
        {pageTitle}
      </h2>
      
      {/* Breadcrumb Navigation */}
      <nav className="overflow-x-auto pb-1 sm:pb-0 -mx-2 sm:mx-0 px-2 sm:px-0">
        <ol className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap min-w-max sm:min-w-0">
          <li>
            <Link
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-[#83261D] dark:hover:text-[#83261D] transition-colors"
              to="/"
            >
              <span>Home</span>
              <svg
                className="stroke-current flex-shrink-0"
                width="14"
                height="14"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
          <li className="text-xs sm:text-sm text-gray-800 dark:text-white/90 truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;