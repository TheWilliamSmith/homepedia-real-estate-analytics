"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  iso3: string;
  iso2: string;
  name: string;
}

export default function CountryCard({ iso3, iso2, name }: Props) {
  const [imgError, setImgError] = useState(false);
  const flagUrl =
    iso2 && iso2 !== "-99"
      ? `https://flagcdn.com/w160/${iso2.toLowerCase()}.png`
      : null;

  return (
    <Link
      href={`/pays/${iso3}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
    >
      <div
        className="relative w-full overflow-hidden bg-gray-100"
        style={{ aspectRatio: "3/2" }}
      >
        {flagUrl && !imgError ? (
          <img
            src={flagUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
      </div>
      <div className="px-3 py-2.5 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-800 leading-tight truncate">
          {name}
        </p>
      </div>
    </Link>
  );
}
