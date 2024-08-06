import PayrollCalculator from '../../components/payroll-calculator';

export default function Home() {
  return (
    <main className="container mx-auto px-4">
      <PayrollCalculator />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">About the Calculator</h2>
        <textarea
          className="w-full h-32 p-2 border rounded"
          placeholder="Enter text about the calculator"
        ></textarea>
      </div>
    </main>
  );
}
