"use client";

/** Formate une Date au format datetime-local (YYYY-MM-DDTHH:mm) en heure locale. */
export const formatDateTimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

type DateSectionProps = {
  value: string;
  onChange: (value: string) => void;
};

export const DateSection = ({ value, onChange }: DateSectionProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Date</h2>
      <label className="block text-sm text-zinc-600">
        Date et heure de l&apos;observation
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={handleChange}
        className="mt-2 flex min-h-[48px] w-full items-center rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base text-zinc-800 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        aria-label="Date et heure de l'observation"
      />
    </section>
  );
};
