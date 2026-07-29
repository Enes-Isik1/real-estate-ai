// components/analysis/NegotiationPoints.tsx
export function NegotiationPoints({ points }: { points: any[] }) {
  return (
    <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-lg">Verhandlungschancen</h3>
      {points.map((p, i) => (
        <div key={i} className="space-y-2 border-b last:border-0 pb-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-indigo-900">{p.title}</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
              Score: {p.leverageScore}/10
            </span>
          </div>
          <p className="text-sm text-gray-600">{p.argument}</p>
          {/* Kleiner Fortschrittsbalken für den Score */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full" 
              style={{ width: `${p.leverageScore * 10}%` }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}