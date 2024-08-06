'use client';

import { useState } from 'react';

function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        className="flex justify-between w-full py-4 px-2 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="p-4">{answer}</div>}
    </div>
  );
}

export default function FAQ() {
  const faqItems = [
    {
      question: 'What is payroll tax?',
      answer:
        "Payroll tax refers to taxes that are withheld from an employee's salary by their employer. In the UK, this typically includes Income Tax and National Insurance contributions.",
    },
    {
      question: 'How is payroll tax calculated?',
      answer:
        'Payroll tax is calculated based on your earnings, tax code, and other factors such as your National Insurance category. The exact calculation can be complex and varies based on your individual circumstances.',
    },
    // Add more FAQ items as needed
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqItems.map((item, index) => (
          <AccordionItem
            key={index}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  );
}
