export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 py-12 text-center dark:border-gray-800">
      <nav className="mb-6 flex justify-center gap-6">
        <a
          href="#"
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={() => alert('This button is only here to make it look like a real web site.')}
        >
          About
        </a>
        <a
          href="#"
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={() => alert('Text Alex')}
        >
          Contact
        </a>
      </nav>
      <p className="text-xs text-gray-500 dark:text-gray-500">
        The most important calendar data you need.
      </p>
    </footer>
  );
}
