import ThHead from "@/components/Tables/component/th";
import TdBody from "@/components/Tables/component/td";
import moment from 'moment';
import DownloadButton from "@/components/Tables/component/download-b";

const NewsLetterTable = ({ newsLetterData }) => {
  return (<div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
    <div className="max-w-full overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
            <ThHead Title={"Email"} />  
            <ThHead Title={"Date"} />            
            {/* <ThHead Title={"Actions"} /> */}
          </tr>
        </thead>
        <tbody>
          {newsLetterData?.map((data, index) => (
            <tr key={index} className="cursor-pointer hover:bg-gray-100">
              <TdBody xData={data?.email} isTitle={true} />
              <TdBody xData={moment(data?.created_at).format("dddd, MMMM Do YYYY")}
                isTitle={false} />
              {/* <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5`}>
                <div className="flex  space-x-3.5">
                 <div> <DownloadButton /> </div> 
                </div>
              </td> */}
            </tr>))}
        </tbody>
      </table>
    </div>
  </div>);
};
export default NewsLetterTable;
