import { HomeMapView } from "@/components/map/HomeMapView";
import { getObservationsForMap } from "@/lib/observations";

export default async function HomePage() {
  const observations = await getObservationsForMap();
  return <HomeMapView observations={observations} />;
}
