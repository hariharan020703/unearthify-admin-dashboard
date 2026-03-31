import { useState } from "react";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { Link } from "react-router";

// Define the interface for the props
interface HeaderProps {
  onClick?: () => void; // Optional function that takes no arguments and returns void
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick, onToggle }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-4 xl:px-6">
        {/* Top Row - Mobile & Tablet */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Mobile Hamburger Menu */}
          <button
            className="block w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-gray-500 lg:hidden dark:text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onToggle}>
            <svg
              className="block mx-auto"
              width="16"
              height="14"
              viewBox="0 0 16 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 7C0.583252 6.58579 0.919038 6.25 1.33325 6.25L14.6666 6.25C15.0808 6.25 15.4166 6.58579 15.4166 7C15.4166 7.41421 15.0808 7.75 14.6666 7.75L1.33325 7.75C0.919038 7.75 0.583252 7.41422 0.583252 7ZM1.33325 12.25C0.919038 12.25 0.583252 12.5858 0.583252 13C0.583252 13.4142 0.919038 13.75 1.33325 13.75L7.99992 13.75C8.41413 13.75 8.74992 13.4142 8.74992 13C8.74992 12.5858 8.41413 12.25 7.99992 12.25L1.33325 12.25Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Desktop Sidebar Toggle (Hidden on Mobile) */}
          <button
            onClick={onClick}
            className="items-center justify-center hidden w-9 h-9 lg:w-10 lg:h-11 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:border hover:bg-gray-100 transition-colors">
            <svg
              className="fill-current"
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H16.6666C17.0808 0.25 17.4166 0.585786 17.4166 1C17.4166 1.41421 17.0808 1.75 16.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 7C0.583252 6.58579 0.919038 6.25 1.33325 6.25L16.6666 6.25C17.0808 6.25 17.4166 6.58579 17.4166 7C17.4166 7.41421 17.0808 7.75 16.6666 7.75L1.33325 7.75C0.919038 7.75 0.583252 7.41422 0.583252 7ZM1.33325 12.25C0.919038 12.25 0.583252 12.5858 0.583252 13C0.583252 13.4142 0.919038 13.75 1.33325 13.75L9.99992 13.75C10.4141 13.75 10.7499 13.4142 10.7499 13C10.7499 12.5858 10.4141 12.25 9.99992 12.25L1.33325 12.25Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden">
            <img
              className="dark:hidden h-8 sm:h-10"
              src="./images/logo/logo.svg"
              alt="Logo"
            />
            <img
              className="hidden dark:block h-8 sm:h-10"
              src="./images/logo/logo-dark.svg"
              alt="Logo"
            />
          </Link>

          {/* Mobile Application Menu Toggle */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md xl:max-w-lg ml-4">
            <div className="relative">
              <button className="absolute -translate-y-1/2 left-3 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search or type command..."
                className="dark:bg-dark-900 h-10 lg:h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-10 pr-16 text-xs lg:text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-[#83261D] focus:outline-hidden focus:ring-2 focus:ring-[#83261D]/20 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-[#83261D]"
              />
              <button className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                <span>⌘</span>
                <span>K</span>
              </button>
            </div>
          </div>
        </div>

        {/* Application Menu - Mobile Dropdown */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } flex-col sm:flex-row items-center justify-between w-full gap-3 px-4 py-3 lg:flex lg:flex-row lg:w-auto lg:px-0 lg:py-0 lg:shadow-none border-t border-gray-200 dark:border-gray-800 lg:border-0`}>
          
          {/* Right Side Icons */}
          <div className="flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggleButton />
            
            {/* Notification Dropdown */}
            <NotificationDropdown />
          </div>

          {/* User Dropdown */}
          <div className="w-full sm:w-auto flex justify-center">
            <UserDropdown />
          </div>

          {/* Mobile Search (Visible only when app menu is open) */}
          <div className="w-full lg:hidden mt-2">
            <div className="relative">
              <button className="absolute -translate-y-1/2 left-3 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#83261D] focus:outline-hidden focus:ring-2 focus:ring-[#83261D]/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;