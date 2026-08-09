"use client";

import { useState } from "react";
import Image from "next/image";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeacherPortrait({
  name,
  imageUrl
}: {
  name: string;
  imageUrl?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-salsaOrange-400 to-salsaOrange-600 font-display text-2xl font-bold text-white">
      {getInitials(name)}
      {imageUrl && !failed ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 104px"
          unoptimized={imageUrl.startsWith("/local-images/")}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
