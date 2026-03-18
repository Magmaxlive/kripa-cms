import React from "react";

const ButtonOne = ({ label, buttonEvent, }) => {
    return (<>
        <button onClick={(e) => buttonEvent(e)} className="flex w-full justify-center rounded-[7px] bg-[#1c1678] p-[13px] font-medium text-white hover:bg-opacity-90">
            {label}
        </button>
    </>);
};
export default ButtonOne;
