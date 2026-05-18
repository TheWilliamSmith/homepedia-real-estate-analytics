import Header from "@/components/Header";
import CountryDetail from "@/components/CountryDetail";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ iso3: string }>;
}) {
  const { iso3 } = await params;
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto">
        <CountryDetail iso3={iso3} />
      </div>
    </div>
  );
}
