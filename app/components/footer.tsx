import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Payroll Tax Calculator
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              © 2024 payrolltaxcalculator.co.uk
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Home
            </Link>
            <Link
              href="/learn/what-is-payroll-tax"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Learn
            </Link>
            <Link
              href="/contact-us"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Contact Us
            </Link>
            <Link
              href="/privacy-policy"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
