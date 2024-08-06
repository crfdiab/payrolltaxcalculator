'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';

interface TaxResult {
  gross: number;
  incomeTax: number;
  nationalInsurance: number;
  takeHome: number;
}

export default function PayrollCalculator() {
  const [salary, setSalary] = useState('');
  const [period, setPeriod] = useState('annual');
  const [showCalculation, setShowCalculation] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);

  const calculateTax = () => {
    const annualSalary =
      period === 'annual'
        ? Number(salary)
        : Number(salary) *
          (period === 'month' ? 12 : period === 'week' ? 52 : 260);

    const incomeTax = calculateIncomeTax(annualSalary);
    const nationalInsurance = calculateNationalInsurance(annualSalary);
    const takeHome = annualSalary - incomeTax - nationalInsurance;

    setResult({
      gross: annualSalary,
      incomeTax,
      nationalInsurance,
      takeHome,
    });

    setShowCalculation(true);
  };

  const calculateIncomeTax = (annualSalary: number) => {
    if (annualSalary <= 12570) return 0;
    if (annualSalary <= 50270) return (annualSalary - 12570) * 0.2;
    return (50270 - 12570) * 0.2 + (annualSalary - 50270) * 0.4;
  };

  const calculateNationalInsurance = (annualSalary: number) => {
    if (annualSalary <= 9568) return 0;
    if (annualSalary <= 50270) return (annualSalary - 9568) * 0.12;
    return (50270 - 9568) * 0.12 + (annualSalary - 50270) * 0.02;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Tax Calculation Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Tax year 2024/2025`, 10, 20);
    doc.text(`Gross salary: ${formatCurrency(result.gross)}`, 10, 30);
    doc.text(`Income Tax: ${formatCurrency(result.incomeTax)}`, 10, 40);
    doc.text(
      `National Insurance: ${formatCurrency(result.nationalInsurance)}`,
      10,
      50
    );
    doc.text(`Take home pay: ${formatCurrency(result.takeHome)}`, 10, 60);
    doc.save('tax-calculation.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Payroll Tax Calculator</h1>
      <p className="mb-4">
        The PayrollTaxCalculator.co.uk Tax Calculator provides accurate
        estimates of PAYE Pay As You Earn income tax and National Insurance
        NI contributions based on your salary in the United Kingdom. Whether
        you're paid weekly, monthly, or annually, our tool helps you understand
        your tax deductions and calculate your take-home pay.
      </p>
      <div className="flex space-x-4 mb-4">
        <input
          type="number"
          placeholder="Enter your salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="border p-2 rounded flex-grow"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="annual">per annual</option>
          <option value="month">per month</option>
          <option value="week">per week</option>
          <option value="day">per day</option>
        </select>
        <button
          onClick={calculateTax}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Calculate
        </button>
      </div>
      {result && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Your estimation</h2>
          <p>Tax year 2024/2025</p>
          <table className="w-full mt-2">
            <thead>
              <tr>
                <th></th>
                <th>Yearly</th>
                <th>Monthly</th>
                <th>Weekly</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gross salary</td>
                <td>{formatCurrency(result.gross)}</td>
                <td>{formatCurrency(result.gross / 12)}</td>
                <td>{formatCurrency(result.gross / 52)}</td>
              </tr>
              <tr>
                <td>Income Tax</td>
                <td>{formatCurrency(result.incomeTax)}</td>
                <td>{formatCurrency(result.incomeTax / 12)}</td>
                <td>{formatCurrency(result.incomeTax / 52)}</td>
              </tr>
              <tr>
                <td>National Insurance</td>
                <td>{formatCurrency(result.nationalInsurance)}</td>
                <td>{formatCurrency(result.nationalInsurance / 12)}</td>
                <td>{formatCurrency(result.nationalInsurance / 52)}</td>
              </tr>
              <tr>
                <td>Take home pay</td>
                <td>{formatCurrency(result.takeHome)}</td>
                <td>{formatCurrency(result.takeHome / 12)}</td>
                <td>{formatCurrency(result.takeHome / 52)}</td>
              </tr>
            </tbody>
          </table>
          <button
            onClick={downloadPDF}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Download PDF Report
          </button>
        </div>
      )}
      <button
        onClick={() => setShowCalculation(!showCalculation)}
        className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        How The Result Is Calculated
      </button>
      {showCalculation && result && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Calculation Breakdown</h3>
          <p>
            Based on your input of {formatCurrency(result.gross)} per {period}:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              Income Tax: {formatCurrency(result.incomeTax)}
              <ul className="list-disc list-inside ml-4">
                {result.gross > 50270 && (
                  <>
                    <li>
                      20% on income between £12,571 and £50,270:{' '}
                      {formatCurrency((50270 - 12570) * 0.2)}
                    </li>
                    <li>
                      40% on income above £50,270:{' '}
                      {formatCurrency((result.gross - 50270) * 0.4)}
                    </li>
                  </>
                )}
                {result.gross <= 50270 && result.gross > 12570 && (
                  <li>
                    20% on income between £12,571 and{' '}
                    {formatCurrency(result.gross)}:{' '}
                    {formatCurrency(result.incomeTax)}
                  </li>
                )}
                {result.gross <= 12570 && (
                  <li>No income tax on income below £12,570</li>
                )}
              </ul>
            </li>
            <li>
              National Insurance: {formatCurrency(result.nationalInsurance)}
              <ul className="list-disc list-inside ml-4">
                {result.gross > 50270 && (
                  <>
                    <li>
                      12% on income between £9,569 and £50,270:{' '}
                      {formatCurrency((50270 - 9568) * 0.12)}
                    </li>
                    <li>
                      2% on income above £50,270:{' '}
                      {formatCurrency((result.gross - 50270) * 0.02)}
                    </li>
                  </>
                )}
                {result.gross <= 50270 && result.gross > 9568 && (
                  <li>
                    12% on income between £9,569 and{' '}
                    {formatCurrency(result.gross)}:{' '}
                    {formatCurrency(result.nationalInsurance)}
                  </li>
                )}
                {result.gross <= 9568 && (
                  <li>No National Insurance on income below £9,568</li>
                )}
              </ul>
            </li>
          </ul>
          <p className="mt-2">
            Take home pay: {formatCurrency(result.takeHome)} (
            {formatCurrency(result.gross)} - {formatCurrency(result.incomeTax)}{' '}
            - {formatCurrency(result.nationalInsurance)})
          </p>
          <p className="mt-2 text-sm italic">
            Note: These calculations are based on simplified tax brackets and
            may not reflect the exact UK tax rates. For precise calculations,
            please consult with a tax professional or visit the official HMRC
            website.
          </p>
        </div>
      )}
      
      {/* About the Calculator section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">About the Calculator</h2>
        <p className="mb-4">
          The PayrollTaxCalculator.co.uk Tax Calculator provides accurate
          estimates of PAYE (Pay As You Earn) income tax and National Insurance
          (NI) contributions based on your salary in the United Kingdom. Whether
          you're paid weekly, monthly, or annually, our tool helps you
          understand your tax deductions and calculate your take-home pay.
        </p>
      </div>
      
      {/* Footer section */}
      <footer className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
        <p>&copy; 2024 PayrollTaxCalculator.co.uk. All rights reserved.</p>
        <p>Disclaimer: This calculator is for informational purposes only. For accurate tax advice, please consult a qualified professional.</p>
      </footer>
    </div>
  );
}