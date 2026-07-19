export function EventCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden glass border border-white/5 relative bg-white/5">
      <div 
        className="h-48 bg-gradient-to-r from-transparent via-white/5 to-transparent relative overflow-hidden"
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear'
        }}
      />
      <div className="p-6">
        <div className="h-6 bg-white/5 rounded-md w-3/4 mb-3" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
        <div className="h-4 bg-white/5 rounded-md w-full mb-2" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
        <div className="h-4 bg-white/5 rounded-md w-2/3 mb-6" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
        
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-white/5 rounded-md w-1/2" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
          <div className="h-4 bg-white/5 rounded-md w-2/3" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
        </div>
        
        <div className="h-4 bg-white/5 rounded-md w-1/4" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
      </div>
    </div>
  );
}