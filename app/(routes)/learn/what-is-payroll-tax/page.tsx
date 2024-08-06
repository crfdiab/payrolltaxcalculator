import Image from 'next/image';

export default function WhatIsPayrollTax() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">What Is Payroll Tax</h1>
      <Image
        src="/images/featured-image.jpg"
        alt="Payroll Tax"
        width={1200}
        height={628}
        className="mb-8"
      />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1">
          <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
          {/* Add table of contents here */}
        </div>
        <div className="col-span-2">{/* Add content here */}</div>
      </div>
    </div>
  );
}
