"use client";

type CommentSectionProps = {
  value: string;
  onChange: (value: string) => void;
};

export const CommentSection = ({ value, onChange }: CommentSectionProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Commentaire</h2>
      <label className="block text-sm text-zinc-600">
        Ajouter du contexte à votre observation (conditions, remarques…)
      </label>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Ex. Couche instable à 40 cm, vent fort de nord..."
        rows={4}
        className="mt-2 min-h-[48px] w-full resize-y rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-base text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        aria-label="Commentaire de l'observation"
      />
    </section>
  );
};
