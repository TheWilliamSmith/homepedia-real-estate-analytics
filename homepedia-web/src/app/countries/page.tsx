import Header from "@/components/Header";
import CountriesTable from "@/components/CountriesTable";

export const metadata = {
  title: "Population par pays — Homepedia",
};

export default function CountriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <CountriesTable />
      </main>
    </div>
  );
}
