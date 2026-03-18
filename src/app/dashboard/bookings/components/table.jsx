import ThHead from "@/components/Tables/component/th";
import TdBody from "@/components/Tables/component/td";
import moment from 'moment';

const BookingTable = ({ bookingsData }) => {


  const handleDownloadCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Date",
      "Email",
      "Phone",
      "Company",
      "Country",
      "Messages",
    ];

    const rows = bookingsData.map(data => [
      data?.meta_data.name_f || "",
      data?.meta_data.name_l || "",
      moment(data?.created_at).format("dddd, MMMM Do YYYY") || "",
      data?.meta_data.email || "",
      data?.meta_data.phone || "",
      data?.meta_data.company || "",
      data?.meta_data.country || "",
      data?.meta_data.message || "",
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (<div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
    <div className="max-w-full overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
            <ThHead Title={"First Name"} />
            {/* <ThHead Title={"Last Name"} /> */}
            <ThHead Title={"Date"} />
            <ThHead Title={"Email"} />
            <ThHead Title={"Phone"} />
            <ThHead Title={"Subject"} />
            {/* <ThHead Title={"Country"} /> */}
            <ThHead Title={"Messages"} />
            
            {/* <ThHead Title={"Actions"} /> */}
          </tr>
        </thead>
        <tbody>
          {bookingsData?.map((data, index) => (
            <tr key={index} className="cursor-pointer hover:bg-gray-100">
              <TdBody xData={data?.name} isTitle={true} />
              {/* <TdBody xData={data?.meta_data.name_l} isTitle={true} /> */}
              <TdBody xData={moment(data?.created_at).format("dddd, MMMM Do YYYY")}
                isTitle={false} />
              <TdBody xData={data?.meta_data.email} isTitle={false} />
              <TdBody xData={data?.meta_data.phone} isTitle={false} />
              <TdBody xData={data?.meta_data.sub} isTitle={false} />
              <TdBody xData={data?.meta_data.message} isTitle={false} />
            
              {/* <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5`}>
                <div className="flex  space-x-3.5">
                 <div onClick={()=> handleDownloadCSV()}> <DownloadButton /> </div> 
                </div>
              </td> */}
            </tr>))}
        </tbody>
      </table>
    </div>
  </div>);
};
export default BookingTable;
