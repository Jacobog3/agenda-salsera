import { createClient } from "@supabase/supabase-js";
import { execFileSync, spawnSync } from "node:child_process";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "event-flyers";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const academies = [
  {
    slug: "academia-latidos",
    facebookUrl: "https://www.facebook.com/ComunidadLatidos?locale=es_LA"
  },
  {
    slug: "comunidad-salsera",
    facebookUrl: "https://www.facebook.com/profile.php?id=61550694705790&locale=es_LA"
  },
  {
    slug: "tumbao-estudio-de-baile-guatemala",
    facebookUrl: "https://www.facebook.com/tumbaoestudiogt?locale=es_LA"
  },
  {
    slug: "ritmo-y-sabor",
    facebookUrl: "https://www.facebook.com/ritmoysaborgt?locale=es_LA"
  },
  {
    slug: "ads-addiction-dance-studio",
    facebookUrl: "https://www.facebook.com/adsgt?locale=es_LA"
  },
  {
    slug: "dance-art",
    facebookUrl: "https://www.facebook.com/Danceartguatemala?locale=es_LA"
  },
  {
    slug: "in-motion-dance-fitness",
    facebookUrl: "https://www.facebook.com/profile.php?id=100089353824343&locale=es_LA"
  },
  {
    slug: "sky-dance-academy-estilo-latino",
    facebookUrl: "https://www.facebook.com/estilolatinoguatemala?locale=es_LA"
  },
  {
    slug: "tempo-dance-academy",
    facebookUrl: "https://www.facebook.com/profile.php?id=100083365981237&locale=es_LA"
  },
  {
    slug: "salsa-latin-guatemala",
    facebookUrl: "https://www.facebook.com/profile.php?id=100064892794034&locale=es_LA"
  },
  {
    slug: "escuela-cubana-de-baile",
    facebookUrl: "https://www.facebook.com/escuelacubana2022?locale=es_LA"
  },
  {
    slug: "academia-tumbao-fenix-dc",
    facebookUrl: "https://www.facebook.com/profile.php?id=100063633725346&locale=es_LA"
  },
  {
    slug: "salsa-for-you-gt",
    facebookUrl: "https://www.facebook.com/salsaforyougt?locale=es_LA"
  }
];

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function extractMeta(html, property) {
  const pattern = new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]+)"`, "i");
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]) : null;
}

function extensionFromContentType(contentType) {
  if (!contentType) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

async function fetchFacebookMetadata(url) {
  const response = spawnSync("curl", ["-L", "-s", url], {
    encoding: "utf8"
  });
  const html = response.stdout || "";

  if (!html) {
    throw new Error("Empty Facebook response");
  }

  return {
    title: extractMeta(html, "og:title"),
    image: extractMeta(html, "og:image")
  };
}

async function uploadFromRemoteUrl(pathBase, remoteUrl) {
  const imageResponse = await fetch(remoteUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
  });

  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.status}`);
  }

  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const path = `${pathBase}.${extensionFromContentType(contentType)}`;
  const arrayBuffer = await imageResponse.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    contentType
  };
}

async function updateAcademy(entry, publicUrl) {
  const existing = await supabase
    .from("academies")
    .select("id, slug")
    .eq("slug", entry.slug)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (!existing.data) {
    throw new Error("Academy not found in database");
  }

  const payload = {
    cover_image_url: publicUrl,
    facebook_url: entry.facebookUrl
  };

  const { error } = await supabase
    .from("academies")
    .update(payload)
    .eq("slug", entry.slug);

  if (!error) return { usedFacebookColumn: true };

  if (!error.message.toLowerCase().includes("facebook_url")) {
    throw new Error(error.message);
  }

  const fallback = await supabase
    .from("academies")
    .update({ cover_image_url: publicUrl })
    .eq("slug", entry.slug);

  if (fallback.error) {
    throw new Error(fallback.error.message);
  }

  return { usedFacebookColumn: false };
}

for (const entry of academies) {
  try {
    const meta = await fetchFacebookMetadata(entry.facebookUrl);
    if (!meta.image) {
      console.log(`SKIP ${entry.slug}: no og:image`);
      continue;
    }

    const uploaded = await uploadFromRemoteUrl(
      `academies/facebook/${entry.slug}`,
      meta.image
    );

    const result = await updateAcademy(entry, uploaded.publicUrl);

    console.log(
      JSON.stringify({
        slug: entry.slug,
        title: meta.title,
        image: uploaded.publicUrl,
        facebookStored: result.usedFacebookColumn
      })
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        slug: entry.slug,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    );
  }
}
