type Tab<T extends string> = {
  id: T;
  label: string;
};

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: Tab<T>[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="mb-6 grid grid-flow-col auto-cols-fr gap-1 overflow-x-auto rounded-lg border border-white/10 bg-black/20 p-1 sm:inline-grid sm:gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            value === tab.id ? "bg-gold text-ink" : "text-cream/65 hover:bg-white/[0.07] hover:text-cream"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
