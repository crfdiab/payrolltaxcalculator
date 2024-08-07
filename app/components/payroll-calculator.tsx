'use client';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import Link from 'next/link';

interface TaxResult {
  gross: number;
  incomeTax: number;
  nationalInsurance: number;
  takeHome: number;
  pension: number;
  studentLoan: number;
  salaryExchange: number;
}

const regions = {
  'England & Wales': {
    taxBands: [
      { threshold: 12570, rate: 0 },
      { threshold: 50270, rate: 0.2 },
      { threshold: 125140, rate: 0.4 },
      { threshold: Infinity, rate: 0.45 },
    ],
  },
  'Scotland': {
    taxBands: [
      { threshold: 12570, rate: 0 },
      { threshold: 14732, rate: 0.19 },
      { threshold: 25688, rate: 0.20 },
      { threshold: 43662, rate: 0.21 },
      { threshold: 125140, rate: 0.42 },
      { threshold: Infinity, rate: 0.47 },
    ],
  },
  'Northern Ireland': {
    taxBands: [
      { threshold: 12570, rate: 0 },
      { threshold: 50270, rate: 0.2 },
      { threshold: 125140, rate: 0.4 },
      { threshold: Infinity, rate: 0.45 },
    ],
  },
};

export default function PayrollCalculator() {
  const [salary, setSalary] = useState('');
  const [period, setPeriod] = useState('annual');
  const [region, setRegion] = useState('England & Wales');
  const [taxCode, setTaxCode] = useState('1257L');
  const [pensionContribution, setPensionContribution] = useState('');
  const [studentLoanPlan, setStudentLoanPlan] = useState('none');
  const [salaryExchange, setSalaryExchange] = useState('');
  const [showCalculation, setShowCalculation] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);

  const calculateTax = () => {
    const annualSalary = period === 'annual'
      ? Number(salary)
      : Number(salary) * (period === 'month' ? 12 : period === 'week' ? 52 : 260);

    const personalAllowance = calculatePersonalAllowance(annualSalary);
    const pensionDeduction = (Number(pensionContribution) / 100) * annualSalary;
    const salaryExchangeDeduction = Number(salaryExchange);
    const taxableIncome = annualSalary - pensionDeduction - salaryExchangeDeduction;

    const incomeTax = calculateIncomeTax(taxableIncome, personalAllowance);
    const nationalInsurance = calculateNationalInsurance(taxableIncome);
    const studentLoanRepayment = calculateStudentLoanRepayment(taxableIncome);

    const takeHome = taxableIncome - incomeTax - nationalInsurance - studentLoanRepayment;

    setResult({
      gross: annualSalary,
      incomeTax,
      nationalInsurance,
      takeHome,
      pension: pensionDeduction,
      studentLoan: studentLoanRepayment,
      salaryExchange: salaryExchangeDeduction,
    });

    setShowCalculation(true);
  };

  const calculatePersonalAllowance = (annualSalary: number) => {
    const baseAllowance = 12570;
    if (annualSalary <= 100000) return baseAllowance;
    const reduction = Math.min((annualSalary - 100000) / 2, baseAllowance);
    return Math.max(baseAllowance - reduction, 0);
  };

  const calculateIncomeTax = (taxableIncome: number, personalAllowance: number) => {
    let tax = 0;
    let remainingIncome = taxableIncome - personalAllowance;

    for (const band of regions[region as keyof typeof regions].taxBands) {
      if (remainingIncome <= 0) break;
      const taxableAmount = Math.min(remainingIncome, band.threshold - (band.threshold === Infinity ? 0 : regions[region as keyof typeof regions].taxBands[regions[region as keyof typeof regions].taxBands.indexOf(band) - 1]?.threshold || 0));
      tax += taxableAmount * band.rate;
      remainingIncome -= taxableAmount;
    }

    return tax;
  };

  const calculateNationalInsurance = (taxableIncome: number) => {
    if (taxableIncome <= 9568) return 0;
    if (taxableIncome <= 50270) return (taxableIncome - 9568) * 0.12;
    return (50270 - 9568) * 0.12 + (taxableIncome - 50270) * 0.02;
  };

  const calculateStudentLoanRepayment = (taxableIncome: number) => {
    const thresholds = {
      'plan1': 19895,
      'plan2': 27295,
      'plan4': 25000,
      'postgraduate': 21000,
    };
    if (studentLoanPlan === 'none' || taxableIncome <= thresholds[studentLoanPlan as keyof typeof thresholds]) return 0;
    return (taxableIncome - thresholds[studentLoanPlan as keyof typeof thresholds]) * 0.09;
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
    doc.text(`National Insurance: ${formatCurrency(result.nationalInsurance)}`, 10, 50);
    doc.text(`Pension Contribution: ${formatCurrency(result.pension)}`, 10, 60);
    doc.text(`Student Loan Repayment: ${formatCurrency(result.studentLoan)}`, 10, 70);
    doc.text(`Salary Exchange: ${formatCurrency(result.salaryExchange)}`, 10, 80);
    doc.text(`Take home pay: ${formatCurrency(result.takeHome)}`, 10, 90);
    doc.save('tax-calculation.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Payroll Tax Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="number"
          placeholder="Enter your salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="annual">per year</option>
          <option value="month">per month</option>
          <option value="week">per week</option>
          <option value="day">per day</option>
        </select>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="England & Wales">England & Wales</option>
          <option value="Scotland">Scotland</option>
          <option value="Northern Ireland">Northern Ireland</option>
        </select>
        <input
          type="text"
          placeholder="Tax Code (e.g. 1257L)"
          value={taxCode}
          onChange={(e) => setTaxCode(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Pension Contribution (%)"
          value={pensionContribution}
          onChange={(e) => setPensionContribution(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={studentLoanPlan}
          onChange={(e) => setStudentLoanPlan(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="none">No Student Loan</option>
          <option value="plan1">Plan 1</option>
          <option value="plan2">Plan 2</option>
          <option value="plan4">Plan 4</option>
          <option value="postgraduate">Postgraduate Loan</option>
        </select>
        <input
          type="number"
          placeholder="Salary Exchange (£)"
          value={salaryExchange}
          onChange={(e) => setSalaryExchange(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      <button
        onClick={calculateTax}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Calculate
      </button>
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
                <td>Pension Contribution</td>
                <td>{formatCurrency(result.pension)}</td>
                <td>{formatCurrency(result.pension / 12)}</td>
                <td>{formatCurrency(result.pension / 52)}</td>
              </tr>
              <tr>
                <td>Student Loan Repayment</td>
                <td>{formatCurrency(result.studentLoan)}</td>
                <td>{formatCurrency(result.studentLoan / 12)}</td>
                <td>{formatCurrency(result.studentLoan / 52)}</td>
              </tr>
              <tr>
                <td>Salary Exchange</td>
                <td>{formatCurrency(result.salaryExchange)}</td>
                <td>{formatCurrency(result.salaryExchange / 12)}</td>
                <td>{formatCurrency(result.salaryExchange / 52)}</td>
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
  <h2 className="text-2xl font-bold mb-4">Understanding Payroll Tax Calculation in the UK</h2>
  <p className="mb-4">
    Payroll taxes in the United Kingdom, including PAYE (Pay As You Earn) income tax and National Insurance (NI) contributions, are essential components deducted from employees' salaries. These deductions fund various public services and benefits, ensuring the smooth functioning of the country's social security system.
  </p>
  <p className="mb-4">
    The <a href="https://payrolltaxcalculator.co.uk" target="_blank" rel="noopener noreferrer">PayrollTaxCalculator.co.uk Tax Calculator</a> is a valuable tool for individuals to estimate their tax liabilities accurately. It calculates PAYE income tax based on progressive tax bands and National Insurance contributions, which vary depending on earnings thresholds. Whether you receive payments weekly, monthly, or annually, this tool simplifies the complex task of payroll tax calculation.
  </p>
  <p className="mb-4">
    PAYE income tax rates range from 20% to 45% of taxable income, with adjustments for personal allowances and deductions. National Insurance contributions consist of Class 1 (Employee and Employer contributions), Class 2, and Class 4 contributions, each serving different purposes such as funding state pensions, healthcare, and other benefits.
  </p>
  <p className="mb-4">
    For detailed information on PAYE and National Insurance, visit the <a href="https://www.gov.uk/income-tax" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax</a> and <a href="https://www.gov.uk/national-insurance" target="_blank" rel="noopener noreferrer">National Insurance</a> pages. These resources provide authoritative guidance on tax rates, allowances, and obligations in the UK.
  </p>
  <div className="mt-8">
    <h3 className="text-xl font-bold mb-4">Frequently Asked Questions about Payroll Taxes</h3>
    <h4 className="text-lg font-semibold">What is PAYE income tax?</h4>
    <p className="mb-4">
      PAYE (Pay As You Earn) is the UK's system for deducting income tax from an employee's salary before it's paid. Employers calculate and withhold the correct amount of tax each pay period.
      Learn more about PAYE on the <a href="https://www.gov.uk/income-tax/how-you-pay-income-tax" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">How are National Insurance contributions calculated?</h4>
    <p className="mb-4">
      National Insurance contributions are calculated based on earnings. Employees pay Class 1 contributions, while self-employed individuals pay Class 2 and Class 4 contributions.
      For more details, visit the <a href="https://www.gov.uk/national-insurance" target="_blank" rel="noopener noreferrer">GOV.UK National Insurance</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">What are the current tax bands and rates?</h4>
    <p className="mb-4">
      The UK's income tax rates range from 20% to 45%, depending on income. The basic rate is 20%, the higher rate is 40%, and the additional rate is 45%.
      Check the latest tax bands and rates on the <a href="https://www.gov.uk/income-tax-rates" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax Rates</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">Do I need to pay National Insurance if I'm self-employed?</h4>
    <p className="mb-4">
      Yes, self-employed individuals pay Class 2 and Class 4 National Insurance contributions based on their profits.
      Learn more about self-employed National Insurance on the <a href="https://www.gov.uk/self-employed-national-insurance-rates" target="_blank" rel="noopener noreferrer">GOV.UK National Insurance Rates</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">How do deductions for pensions and benefits affect my take-home pay?</h4>
    <p className="mb-4">
      Pension contributions and benefit deductions reduce your taxable income, lowering the amount of PAYE tax and National Insurance you pay.
      Find out more about how these deductions work on the <a href="https://www.gov.uk/workplace-pensions" target="_blank" rel="noopener noreferrer">GOV.UK Workplace Pensions</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">Can I claim tax relief on work-related expenses?</h4>
    <p className="mb-4">
      Yes, you can claim tax relief on allowable work-related expenses, which reduces your taxable income and overall tax bill.
      Discover what expenses qualify on the <a href="https://www.gov.uk/tax-relief-for-employees" target="_blank" rel="noopener noreferrer">GOV.UK Tax Relief for Employees</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">What is the difference between Class 1 and Class 2 National Insurance contributions?</h4>
    <p className="mb-4">
      Class 1 contributions are paid by employees and employers, while Class 2 contributions are paid by self-employed individuals.
      More details can be found on the <a href="https://www.gov.uk/national-insurance/how-much-you-pay" target="_blank" rel="noopener noreferrer">GOV.UK National Insurance</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">How do changes in income affect my tax obligations?</h4>
    <p className="mb-4">
      Changes in income can alter the tax band you fall into, affecting the rate of PAYE tax and National Insurance you pay.
      Learn how income changes impact taxes on the <a href="https://www.gov.uk/income-tax" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">Where can I find my PAYE tax code?</h4>
    <p className="mb-4">
      Your PAYE tax code can be found on your payslip, P60, or by contacting HMRC.
      For more information, visit the <a href="https://www.gov.uk/tax-codes" target="_blank" rel="noopener noreferrer">GOV.UK Tax Codes</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">What happens if I miss the deadline for tax payments?</h4>
    <p className="mb-4">
      Missing tax payment deadlines can result in penalties and interest charges.
      Find out what to do if you miss a payment on the <a href="https://www.gov.uk/understand-self-assessment-bill/payments" target="_blank" rel="noopener noreferrer">GOV.UK Self Assessment</a> page.
    </p>
  </div>
</div>
<div className="mt-8">
  <h2 className="text-2xl font-bold mb-4">Understanding Payroll Tax Calculation in the UK</h2>
  <p className="mb-4">
    Payroll taxes in the United Kingdom, including PAYE (Pay As You Earn) income tax and National Insurance (NI) contributions, are essential components deducted from employees' salaries. These deductions fund various public services and benefits, ensuring the smooth functioning of the country's social security system.
  </p>
  <p className="mb-4">
    The <a href="https://payrolltaxcalculator.co.uk" target="_blank" rel="noopener noreferrer">PayrollTaxCalculator.co.uk Tax Calculator</a> is a valuable tool for individuals to estimate their tax liabilities accurately. It calculates PAYE income tax based on progressive tax bands and National Insurance contributions, which vary depending on earnings thresholds. Whether you receive payments weekly, monthly, or annually, this tool simplifies the complex task of payroll tax calculation.
  </p>
  <p className="mb-4">
    PAYE income tax rates range from 20% to 45% of taxable income, with adjustments for personal allowances and deductions. National Insurance contributions consist of Class 1 (Employee and Employer contributions), Class 2, and Class 4 contributions, each serving different purposes such as funding state pensions, healthcare, and other benefits.
  </p>
  <p className="mb-4">
    For detailed information on PAYE and National Insurance, visit the <a href="https://www.gov.uk/income-tax" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax</a> and <a href="https://www.gov.uk/national-insurance" target="_blank" rel="noopener noreferrer">National Insurance</a> pages. These resources provide authoritative guidance on tax rates, allowances, and obligations in the UK.
  </p>
  <div className="mt-8 mb-8">
  <a href="/what-is-payroll-tax/" className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition duration-300 inline-block">
    Learn What Is Payroll Tax In UK
  </a>
</div>
  <div className="mt-8">
    <h3 className="text-xl font-bold mb-4">Frequently Asked Questions about Payroll Taxes</h3>
    <h4 className="text-lg font-semibold">What is PAYE income tax?</h4>
    <p className="mb-4">
      PAYE (Pay As You Earn) is the UK's system for deducting income tax from an employee's salary before it's paid. Employers calculate and withhold the correct amount of tax each pay period.
      Learn more about PAYE on the <a href="https://www.gov.uk/income-tax/how-you-pay-income-tax" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">How are National Insurance contributions calculated?</h4>
    <p className="mb-4">
      National Insurance contributions are calculated based on earnings. Employees pay Class 1 contributions, while self-employed individuals pay Class 2 and Class 4 contributions.
      For more details, visit the <a href="https://www.gov.uk/national-insurance" target="_blank" rel="noopener noreferrer">GOV.UK National Insurance</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">What are the current tax bands and rates?</h4>
    <p className="mb-4">
      The UK's income tax rates range from 20% to 45%, depending on income. The basic rate is 20%, the higher rate is 40%, and the additional rate is 45%.
      Check the latest tax bands and rates on the <a href="https://www.gov.uk/income-tax-rates" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax Rates</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">Do I need to pay National Insurance if I'm self-employed?</h4>
    <p className="mb-4">
      Yes, self-employed individuals pay Class 2 and Class 4 National Insurance contributions based on their profits.
      Learn more about self-employed National Insurance on the <a href="https://www.gov.uk/self-employed-national-insurance-rates" target="_blank" rel="noopener noreferrer">GOV.UK National Insurance Rates</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">How do deductions for pensions and benefits affect my take-home pay?</h4>
    <p className="mb-4">
      Pension contributions and benefit deductions reduce your taxable income, lowering the amount of PAYE tax and National Insurance you pay.
      Find out more about how these deductions work on the <a href="https://www.gov.uk/workplace-pensions" target="_blank" rel="noopener noreferrer">GOV.UK Workplace Pensions</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">Can I claim tax relief on work-related expenses?</h4>
    <p className="mb-4">
      Yes, you can claim tax relief on allowable work-related expenses, which reduces your taxable income and overall tax bill.
      Discover what expenses qualify on the <a href="https://www.gov.uk/tax-relief-for-employees" target="_blank" rel="noopener noreferrer">GOV.UK Tax Relief for Employees</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">What is the difference between Class 1 and Class 2 National Insurance contributions?</h4>
    <p className="mb-4">
      Class 1 contributions are paid by employees and employers, while Class 2 contributions are paid by self-employed individuals.
      More details can be found on the <a href="https://www.gov.uk/national-insurance/how-much-you-pay" target="_blank" rel="noopener noreferrer">GOV.UK National Insurance</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">How do changes in income affect my tax obligations?</h4>
    <p className="mb-4">
      Changes in income can alter the tax band you fall into, affecting the rate of PAYE tax and National Insurance you pay.
      Learn how income changes impact taxes on the <a href="https://www.gov.uk/income-tax" target="_blank" rel="noopener noreferrer">GOV.UK Income Tax</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">Where can I find my PAYE tax code?</h4>
    <p className="mb-4">
      Your PAYE tax code can be found on your payslip, P60, or by contacting HMRC.
      For more information, visit the <a href="https://www.gov.uk/tax-codes" target="_blank" rel="noopener noreferrer">GOV.UK Tax Codes</a> page.
    </p>
    
    <h4 className="text-lg font-semibold">What happens if I miss the deadline for tax payments?</h4>
    <p className="mb-4">
      Missing tax payment deadlines can result in penalties and interest charges.
      Find out what to do if you miss a payment on the <a href="https://www.gov.uk/understand-self-assessment-bill/payments" target="_blank" rel="noopener noreferrer">GOV.UK Self Assessment</a> page.
    </p>
  </div>
</div>

      
      {/* Footer section */}
      <footer className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
        <p>&copy; 2024 PayrollTaxCalculator.co.uk. All rights reserved.</p>
        <p>Disclaimer: This calculator is for informational purposes only. For accurate tax advice, please consult a qualified professional.</p>
      </footer>
    </div>
  );
}