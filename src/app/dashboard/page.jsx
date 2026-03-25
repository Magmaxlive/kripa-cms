import DefaultLayout from "@/components/Layouts/DefaultLaout";
import DashboardHome from "../../components/Dashboard/DashboardHome";

export default function page() {
  return (
    <div>
      <DefaultLayout>
        <DashboardHome/>
      </DefaultLayout>
    </div>
  )
}
