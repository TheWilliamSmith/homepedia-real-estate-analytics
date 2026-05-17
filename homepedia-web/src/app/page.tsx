import Header from "@/components/Header";
import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 min-h-0">
        <MapWrapper />
      </main>
    </div>
  );
}
