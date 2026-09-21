import { z } from "zod";

const text = z.string().trim().max(5000).nullable();
const count = z.number().int().min(0).max(10000).nullable();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
  "Ange ett giltigt datum.",
).nullable();

// Explicit allowlist: no internal notes, customer prices, owner reassignment or publication controls.
export const landlordPropertyInput = z.object({
  publicDescription: text,
  rentIn: z.number().min(0).max(10000000).nullable(),
  bedrooms: count,
  beds: count,
  squareMeters: z.number().min(0).max(1000000).nullable(),
  availability: z.string().trim().max(1000).nullable(),
  moveInFrom: date,
  availableTo: date,
}).strict().partial().refine(
  (value) => !value.moveInFrom || !value.availableTo || value.moveInFrom <= value.availableTo,
  "Slutdatum måste vara samma dag som eller efter startdatum.",
);
export type LandlordPropertyInput = z.infer<typeof landlordPropertyInput>;
export type LandlordProperty = Required<LandlordPropertyInput> & {
  id: string;
  address: string | null;
  city: string | null;
};
