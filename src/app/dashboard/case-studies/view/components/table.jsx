import { useState } from "react";
import ThHead from "@/components/Tables/component/th";
import TdBody from "@/components/Tables/component/td";
import moment from 'moment';
import { useRouter } from 'next/navigation';
import DeleteButton from "@/components/Tables/component/del-b";
import ViewButton from "@/components/Tables/component/view-b";
import { baseURL, authToken } from "@/auth/auth";
import axios from "axios";
import DeleteComponent from "@/components/Modal/delete";
import DeleteSuccess from "@/components/Modal/del-success";

const CasesTable = ({ nData }) => {
  const router = useRouter();

  const [deleteModal, DeleteModal] = useState(false);
  const [deleteModalSuccess, DeleteModalSuccess] = useState(false);
  const [deleteModalId, DeleteModalId] = useState("");
  const [deleteModalName, DeleteModalName] = useState("");

  const RenderDeleteData = (id, name) => {
    DeleteModalId(id);
    DeleteModalName(name); DeleteModal(true);
  }

  const NavigatePage = (data) => {
    router.push(`/dashboard/case-studies/view/update/${data.id}`);
  };

  const FetchDeleteAPI = async (id) => {
    var pr_url = `${baseURL}/api/${id}/DeleteCaseStudiesAPIView`;
    const delete_data = await axios.get((pr_url), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
    });
    let deleteResultStatus = delete_data?.data.status;
    if (deleteResultStatus === "200") {
      DeleteModal(false); DeleteModalSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }


  return (
    <>
      {deleteModalSuccess ? ( <DeleteSuccess DeleteModalSuccess={DeleteModalSuccess} deleteModalName={deleteModalName} /> ) : (null)}
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                <ThHead Title={"Title"} />
                <ThHead Title={"Date"} />
                <ThHead Title={"Actions"} />
              </tr>
            </thead>
            <tbody>
              {nData?.map((data, index) => (
                <tr key={index} className="cursor-pointer hover:bg-gray-100">
                  <TdBody xData={data?.name} isTitle={true} />
                  <TdBody xData={moment(data?.created_at).format("dddd, MMMM Do YYYY")}
                    isTitle={false} />
                  <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5`}>
                    <div className="flex  space-x-3.5">
                      {deleteModal ? (<div> <DeleteComponent deleteModalId={deleteModalId}
                        deleteTitle={deleteModalName} DeleteModal={DeleteModal}
                        FetchDeleteAPI={FetchDeleteAPI} />  </div>) : null}
                      <div> <DeleteButton DeleteEvent={RenderDeleteData} delName={data?.name}
                        delId={data?.id} /> </div>
                      <div onClick={() => NavigatePage(data)}> <ViewButton /> </div>
                    </div>
                  </td>
                </tr> ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default CasesTable;
