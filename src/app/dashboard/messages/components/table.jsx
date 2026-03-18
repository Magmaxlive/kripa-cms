import ThHead from "@/components/Tables/component/th";
import TdBody from "@/components/Tables/component/td";
import moment from 'moment';
import { useState } from 'react';

const MessagesTable = ({ messagesData }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleMessageClick = (data) => {
    setSelectedRow(data);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedRow(null);
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
              <ThHead Title={"Name"} />
              <ThHead Title={"Date"} />
              <ThHead Title={"Email"} />
              <ThHead Title={"Phone"} />
              {/* <ThHead Title={"Subject"} /> */}
              <ThHead Title={"Message"} />
            </tr>
          </thead>
          <tbody>
            {messagesData?.map((data, index) => (
              <tr key={index} className="cursor-pointer hover:bg-gray-100" onClick={() => handleMessageClick(data)}>
                <TdBody xData={data?.name} isTitle={true} />
                <TdBody xData={moment(data?.created_at).format("dddd, MMMM Do YYYY")} isTitle={false} />
                <TdBody xData={data?.meta_data.email} isTitle={false} />
                <TdBody xData={data?.meta_data.phone.phone} isTitle={false} />
                {/* <TdBody xData={data?.meta_data.subject} isTitle={false} /> */}
                <TdBody 
                  xData={
                    <span 
                      className="truncate block max-w-[200px] whitespace-nowrap" 
                      title="Click to view full details" >
                      {data?.meta_data.message?.substring(0, 30) + (data?.meta_data.message?.length > 30 ? '...' : '')}
                    </span>
                  } 
                  isTitle={false} 
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && selectedRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-dark p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Message Details</h3>
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300"><strong>Name:</strong> {selectedRow?.name}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Date:</strong> {moment(selectedRow?.created_at).format("dddd, MMMM Do YYYY")}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {selectedRow?.meta_data.email}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> {selectedRow?.meta_data.phone.phone}</p>
              {/* <p className="text-gray-700 dark:text-gray-300"><strong>Subject:</strong> {selectedRow?.meta_data.sub}</p> */}
              <p className="text-gray-700 dark:text-gray-300"><strong>Message:</strong> {selectedRow?.meta_data.message}</p>
            </div>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={closePopup} >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesTable;