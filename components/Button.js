export default ({ children, href }) => {
  return (
    <a href={href}>
      <button
        className="relative inline-flex items-center justify-center p-1 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
        href={href}
      >
        <span className="relative px-5 py-3 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
          {children}
        </span>
      </button>
    </a>
  );
};

/*
export default ({ children, href }) => {
  return (
    <button
      className="button text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-md text-sm px-5 py-3 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      href={href}
    >
      {children}
    </button>
  );
};
*/
