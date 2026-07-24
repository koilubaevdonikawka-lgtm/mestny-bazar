export function HalalBadge() {
  return (
    <div
      className="select-none"
      title="Халяль"
      aria-label="Халяль"
    >
      <div className="h-9 w-9 rounded-full bg-[oklch(0.45_0.15_155)] text-white flex flex-col items-center justify-center shadow-md border-2 border-white">
        <span className="font-serif text-[8px] leading-none font-bold tracking-wide">HALAL</span>
        <span className="text-[7px] leading-none mt-0.5 opacity-90">حلال</span>
      </div>
    </div>
  );
}
