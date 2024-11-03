export default function Table({
  params,
}: Readonly<{ params: { tableId: string } }>) {
  return (
    <div className="">
      <h1>Table{params.tableId}</h1>
    </div>
  );
}
