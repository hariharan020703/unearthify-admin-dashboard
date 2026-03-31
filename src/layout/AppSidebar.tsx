import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import logo from "../assets/logo.jpg";

import {
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { FaUser } from "react-icons/fa";
import { FaHandHoldingHeart, FaPalette } from "react-icons/fa6";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { BiSolidDashboard } from "react-icons/bi";
import { SiGoogleforms } from "react-icons/si";
import { HiUsers } from "react-icons/hi";
import { MdContactMail } from "react-icons/md";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <BiSolidDashboard className="text-[#893128] text-xl sm:text-2xl" />,
    name: "Dashboard",
    path: "/",
  },
  {
    name: "Artist Requests",
    icon: <HiUsers className="text-[#893128] text-xl sm:text-2xl" />,
    path: "/artist-requests",
  },
  {
    icon: <FaUser className="text-[#893128] text-xl sm:text-2xl" />,
    name: "Artists",
    path: "/artists",
    subItems: [
      { name: "Artists List", path: "/artists", pro: false },
      { name: "Add Artists", path: "/artists/add", pro: false },
      { name: "Pending Artists", path: "/artists/artist-submissions", pro: false },
      { name: "Rejected Artists", path: "/artists/artist-rejections", pro: false },
      { name: "Deleted Artists", path: "/artists/deleted", pro: false },
    ],
  },
  {
    icon: <FaPalette className="text-[#893128] text-xl sm:text-2xl" />,
    name: "Art Forms",
    subItems: [
      { name: "Categories List", path: "/categories", pro: false },
      { name: "Add Categories", path: "/categories/add", pro: false },
      { name: "Art Details List", path: "/art-details", pro: false },
      { name: "Add Art Details", path: "/art-details/add", pro: false },
    ],
  },
  {
    name: "Events",
    icon: <BsFillCalendarEventFill className="text-[#893128] text-xl sm:text-2xl" />,
    subItems: [
      { name: "Event List", path: "/events", pro: false },
      { name: "Add Event", path: "/events/add", pro: false },
      { name: "Pending Events", path: "/events/pending", pro: false },
      { name: "Rejected Events", path: "/events/rejected", pro: false },
      { name: "Deleted Events", path: "/events/deleted", pro: false },
    ],
  },
  {
    icon: <SiGoogleforms className="text-[#893128] text-xl sm:text-2xl" />,
    name: "Registrations",
    path: "/applications",
    subItems: [
      { name: "Art Form", path: "/applications", pro: false },
      { name: "Events", path: "/eventApplications", pro: false },
    ],
  },
  {
    name: "Contact Requests",
    icon: <MdContactMail className="text-[#893128] text-xl sm:text-2xl" />,
    path: "/contact-requests",
  },
  {
  name: "Contribute",
  icon: <FaHandHoldingHeart className="text-[#893128] text-xl sm:text-2xl" />,
  path: "/contributions",
}
];
const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-2 sm:gap-3 md:gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group w-full flex items-center px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "bg-[#83261D]/10 text-[#83261D] font-medium"
                : "text-gray-700 hover:bg-gray-100"
                } ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`flex-shrink-0 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "text-[#83261D]"
                  : "text-gray-500"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="ml-3 text-sm sm:text-base whitespace-nowrap flex-1 text-left">
                  {nav.name}
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-[#83261D]"
                    : "text-gray-400"
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group flex items-center px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 ${isActive(nav.path)
                  ? "bg-[#83261D]/10 text-[#83261D] font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  } ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={`flex-shrink-0 ${isActive(nav.path)
                    ? "text-[#83261D]"
                    : "text-gray-500"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="ml-3 text-sm sm:text-base whitespace-nowrap">
                    {nav.name}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-1 sm:mt-2 space-y-1 ml-8 sm:ml-10 md:ml-11">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex items-center px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${isActive(subItem.path)
                        ? "bg-[#83261D]/5 text-[#83261D] font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <span className="truncate flex-1">{subItem.name}</span>
                      <span className="flex items-center gap-1 ml-2">
                        {subItem.new && (
                          <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 px-3 sm:px-4 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 overflow-y-auto no-scrollbar
        ${isExpanded || isMobileOpen
          ? "w-[260px] sm:w-[280px] md:w-[290px]"
          : isHovered
            ? "w-[260px] sm:w-[280px] md:w-[290px]"
            : "w-[70px] sm:w-[80px] md:w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-4 sm:py-5 md:py-6 lg:py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src={logo}
                alt="Logo"
                width={120}
                height={36}
              />
              <img
                className="hidden dark:block"
                src={logo}
                alt="Logo"
                width={140}
                height={40}
              />
            </>
          ) : (
            <img
              src={logo}
              alt="Logo"
              width={32}
              height={32}
              className="mx-auto"
            />
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar pb-6">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {/* Menu Header */}
              <h2
                className={`mb-3 sm:mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;