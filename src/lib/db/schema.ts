import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  AvalancheDetails,
  IndiceKey,
  ObservableKey,
  ObservablesDetails,
  OrientationKey,
  ProfileTestsJson,
} from "@/types/observation";

/** Photo d'observation (Cloudinary). */
export type ObservationPhotoJson = {
  url: string;
  publicId: string;
  comment?: string;
};

/** JSON des indices avec détails. */
export type IndicesJson = {
  keys: IndiceKey[];
  details?: { avalanche?: AvalancheDetails };
};

/** JSON des observables avec détails. */
export type ObservablesJson = {
  keys: ObservableKey[];
  details?: ObservablesDetails;
};

export const observationsTable = pgTable("observations", {
  id: uuid("id").primaryKey().defaultRandom(),
  observedAt: timestamp("observed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  placeName: text("place_name"),
  elevation: integer("elevation"),
  orientations: jsonb("orientations").$type<OrientationKey[]>().default([]),
  indices: jsonb("indices").$type<IndicesJson>().default({
    keys: [],
  }),
  observables: jsonb("observables").$type<ObservablesJson>().default({
    keys: [],
  }),
  photos: jsonb("photos")
    .$type<ObservationPhotoJson[]>()
    .default([]),
  profileTests: jsonb("profile_tests")
    .$type<ProfileTestsJson>()
    .default({ stabilityTests: [] }),
  comment: text("comment"),
  observerName: text("observer_name"),
  observerSkill: text("observer_skill"),
});

export type Observation = typeof observationsTable.$inferSelect;
export type NewObservation = typeof observationsTable.$inferInsert;
