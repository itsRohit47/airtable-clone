export default function BaseSkeleton() {
  return (
    <div
      className="w-full max-w-96 rounded-md border-gray-300 p-4"
      aria-busy="true"
      aria-label="Loading base information"
    >
      <div className="flex h-full gap-x-3">
        <div className="h-14 w-14 animate-pulse rounded-md bg-gray-200" />
        <div className="flex flex-grow flex-col gap-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
