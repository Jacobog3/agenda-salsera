import "server-only";
import { env } from "@/lib/utils/env";

export type GooglePlaceRating = {
  rating: number;
  userRatingCount: number;
  googleMapsUri: string;
};

export async function getGooglePlaceRating(
  placeId?: string | null
): Promise<GooglePlaceRating | null> {
  if (!placeId || !env.googlePlacesApiKey) return null;

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": env.googlePlacesApiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri"
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      console.error("[google-places] Place Details error:", response.status);
      return null;
    }

    const place = await response.json() as Partial<GooglePlaceRating>;
    if (
      typeof place.rating !== "number" ||
      typeof place.userRatingCount !== "number" ||
      typeof place.googleMapsUri !== "string"
    ) {
      return null;
    }

    return {
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      googleMapsUri: place.googleMapsUri
    };
  } catch (error) {
    console.error("[google-places] Unable to load rating:", error);
    return null;
  }
}
