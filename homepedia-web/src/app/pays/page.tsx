import Header from "@/components/Header";
import CountriesGrid from "@/components/CountriesGrid";

export default function PaysPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto">
        <CountriesGrid />
      </div>
    </div>
  );
}
