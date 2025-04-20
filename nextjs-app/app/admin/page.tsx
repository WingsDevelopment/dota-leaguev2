import RegisterCrud from "@/components/admin/register-crud";
/* -------------------- */
/*   Server Component   */
/* -------------------- */
export default async function Page() {
  /* ------- */
  /*   JSX   */
  /* ------- */
  return (
    <div className="flex flex-col gap-4">
      <RegisterCrud registerList={[]} />
    </div>
  );
}
